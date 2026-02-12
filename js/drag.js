/**
 * Drag manager for text elements on the meme canvas.
 * Handles mouse and touch events for selecting, dragging, and repositioning text.
 */
const DragManager = (() => {
  let canvas = null;
  let isDragging = false;
  let dragIndex = -1;
  let offsetX = 0;
  let offsetY = 0;
  let onSelectCallback = null;
  let onDragEndCallback = null;

  /**
   * Initialize the drag manager.
   * @param {HTMLCanvasElement} canvasEl
   * @param {Object} options
   * @param {Function} options.onSelect - Called when a text element is selected. Receives index.
   * @param {Function} options.onDragEnd - Called when drag ends. Receives index.
   */
  function init(canvasEl, options = {}) {
    canvas = canvasEl;
    onSelectCallback = options.onSelect || null;
    onDragEndCallback = options.onDragEnd || null;

    // Mouse events
    canvas.addEventListener("mousedown", handleStart);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseup", handleEnd);
    canvas.addEventListener("mouseleave", handleEnd);

    // Touch events
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchcancel", handleTouchEnd);
  }

  /**
   * Get canvas-relative coordinates from a mouse event.
   */
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  /**
   * Get canvas-relative coordinates from a touch event.
   */
  function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  }

  function handleStart(e) {
    const pos = getMousePos(e);
    startDrag(pos);
  }

  function handleTouchStart(e) {
    e.preventDefault();
    const pos = getTouchPos(e);
    startDrag(pos);
  }

  function startDrag(pos) {
    const hitIndex = CanvasEngine.hitTest(pos.x, pos.y);
    if (hitIndex >= 0) {
      isDragging = true;
      dragIndex = hitIndex;
      const te = CanvasEngine.getTextElements()[hitIndex];
      offsetX = pos.x - te.x;
      offsetY = pos.y - te.y;
      CanvasEngine.setSelectedText(hitIndex);
      canvas.style.cursor = "grabbing";
    } else {
      CanvasEngine.setSelectedText(-1);
      dragIndex = -1;
    }
    if (onSelectCallback) {
      onSelectCallback(hitIndex);
    }
  }

  function handleMove(e) {
    if (!isDragging) {
      // Change cursor on hover
      const pos = getMousePos(e);
      const hitIndex = CanvasEngine.hitTest(pos.x, pos.y);
      canvas.style.cursor = hitIndex >= 0 ? "grab" : "default";
      return;
    }
    const pos = getMousePos(e);
    moveDrag(pos);
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    moveDrag(pos);
  }

  function moveDrag(pos) {
    if (!isDragging || dragIndex < 0) return;
    const newX = pos.x - offsetX;
    const newY = pos.y - offsetY;
    CanvasEngine.updateTextElement(dragIndex, { x: newX, y: newY });
  }

  function handleEnd() {
    if (isDragging && onDragEndCallback) {
      onDragEndCallback(dragIndex);
    }
    isDragging = false;
    dragIndex = -1;
    canvas.style.cursor = "default";
  }

  function handleTouchEnd() {
    handleEnd();
  }

  /**
   * Destroy event listeners.
   */
  function destroy() {
    if (!canvas) return;
    canvas.removeEventListener("mousedown", handleStart);
    canvas.removeEventListener("mousemove", handleMove);
    canvas.removeEventListener("mouseup", handleEnd);
    canvas.removeEventListener("mouseleave", handleEnd);
    canvas.removeEventListener("touchstart", handleTouchStart);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchend", handleTouchEnd);
    canvas.removeEventListener("touchcancel", handleTouchEnd);
  }

  return {
    init,
    destroy,
  };
})();
