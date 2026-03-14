import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Yalnizca admin kullanabilir." }, { status: 403 });
  }

  const { is_hidden } = (await request.json()) as { is_hidden?: boolean };

  if (typeof is_hidden !== "boolean") {
    return NextResponse.json({ error: "Gecersiz durum." }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const result = await adminSupabase.from("artworks").update({ is_hidden }).eq("id", id);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
