/**
 * Canvas rendering engine for the meme generator.
 * Handles image loading, text drawing with stroke/fill, word wrap, and PNG export.
 */
const CanvasEngine = (() => {
  let canvas = null;
  let ctx = null;
  let currentImage = null;
  let textElements = [];
  let selectedTextIndex = -1;

  /**
   * Initialize the canvas engine.
   * @param {HTMLCanvasElement} canvasEl - The canvas DOM element.
   */
  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    // Set default canvas size
    canvas.width = 600;
    canvas.height = 500;
    render();
  }

  /**
   * Load an image from a source URL and draw it to the canvas.
   * @param {string} src - Image source URL or data URL.
   * @returns {Promise} Resolves when image is loaded.
   */
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        currentImage = img;
        resizeCanvasToImage();
        render();
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Resize canvas to match the loaded image aspect ratio,
   * constrained to the container width.
   */
  function resizeCanvasToImage() {
    if (!currentImage) return;
    const container = canvas.parentElement;
    const style = getComputedStyle(container);
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    const maxWidth = container.clientWidth - padLeft - padRight - 2;
    const ratio = currentImage.height / currentImage.width;
    let w = Math.min(currentImage.width, maxWidth);
    let h = w * ratio;
    // Cap height
    if (h > 700) {
      h = 700;
      w = h / ratio;
    }
    canvas.width = Math.round(w);
    canvas.height = Math.round(h);
  }

  /**
   * Get all text elements.
   * @returns {Array} Text elements array.
   */
  function getTextElements() {
    return textElements;
  }

  /**
   * Set text elements (replaces all).
   * @param {Array} elements
   */
  function setTextElements(elements) {
    textElements = elements;
    render();
  }

  /**
   * Add a new text element.
   * @param {Object} textObj - Text element config.
   * @returns {number} Index of the new element.
   */
  function addTextElement(textObj) {
    const defaults = {
      text: "Your text",
      x: canvas.width / 2,
      y: canvas.height / 2,
      fontFamily: "Impact",
      fontSize: 40,
      fontColor: "#ffffff",
      bold: false,
      italic: false,
      outlineColor: "#000000",
      outlineWidth: 3,
    };
    textElements.push({ ...defaults, ...textObj });
    render();
    return textElements.length - 1;
  }

  /**
   * Update a text element at a given index.
   * @param {number} index
   * @param {Object} props - Properties to update.
   */
  function updateTextElement(index, props) {
    if (index >= 0 && index < textElements.length) {
      Object.assign(textElements[index], props);
      render();
    }
  }

  /**
   * Remove a text element at a given index.
   * @param {number} index
   */
  function removeTextElement(index) {
    if (index >= 0 && index < textElements.length) {
      textElements.splice(index, 1);
      if (selectedTextIndex === index) {
        selectedTextIndex = -1;
      } else if (selectedTextIndex > index) {
        selectedTextIndex--;
      }
      render();
    }
  }

  /**
   * Set the selected text index.
   * @param {number} index
   */
  function setSelectedText(index) {
    selectedTextIndex = index;
    render();
  }

  /**
   * Get the currently selected text index.
   * @returns {number}
   */
  function getSelectedText() {
    return selectedTextIndex;
  }

  /**
   * Clear all text elements.
   */
  function clearTextElements() {
    textElements = [];
    selectedTextIndex = -1;
    render();
  }

  /**
   * Perform hit-test: find which text element (if any) is at point (px, py).
   * @param {number} px - X coordinate on canvas.
   * @param {number} py - Y coordinate on canvas.
   * @returns {number} Index of hit text element, or -1 if none.
   */
  function hitTest(px, py) {
    // Iterate in reverse so topmost (last drawn) is checked first
    for (let i = textElements.length - 1; i >= 0; i--) {
      const te = textElements[i];
      const bbox = getTextBoundingBox(te);
      if (
        px >= bbox.x &&
        px <= bbox.x + bbox.width &&
        py >= bbox.y &&
        py <= bbox.y + bbox.height
      ) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Compute the bounding box of a text element.
   * @param {Object} te - Text element.
   * @returns {Object} { x, y, width, height }
   */
  function getTextBoundingBox(te) {
    const font = buildFont(te);
    ctx.save();
    ctx.font = font;
    const lines = wrapText(te.text, te.fontSize, canvas.width * 0.9);
    const lineHeight = te.fontSize * 1.2;
    let maxWidth = 0;
    for (const line of lines) {
      const m = ctx.measureText(line);
      if (m.width > maxWidth) maxWidth = m.width;
    }
    const totalHeight = lines.length * lineHeight;
    ctx.restore();

    const pad = 8;
    return {
      x: te.x - maxWidth / 2 - pad,
      y: te.y - te.fontSize - pad,
      width: maxWidth + pad * 2,
      height: totalHeight + pad * 2,
    };
  }

  /**
   * Build CSS font string from text element properties.
   * @param {Object} te
   * @returns {string}
   */
  function buildFont(te) {
    let style = "";
    if (te.italic) style += "italic ";
    if (te.bold) style += "bold ";
    style += `${te.fontSize}px "${te.fontFamily}", sans-serif`;
    return style;
  }

  /**
   * Word-wrap text to fit within maxWidth.
   * @param {string} text
   * @param {number} fontSize
   * @param {number} maxWidth
   * @returns {string[]}
   */
  function wrapText(text, fontSize, maxWidth) {
    if (!text) return [""];
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  /**
   * Main render function. Clears canvas, draws image, draws all text elements.
   */
  function render() {
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (currentImage) {
      ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    } else {
      // Placeholder background
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#555";
      ctx.font = '20px "Segoe UI", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(
        "Select a template or upload an image",
        canvas.width / 2,
        canvas.height / 2
      );
    }

    // Draw text elements
    for (let i = 0; i < textElements.length; i++) {
      drawTextElement(textElements[i], i === selectedTextIndex);
    }
  }

  /**
   * Draw a single text element on the canvas.
   * @param {Object} te - Text element.
   * @param {boolean} isSelected - Whether to draw selection indicator.
   */
  function drawTextElement(te, isSelected) {
    ctx.save();
    ctx.font = buildFont(te);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const lines = wrapText(te.text, te.fontSize, canvas.width * 0.9);
    const lineHeight = te.fontSize * 1.2;
    const startY = te.y - te.fontSize;

    // Draw selection box
    if (isSelected) {
      const bbox = getTextBoundingBox(te);
      ctx.strokeStyle = "rgba(0, 123, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
      ctx.setLineDash([]);
    }

    // Draw each line
    for (let i = 0; i < lines.length; i++) {
      const ly = startY + i * lineHeight;

      // Outline
      if (te.outlineWidth > 0) {
        ctx.strokeStyle = te.outlineColor;
        ctx.lineWidth = te.outlineWidth * 2;
        ctx.lineJoin = "round";
        ctx.strokeText(lines[i], te.x, ly);
      }

      // Fill
      ctx.fillStyle = te.fontColor;
      ctx.fillText(lines[i], te.x, ly);
    }

    ctx.restore();
  }

  /**
   * Export the canvas as a PNG data URL (without selection indicators).
   * @returns {string} Data URL.
   */
  function exportPNG() {
    // Temporarily deselect to hide selection box
    const prevSelected = selectedTextIndex;
    selectedTextIndex = -1;
    render();
    const dataURL = canvas.toDataURL("image/png");
    selectedTextIndex = prevSelected;
    render();
    return dataURL;
  }

  /**
   * Get the canvas element.
   * @returns {HTMLCanvasElement}
   */
  function getCanvas() {
    return canvas;
  }

  /**
   * Get canvas dimensions.
   * @returns {Object} { width, height }
   */
  function getDimensions() {
    return { width: canvas.width, height: canvas.height };
  }

  return {
    init,
    loadImage,
    getTextElements,
    setTextElements,
    addTextElement,
    updateTextElement,
    removeTextElement,
    setSelectedText,
    getSelectedText,
    clearTextElements,
    hitTest,
    getTextBoundingBox,
    render,
    exportPNG,
    getCanvas,
    getDimensions,
    resizeCanvasToImage,
  };
})();
