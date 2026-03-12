"use client";

import { useMemo, useState } from "react";
import { GOOGLE_DRIVE_PICKER_SCOPE } from "@/lib/auth/googleScopes";
import { ExtractedFileContent, ExtractionStatus, StudyMaterial } from "@/types/study";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; expires_in?: number; error?: string }) => void;
          }) => { requestAccessToken: (options?: { prompt?: "consent" | "none" }) => void };
        };
      };
      picker?: {
        PickerBuilder: new () => {
          addView: (view: unknown) => unknown;
          setOAuthToken: (token: string) => unknown;
          setDeveloperKey: (key: string) => unknown;
          setAppId: (appId: string) => unknown;
          setCallback: (callback: (data: { action: string; docs?: Array<{ id: string }> }) => void) => unknown;
          build: () => { setVisible: (visible: boolean) => void };
        };
        DocsView: new () => unknown;
        Action: { PICKED: string };
      };
    };
    gapi?: {
      load: (feature: string, callback: { callback: () => void }) => void;
    };
  }
}

type DriveFilePickerPanelProps = {
  assignmentId: string;
  initialSelectedFiles: StudyMaterial[];
  initialExtractions: ExtractedFileContent[];
};

const GIS_SCRIPT_ID = "google-identity-services";
const GAPI_SCRIPT_ID = "google-api-script";

function statusLabel(status: ExtractionStatus) {
  if (status === "not_extracted") return "Not extracted";
  if (status === "extracting") return "Extracting";
  if (status === "extracted") return "Extracted";
  return "Failed";
}

