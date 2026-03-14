import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AIAssistant from "@/components/ai-assistant";
import type { Artwork } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("artworks")
    .select("id,user_id,title,description,image_url,tags,is_hidden,created_at")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(24);

  const artworks = (data ?? []) as Artwork[];
  const userIds = [...new Set(artworks.map((art) => art.user_id))];
  const profilesResult = userIds.length
    ? await supabase.from("profiles").select("id,username").in("id", userIds)
    : { data: [] };

  const usernameMap = new Map(
    (profilesResult.data ?? []).map((row) => [row.id as string, (row.username as string | null) ?? "Anonim"])
  );

  return (
    <div className="page-grid">
      <section className="stack">
        <div className="hero glass-card">
          <h1>Cizimini yukle, hikayeni anlat, AI ile gelis.</h1>
          <p>
            Bu platformda sanatcilar cizimlerini sergiler, topluluktan yorum alir ve AI
            asistanla yeni fikirler uretir.
          </p>
          <div className="hero-actions">
            <Link className="btn" href="/upload">
              Cizim Paylas
            </Link>
            <Link className="btn btn-secondary" href="/auth">
              Giris Yap / Kayit Ol
            </Link>
          </div>
        </div>

        <section className="gallery-grid">
          {artworks.length === 0 ? (
            <div className="glass-card">
              <h2>Henuz cizim yok</h2>
              <p>Ilk cizimi sen yukleyebilirsin.</p>
            </div>
          ) : (
            artworks.map((art) => (
              <article className="art-card" key={art.id}>
                <Link href={`/artworks/${art.id}`}>
                  <div className="image-wrap">
                    <Image src={art.image_url} alt={art.title} fill sizes="(max-width: 900px) 100vw, 33vw" />
                  </div>
                </Link>
                <div className="card-content">
                  <h3>{art.title}</h3>
                  <p>{art.description || "Aciklama eklenmedi."}</p>
                  <div className="meta-row">
                    <span>@{usernameMap.get(art.user_id) ?? "Anonim"}</span>
                    <span>{new Date(art.created_at).toLocaleDateString("tr-TR")}</span>
                  </div>
                  <div className="tag-row">
                    {(art.tags ?? []).slice(0, 4).map((tag) => (
                      <span key={`${art.id}-${tag}`} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </section>

      <AIAssistant />
    </div>
  );
}
