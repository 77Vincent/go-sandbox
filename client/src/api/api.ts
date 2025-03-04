
export async function healthCheck() {
  const res = await fetch("/api/status");
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
    return await res.json();
}
