# Meme Generator

A full-stack meme generator built with Next.js and InstantDB. Create memes with templates or your own images, add customizable text, and share them in a public feed with upvotes.

## Features

- **Template Library** - 9 built-in meme templates (Drake, Battle Machine, Spongebob, etc.)
- **Image Upload** - Use your own images as meme backgrounds
- **Top/Bottom Text** - Classic meme text inputs with real-time preview
- **Custom Text** - Add additional draggable text elements anywhere on the canvas
- **Drag & Drop** - Click and drag text to reposition it on the canvas
- **Font Controls** - Font family, size, color, bold, and italic
- **Outline Controls** - Adjustable text outline color and width
- **Download** - Export your finished meme as a PNG image
- **Post to Feed** - Share memes to a public feed (requires sign-in)
- **Upvotes** - Upvote memes from the feed (sign in as guest to vote)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Bootstrap 5
- **Backend/Database**: InstantDB
- **Storage**: InstantDB Storage for meme images

## Getting Started

### Prerequisites

- Node.js 18+
- An InstantDB account and app (or use the configured app ID)

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create `.env.local` in the project root (or use the existing one):

   ```
   NEXT_PUBLIC_INSTANT_APP_ID=your-instant-app-id
   ```

3. **Push schema and permissions to InstantDB**

   ```bash
   npx instant-cli init   # Select your app, generates schema/perms
   npx instant-cli push   # Push schema and permissions to production
   ```

   If you already have `instant.schema.ts` and `instant.perms.ts`, run:

   ```bash
   npx instant-cli push
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Usage

1. **Create** - Pick a template or upload an image, add text, customize fonts, drag to position
2. **Download** - Export your meme as PNG
3. **Post to Feed** - Sign in as guest, then click "Post to Feed" to share
4. **Vote** - Go to the Feed, sign in if needed, and upvote memes

## Project Structure

```
meme-generator/
├── src/
│   ├── app/
│   │   ├── feed/page.tsx    # Meme feed with upvotes
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Meme creator
│   │   └── globals.css      # Styles
│   ├── components/
│   │   ├── Layout/Navbar.tsx
│   │   ├── MemeCard/        # Feed meme card with upvote
│   │   └── MemeEditor/      # Canvas editor with controls
│   ├── data/templates.ts    # Meme template definitions
│   ├── lib/
│   │   ├── canvas-engine.ts # Canvas rendering
│   │   ├── db.ts            # InstantDB client
│   │   ├── drag-manager.ts  # Text drag & drop
│   │   └── utils.ts         # Helpers
│   ├── instant.schema.ts    # InstantDB schema
│   └── instant.perms.ts     # InstantDB permissions
├── public/templates/        # Meme template images
├── package.json
└── README.md
```

## InstantDB Schema

- **memes** - Meme posts with createdAt, linked to image ($files) and creator ($users)
- **votes** - Upvotes linking memes to voters ($users)
- **$files** - Storage for meme images
- **$users** - Built-in user entities (guest or authenticated)
