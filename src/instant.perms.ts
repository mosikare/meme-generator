import type { InstantRules } from "@instantdb/react";

const rules = {
  memes: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "auth.id == data.ref('creator.id')",
      delete: "auth.id == data.ref('creator.id')",
    },
  },
  votes: {
    allow: {
      view: "true",
      create: "auth.id != null",
      delete: "auth.id == data.ref('voter.id')",
    },
  },
  $files: {
    allow: {
      view: "true",
      create: "auth.id != null",
    },
  },
} satisfies InstantRules;

export default rules;
