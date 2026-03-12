"use client";

import { useState } from "react";
import { PortalPreview } from "@/components/PortalPreview";
import { PortalGenerationStatus, StudyPortal } from "@/types/study";

type PortalGenerationPanelProps = {
  assignmentId: string;
  initialPortal: StudyPortal;
  initialSource: "generated" | "fallback";
  initialStatus: PortalGenerationStatus;
  initialMessage?: string;
};

type PortalResponse = {
  portal: StudyPortal;
  source: "generated" | "fallback";
  generationStatus: PortalGenerationStatus;
  message?: string;
};

function statusLabel(status: PortalGenerationStatus) {
  if (status === "not_generated") return "Not generated";
  if (status === "generating") return "Generating";
  if (status === "generated") return "Generated";
  if (status === "fallback") return "Fallback";
  return "Failed";
}

export function PortalGenerationPanel({
  assignmentId,
  initialPortal,
  initialSource,
  initialStatus,
  initialMessage
}: PortalGenerationPanelProps) {
  const [portal, setPortal] = useState(initialPortal);
  const [source, setSource] = useState(initialSource);
  const [status, setStatus] = useState<PortalGenerationStatus>(initialStatus);
  const [message, setMessage] = useState<string | undefined>(initialMessage);
  const [isLoading, setIsLoading] = useState(false);

  async function generatePortal() {
    setIsLoading(true);
    setStatus("generating");
    setMessage(undefined);

    const response = await fetch(`/api/assignments/${assignmentId}/portal`, {
      method: "POST"
    });

    if (!response.ok) {
      setStatus("failed");
      setMessage("Portal generation failed. Try again after extraction completes.");
      setIsLoading(false);
      return;
    }

    const body = (await response.json()) as PortalResponse;
    setPortal(body.portal);
    setSource(body.source);
    setStatus(body.generationStatus);
    setMessage(body.message);
    setIsLoading(false);
  }

  return (
    <>
      <section className="card">
        <p>
          Portal source: <strong>{source === "generated" ? "Generated from extracted files" : "Fallback content"}</strong>
        </p>
        <p>
          Generation status: <strong>{statusLabel(status)}</strong>
        </p>
        {message ? <p>{message}</p> : null}
        <button type="button" className="button" onClick={generatePortal} disabled={isLoading}>
          {isLoading ? "Generating portal..." : "Generate Structured Portal"}
        </button>
      </section>
      <PortalPreview portal={portal} />
    </>
  );
}
