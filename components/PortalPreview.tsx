import { StudyPortal } from "@/types/study";

type PortalPreviewProps = {
  portal: StudyPortal;
};

export function PortalPreview({ portal }: PortalPreviewProps) {
  return (
    <div className="portal-grid">
      <section className="card">
        <h3>Summary</h3>
        <p>{portal.summary}</p>
      </section>
      <section className="card">
        <h3>Key Concepts</h3>
        <ul>{portal.keyConcepts.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="card">
        <h3>Action Plan</h3>
        <ol>{portal.actionPlan.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
      <section className="card">
        <h3>Study Checklist</h3>
        <ul>{portal.studyChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="card">
        <h3>Research Topics</h3>
        <ul>{portal.researchTopics.map((item) => <li key={item}>{item}</li>)}</ul>
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
