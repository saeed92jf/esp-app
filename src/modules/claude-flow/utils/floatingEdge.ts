// src/modules/claude-flow/utils/floatingEdge.ts
// ─────────────────────────────────────────────────────────────────────────
// Geometry for "floating" edges: instead of leaving from a fixed handle,
// the edge leaves from whichever point on the node's actual VISIBLE outline
// is closest to the other node, and follows it as nodes move.
// Reference: https://reactflow.dev/examples/edges/floating-edges
//
// The plain xyflow recipe intersects the two nodes' rectangular BOUNDING
// BOXES, which looks correct for rectangles but leaves a visible gap for
// every non-rectangular shape (circle, diamond, hexagon, triangle,
// parallelogram, stadium-shaped start/end nodes, ...) since their visible
// outline sits inside the bounding box. Here we approximate each node's
// outline as a polygon that matches its actual rendered shape (see
// nodePolygon below) and intersect a ray against THAT instead — this is
// what makes the edge actually touch the shape you see, not its box.
// ─────────────────────────────────────────────────────────────────────────

import { Position, type InternalNode } from "@xyflow/react";

type Point = { x: number; y: number };

/** Local-space (0..w, 0..h) polygon approximating each node type's visible outline. */
function ellipsePoints(w: number, h: number, segments = 32): Point[] {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2;
  const ry = h / 2;
  const pts: Point[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
  }
  return pts;
}

function nodePolygon(type: string | undefined, w: number, h: number): Point[] {
  switch (type) {
    case "circleNode":
      return ellipsePoints(w, h, 32);

    // Stadium/pill shapes — fully rounded ends. An ellipse is a much closer
    // match than the raw rectangle for these (they're mostly rounded).
    case "inputNode":
    case "outputNode":
      return ellipsePoints(w, h, 32);

    case "diamondNode":
      return [
        { x: w / 2, y: 0 },
        { x: w, y: h / 2 },
        { x: w / 2, y: h },
        { x: 0, y: h / 2 },
      ];

    case "hexagonNode": {
      const dx = Math.min(w * 0.22, 32);
      return [
        { x: dx, y: 0 },
        { x: w - dx, y: 0 },
        { x: w, y: h / 2 },
        { x: w - dx, y: h },
        { x: dx, y: h },
        { x: 0, y: h / 2 },
      ];
    }

    case "parallelogramNode": {
      const skew = Math.min(w * 0.18, 28);
      return [
        { x: skew, y: 0 },
        { x: w, y: 0 },
        { x: w - skew, y: h },
        { x: 0, y: h },
      ];
    }

    case "triangleNode":
      return [
        { x: w / 2, y: 0 },
        { x: w, y: h },
        { x: 0, y: h },
      ];

    case "delayNode": {
      // "D" shape — flat left edge, rounded right edge; approximate the
      // round end with an arc of points instead of squaring it off.
      const r = h / 2;
      const pts: Point[] = [
        { x: 0, y: 0 },
        { x: w - r, y: 0 },
      ];
      const segments = 16;
      for (let i = 0; i <= segments; i++) {
        const a = -Math.PI / 2 + (i / segments) * Math.PI;
        pts.push({ x: w - r + r * Math.cos(a), y: h / 2 + r * Math.sin(a) });
      }
      pts.push({ x: 0, y: h });
      return pts;
    }

    // Boxy shapes close enough to their bounding rectangle that the plain
    // rectangle is a fine approximation (rounded corners are only a few px).
    case "defaultNode":
    case "textNode":
    case "noteNode":
    case "documentNode":
    case "predefinedProcessNode":
    case "cylinderNode":
    case "cloudNode":
    case "groupNode":
    default:
      return [
        { x: 0, y: 0 },
        { x: w, y: 0 },
        { x: w, y: h },
        { x: 0, y: h },
      ];
  }
}

/** Ray (from c toward t, both in absolute coords) vs. one polygon edge segment (a→b). */
function raySegmentIntersection(c: Point, t: Point, a: Point, b: Point): (Point & { t: number }) | null {
  const rdx = t.x - c.x;
  const rdy = t.y - c.y;
  const sdx = b.x - a.x;
  const sdy = b.y - a.y;

  const denom = rdx * sdy - rdy * sdx;
  if (Math.abs(denom) < 1e-9) return null; // parallel

  const tt = ((a.x - c.x) * sdy - (a.y - c.y) * sdx) / denom;
  const u = ((a.x - c.x) * rdy - (a.y - c.y) * rdx) / denom;

  if (tt >= 0 && u >= 0 && u <= 1) {
    return { x: c.x + tt * rdx, y: c.y + tt * rdy, t: tt };
  }
  return null;
}

/** Nearest point where the ray from `center` toward `target` exits `polygon` (absolute coords). */
function polygonRayIntersection(polygon: Point[], center: Point, target: Point): Point {
  let best: (Point & { t: number }) | null = null;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const hit = raySegmentIntersection(center, target, a, b);
    if (hit && (!best || hit.t < best.t)) best = hit;
  }
  return best ?? center;
}

/** Finds the point on `intersectionNode`'s actual outline closest to `targetNode`. */
function getNodeIntersection(intersectionNode: InternalNode, targetNode: InternalNode): Point {
  const w = intersectionNode.measured?.width ?? 0;
  const h = intersectionNode.measured?.height ?? 0;
  const origin = intersectionNode.internals.positionAbsolute;
  const center: Point = { x: origin.x + w / 2, y: origin.y + h / 2 };

  const tw = targetNode.measured?.width ?? 0;
  const th = targetNode.measured?.height ?? 0;
  const targetOrigin = targetNode.internals.positionAbsolute;
  const targetCenter: Point = { x: targetOrigin.x + tw / 2, y: targetOrigin.y + th / 2 };

  if (w === 0 || h === 0) return center; // not measured yet — fall back gracefully

  const localPolygon = nodePolygon(intersectionNode.type, w, h);
  const absPolygon = localPolygon.map((p) => ({ x: p.x + origin.x, y: p.y + origin.y }));

  return polygonRayIntersection(absPolygon, center, targetCenter);
}

/** Determines which side (Top/Right/Bottom/Left) of `node`'s bounding box the point sits nearest to — used only to pick a sensible bezier curve direction, not for the actual attach point. */
function getEdgePosition(node: InternalNode, intersectionPoint: Point) {
  const nx = node.internals.positionAbsolute.x;
  const ny = node.internals.positionAbsolute.y;
  const nw = node.measured?.width ?? 0;
  const nh = node.measured?.height ?? 0;
  const cx = nx + nw / 2;
  const cy = ny + nh / 2;

  const dx = (intersectionPoint.x - cx) / (nw / 2 || 1);
  const dy = (intersectionPoint.y - cy) / (nh / 2 || 1);

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? Position.Right : Position.Left;
  }
  return dy > 0 ? Position.Bottom : Position.Top;
}

/** Full floating-edge params for a source/target pair — feed straight into getBezierPath / getSmoothStepPath. */
export function getFloatingEdgeParams(source: InternalNode, target: InternalNode) {
  const sourceIntersection = getNodeIntersection(source, target);
  const targetIntersection = getNodeIntersection(target, source);

  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
    sourcePos: getEdgePosition(source, sourceIntersection),
    targetPos: getEdgePosition(target, targetIntersection),
  };
}
