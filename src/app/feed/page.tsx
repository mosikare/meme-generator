"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { MemeCard } from "@/components/MemeCard/MemeCard";

export default function FeedPage() {
  const { user } = db.useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const { isLoading, error, data } = db.useQuery({
    memes: {
      $: {
        order: { serverCreatedAt: "desc" },
      },
      image: {},
      creator: {},
      votes: { voter: {} },
    },
  });

  const memes = data?.memes ?? [];

  const handleSignInAsGuest = async () => {
    setIsSigningIn(true);
    try {
      await db.auth.signInAsGuest();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="container-fluid px-3 py-3">
      {!user && (
        <div className="alert alert-info d-flex align-items-center justify-content-between mb-3">
          <span>Sign in to upvote memes.</span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSignInAsGuest}
            disabled={isSigningIn}
          >
            {isSigningIn ? "Signing in..." : "Continue as Guest"}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-5">
          <div className="spinner-border text-light" role="status" />
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error.message}
        </div>
      )}

      {!isLoading && !error && memes.length === 0 && (
        <div className="text-center py-5 text-muted">
          <p className="lead">No memes yet. Be the first to post one!</p>
          <a href="/" className="btn btn-accent">
            Create Meme
          </a>
        </div>
      )}

      {!isLoading && memes.length > 0 && (
        <div className="row g-3">
          {memes.map((meme) => (
            <div key={meme.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <MemeCard meme={meme} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
