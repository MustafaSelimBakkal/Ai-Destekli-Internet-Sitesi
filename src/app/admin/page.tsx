import { redirect } from "next/navigation";
import AdminModeration from "@/components/admin-moderation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/");
  }

  const adminSupabase = createAdminClient();

  const artworksResult = await adminSupabase
    .from("artworks")
    .select("id,user_id,title,is_hidden,created_at")
    .order("created_at", { ascending: false })
    .limit(60);

  const commentsResult = await adminSupabase
    .from("artwork_comments")
    .select("id,user_id,content,is_hidden,created_at,artwork_id")
    .order("created_at", { ascending: false })
    .limit(80);

  const userIds = [
    ...new Set([
      ...(artworksResult.data ?? []).map((item) => item.user_id as string),
      ...(commentsResult.data ?? []).map((item) => item.user_id as string)
    ])
  ];

  const profilesResult = userIds.length
    ? await adminSupabase.from("profiles").select("id,username").in("id", userIds)
    : { data: [] };

  const usernameMap = new Map(
    (profilesResult.data ?? []).map((item) => [item.id as string, (item.username as string | null) ?? "anonim"])
  );

  const artworks = (artworksResult.data ?? []).map((item) => ({
    id: item.id as string,
    title: item.title as string,
    is_hidden: Boolean(item.is_hidden),
    created_at: item.created_at as string,
    username: usernameMap.get(item.user_id as string) ?? "anonim"
  }));

  const comments = (commentsResult.data ?? []).map((item) => ({
    id: item.id as string,
    content: item.content as string,
    is_hidden: Boolean(item.is_hidden),
    created_at: item.created_at as string,
    artwork_id: item.artwork_id as string,
    username: usernameMap.get(item.user_id as string) ?? "anonim"
  }));

  return (
    <section className="stack">
      <div className="hero glass-card">
        <h1>Admin Moderasyon</h1>
        <p>Cizim ve yorum gorunurlugunu yonetebilirsin.</p>
      </div>
      <AdminModeration artworks={artworks} comments={comments} />
    </section>
  );
}
