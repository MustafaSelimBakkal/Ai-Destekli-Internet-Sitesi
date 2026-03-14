import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClientIp, hitRateLimit } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Yorum icin giris gerekli." }, { status: 401 });
  }

  const limiter = hitRateLimit({
    key: `comment:${getClientIp(request)}:${user.id}`,
    limit: 8,
    windowMs: 60_000
  });

  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Cok hizli yorum gonderiyorsun. Lutfen biraz bekle." },
      { status: 429 }
    );
  }

  const { content } = (await request.json()) as { content?: string };
  const text = content?.trim() ?? "";

  if (!text) {
    return NextResponse.json({ error: "Yorum bos olamaz." }, { status: 400 });
  }

  if (text.length > 500) {
    return NextResponse.json({ error: "Yorum en fazla 500 karakter olabilir." }, { status: 400 });
  }

  const insert = await supabase
    .from("artwork_comments")
    .insert({ artwork_id: id, user_id: user.id, content: text })
    .select("id,content,created_at")
    .single();

  if (insert.error || !insert.data) {
    return NextResponse.json({ error: insert.error?.message ?? "Yorum eklenemedi." }, { status: 400 });
  }

  const profile = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    comment: {
      id: insert.data.id,
      content: insert.data.content,
      created_at: insert.data.created_at,
      username: profile.data?.username ?? user.email?.split("@")[0] ?? "artist"
    }
  });
}
