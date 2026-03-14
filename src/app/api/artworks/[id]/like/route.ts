import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Bu islem icin giris gerekli." }, { status: 401 });
  }

  const likeKey = {
    artwork_id: id,
    user_id: user.id
  };

  const existing = await supabase
    .from("artwork_likes")
    .select("artwork_id")
    .match(likeKey)
    .maybeSingle();

  if (existing.error) {
    return NextResponse.json({ error: existing.error.message }, { status: 400 });
  }

  if (existing.data) {
    const del = await supabase.from("artwork_likes").delete().match(likeKey);
    if (del.error) {
      return NextResponse.json({ error: del.error.message }, { status: 400 });
    }
  } else {
    const add = await supabase.from("artwork_likes").insert(likeKey);
    if (add.error) {
      return NextResponse.json({ error: add.error.message }, { status: 400 });
    }
  }

  const countResult = await supabase
    .from("artwork_likes")
    .select("artwork_id", { count: "exact", head: true })
    .eq("artwork_id", id);

  if (countResult.error) {
    return NextResponse.json({ error: countResult.error.message }, { status: 400 });
  }

  return NextResponse.json({
    liked: !existing.data,
    count: countResult.count ?? 0
  });
}
