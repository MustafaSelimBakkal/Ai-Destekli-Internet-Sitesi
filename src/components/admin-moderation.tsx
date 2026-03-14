"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ArtworkItem = {
  id: string;
  title: string;
  is_hidden: boolean;
  created_at: string;
  username: string;
};

type CommentItem = {
  id: string;
  content: string;
  is_hidden: boolean;
  created_at: string;
  artwork_id: string;
  username: string;
};

type Props = {
  artworks: ArtworkItem[];
  comments: CommentItem[];
};

export default function AdminModeration({ artworks, comments }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [busyKey, setBusyKey] = useState("");

  async function toggleArtwork(id: string, nextHidden: boolean) {
    setBusyKey(`a-${id}`);
    setStatus("");
    const response = await fetch(`/api/admin/artworks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_hidden: nextHidden })
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Cizim guncellenemedi.");
      setBusyKey("");
      return;
    }

    setStatus("Cizim durumu guncellendi.");
    setBusyKey("");
    router.refresh();
  }

  async function toggleComment(id: string, nextHidden: boolean) {
    setBusyKey(`c-${id}`);
    setStatus("");
    const response = await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_hidden: nextHidden })
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Yorum guncellenemedi.");
      setBusyKey("");
      return;
    }

    setStatus("Yorum durumu guncellendi.");
    setBusyKey("");
    router.refresh();
  }

  return (
    <section className="stack">
      {status ? <p>{status}</p> : null}

      <div className="glass-card stack">
        <h2>Cizim Moderasyonu</h2>
        {artworks.map((artwork) => (
          <article key={artwork.id} className="moderation-item">
            <div>
              <p>
                <strong>{artwork.title}</strong> by @{artwork.username}
              </p>
              <p>{new Date(artwork.created_at).toLocaleString("tr-TR")}</p>
            </div>
            <button
              className="btn"
              type="button"
              disabled={busyKey === `a-${artwork.id}`}
              onClick={() => toggleArtwork(artwork.id, !artwork.is_hidden)}
            >
              {artwork.is_hidden ? "Yayinla" : "Gizle"}
            </button>
          </article>
        ))}
      </div>

      <div className="glass-card stack">
        <h2>Yorum Moderasyonu</h2>
        {comments.map((comment) => (
          <article key={comment.id} className="moderation-item">
            <div>
              <p>
                <strong>@{comment.username}</strong> - {comment.content}
              </p>
              <p>{new Date(comment.created_at).toLocaleString("tr-TR")}</p>
              <p>Artwork: {comment.artwork_id}</p>
            </div>
            <button
              className="btn"
              type="button"
              disabled={busyKey === `c-${comment.id}`}
              onClick={() => toggleComment(comment.id, !comment.is_hidden)}
            >
              {comment.is_hidden ? "Yorumu Ac" : "Yorumu Gizle"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
