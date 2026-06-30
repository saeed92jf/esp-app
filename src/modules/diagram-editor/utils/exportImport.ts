import { nanoid } from "nanoid";
import type { DiagramDocument } from "../types/diagram.types";
// Trigger a browser download of the diagram as a .json file
export function exportDiagramAsJson(doc: DiagramDocument): void {
  const json = JSON.stringify(doc, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${doc.name.replace(/\s+/g, "_")}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
// Read a File object and parse it as a DiagramDocument
export function importDiagramFromFile(
  file: File
): Promise<DiagramDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as unknown;
        const validation = validateDiagramDocument(parsed);
        if (!validation.valid) {
          reject(new Error(validation.errors.join(", ")));
          return;
        }
        resolve(parsed as DiagramDocument);
      } catch {
        reject(new Error("Failed to parse JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
// Validate that a parsed JSON object conforms to the DiagramDocument shape
export function validateDiagramDocument(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Invalid document: not an object"] };
  }
  const doc = data as Record<string, unknown>;
  if (!doc.id || typeof doc.id !== "string") errors.push("Missing or invalid id");
  if (!doc.name || typeof doc.name !== "string") errors.push("Missing or invalid name");
  if (!doc.version || typeof doc.version !== "string") errors.push("Missing version");
  if (!Array.isArray(doc.nodes)) errors.push("nodes must be an array");
  if (!Array.isArray(doc.edges)) errors.push("edges must be an array");
  if (!doc.viewport || typeof doc.viewport !== "object") errors.push("Missing viewport");
  return { valid: errors.length === 0, errors };
}
// Deep-clone a DiagramDocument, optionally assigning a new id and timestamps
export function cloneDiagramDocument(
  doc: DiagramDocument,
  newId = false
): DiagramDocument {
  const clone = JSON.parse(JSON.stringify(doc)) as DiagramDocument;
  if (newId) {
    clone.id = nanoid();
    clone.createdAt = new Date().toISOString();
  }
  clone.updatedAt = new Date().toISOString();
  return clone;
}
