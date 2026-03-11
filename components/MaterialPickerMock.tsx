import { StudyMaterial } from "@/types/study";

type MaterialPickerMockProps = {
  materials: StudyMaterial[];
};

export function MaterialPickerMock({ materials }: MaterialPickerMockProps) {
  return (
    <section className="card">
      <h3>Google Picker (Mock)</h3>
      <p>Select study files to include in your portal.</p>
      <ul className="checklist">
        {materials.map((material) => (
          <li key={material.id}>
            <label>
              <input type="checkbox" defaultChecked={material.selectedByUser} /> {material.name} ({material.kind})
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
