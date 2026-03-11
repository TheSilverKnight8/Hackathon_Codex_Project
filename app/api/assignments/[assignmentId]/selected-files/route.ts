import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSelectedDriveFilesMetadata } from "@/lib/services/googleDriveService";
import { studyRepository } from "@/lib/studyRepository";

type SaveSelectedFilesRequest = {
  fileIds?: string[];
  accessToken?: string;
};

type RemoveSelectedFileRequest = {
  fileId?: string;
};

type RouteProps = {
  params: { assignmentId: string };
};

export async function GET(_request: NextRequest, { params }: RouteProps) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = studyRepository.getSelectedFilesForAssignment(params.assignmentId, session.sessionId);
  return NextResponse.json({ files });
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SaveSelectedFilesRequest;

  if (!body.accessToken || !body.fileIds || body.fileIds.length === 0) {
    return NextResponse.json({ error: "Missing access token or selected files." }, { status: 400 });
  }

  const files = await getSelectedDriveFilesMetadata({
    accessToken: body.accessToken,
    assignmentId: params.assignmentId,
    fileIds: body.fileIds
  });

  const savedFiles = studyRepository.saveSelectedFilesForAssignment(params.assignmentId, files, session.sessionId);
  return NextResponse.json({ files: savedFiles });
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as RemoveSelectedFileRequest;

  if (!body.fileId) {
    return NextResponse.json({ error: "Missing file id." }, { status: 400 });
  }

  const files = studyRepository.removeSelectedFileForAssignment(params.assignmentId, body.fileId, session.sessionId);
  return NextResponse.json({ files });
}
