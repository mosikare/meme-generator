"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { MemeEditor } from "@/components/MemeEditor/MemeEditor";
import { db } from "@/lib/db";
import { dataURLtoFile } from "@/lib/utils";
import { id } from "@instantdb/react";

export default function CreatePage() {
  const router = useRouter();
  const { user } = db.useAuth();
  const [isPosting, setIsPosting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignInAsGuest = useCallback(async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await db.auth.signInAsGuest();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const handleExport = useCallback(
    async (dataUrl: string) => {
      if (!user?.id) {
        setError("Please sign in first. Click 'Continue as Guest' above.");
        return;
      }

      setIsPosting(true);
      setError(null);
      try {
        const memeId = id();
        const file = dataURLtoFile(dataUrl, `meme-${memeId}.png`);
        const path = `memes/${user.id}/${memeId}.png`;
        const { data: uploadData } = await db.storage.uploadFile(path, file, {
          contentType: "image/png",
        });
        const fileId = uploadData?.id;
        if (!fileId) {
          throw new Error("File upload completed but could not retrieve file ID");
        }

        await db.transact([
          db.tx.memes[memeId]
            .update({ createdAt: new Date() })
            .link({ image: fileId, creator: user.id }),
        ]);

        router.push("/feed");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to post meme");
      } finally {
        setIsPosting(false);
      }
    },
    [router, user]
  );

  return (
    <>
      {!user && (
        <div className="container-fluid px-3 py-2">
          <div className="alert alert-info d-flex align-items-center justify-content-between">
            <span>Sign in to post memes to the feed.</span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSignInAsGuest}
              disabled={isSigningIn}
            >
              {isSigningIn ? "Signing in..." : "Continue as Guest"}
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="container-fluid px-3">
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
              aria-label="Close"
            />
          </div>
        </div>
      )}
      {isPosting && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="spinner-border text-light" role="status" />
        </div>
      )}
      <MemeEditor onExport={handleExport} canPost={!!user} />
    </>
  );
}
