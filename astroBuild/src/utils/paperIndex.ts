import { API_URL } from "./config";

let cache: any = null;

export async function getPaperIndex() {
  if (cache) return cache;

  const res = await fetch(`${API_URL}/paper-paths`);
  cache = await res.json();

  return cache;
}