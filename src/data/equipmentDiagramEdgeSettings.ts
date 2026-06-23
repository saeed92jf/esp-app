// Edge settings for custom routing and handles
// Export settings per edge ID to control sourceHandle, targetHandle, type, and pathOptions

export interface EdgeSetting {
  sourceHandle?: string;
  targetHandle?: string;
  type?: "default" | "straight" | "step" | "smoothstep";
  pathOptions?: {
    offset?: number;
    borderRadius?: number;
    curvature?: number;
  };
}

export const edgeSettings: Record<string, EdgeSetting> = {
  // Hub → Category edges
  "in-service-pressure-vessel": {
    sourceHandle: "hub-right",
    targetHandle: "cat-in-left",
    type: "smoothstep",
    pathOptions: { offset: 20, borderRadius: 12 },
  },
  "in-service-storage-tank": {
    sourceHandle: "hub-bottom",
    targetHandle: "cat-in-top",
    type: "smoothstep",
    pathOptions: { offset: 20, borderRadius: 12 },
  },
  "in-service-piping": {
    sourceHandle: "hub-left",
    targetHandle: "cat-in-right",
    type: "smoothstep",
    pathOptions: { offset: 20, borderRadius: 12 },
  },
  "in-service-valve": {
    sourceHandle: "hub-top",
    targetHandle: "cat-in-bottom",
    type: "smoothstep",
    pathOptions: { offset: 20, borderRadius: 12 },
  },
  "in-service-pressure-relief": {
    sourceHandle: "hub-top-right",
    targetHandle: "cat-in-left",
    type: "smoothstep",
    pathOptions: { offset: 20, borderRadius: 12 },
  },
  "in-service-heat-exchanger": {
    sourceHandle: "hub-bottom-right",
    targetHandle: "cat-in-top",
    type: "smoothstep",
    pathOptions: { offset: 20, borderRadius: 12 },
  },

  // Category → Standard edges (examples - add rest as needed)
  "pressure-vessel-api-510": {
    sourceHandle: "cat-out-right",
    targetHandle: "std-in",
    type: "smoothstep",
    pathOptions: { offset: 15, borderRadius: 8 },
  },
  "pressure-vessel-asme-viii": {
    sourceHandle: "cat-out-right",
    targetHandle: "std-in",
    type: "smoothstep",
    pathOptions: { offset: 15, borderRadius: 8 },
  },
  "storage-tank-api-653": {
    sourceHandle: "cat-out-bottom",
    targetHandle: "std-in",
    type: "smoothstep",
    pathOptions: { offset: 15, borderRadius: 8 },
  },
  "piping-asme-b31.3": {
    sourceHandle: "cat-out-right",
    targetHandle: "std-in",
    type: "smoothstep",
    pathOptions: { offset: 15, borderRadius: 8 },
  },

  // Add more edge IDs as needed
  // Format: 'source-id-target-id': { ... }
};
