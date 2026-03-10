import { API_URL } from "./config";
import localPaperPaths from "../../public/paperPaths.json";

let cache: any = null;

export async function getPaperIndex() {
  if (cache) return cache;

  try {
    const res = await fetch(`${API_URL}/paper-paths`);

    if (!res.ok) throw new Error("API failed");

    cache = await res.json();
  } catch (err) {
    console.warn("API failed, using local paperPaths.json");
    cache = localPaperPaths;
  }

  return cache;
}
