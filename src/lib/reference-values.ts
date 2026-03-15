export const referenceValues: Record<string, { name: string; value: string }[]> = {
  'Cardiology': [
    { name: 'Heart rate', value: '60–100 bpm' },
    { name: 'Blood pressure', value: '90/60–140/90 mmHg' },
    { name: 'PR interval', value: '120–200 ms' },
    { name: 'QRS duration', value: '<120 ms' },
    { name: 'QTc interval', value: '<450 ms (M), <470 ms (F)' },
    { name: 'Troponin I', value: '<14 ng/L' },
    { name: 'BNP', value: '<100 pg/mL' },
    { name: 'Total cholesterol', value: '<5 mmol/L' },
  ],
  'Respiratory': [
    { name: 'FEV1/FVC ratio', value: '>0.7' },
    { name: 'PaO₂', value: '10.5–13.5 kPa' },
    { name: 'PaCO₂', value: '4.7–6.0 kPa' },
    { name: 'pH (arterial)', value: '7.35–7.45' },
    { name: 'HCO₃⁻', value: '22–26 mmol/L' },
    { name: 'Oxygen saturation', value: '94–98%' },
    { name: 'Peak flow (adult)', value: '400–600 L/min' },
  ],
  'Gastroenterology': [
    { name: 'ALT', value: '3–40 IU/L' },
    { name: 'AST', value: '3–30 IU/L' },
    { name: 'ALP', value: '30–100 IU/L' },
    { name: 'GGT', value: '8–61 IU/L' },
    { name: 'Bilirubin', value: '3–17 μmol/L' },
    { name: 'Albumin', value: '35–50 g/L' },
    { name: 'Amylase', value: '28–100 U/L' },
    { name: 'INR', value: '0.8–1.1' },
  ],
  'Renal': [
    { name: 'eGFR', value: '>90 mL/min/1.73m²' },
    { name: 'Creatinine', value: '55–120 μmol/L' },
    { name: 'Sodium (Na⁺)', value: '135–145 mmol/L' },
    { name: 'Potassium (K⁺)', value: '3.5–5.0 mmol/L' },
    { name: 'Urea', value: '2.5–7.8 mmol/L' },
    { name: 'Calcium (corrected)', value: '2.1–2.6 mmol/L' },
    { name: 'Phosphate', value: '0.8–1.5 mmol/L' },
    { name: 'Bicarbonate', value: '22–26 mmol/L' },
  ],
  'Haematology': [
    { name: 'Haemoglobin (M)', value: '130–170 g/L' },
    { name: 'Haemoglobin (F)', value: '120–150 g/L' },
    { name: 'WCC', value: '4.0–11.0 × 10⁹/L' },
    { name: 'Platelets', value: '150–400 × 10⁹/L' },
    { name: 'MCV', value: '80–100 fL' },
    { name: 'Neutrophils', value: '2.0–7.5 × 10⁹/L' },
    { name: 'Lymphocytes', value: '1.3–3.5 × 10⁹/L' },
    { name: 'Ferritin', value: '15–300 μg/L' },
    { name: 'INR', value: '0.8–1.1' },
    { name: 'APTT', value: '25–35 seconds' },
  ],
  'Endocrinology': [
    { name: 'Fasting glucose', value: '3.5–5.5 mmol/L' },
    { name: 'HbA1c', value: '<42 mmol/mol (6.0%)' },
    { name: 'TSH', value: '0.4–4.0 mU/L' },
    { name: 'Free T4', value: '12–22 pmol/L' },
    { name: 'Free T3', value: '3.1–6.8 pmol/L' },
    { name: 'Cortisol (9am)', value: '170–720 nmol/L' },
    { name: 'Calcium (corrected)', value: '2.1–2.6 mmol/L' },
    { name: 'PTH', value: '1.1–6.9 pmol/L' },
  ],
  'Neurology': [
    { name: 'CSF protein', value: '0.15–0.45 g/L' },
    { name: 'CSF glucose', value: '>60% plasma glucose' },
    { name: 'CSF WCC', value: '<5 cells/μL' },
    { name: 'Sodium (Na⁺)', value: '135–145 mmol/L' },
    { name: 'Calcium (corrected)', value: '2.1–2.6 mmol/L' },
    { name: 'Glucose', value: '3.5–5.5 mmol/L' },
  ],
  'Rheumatology': [
    { name: 'CRP', value: '<5 mg/L' },
    { name: 'ESR (approx.)', value: 'Age/2 (M), (Age+10)/2 (F)' },
    { name: 'Uric acid', value: '200–430 μmol/L' },
    { name: 'ALP', value: '30–100 IU/L' },
    { name: 'Calcium (corrected)', value: '2.1–2.6 mmol/L' },
    { name: 'Vitamin D', value: '>50 nmol/L' },
  ],
  'Infectious Disease': [
    { name: 'WCC', value: '4.0–11.0 × 10⁹/L' },
    { name: 'Neutrophils', value: '2.0–7.5 × 10⁹/L' },
    { name: 'CRP', value: '<5 mg/L' },
    { name: 'Procalcitonin', value: '<0.1 ng/mL' },
    { name: 'Lactate', value: '<2 mmol/L' },
    { name: 'Temperature', value: '36.1–37.2°C' },
  ],
  'Obstetrics & Gynaecology': [
    { name: 'β-hCG (non-pregnant)', value: '<5 IU/L' },
    { name: 'Haemoglobin (pregnancy)', value: '>110 g/L (1st tri), >105 g/L (2nd/3rd)' },
    { name: 'Platelets', value: '150–400 × 10⁹/L' },
    { name: 'Blood pressure', value: '<140/90 mmHg' },
    { name: 'Fasting glucose (GDM screen)', value: '<5.1 mmol/L' },
  ],
  'Paediatrics': [
    { name: 'Heart rate (neonate)', value: '110–160 bpm' },
    { name: 'Heart rate (1–5 yr)', value: '80–120 bpm' },
    { name: 'Resp rate (neonate)', value: '30–60 /min' },
    { name: 'Resp rate (1–5 yr)', value: '20–30 /min' },
    { name: 'WCC (neonate)', value: '10–26 × 10⁹/L' },
    { name: 'Bilirubin (neonate, day 3)', value: '<205 μmol/L (use treatment chart)' },
  ],
  'Dermatology': [
    { name: 'CRP', value: '<5 mg/L' },
    { name: 'ESR', value: 'Age/2 (M), (Age+10)/2 (F)' },
    { name: 'IgE (total)', value: '<81 kU/L' },
  ],
  'Psychiatry': [
    { name: 'Lithium (therapeutic)', value: '0.4–1.0 mmol/L' },
    { name: 'TSH', value: '0.4–4.0 mU/L' },
    { name: 'Sodium (Na⁺)', value: '135–145 mmol/L' },
    { name: 'Calcium (corrected)', value: '2.1–2.6 mmol/L' },
    { name: 'Glucose', value: '3.5–5.5 mmol/L' },
  ],
  'Ophthalmology': [
    { name: 'Intraocular pressure', value: '10–21 mmHg' },
    { name: 'Visual acuity (normal)', value: '6/6 (Snellen)' },
    { name: 'Glucose', value: '3.5–5.5 mmol/L' },
    { name: 'HbA1c', value: '<42 mmol/mol (6.0%)' },
    { name: 'ESR', value: 'Age/2 (M), (Age+10)/2 (F)' },
  ],
  'Urology': [
    { name: 'PSA (age-adjusted)', value: '<3 ng/mL (40–49 yr), <4 ng/mL (50–59 yr)' },
    { name: 'Creatinine', value: '55–120 μmol/L' },
    { name: 'eGFR', value: '>90 mL/min/1.73m²' },
    { name: 'Urine pH', value: '4.5–8.0' },
    { name: 'WCC', value: '4.0–11.0 × 10⁹/L' },
  ],
  'Surgery': [
    { name: 'Haemoglobin', value: '130–170 g/L (M), 120–150 g/L (F)' },
    { name: 'WCC', value: '4.0–11.0 × 10⁹/L' },
    { name: 'CRP', value: '<5 mg/L' },
    { name: 'Amylase', value: '28–100 U/L' },
    { name: 'Lactate', value: '<2 mmol/L' },
    { name: 'INR', value: '0.8–1.1' },
  ],
};

export function getReferenceValuesForSpecialty(specialty: string): { name: string; value: string }[] | null {
  // Try exact match first
  if (referenceValues[specialty]) return referenceValues[specialty];

  // Try case-insensitive match
  const key = Object.keys(referenceValues).find(
    k => k.toLowerCase() === specialty.toLowerCase()
  );
  if (key) return referenceValues[key];

  // Try partial match
  const partialKey = Object.keys(referenceValues).find(
    k => specialty.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(specialty.toLowerCase())
  );
  if (partialKey) return referenceValues[partialKey];

  return null;
}
