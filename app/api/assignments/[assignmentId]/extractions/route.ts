import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDriveAccessToken } from "@/lib/auth/tokenStore";
import { extractFileText } from "@/lib/services/fileExtractionService";
import { studyRepository } from "@/lib/studyRepository";
import { ExtractedFileContent } from "@/types/study";

type RouteProps = {
  params: { assignmentId: string };
};

type ExtractRequest = {
  fileIds?: string[];
};

export async function GET(_request: NextRequest, { params }: RouteProps) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const extractions = studyRepository.getExtractionsForAssignment(params.assignmentId, session.sessionId);
  return NextResponse.json({ extractions });
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ExtractRequest;
  const selectedFiles = studyRepository.getSelectedFilesForAssignment(params.assignmentId, session.sessionId);
  const targetFileIds = body.fileIds && body.fileIds.length > 0 ? new Set(body.fileIds) : null;
  const filesToExtract = targetFileIds
    ? selectedFiles.filter((file) => targetFileIds.has(file.id))
    : selectedFiles;

  if (filesToExtract.length === 0) {
    return NextResponse.json({ extractions: [] });
  }

  const driveToken = getDriveAccessToken(session.sessionId);

  if (!driveToken) {
    const failed = filesToExtract.map<ExtractedFileContent>((file) => ({
      assignmentId: params.assignmentId,
      fileId: file.id,
      fileName: file.name,
      extractionStatus: "failed",
      extractedText: "",
      errorMessage: "No active Drive token. Re-open Google Picker and re-select files."
    }));

    studyRepository.upsertExtractionsForAssignment(params.assignmentId, failed, session.sessionId);
    return NextResponse.json({ extractions: studyRepository.getExtractionsForAssignment(params.assignmentId, session.sessionId) });
  }

  const extracting = filesToExtract.map<ExtractedFileContent>((file) => ({
    assignmentId: params.assignmentId,
    fileId: file.id,
    fileName: file.name,
    extractionStatus: "extracting",
    extractedText: ""
  }));

  studyRepository.upsertExtractionsForAssignment(params.assignmentId, extracting, session.sessionId);

  const results = await Promise.all(
    filesToExtract.map((file) => extractFileText(driveToken, params.assignmentId, file))
  );

  studyRepository.upsertExtractionsForAssignment(params.assignmentId, results, session.sessionId);

  return NextResponse.json({
    extractions: studyRepository.getExtractionsForAssignment(params.assignmentId, session.sessionId)
  });
}
