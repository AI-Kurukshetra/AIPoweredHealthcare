export async function optimizeRoute(
  visits: { lat: number; lng: number }[],
  startLocation?: { lat: number; lng: number }
) {
  // Uses MapBox Directions API or OpenRouteService.
  // Mock logic: Returns the same array reordered by "distance" (simulated).
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  if (visits.length === 0) {
    return { optimizedOrder: [], totalDistance: 0, totalDuration: 0, waypoints: [] };
  }

  const origin = startLocation ?? visits[0];

  const optimizedOrder = [...visits].sort((a, b) => {
    // Arbitrary sort for mock, biased by distance from origin
    const da = Math.hypot(a.lat - origin.lat, a.lng - origin.lng);
    const db = Math.hypot(b.lat - origin.lat, b.lng - origin.lng);
    return da - db;
  });
  
  return {
    optimizedOrder,
    totalDistance: optimizedOrder.length * 5.2, // km
    totalDuration: optimizedOrder.length * 15, // mins
    waypoints: optimizedOrder,
  };
}
