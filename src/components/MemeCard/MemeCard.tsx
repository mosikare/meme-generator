"use client";

import { db } from "@/lib/db";
import { id } from "@instantdb/react";

interface MemeCardProps {
  meme: {
    id: string;
    image?: { url?: string };
    creator?: { email?: string };
    votes?: Array<{ id: string; voter?: { id?: string } }>;
  };
}

export function MemeCard({ meme }: MemeCardProps) {
  const { user } = db.useAuth();
  const voteCount = meme.votes?.length ?? 0;
  const userVote = user?.id
    ? meme.votes?.find((v) => v.voter?.id === user.id)
    : null;
  const hasVoted = !!userVote;

  const handleVote = async () => {
    if (!user?.id) return;
    if (hasVoted && userVote) {
      await db.transact([db.tx.votes[userVote.id].delete()]);
    } else {
      await db.transact([
        db.tx.votes[id()]
          .update({})
          .link({ meme: meme.id, voter: user.id }),
      ]);
    }
  };

  const imageUrl = meme.image?.url;
  if (!imageUrl) return null;

  return (
    <div className="card bg-dark border-secondary h-100">
      <img
        src={imageUrl}
        className="card-img-top object-fit-cover"
        alt="Meme"
        style={{ maxHeight: 300, objectFit: "cover" }}
      />
      <div className="card-body d-flex align-items-center justify-content-between">
        <button
          type="button"
          className={`btn btn-sm d-flex align-items-center gap-1 ${
            hasVoted ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={handleVote}
          disabled={!user}
          title={!user ? "Sign in to vote" : hasVoted ? "Remove vote" : "Upvote"}
        >
          <i className={`bi ${hasVoted ? "bi-caret-up-fill" : "bi-caret-up"}`} />
          <span>{voteCount}</span>
        </button>
        {meme.creator?.email && (
          <small className="text-muted">{meme.creator.email}</small>
        )}
      </div>
    </div>
  );
}
