import type { Connection } from "reactflow"

export function isValidConnection(connection: Connection): boolean {
  const sourceNode = document.querySelector(`[data-id="${connection.source}"]`)
  const targetNode = document.querySelector(`[data-id="${connection.target}"]`)

  if (!sourceNode || !targetNode) return false

  const sourceType = sourceNode.getAttribute("data-category")
  const targetType = targetNode.getAttribute("data-category")

  // Start node can only connect to connectors, transformations, demo, or file-conversion
  if (
    sourceType === "start" &&
    !["connector", "transformation", "demo", "file-conversion"].includes(targetType || "")
  ) {
    return false
  }

  // End node can only receive connections from connectors, transformations, demo, or file-conversion
  if (targetType === "end" && !["connector", "transformation", "demo", "file-conversion"].includes(sourceType || "")) {
    return false
  }

  // Jobs cannot connect to anything
  if (sourceType === "job" || targetType === "job") {
    return false
  }

  // Allow demo and file-conversion nodes to connect to each other
  if (
    (sourceType === "demo" || sourceType === "file-conversion") &&
    (targetType === "demo" || targetType === "file-conversion" || targetType === "end")
  ) {
    return true
  }

  // Connectors can only connect to transformations
  if (sourceType === "connector" && targetType !== "transformation") {
    return false
  }

  // Transformations can only connect to connectors or the end node
  if (sourceType === "transformation" && !["connector", "end"].includes(targetType || "")) {
    return false
  }

  return true
}

