/**
 * Canvas rendering engine for the meme generator.
 * Handles image loading, text drawing with stroke/fill, word wrap, and PNG export.
 */

export interface TextElement {
  text: string;
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  bold: boolean;
  italic: boolean;
  outlineColor: string;
  outlineWidth: number;
}

const DEFAULTS: Partial<TextElement> = {
  text: "Your text",
  fontFamily: "Impact",
  fontSize: 40,
  fontColor: "#ffffff",
  bold: false,
  italic: false,
  outlineColor: "#000000",
  outlineWidth: 3,
};

export class CanvasEngineClass {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private currentImage: HTMLImageElement | null = null;
  private textElements: TextElement[] = [];
  private selectedTextIndex = -1;

  init(canvasEl: HTMLCanvasElement) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext("2d");
    this.canvas.width = 600;
    this.canvas.height = 500;
    this.render();
  }

  loadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        this.currentImage = img;
        this.resizeCanvasToImage();
        this.render();
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  resizeCanvasToImage() {
    if (!this.canvas || !this.currentImage) return;
    const container = this.canvas.parentElement;
    if (!container) return;
    const style = getComputedStyle(container);
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    const maxWidth = container.clientWidth - padLeft - padRight - 2;
    const ratio = this.currentImage.height / this.currentImage.width;
    let w = Math.min(this.currentImage.width, maxWidth);
    let h = w * ratio;
    if (h > 700) {
      h = 700;
      w = h / ratio;
    }
    this.canvas!.width = Math.round(w);
    this.canvas!.height = Math.round(h);
  }

  getTextElements(): TextElement[] {
    return this.textElements;
  }

  setTextElements(elements: TextElement[]) {
    this.textElements = elements;
    this.render();
  }

  addTextElement(textObj: Partial<TextElement>): number {
    const el: TextElement = {
      ...DEFAULTS,
      text: "Your text",
      x: this.canvas ? this.canvas.width / 2 : 300,
      y: this.canvas ? this.canvas.height / 2 : 250,
      fontFamily: "Impact",
      fontSize: 40,
      fontColor: "#ffffff",
      bold: false,
      italic: false,
      outlineColor: "#000000",
      outlineWidth: 3,
      ...textObj,
    };
    this.textElements.push(el);
    this.render();
    return this.textElements.length - 1;
  }

  updateTextElement(index: number, props: Partial<TextElement>) {
    if (index >= 0 && index < this.textElements.length) {
      Object.assign(this.textElements[index], props);
      this.render();
    }
  }

  removeTextElement(index: number) {
    if (index >= 0 && index < this.textElements.length) {
      this.textElements.splice(index, 1);
      if (this.selectedTextIndex === index) {
        this.selectedTextIndex = -1;
      } else if (this.selectedTextIndex > index) {
        this.selectedTextIndex--;
      }
      this.render();
    }
  }

  setSelectedText(index: number) {
    this.selectedTextIndex = index;
    this.render();
  }

  getSelectedText(): number {
    return this.selectedTextIndex;
  }

  clearTextElements() {
    this.textElements = [];
    this.selectedTextIndex = -1;
    this.render();
  }

  hitTest(px: number, py: number): number {
    if (!this.ctx || !this.canvas) return -1;
    for (let i = this.textElements.length - 1; i >= 0; i--) {
      const te = this.textElements[i];
      const bbox = this.getTextBoundingBox(te);
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

  private getTextBoundingBox(te: TextElement): { x: number; y: number; width: number; height: number } {
    if (!this.ctx || !this.canvas) return { x: 0, y: 0, width: 0, height: 0 };
    const font = this.buildFont(te);
    this.ctx.save();
    this.ctx.font = font;
    const lines = this.wrapText(te.text, te.fontSize, this.canvas.width * 0.9);
    const lineHeight = te.fontSize * 1.2;
    let maxWidth = 0;
    for (const line of lines) {
      const m = this.ctx.measureText(line);
      if (m.width > maxWidth) maxWidth = m.width;
    }
    const totalHeight = lines.length * lineHeight;
    this.ctx.restore();
    const pad = 8;
    return {
      x: te.x - maxWidth / 2 - pad,
      y: te.y - te.fontSize - pad,
      width: maxWidth + pad * 2,
      height: totalHeight + pad * 2,
    };
  }

  private buildFont(te: TextElement): string {
    let style = "";
    if (te.italic) style += "italic ";
    if (te.bold) style += "bold ";
    style += `${te.fontSize}px "${te.fontFamily}", sans-serif`;
    return style;
  }

  private wrapText(text: string, fontSize: number, maxWidth: number): string[] {
    if (!this.ctx) return [""];
    if (!text) return [""];
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0] || "";
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i];
      const metrics = this.ctx.measureText(testLine);
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

  render() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.currentImage) {
      this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.fillStyle = "#1a1a2e";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "#555";
      this.ctx.font = '20px "Segoe UI", sans-serif';
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "Select a template or upload an image",
        this.canvas.width / 2,
        this.canvas.height / 2
      );
    }
    for (let i = 0; i < this.textElements.length; i++) {
      this.drawTextElement(this.textElements[i], i === this.selectedTextIndex);
    }
  }

  private drawTextElement(te: TextElement, isSelected: boolean) {
    if (!this.ctx || !this.canvas) return;
    this.ctx.save();
    this.ctx.font = this.buildFont(te);
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "top";
    const lines = this.wrapText(te.text, te.fontSize, this.canvas.width * 0.9);
    const lineHeight = te.fontSize * 1.2;
    const startY = te.y - te.fontSize;
    if (isSelected) {
      const bbox = this.getTextBoundingBox(te);
      this.ctx.strokeStyle = "rgba(0, 123, 255, 0.8)";
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([6, 3]);
      this.ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
      this.ctx.setLineDash([]);
    }
    for (let i = 0; i < lines.length; i++) {
      const ly = startY + i * lineHeight;
      if (te.outlineWidth > 0) {
        this.ctx.strokeStyle = te.outlineColor;
        this.ctx.lineWidth = te.outlineWidth * 2;
        this.ctx.lineJoin = "round";
        this.ctx.strokeText(lines[i], te.x, ly);
      }
      this.ctx.fillStyle = te.fontColor;
      this.ctx.fillText(lines[i], te.x, ly);
    }
    this.ctx.restore();
  }

  exportPNG(): string {
    if (!this.canvas) return "";
    const prevSelected = this.selectedTextIndex;
    this.selectedTextIndex = -1;
    this.render();
    const dataURL = this.canvas.toDataURL("image/png");
    this.selectedTextIndex = prevSelected;
    this.render();
    return dataURL;
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  getDimensions(): { width: number; height: number } {
    if (!this.canvas) return { width: 0, height: 0 };
    return { width: this.canvas.width, height: this.canvas.height };
  }
}

export const createCanvasEngine = () => new CanvasEngineClass();
