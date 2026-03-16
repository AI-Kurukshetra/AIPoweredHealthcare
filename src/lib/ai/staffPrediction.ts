export async function predictStaffNeeds(timeframeDays: number = 7) {
  // Mock logic for predicting staffing shortages based on local visit history.
  // Real implementation: Send historical visit volume and clinician ratio to an ML endpoint.
  await new Promise((resolve) => setTimeout(resolve, 800));

  const days = Array.from({ length: timeframeDays }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return days.map((date) => {
    const projectedVisits = Math.floor(Math.random() * 50) + 20;
    const requiredStaff = Math.ceil(projectedVisits / 5);
    const scheduledStaff = Math.max(requiredStaff - Math.floor(Math.random() * 3), 0);
    const shortage = requiredStaff > scheduledStaff ? requiredStaff - scheduledStaff : 0;

    return {
      date,
      projectedVisits,
      requiredStaff,
      scheduledStaff,
      shortage,
      riskLevel: shortage > 2 ? 'high' : shortage > 0 ? 'medium' : 'low'
    };
  });
}