export function DriveFilePickerPanel({ assignmentId, initialSelectedFiles, initialExtractions }: DriveFilePickerPanelProps) {
  const [selectedFiles, setSelectedFiles] = useState<StudyMaterial[]>(initialSelectedFiles);
  const [extractions, setExtractions] = useState<ExtractedFileContent[]>(initialExtractions);
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [isExtractionLoading, setIsExtractionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pickerFiles = useMemo(
    () => selectedFiles.filter((file) => file.sourceType === "google_drive_picker"),
    [selectedFiles]
  );

  const extractionByFileId = useMemo(
    () => new Map(extractions.map((extraction) => [extraction.fileId, extraction])),
    [extractions]
  );

  async function ensureScript(scriptId: string, src: string) {
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existing) {
      if (existing.dataset.loaded === "true") {
        return;
      }

      await new Promise<void>((resolve) => {
        existing.addEventListener("load", () => resolve(), { once: true });
      });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = src;
    script.async = true;
    script.defer = true;

    await new Promise<void>((resolve, reject) => {
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  }

  async function getDriveAccessToken(clientId: string) {
    const google = window.google;

    if (!google) {
      return null;
    }

    return new Promise<{ accessToken: string; expiresInSeconds: number } | null>((resolve) => {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_DRIVE_PICKER_SCOPE,
        callback: (response) => {
          if (!response.access_token || !response.expires_in) {
            resolve(null);
            return;
          }

          resolve({ accessToken: response.access_token, expiresInSeconds: response.expires_in });
        }
      });

      tokenClient.requestAccessToken({ prompt: "consent" });
    });
  }

  async function openPicker() {
    setErrorMessage(null);
    setIsPickerLoading(true);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const appId = process.env.NEXT_PUBLIC_GOOGLE_APP_ID;

    if (!clientId || !apiKey || !appId) {
      setErrorMessage(
        "Missing Picker configuration. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_GOOGLE_API_KEY, and NEXT_PUBLIC_GOOGLE_APP_ID."
      );
      setIsPickerLoading(false);
      return;
    }

    try {
      await ensureScript(GIS_SCRIPT_ID, "https://accounts.google.com/gsi/client");
      await ensureScript(GAPI_SCRIPT_ID, "https://apis.google.com/js/api.js");

      const tokenData = await getDriveAccessToken(clientId);

      if (!tokenData || !window.google?.picker || !window.gapi) {
        setErrorMessage("Could not start Google Picker.");
        setIsPickerLoading(false);
        return;
      }

      await new Promise<void>((resolve) => {
        window.gapi!.load("picker", { callback: () => resolve() });
      });

      const picker = new window.google.picker.PickerBuilder()
        .addView(new window.google.picker.DocsView())
        .setOAuthToken(tokenData.accessToken)
        .setDeveloperKey(apiKey)
        .setAppId(appId)
        .setCallback(async (data) => {
          if (data.action !== window.google!.picker!.Action.PICKED) {
            setIsPickerLoading(false);
            return;
          }

          const fileIds = (data.docs ?? []).map((doc) => doc.id).filter(Boolean);

          if (fileIds.length === 0) {
            setIsPickerLoading(false);
            return;
          }

          const response = await fetch(`/api/assignments/${assignmentId}/selected-files`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileIds,
              accessToken: tokenData.accessToken,
              expiresInSeconds: tokenData.expiresInSeconds
            })
          });

          if (!response.ok) {
            setErrorMessage("Unable to save selected files.");
            setIsPickerLoading(false);
            return;
          }

          const body = (await response.json()) as { files: StudyMaterial[] };
          setSelectedFiles(body.files);
          setIsPickerLoading(false);
        })
        .build();

      picker.setVisible(true);
    } catch {
      setErrorMessage("Google Picker could not be loaded right now.");
      setIsPickerLoading(false);
    }
  }

  async function removeFile(fileId: string) {
    setErrorMessage(null);
    setIsPickerLoading(true);

    const response = await fetch(`/api/assignments/${assignmentId}/selected-files`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId })
    });

    if (!response.ok) {
      setErrorMessage("Failed to remove file.");
      setIsPickerLoading(false);
      return;
    }

    const body = (await response.json()) as { files: StudyMaterial[] };
    setSelectedFiles(body.files);
    setExtractions((current) => current.filter((item) => item.fileId !== fileId));
    setIsPickerLoading(false);
  }

  async function extractSelectedFiles() {
    if (pickerFiles.length === 0) {
      setErrorMessage("Select Google Drive files first.");
      return;
    }

    setErrorMessage(null);
    setIsExtractionLoading(true);

    const response = await fetch(`/api/assignments/${assignmentId}/extractions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileIds: pickerFiles.map((file) => file.id) })
    });

    if (!response.ok) {
      setErrorMessage("Text extraction failed.");
      setIsExtractionLoading(false);
      return;
    }

    const body = (await response.json()) as { extractions: ExtractedFileContent[] };
    setExtractions(body.extractions);
    setIsExtractionLoading(false);
  }

  return (
    <section className="card">
      <h3>Google Drive Files</h3>
      <p>Select only the files needed for this assignment.</p>

      <button type="button" className="button" onClick={openPicker} disabled={isPickerLoading || isExtractionLoading}>
        {isPickerLoading ? "Loading Picker..." : "Choose files with Google Picker"}
      </button>

      {errorMessage ? <p>{errorMessage}</p> : null}

      {pickerFiles.length > 0 ? (
        <ul className="file-list">
          {pickerFiles.map((file) => {
            const extraction = extractionByFileId.get(file.id);
            const status = extraction?.extractionStatus ?? "not_extracted";

            return (
              <li key={file.id}>
                <div>
                  <strong>{file.name}</strong>
                  <p>
                    {file.mimeType ?? "Unknown type"} · Status: {statusLabel(status)}
                  </p>
                  {file.webViewLink ? (
                    <a href={file.webViewLink} target="_blank" rel="noreferrer">
                      Open in Google Drive
                    </a>
                  ) : null}
                </div>
                <button type="button" onClick={() => removeFile(file.id)} disabled={isPickerLoading || isExtractionLoading}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No Google Drive files selected yet.</p>
      )}

      <div className="inline-actions">
        <button type="button" className="button" onClick={extractSelectedFiles} disabled={isPickerLoading || isExtractionLoading || pickerFiles.length === 0}>
          {isExtractionLoading ? "Extracting text..." : "Extract text from selected files"}
        </button>
      </div>

      <section className="card extraction-preview">
        <h3>Raw Extracted Text Preview</h3>
        {pickerFiles.length === 0 ? (
          <p>Select files first to extract preview text.</p>
        ) : extractions.length === 0 ? (
          <p>No extracted text yet.</p>
        ) : (
          <ul className="checklist">
            {extractions.map((record) => (
              <li key={record.fileId} className="extraction-item">
                <strong>{record.fileName}</strong>
                <p>Status: {statusLabel(record.extractionStatus)}</p>
                {record.errorMessage ? <p>{record.errorMessage}</p> : null}
                {record.extractedText ? <pre>{record.extractedText.slice(0, 2000)}</pre> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
