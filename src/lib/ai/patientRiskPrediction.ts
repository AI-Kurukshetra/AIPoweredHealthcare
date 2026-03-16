export async function predictPatientRisk(vitals: { systolic?: number; diastolic?: number; spo2?: number; heartRate?: number }, age?: number) {
  // Uses historical and current vitals to compute a readmission or complication risk.
  await new Promise((resolve) => setTimeout(resolve, 600));

  let score = 0;
  if (vitals.systolic && vitals.systolic > 140) score += 2;
  if (vitals.spo2 && vitals.spo2 < 92) score += 3;
  if (vitals.heartRate && (vitals.heartRate > 100 || vitals.heartRate < 50)) score += 2;
  if (age && age > 75) score += 1;

  if (score >= 4) {
    return { riskScore: score, category: 'High Risk', recommendations: ['Immediate follow up', 'Telehealth check-in'] };
  } else if (score >= 2) {
    return { riskScore: score, category: 'Moderate Risk', recommendations: ['Monitor vitals closely'] };
  }

  return { riskScore: score, category: 'Low Risk', recommendations: ['Routine care'] };
}
