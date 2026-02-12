/**
 * Main application: wires UI controls to the CanvasEngine and DragManager.
 */
document.addEventListener("DOMContentLoaded", () => {
  // ─── DOM References ───────────────────────────────────────────────
  const canvas = document.getElementById("memeCanvas");
  const templateGrid = document.getElementById("templateGrid");
  const uploadInput = document.getElementById("uploadInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const topTextInput = document.getElementById("topText");
  const bottomTextInput = document.getElementById("bottomText");
  const addCustomTextBtn = document.getElementById("addCustomText");
  const removeTextBtn = document.getElementById("removeText");
  const fontFamilySelect = document.getElementById("fontFamily");
  const fontSizeRange = document.getElementById("fontSize");
  const fontSizeValue = document.getElementById("fontSizeValue");
  const fontColorInput = document.getElementById("fontColor");
  const boldToggle = document.getElementById("boldToggle");
  const italicToggle = document.getElementById("italicToggle");
  const outlineColorInput = document.getElementById("outlineColor");
  const outlineWidthRange = document.getElementById("outlineWidth");
  const outlineWidthValue = document.getElementById("outlineWidthValue");
  const downloadBtn = document.getElementById("downloadBtn");
  const clearAllBtn = document.getElementById("clearAll");
  const selectedTextInfo = document.getElementById("selectedTextInfo");

  // ─── Initialize Bootstrap Tooltips ─────────────────────────────────
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  tooltipTriggerList.forEach(
    (el) => new bootstrap.Tooltip(el)
  );

  // ─── Initialize Canvas Engine ─────────────────────────────────────
  CanvasEngine.init(canvas);

  // ─── Initialize Drag Manager ──────────────────────────────────────
  DragManager.init(canvas, {
    onSelect: (index) => {
      updateControlsFromSelected(index);
    },
    onDragEnd: () => {},
  });

  // ─── Template Grid ────────────────────────────────────────────────
  MemeTemplates.forEach((template, idx) => {
    const col = document.createElement("div");
    col.className = "col-4 mb-2";

    const card = document.createElement("div");
    card.className = "template-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.title = template.name;

    const img = document.createElement("img");
    img.src = template.path;
    img.alt = template.name;
    img.className = "img-fluid rounded";
    img.loading = "lazy";

    const label = document.createElement("small");
    label.className = "template-label";
    label.textContent = template.name;

    card.appendChild(img);
    card.appendChild(label);
    col.appendChild(card);
    templateGrid.appendChild(col);

    card.addEventListener("click", () => selectTemplate(idx));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTemplate(idx);
      }
    });
  });

  function selectTemplate(idx) {
    const template = MemeTemplates[idx];
    // Highlight selected
    document.querySelectorAll(".template-card").forEach((c, i) => {
      c.classList.toggle("active", i === idx);
    });
    CanvasEngine.clearTextElements();
    CanvasEngine.loadImage(template.path).then(() => {
      // Add default texts
      const dims = CanvasEngine.getDimensions();
      template.defaultTexts.forEach((dt) => {
        CanvasEngine.addTextElement({
          text: dt.text,
          x: dims.width * dt.xRatio,
          y: dims.height * dt.yRatio,
        });
      });
      syncTopBottomInputs();
    });
  }

  // ─── Upload Image ─────────────────────────────────────────────────
  uploadBtn.addEventListener("click", () => uploadInput.click());

  uploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.querySelectorAll(".template-card").forEach((c) =>
        c.classList.remove("active")
      );
      CanvasEngine.clearTextElements();
      CanvasEngine.loadImage(ev.target.result).then(() => {
        // Add default top/bottom text
        const dims = CanvasEngine.getDimensions();
        CanvasEngine.addTextElement({
          text: "Top text",
          x: dims.width / 2,
          y: dims.height * 0.12,
        });
        CanvasEngine.addTextElement({
          text: "Bottom text",
          x: dims.width / 2,
          y: dims.height * 0.92,
        });
        syncTopBottomInputs();
      });
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-uploaded
    uploadInput.value = "";
  });

  // ─── Top / Bottom Text Inputs ─────────────────────────────────────
  topTextInput.addEventListener("input", () => {
    const elements = CanvasEngine.getTextElements();
    if (elements.length >= 1) {
      CanvasEngine.updateTextElement(0, { text: topTextInput.value });
    }
  });

  bottomTextInput.addEventListener("input", () => {
    const elements = CanvasEngine.getTextElements();
    if (elements.length >= 2) {
      CanvasEngine.updateTextElement(1, { text: bottomTextInput.value });
    }
  });

  function syncTopBottomInputs() {
    const elements = CanvasEngine.getTextElements();
    topTextInput.value = elements.length >= 1 ? elements[0].text : "";
    bottomTextInput.value = elements.length >= 2 ? elements[1].text : "";
  }

  // ─── Add Custom Text ─────────────────────────────────────────────
  addCustomTextBtn.addEventListener("click", () => {
    const dims = CanvasEngine.getDimensions();
    const idx = CanvasEngine.addTextElement({
      text: "Custom text",
      x: dims.width / 2,
      y: dims.height / 2,
      fontSize: 32,
    });
    CanvasEngine.setSelectedText(idx);
    updateControlsFromSelected(idx);
  });

  // ─── Remove Selected Text ────────────────────────────────────────
  removeTextBtn.addEventListener("click", () => {
    const sel = CanvasEngine.getSelectedText();
    if (sel >= 0) {
      CanvasEngine.removeTextElement(sel);
      syncTopBottomInputs();
      updateControlsFromSelected(-1);
    }
  });

  // ─── Font Controls ───────────────────────────────────────────────
  fontFamilySelect.addEventListener("change", () => {
    applyToSelected({ fontFamily: fontFamilySelect.value });
  });

  fontSizeRange.addEventListener("input", () => {
    fontSizeValue.textContent = fontSizeRange.value + "px";
    applyToSelected({ fontSize: parseInt(fontSizeRange.value) });
  });

  fontColorInput.addEventListener("input", () => {
    applyToSelected({ fontColor: fontColorInput.value });
  });

  boldToggle.addEventListener("click", () => {
    boldToggle.classList.toggle("active");
    applyToSelected({ bold: boldToggle.classList.contains("active") });
  });

  italicToggle.addEventListener("click", () => {
    italicToggle.classList.toggle("active");
    applyToSelected({ italic: italicToggle.classList.contains("active") });
  });

  outlineColorInput.addEventListener("input", () => {
    applyToSelected({ outlineColor: outlineColorInput.value });
  });

  outlineWidthRange.addEventListener("input", () => {
    outlineWidthValue.textContent = outlineWidthRange.value + "px";
    applyToSelected({ outlineWidth: parseInt(outlineWidthRange.value) });
  });

  function applyToSelected(props) {
    const sel = CanvasEngine.getSelectedText();
    if (sel >= 0) {
      CanvasEngine.updateTextElement(sel, props);
    }
  }

  /**
   * Update the font controls UI to reflect the selected text element's properties.
   */
  function updateControlsFromSelected(index) {
    if (index < 0) {
      selectedTextInfo.textContent = "No text selected";
      removeTextBtn.disabled = true;
      return;
    }
    removeTextBtn.disabled = false;
    const te = CanvasEngine.getTextElements()[index];
    if (!te) return;
    selectedTextInfo.textContent = `Selected: "${te.text.substring(0, 20)}${te.text.length > 20 ? "..." : ""}"`;
    fontFamilySelect.value = te.fontFamily;
    fontSizeRange.value = te.fontSize;
    fontSizeValue.textContent = te.fontSize + "px";
    fontColorInput.value = te.fontColor;
    boldToggle.classList.toggle("active", te.bold);
    italicToggle.classList.toggle("active", te.italic);
    outlineColorInput.value = te.outlineColor;
    outlineWidthRange.value = te.outlineWidth;
    outlineWidthValue.textContent = te.outlineWidth + "px";
  }

  // ─── Clear All ────────────────────────────────────────────────────
  clearAllBtn.addEventListener("click", () => {
    CanvasEngine.clearTextElements();
    syncTopBottomInputs();
    updateControlsFromSelected(-1);
    document
      .querySelectorAll(".template-card")
      .forEach((c) => c.classList.remove("active"));
  });

  // ─── Download ─────────────────────────────────────────────────────
  downloadBtn.addEventListener("click", () => {
    const dataURL = CanvasEngine.exportPNG();
    const link = document.createElement("a");
    link.download = `meme-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // ─── Window Resize ────────────────────────────────────────────────
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      CanvasEngine.resizeCanvasToImage();
      CanvasEngine.render();
    }, 200);
  });
});
