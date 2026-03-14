import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import ArtworkInteractions from "@/components/artwork-interactions";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ArtworkDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);
  const db = isAdmin ? createAdminClient() : supabase;

  const artworkResult = await db
    .from("artworks")
    .select("id,user_id,title,description,image_url,tags,is_hidden,created_at")
    .eq("id", id)
    .single();

  if (!artworkResult.data) {
    notFound();
  }

  const artwork = artworkResult.data;

  if (artwork.is_hidden && !isAdmin) {
    notFound();
  }

  const [profileResult, likesResult, likedResult, commentsResult] = await Promise.all([
    db.from("profiles").select("username").eq("id", artwork.user_id).maybeSingle(),
    db.from("artwork_likes").select("artwork_id", { count: "exact", head: true }).eq("artwork_id", id),
    user
      ? supabase
          .from("artwork_likes")
          .select("artwork_id")
          .eq("artwork_id", id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    db
      .from("artwork_comments")
      .select("id,user_id,content,created_at,is_hidden")
      .eq("artwork_id", id)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(50)
  ]);

  const commentUserIds = [
    ...new Set((commentsResult.data ?? []).map((comment) => comment.user_id as string))
  ];
  const commentsProfiles = commentUserIds.length
    ? await db.from("profiles").select("id,username").in("id", commentUserIds)
    : { data: [] };

  const commentNameMap = new Map(
    (commentsProfiles.data ?? []).map((row) => [row.id as string, (row.username as string | null) ?? "anonim"])
  );

  const comments = (commentsResult.data ?? []).map((comment) => ({
    id: comment.id as string,
    content: comment.content as string,
    created_at: comment.created_at as string,
    username: commentNameMap.get(comment.user_id as string) ?? "anonim"
  }));

  return (
    <div className="stack detail-stack">
      <article className="glass-card detail-card">
        <h1>{artwork.title}</h1>
        <p>{artwork.description || "Aciklama eklenmedi."}</p>
        <p>
          <strong>Sanatci:</strong> @{profileResult.data?.username ?? "Anonim"}
        </p>
        <p>
          <strong>Tarih:</strong> {new Date(artwork.created_at).toLocaleDateString("tr-TR")}
        </p>
        <div className="detail-image-wrap">
          <Image src={artwork.image_url} alt={artwork.title} fill sizes="100vw" />
        </div>
        <div className="tag-row">
          {(artwork.tags ?? []).map((tag) => (
            <span key={`${artwork.id}-${tag}`} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      </article>

      <ArtworkInteractions
        artworkId={id}
        isLoggedIn={!!user}
        initialLiked={!!likedResult.data}
        initialLikeCount={likesResult.count ?? 0}
        initialComments={comments}
      />
    </div>
  );
}
