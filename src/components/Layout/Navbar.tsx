"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="navbar navbar-dark py-2">
      <div className="container-fluid">
        <Link className="navbar-brand text-decoration-none" href="/">
          <i className="bi bi-emoji-laughing me-2"></i>
          Meme<span>Generator</span>
        </Link>
        <div className="d-flex gap-2">
          <Link
            className="btn btn-outline-light btn-sm"
            href="/"
          >
            Create
          </Link>
          <Link
            className="btn btn-outline-light btn-sm"
            href="/feed"
          >
            Feed
          </Link>
        </div>
      </div>
    </nav>
  );
}
