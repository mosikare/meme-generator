"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MemeTemplates } from "@/data/templates";
import {
  createCanvasEngine,
  type CanvasEngineClass,
  type TextElement,
} from "@/lib/canvas-engine";
import { createDragManager, type DragManagerClass } from "@/lib/drag-manager";

interface MemeEditorProps {
  onExport?: (dataUrl: string) => void;
  canPost?: boolean;
}

export function MemeEditor({ onExport, canPost = true }: MemeEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const customTextFieldsRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<CanvasEngineClass | null>(null);
  const dragManagerRef = useRef<DragManagerClass | null>(null);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(-1);
  const [selectedTextIndex, setSelectedTextIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const eng = createCanvasEngine();
    eng.init(canvas);
    setEngine(eng);
    const dm = createDragManager();
    dm.init(canvas, eng, {
      onSelect: (idx) => setSelectedTextIndex(idx),
    });
    dragManagerRef.current = dm;
    return () => {
      dm.destroy();
    };
  }, []);

  const selectTemplate = useCallback(
    (idx: number) => {
      if (!engine) return;
      const template = MemeTemplates[idx];
      setSelectedTemplateIndex(idx);
      engine.clearTextElements();
      engine.loadImage(template.path).then(() => {
        const dims = engine.getDimensions();
        template.defaultTexts.forEach((dt) => {
          engine.addTextElement({
            text: dt.text,
            x: dims.width * dt.xRatio,
            y: dims.height * dt.yRatio,
          });
        });
      });
    },
    [engine]
  );

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !engine) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedTemplateIndex(-1);
        engine.clearTextElements();
        engine.loadImage(ev.target?.result as string).then(() => {
          const dims = engine.getDimensions();
          engine.addTextElement({
            text: "Top text",
            x: dims.width / 2,
            y: dims.height * 0.12,
          });
          engine.addTextElement({
            text: "Bottom text",
            x: dims.width / 2,
            y: dims.height * 0.92,
          });
        });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [engine]
  );

  const handleResize = useCallback(() => {
    engine?.resizeCanvasToImage();
    engine?.render();
  }, [engine]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const elements = engine?.getTextElements() ?? [];
  const selectedElement = selectedTextIndex >= 0 ? elements[selectedTextIndex] : null;

  const applyToSelected = useCallback(
    (props: Partial<TextElement>) => {
      if (selectedTextIndex >= 0) engine?.updateTextElement(selectedTextIndex, props);
    },
    [engine, selectedTextIndex]
  );

  return (
    <div className="container-fluid px-3 py-3">
      <div className="row g-3">
        <div className="col-md-4 col-lg-3">
          <div className="control-panel p-3">
            <div className="mb-3">
              <div className="section-header">
                <i className="bi bi-images me-1"></i>Templates
              </div>
              <div className="row g-2">
                {MemeTemplates.map((template, idx) => (
                  <div key={idx} className="col-4 mb-2">
                    <div
                      className={`template-card ${selectedTemplateIndex === idx ? "active" : ""}`}
                      role="button"
                      tabIndex={0}
                      title={template.name}
                      onClick={() => selectTemplate(idx)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectTemplate(idx);
                        }
                      }}
                    >
                      <img
                        src={template.path}
                        alt={template.name}
                        className="img-fluid rounded"
                        loading="lazy"
                      />
                      <small className="template-label">{template.name}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <div className="section-header">
                <i className="bi bi-upload me-1"></i>Upload Image
              </div>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleUpload}
              />
              <button
                type="button"
                className="btn btn-outline-light btn-sm w-100"
                onClick={() => uploadInputRef.current?.click()}
              >
                <i className="bi bi-image me-1"></i>Choose Image
              </button>
            </div>

            <div className="mb-3">
              <div className="section-header">
                <i className="bi bi-type me-1"></i>Text
              </div>
              <div className="mb-2">
                <label htmlFor="editTextInput" className="form-label small mb-1">
                  Edit selected text
                </label>
                <input
                  type="text"
                  id="editTextInput"
                  className="form-control form-control-sm"
                  placeholder="Click text on canvas to edit..."
                  value={selectedElement?.text ?? ""}
                  onChange={(e) => applyToSelected({ text: e.target.value })}
                />
              </div>
              {elements.length >= 1 && (
                <div className="mb-2">
                  <label htmlFor="topText" className="form-label small mb-1">
                    Top Text
                  </label>
                  <input
                    type="text"
                    id="topText"
                    className="form-control form-control-sm"
                    placeholder="Enter top text..."
                    value={elements[0]?.text ?? ""}
                    onChange={(e) => engine?.updateTextElement(0, { text: e.target.value })}
                  />
                </div>
              )}
              {elements.length >= 2 && (
                <div className="mb-2">
                  <label htmlFor="bottomText" className="form-label small mb-1">
                    Bottom Text
                  </label>
                  <input
                    type="text"
                    id="bottomText"
                    className="form-control form-control-sm"
                    placeholder="Enter bottom text..."
                    value={elements[1]?.text ?? ""}
                    onChange={(e) => engine?.updateTextElement(1, { text: e.target.value })}
                  />
                </div>
              )}
              <div ref={customTextFieldsRef} className="mb-2">
                {elements.slice(2).map((el, i) => (
                  <div key={i} className="mb-2">
                    <label
                      htmlFor={`customText-${i + 2}`}
                      className="form-label small mb-1"
                    >
                      Custom text {i + 1}
                    </label>
                    <input
                      type="text"
                      id={`customText-${i + 2}`}
                      className="form-control form-control-sm"
                      placeholder="Type your custom text..."
                      value={el.text}
                      onChange={(e) =>
                        engine?.updateTextElement(i + 2, { text: e.target.value })
                      }
                      onFocus={() => {
                        engine?.setSelectedText(i + 2);
                        setSelectedTextIndex(i + 2);
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm flex-fill"
                  onClick={() => {
                    const dims = engine?.getDimensions() ?? { width: 300, height: 250 };
                    const idx = engine?.addTextElement({
                      text: "Custom text",
                      x: dims.width / 2,
                      y: dims.height / 2,
                      fontSize: 32,
                    });
                    if (idx !== undefined) {
                      engine?.setSelectedText(idx);
                      setSelectedTextIndex(idx);
                    }
                  }}
                >
                  <i className="bi bi-plus-lg me-1"></i>Add Text
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm flex-fill"
                  disabled={selectedTextIndex < 0}
                  onClick={() => {
                    if (selectedTextIndex >= 0) {
                      engine?.removeTextElement(selectedTextIndex);
                      setSelectedTextIndex(-1);
                    }
                  }}
                >
                  <i className="bi bi-trash me-1"></i>Remove
                </button>
              </div>
              <div className="selected-info mt-2" id="selectedTextInfo">
                {selectedTextIndex >= 0 && selectedElement
                  ? `Selected: "${selectedElement.text.substring(0, 20)}${selectedElement.text.length > 20 ? "..." : ""}"`
                  : "No text selected"}
              </div>
            </div>

            <div className="mb-3">
              <div className="section-header">
                <i className="bi bi-fonts me-1"></i>Font Style
              </div>
              <div className="mb-2">
                <label htmlFor="fontFamily" className="form-label small mb-1">
                  Font
                </label>
                <select
                  id="fontFamily"
                  className="form-select form-select-sm"
                  value={selectedElement?.fontFamily ?? "Impact"}
                  onChange={(e) => applyToSelected({ fontFamily: e.target.value })}
                >
                  <option value="Impact">Impact</option>
                  <option value="Arial">Arial</option>
                  <option value="Comic Sans MS">Comic Sans</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="form-label small mb-1">
                  Size: <span className="text-info">{selectedElement?.fontSize ?? 40}px</span>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min={16}
                  max={80}
                  value={selectedElement?.fontSize ?? 40}
                  onChange={(e) => applyToSelected({ fontSize: parseInt(e.target.value) })}
                />
              </div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div>
                  <label className="form-label small mb-1">Color</label>
                  <input
                    type="color"
                    value={selectedElement?.fontColor ?? "#ffffff"}
                    onChange={(e) => applyToSelected({ fontColor: e.target.value })}
                  />
                </div>
                <div className="ms-auto d-flex gap-1">
                  <button
                    type="button"
                    className={`btn btn-sm btn-toggle ${selectedElement?.bold ? "active" : ""}`}
                    title="Bold"
                    onClick={() => applyToSelected({ bold: !selectedElement?.bold })}
                  >
                    <i className="bi bi-type-bold"></i>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm btn-toggle ${selectedElement?.italic ? "active" : ""}`}
                    title="Italic"
                    onClick={() => applyToSelected({ italic: !selectedElement?.italic })}
                  >
                    <i className="bi bi-type-italic"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="section-header">
                <i className="bi bi-border-width me-1"></i>Outline
              </div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div>
                  <label className="form-label small mb-1">Color</label>
                  <input
                    type="color"
                    value={selectedElement?.outlineColor ?? "#000000"}
                    onChange={(e) => applyToSelected({ outlineColor: e.target.value })}
                  />
                </div>
                <div className="flex-fill">
                  <label className="form-label small mb-1">
                    Width:{" "}
                    <span className="text-info">{selectedElement?.outlineWidth ?? 3}px</span>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min={0}
                    max={8}
                    value={selectedElement?.outlineWidth ?? 3}
                    onChange={(e) =>
                      applyToSelected({ outlineWidth: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="d-grid gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  engine?.clearTextElements();
                  setSelectedTextIndex(-1);
                  setSelectedTemplateIndex(-1);
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>Clear All
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-8 col-lg-9">
          <div className="canvas-panel p-3 text-center">
            <canvas id="memeCanvas" ref={canvasRef} />
            <div className="mt-3 d-flex gap-2 justify-content-center flex-wrap">
              <button
                type="button"
                className="btn btn-download btn-lg"
                onClick={() => {
                  const dataUrl = engine?.exportPNG();
                  if (dataUrl) {
                    const link = document.createElement("a");
                    link.download = `meme-${Date.now()}.png`;
                    link.href = dataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
              >
                <i className="bi bi-download me-2"></i>Download Meme
              </button>
              <button
                type="button"
                className="btn btn-accent btn-lg"
                disabled={!canPost}
                title={!canPost ? "Sign in to post" : undefined}
                onClick={() => {
                  const dataUrl = engine?.exportPNG();
                  if (dataUrl) onExport?.(dataUrl);
                }}
              >
                <i className="bi bi-cloud-upload me-2"></i>Post to Feed
              </button>
            </div>
            <p className="text-muted-custom mt-2 mb-0">
              <i className="bi bi-hand-index me-1"></i>Click on text to select it, then drag to
              reposition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
