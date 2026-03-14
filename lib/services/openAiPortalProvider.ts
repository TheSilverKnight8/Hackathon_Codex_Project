import { Assignment, PortalSourceUsed } from "@/types/study";

type PortalDraft = {
  summary: string;
  keyConcepts: string[];
  actionPlan: string[];
  studyChecklist: string[];
  researchTopics: string[];
};

type NormalizedSourceInput = {
  fileId: string;
  fileName: string;
  text: string;
};

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function getOpenAiApiKey() {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return key;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 8);
}

function validatePortalDraft(raw: unknown): PortalDraft {
  if (!raw || typeof raw !== "object") {
    throw new Error("OpenAI response was not a valid object.");
  }

  const parsed = raw as Record<string, unknown>;
  const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";

  if (!summary) {
    throw new Error("OpenAI response is missing summary.");
  }

  const keyConcepts = asStringArray(parsed.keyConcepts);
  const actionPlan = asStringArray(parsed.actionPlan);
  const studyChecklist = asStringArray(parsed.studyChecklist);
  const researchTopics = asStringArray(parsed.researchTopics);

  if (keyConcepts.length === 0 || actionPlan.length === 0 || studyChecklist.length === 0 || researchTopics.length === 0) {
    throw new Error("OpenAI response did not satisfy portal schema requirements.");
  }

  return {
    summary,
    keyConcepts,
    actionPlan,
    studyChecklist,
    researchTopics
  };
}

export async function generatePortalWithOpenAi(params: {
  assignment: Assignment;
  courseName?: string;
  dueDate?: string;
  normalizedSources: NormalizedSourceInput[];
  sourcesUsed: PortalSourceUsed[];
}) {
  const apiKey = getOpenAiApiKey();
  const model = process.env.OPENAI_PORTAL_MODEL ?? "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "study_portal",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["summary", "keyConcepts", "actionPlan", "studyChecklist", "researchTopics"],
            properties: {
              summary: { type: "string" },
              keyConcepts: { type: "array", items: { type: "string" } },
              actionPlan: { type: "array", items: { type: "string" } },
              studyChecklist: { type: "array", items: { type: "string" } },
              researchTopics: { type: "array", items: { type: "string" } }
            }
          }
        }
      },
      messages: [
        {
          role: "system",
          content:
            "You generate concise, high-quality structured study portals for students. Return JSON only, matching the schema exactly."
        },
        {
          role: "user",
          content: JSON.stringify({
            assignment: {
              title: params.assignment.title,
              instructions: params.assignment.instructions,
              dueDate: params.dueDate,
              courseName: params.courseName
            },
            sourcesUsed: params.sourcesUsed,
            sourceTexts: params.normalizedSources
          })
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI generation failed (${response.status}).`);
  }

  const body = (await response.json()) as OpenAiChatResponse;
  const content = body.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI response did not include content.");
  }

  const rawParsed = JSON.parse(content) as unknown;
  return validatePortalDraft(rawParsed);
}
