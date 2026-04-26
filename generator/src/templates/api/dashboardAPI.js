const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export async function fetchDashboardData(token) {
  const res = await fetch(`${API_BASE}/dashboard/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch dashboard data: ${res.status}`);

  return res.json();
}