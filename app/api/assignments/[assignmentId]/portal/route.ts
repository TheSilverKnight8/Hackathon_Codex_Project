import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateStudyPortal } from "@/lib/services/portalGenerationService";
import { studyRepository } from "@/lib/studyRepository";
import { PortalGenerationRecord } from "@/types/study";

type RouteProps = {
  params: { assignmentId: string };
};

export async function GET(_request: NextRequest, { params }: RouteProps) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const view = studyRepository.getPortalViewForAssignment(params.assignmentId, session.sessionId);

  if (!view) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

  return NextResponse.json(view);
}

export async function POST(_request: NextRequest, { params }: RouteProps) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assignment = studyRepository.getAssignmentById(params.assignmentId, session.sessionId);

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

  const course = studyRepository.getCourseById(assignment.courseId, session.sessionId);
  const extractions = studyRepository.getExtractionsForAssignment(params.assignmentId, session.sessionId);

  const generatingRecord: PortalGenerationRecord = {
    assignmentId: params.assignmentId,
    status: "generating",
    portal: null,
    updatedAt: new Date().toISOString()
  };

  studyRepository.setPortalGenerationRecordForAssignment(params.assignmentId, generatingRecord, session.sessionId);

  const generated = await generateStudyPortal({
    assignment,
    course,
    extractions
  });

  if (!generated.portal) {
    const fallbackView = studyRepository.getPortalViewForAssignment(params.assignmentId, session.sessionId);

    const fallbackRecord: PortalGenerationRecord = {
      assignmentId: params.assignmentId,
      status: "fallback",
      portal: fallbackView?.portal ?? null,
      updatedAt: new Date().toISOString(),
      errorMessage: generated.message
    };

    studyRepository.setPortalGenerationRecordForAssignment(params.assignmentId, fallbackRecord, session.sessionId);

    return NextResponse.json(studyRepository.getPortalViewForAssignment(params.assignmentId, session.sessionId));
  }

  const successRecord: PortalGenerationRecord = {
    assignmentId: params.assignmentId,
    status: generated.usedFallback ? "fallback" : "generated",
    portal: generated.portal,
    updatedAt: new Date().toISOString(),
    errorMessage: generated.message
  };

  studyRepository.setPortalGenerationRecordForAssignment(params.assignmentId, successRecord, session.sessionId);

  return NextResponse.json(studyRepository.getPortalViewForAssignment(params.assignmentId, session.sessionId));
}
