import { StudyMaterial } from "@/types/study";

type MaterialPickerMockProps = {
  materials: StudyMaterial[];
};

export function MaterialPickerMock({ materials }: MaterialPickerMockProps) {
  return (
    <section className="card">
      <h3>Fallback Materials</h3>
      <p>These mock/generated materials are shown when no Google Drive files are selected yet.</p>
      <ul className="checklist">
        {materials.map((material) => (
          <li key={material.id}>
            {material.name} ({material.kind ?? material.mimeType ?? "file"})
          </li>
        ))}
      </ul>
    </section>
  );
}
