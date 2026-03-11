import { StudyMaterial } from "@/types/study";

type DriveFileMetadata = {
  id?: string;
  name?: string;
  mimeType?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
};

async function fetchDriveFileMetadata(accessToken: string, fileId: string): Promise<DriveFileMetadata | null> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,webViewLink,iconLink,thumbnailLink`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as DriveFileMetadata;
}

function mapMimeTypeToKind(mimeType?: string): StudyMaterial["kind"] {
  if (!mimeType) {
    return "doc";
  }

  if (mimeType.includes("presentation")) {
    return "slides";
  }

  if (mimeType.includes("spreadsheet")) {
    return "sheet";
  }

  if (mimeType.includes("pdf")) {
    return "pdf";
  }

  return "doc";
}

export async function getSelectedDriveFilesMetadata(params: {
  accessToken: string;
  assignmentId: string;
  fileIds: string[];
}): Promise<StudyMaterial[]> {
  const fileMetadata = await Promise.all(
    params.fileIds.map((fileId) => fetchDriveFileMetadata(params.accessToken, fileId))
  );

  return fileMetadata
    .filter((file): file is DriveFileMetadata => Boolean(file?.id && file?.name))
    .map((file) => ({
      id: file.id!,
      assignmentId: params.assignmentId,
      name: file.name!,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      iconLink: file.iconLink,
      thumbnailLink: file.thumbnailLink,
      sourceType: "google_drive_picker",
      dateSelected: new Date().toISOString(),
      kind: mapMimeTypeToKind(file.mimeType)
    }));
}
