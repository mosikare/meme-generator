/**
 * Drag manager for text elements on the meme canvas.
 * Handles mouse and touch events for selecting, dragging, and repositioning text.
 */

import type { CanvasEngineClass } from "./canvas-engine";

export interface DragManagerOptions {
  onSelect?: (index: number) => void;
  onDragEnd?: (index: number) => void;
}

export class DragManagerClass {
  private canvas: HTMLCanvasElement | null = null;
  private engine: CanvasEngineClass | null = null;
  private isDragging = false;
  private dragIndex = -1;
  private offsetX = 0;
  private offsetY = 0;
  private onSelectCallback: ((index: number) => void) | null = null;
  private onDragEndCallback: ((index: number) => void) | null = null;

  private handleStart: (e: MouseEvent) => void;
  private handleMove: (e: MouseEvent) => void;
  private handleEnd: () => void;
  private handleTouchStart: (e: TouchEvent) => void;
  private handleTouchMove: (e: TouchEvent) => void;
  private handleTouchEnd: () => void;

  constructor() {
    this.handleStart = (e) => {
      const pos = this.getMousePos(e);
      this.startDrag(pos);
    };
    this.handleMove = (e) => {
      if (!this.isDragging) {
        const pos = this.getMousePos(e);
        const hitIndex = this.engine?.hitTest(pos.x, pos.y) ?? -1;
        if (this.canvas) this.canvas.style.cursor = hitIndex >= 0 ? "grab" : "default";
        return;
      }
      const pos = this.getMousePos(e);
      this.moveDrag(pos);
    };
    this.handleEnd = () => {
      if (this.isDragging && this.onDragEndCallback) {
        this.onDragEndCallback(this.dragIndex);
      }
      this.isDragging = false;
      this.dragIndex = -1;
      if (this.canvas) this.canvas.style.cursor = "default";
    };
    this.handleTouchStart = (e) => {
      e.preventDefault();
      const pos = this.getTouchPos(e);
      this.startDrag(pos);
    };
    this.handleTouchMove = (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const pos = this.getTouchPos(e);
      this.moveDrag(pos);
    };
    this.handleTouchEnd = () => this.handleEnd();
  }

  init(
    canvasEl: HTMLCanvasElement,
    engine: CanvasEngineClass,
    options: DragManagerOptions = {}
  ) {
    this.canvas = canvasEl;
    this.engine = engine;
    this.onSelectCallback = options.onSelect ?? null;
    this.onDragEndCallback = options.onDragEnd ?? null;

    canvasEl.addEventListener("mousedown", this.handleStart);
    canvasEl.addEventListener("mousemove", this.handleMove);
    canvasEl.addEventListener("mouseup", this.handleEnd);
    canvasEl.addEventListener("mouseleave", this.handleEnd);
    canvasEl.addEventListener("touchstart", this.handleTouchStart, { passive: false });
    canvasEl.addEventListener("touchmove", this.handleTouchMove, { passive: false });
    canvasEl.addEventListener("touchend", this.handleTouchEnd);
    canvasEl.addEventListener("touchcancel", this.handleTouchEnd);
  }

  private getMousePos(e: MouseEvent): { x: number; y: number } {
    if (!this.canvas) return { x: 0, y: 0 };
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  private getTouchPos(e: TouchEvent): { x: number; y: number } {
    if (!this.canvas) return { x: 0, y: 0 };
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return { x: 0, y: 0 };
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  }

  private startDrag(pos: { x: number; y: number }) {
    const hitIndex = this.engine?.hitTest(pos.x, pos.y) ?? -1;
    if (hitIndex >= 0) {
      this.isDragging = true;
      this.dragIndex = hitIndex;
      const te = this.engine!.getTextElements()[hitIndex];
      this.offsetX = pos.x - te.x;
      this.offsetY = pos.y - te.y;
      this.engine!.setSelectedText(hitIndex);
      if (this.canvas) this.canvas.style.cursor = "grabbing";
    } else {
      this.engine?.setSelectedText(-1);
      this.dragIndex = -1;
    }
    this.onSelectCallback?.(hitIndex);
  }

  private moveDrag(pos: { x: number; y: number }) {
    if (!this.isDragging || this.dragIndex < 0 || !this.engine) return;
    const newX = pos.x - this.offsetX;
    const newY = pos.y - this.offsetY;
    this.engine.updateTextElement(this.dragIndex, { x: newX, y: newY });
  }

  destroy() {
    if (!this.canvas) return;
    this.canvas.removeEventListener("mousedown", this.handleStart);
    this.canvas.removeEventListener("mousemove", this.handleMove);
    this.canvas.removeEventListener("mouseup", this.handleEnd);
    this.canvas.removeEventListener("mouseleave", this.handleEnd);
    this.canvas.removeEventListener("touchstart", this.handleTouchStart);
    this.canvas.removeEventListener("touchmove", this.handleTouchMove);
    this.canvas.removeEventListener("touchend", this.handleTouchEnd);
    this.canvas.removeEventListener("touchcancel", this.handleTouchEnd);
    this.canvas = null;
    this.engine = null;
  }
}

export const createDragManager = () => new DragManagerClass();
