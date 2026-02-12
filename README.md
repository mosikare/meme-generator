# Meme Generator

A browser-based meme generator built with vanilla HTML/CSS/JavaScript and Bootstrap 5. No build tools required.

## Features

- **Template Library** - 6 built-in meme templates (Drake, Distracted Boyfriend, Change My Mind, One Does Not Simply, Expanding Brain, Two Buttons)
- **Image Upload** - Use your own images as meme backgrounds
- **Top/Bottom Text** - Classic meme text inputs with real-time preview
- **Custom Text** - Add additional draggable text elements anywhere on the canvas
- **Drag & Drop** - Click and drag text to reposition it on the canvas
- **Font Controls** - Font family, size, color, bold, and italic
- **Outline Controls** - Adjustable text outline color and width for classic meme style
- **Download** - Export your finished meme as a PNG image

## Getting Started

1. Open `index.html` directly in your browser, **or** serve it locally:

   ```bash
   # Python 3
   python3 -m http.server 8080

   # Then visit http://localhost:8080
   ```

2. Pick a template or upload your own image
3. Edit the top/bottom text (or add custom text)
4. Drag text to position it
5. Adjust font style and outline as desired
6. Click **Download Meme** to save your creation

## Tech Stack

- HTML5 Canvas for rendering
- Bootstrap 5.3.8 (CDN)
- Bootstrap Icons (CDN)
- Vanilla JavaScript (ES6+)

## Project Structure

```
meme-generator/
├── index.html              Main page
├── css/
│   └── style.css           Custom dark theme styles
├── js/
│   ├── templates.js        Meme template definitions
│   ├── canvas.js           Canvas rendering engine
│   ├── drag.js             Drag-and-drop manager
│   └── app.js              App initialization and event wiring
└── assets/
    └── templates/          SVG meme template images
```
