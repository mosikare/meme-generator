/**
 * Meme template definitions.
 * Each template has a name, image path, and suggested default text positions.
 */

export interface DefaultText {
  text: string;
  xRatio: number;
  yRatio: number;
}

export interface MemeTemplate {
  name: string;
  path: string;
  defaultTexts: DefaultText[];
}

export const MemeTemplates: MemeTemplate[] = [
  {
    name: "Drake Hotline Bling",
    path: "/templates/drake.jpg",
    defaultTexts: [
      { text: "Top text here", xRatio: 0.75, yRatio: 0.25 },
      { text: "Bottom text here", xRatio: 0.75, yRatio: 0.75 },
    ],
  },
  {
    name: "Battle Machine",
    path: "/templates/battle-machine.jpg",
    defaultTexts: [
      { text: "Top text", xRatio: 0.5, yRatio: 0.12 },
      { text: "Bottom text", xRatio: 0.5, yRatio: 0.88 },
    ],
  },
  {
    name: "Best Meme Template",
    path: "/templates/best-meme-templates-04.jpeg",
    defaultTexts: [
      { text: "Top text", xRatio: 0.5, yRatio: 0.12 },
      { text: "Bottom text", xRatio: 0.5, yRatio: 0.88 },
    ],
  },
  {
    name: "Disappointed Guy",
    path: "/templates/disappointed-guy.jpg",
    defaultTexts: [
      { text: "Top text", xRatio: 0.5, yRatio: 0.12 },
      { text: "Bottom text", xRatio: 0.5, yRatio: 0.88 },
    ],
  },
  {
    name: "Pooh Bear",
    path: "/templates/pooh-bear.jpg",
    defaultTexts: [
      { text: "Top text", xRatio: 0.5, yRatio: 0.12 },
      { text: "Bottom text", xRatio: 0.5, yRatio: 0.88 },
    ],
  },
  {
    name: "Press Both Buttons",
    path: "/templates/press-both-buttons.jpeg",
    defaultTexts: [
      { text: "Option A", xRatio: 0.3, yRatio: 0.2 },
      { text: "Option B", xRatio: 0.7, yRatio: 0.2 },
    ],
  },
  {
    name: "Space Human",
    path: "/templates/space-human.jpeg",
    defaultTexts: [
      { text: "Top text", xRatio: 0.5, yRatio: 0.12 },
      { text: "Bottom text", xRatio: 0.5, yRatio: 0.88 },
    ],
  },
  {
    name: "Spongebob",
    path: "/templates/spongebob.jpg",
    defaultTexts: [
      { text: "Top text", xRatio: 0.5, yRatio: 0.12 },
      { text: "Bottom text", xRatio: 0.5, yRatio: 0.88 },
    ],
  },
  {
    name: "Winner",
    path: "/templates/winner.jpg",
    defaultTexts: [
      { text: "Top text", xRatio: 0.5, yRatio: 0.12 },
      { text: "Bottom text", xRatio: 0.5, yRatio: 0.88 },
    ],
  },
];
