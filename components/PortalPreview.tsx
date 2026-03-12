import { PortalItemCitation, StudyPortal } from "@/types/study";

type PortalPreviewProps = {
  portal: StudyPortal;
};

function renderItemWithCitations(item: string, itemCitation?: PortalItemCitation) {
  const citations = itemCitation?.citations ?? [];

  return (
    <li key={item} className="portal-item">
      <p>{item}</p>
      {citations.length === 0 ? (
        <p className="citation-empty">No supporting citation found.</p>
      ) : (
        <ul className="citation-list">
          {citations.map((citation) => (
            <li key={`${citation.fileId}-${citation.startOffset ?? 0}-${citation.endOffset ?? 0}`}>
              <strong>{citation.fileName}</strong>
              <p>{citation.supportingSnippet}</p>
              {citation.startOffset !== undefined && citation.endOffset !== undefined ? (
                <p>
                  offsets: {citation.startOffset}-{citation.endOffset}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function PortalPreview({ portal }: PortalPreviewProps) {
  return (
    <div className="portal-grid">
      <section className="card">
        <h3>Summary</h3>
        <p>{portal.summary}</p>
      </section>
      <section className="card">
        <h3>Key Concepts</h3>
        <ul>{portal.keyConcepts.map((item, index) => renderItemWithCitations(item, portal.citations?.keyConcepts[index]))}</ul>
      </section>
      <section className="card">
        <h3>Action Plan</h3>
        <ul>{portal.actionPlan.map((item, index) => renderItemWithCitations(item, portal.citations?.actionPlan[index]))}</ul>
      </section>
      <section className="card">
        <h3>Study Checklist</h3>
        <ul>
          {portal.studyChecklist.map((item, index) => renderItemWithCitations(item, portal.citations?.studyChecklist[index]))}
        </ul>
      </section>
      <section className="card">
        <h3>Research Topics</h3>
        <ul>{portal.researchTopics.map((item, index) => renderItemWithCitations(item, portal.citations?.researchTopics[index]))}</ul>
      </section>
      <section className="card">
        <h3>Sources Used</h3>
        {portal.sourcesUsed.length === 0 ? (
          <p>No extracted file sources were used. Fallback content is shown.</p>
        ) : (
          <ul>
            {portal.sourcesUsed.map((source) => (
              <li key={source.fileId}>
                {source.fileName} ({source.charsUsed} chars)
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
