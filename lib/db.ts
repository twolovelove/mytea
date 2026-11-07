import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Tea, TeaDraft } from "./types";

// Everything lives in this browser's IndexedDB; nothing is stored on a server.
interface TeaDB extends DBSchema {
  teas: { key: string; value: Tea };
}

let dbPromise: Promise<IDBPDatabase<TeaDB>> | null = null;

function db() {
  dbPromise ??= openDB<TeaDB>("my-tea", 1, {
    upgrade(d) {
      d.createObjectStore("teas", { keyPath: "id" });
    },
  });
  return dbPromise;
}

export async function listTeas(): Promise<Tea[]> {
  const all = await (await db()).getAll("teas");
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getTea(id: string): Promise<Tea | undefined> {
  return (await db()).get("teas", id);
}

// crypto.randomUUID only exists on HTTPS/localhost; plain-HTTP LAN testing needs the fallback.
function newId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function addTea(draft: TeaDraft): Promise<Tea> {
  const now = Date.now();
  const tea: Tea = { ...draft, id: newId(), createdAt: now, updatedAt: now };
  await (await db()).put("teas", tea);
  return tea;
}

export async function updateTea(id: string, draft: TeaDraft): Promise<Tea> {
  const existing = await getTea(id);
  if (!existing) throw new Error("tea not found");
  const tea: Tea = { ...existing, ...draft, updatedAt: Date.now() };
  await (await db()).put("teas", tea);
  return tea;
}

export async function deleteTea(id: string): Promise<void> {
  await (await db()).delete("teas", id);
}

export async function deleteAllTeas(): Promise<void> {
  await (await db()).clear("teas");
}
