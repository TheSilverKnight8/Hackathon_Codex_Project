import { ExtractedFileContent, StudyMaterial } from "@/types/study";

const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";

async function exportGoogleDocText(accessToken: string, fileId: string) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export?mimeType=text/plain`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(`Google Docs export failed (${response.status}).`);
  }

  return response.text();
}

async function downloadPlainText(accessToken: string, fileId: string) {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Text file download failed (${response.status}).`);
  }

  return response.text();
}

function supportsPlainText(mimeType?: string) {
  if (!mimeType) {
    return false;
  }

  return mimeType.startsWith("text/") || mimeType === "application/json";
}

export async function extractFileText(
  accessToken: string,
  assignmentId: string,
  file: StudyMaterial
): Promise<ExtractedFileContent> {
  const baseRecord: ExtractedFileContent = {
    assignmentId,
    fileId: file.id,
    fileName: file.name,
    extractionStatus: "failed",
    extractedText: ""
  };

  try {
    if (file.mimeType === GOOGLE_DOC_MIME) {
      const text = await exportGoogleDocText(accessToken, file.id);
      return {
        ...baseRecord,
        extractionStatus: "extracted",
        extractedText: text,
        extractedAt: new Date().toISOString()
      };
    }

    if (supportsPlainText(file.mimeType)) {
      const text = await downloadPlainText(accessToken, file.id);
      return {
        ...baseRecord,
        extractionStatus: "extracted",
        extractedText: text,
        extractedAt: new Date().toISOString()
      };
    }

    return {
      ...baseRecord,
      errorMessage: `Unsupported file type for extraction: ${file.mimeType ?? "unknown"}.`
    };
  } catch (error) {
    return {
      ...baseRecord,
      errorMessage: error instanceof Error ? error.message : "Extraction failed."
    };
  }
}
