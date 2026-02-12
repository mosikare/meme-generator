import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    memes: i.entity({
      createdAt: i.date(),
      title: i.string().optional(),
    }),
    votes: i.entity({}),
  },
  links: {
    memeImage: {
      forward: { on: "memes", has: "one", label: "image", required: true },
      reverse: { on: "$files", has: "many", label: "memes" },
    },
    memeCreator: {
      forward: { on: "memes", has: "one", label: "creator", required: true },
      reverse: { on: "$users", has: "many", label: "createdMemes" },
    },
    voteMeme: {
      forward: { on: "votes", has: "one", label: "meme", required: true },
      reverse: { on: "memes", has: "many", label: "votes" },
    },
    voteUser: {
      forward: { on: "votes", has: "one", label: "voter", required: true },
      reverse: { on: "$users", has: "many", label: "votes" },
    },
  },
  rooms: {},
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;
export type { AppSchema };
export default schema;
