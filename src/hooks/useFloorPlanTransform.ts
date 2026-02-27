"use client";

import { useState, useCallback, useRef } from "react";

interface TransformState {
  panX: number;
  panY: number;
  zoom: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useFloorPlanTransform() {
  const [state, setState] = useState<TransformState>({
    panX: 0,
    panY: 0,
    zoom: 1,
  });

  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const onWheel = useCallback(
    (e: React.WheelEvent, viewportRect: DOMRect) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

      setState((prev) => {
        const newZoom = clamp(prev.zoom * zoomFactor, 0.25, 4);
        const ratio = newZoom / prev.zoom;

        // Zoom toward cursor position
        const cx = e.clientX - viewportRect.left;
        const cy = e.clientY - viewportRect.top;
        const newPanX = cx - ratio * (cx - prev.panX);
        const newPanY = cy - ratio * (cy - prev.panY);

        return { panX: newPanX, panY: newPanY, zoom: newZoom };
      });
    },
    []
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setState((prev) => ({
      ...prev,
      panX: prev.panX + dx,
      panY: prev.panY + dy,
    }));
  }, []);

  const onPointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const zoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: clamp(prev.zoom * 1.2, 0.25, 4),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: clamp(prev.zoom * 0.8, 0.25, 4),
    }));
  }, []);

  const resetView = useCallback(() => {
    setState({ panX: 0, panY: 0, zoom: 1 });
  }, []);

  return {
    state,
    handlers: { onWheel, onPointerDown, onPointerMove, onPointerUp },
    controls: { zoomIn, zoomOut, resetView },
    isPanning,
  };
}
