"use client";

import { type FormEvent, useState } from "react";

type CommentItem = {
  id: string;
  content: string;
  created_at: string;
  username: string;
};

type Props = {
  artworkId: string;
  isLoggedIn: boolean;
  initialLiked: boolean;
  initialLikeCount: number;
  initialComments: CommentItem[];
};

export default function ArtworkInteractions({
  artworkId,
  isLoggedIn,
  initialLiked,
  initialLikeCount,
  initialComments
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [busyLike, setBusyLike] = useState(false);
  const [busyComment, setBusyComment] = useState(false);

  async function toggleLike() {
    if (!isLoggedIn) {
      setStatus("Begeni icin once giris yapmalisin.");
      return;
    }

    setBusyLike(true);
    setStatus("");

    try {
      const response = await fetch(`/api/artworks/${artworkId}/like`, { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Begeni isleminde hata");
      }

      setLiked(data.liked);
      setLikeCount(data.count);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      setStatus(message);
    } finally {
      setBusyLike(false);
    }
  }

  async function sendComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoggedIn) {
      setStatus("Yorum icin once giris yapmalisin.");
      return;
    }

    if (!content.trim()) {
      return;
    }

    setBusyComment(true);
    setStatus("");

    try {
      const response = await fetch(`/api/artworks/${artworkId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Yorum gonderilemedi");
      }

      setComments((prev) => [data.comment as CommentItem, ...prev]);
      setContent("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      setStatus(message);
    } finally {
      setBusyComment(false);
    }
  }

  return (
    <section className="glass-card stack">
      <h2>Topluluk Etkilesimi</h2>
      <div className="interaction-row">
        <button className="btn" onClick={toggleLike} type="button" disabled={busyLike}>
          {liked ? "Begeniyi Geri Al" : "Begeni Birak"}
        </button>
        <span>{likeCount} begeni</span>
      </div>

      <form className="stack" onSubmit={sendComment}>
        <label>
          Yorum yaz
          <textarea
            rows={3}
            value={content}
            maxLength={500}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Yapici bir yorum birak"
          />
        </label>
        <button className="btn" type="submit" disabled={busyComment}>
          {busyComment ? "Gonderiliyor..." : "Yorum Gonder"}
        </button>
      </form>

      {status ? <p>{status}</p> : null}

      <div className="stack">
        {comments.length === 0 ? (
          <p>Henuz yorum yok.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="comment-card">
              <div className="meta-row">
                <strong>@{comment.username}</strong>
                <span>{new Date(comment.created_at).toLocaleDateString("tr-TR")}</span>
              </div>
              <p>{comment.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
