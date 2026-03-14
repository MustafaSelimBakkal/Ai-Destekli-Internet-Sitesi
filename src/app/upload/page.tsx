import { redirect } from "next/navigation";
import UploadForm from "@/components/upload-form";
import { createClient } from "@/lib/supabase/server";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <section className="stack">
      <div className="hero glass-card">
        <h1>Cizimini yukle</h1>
        <p>Baslik, aciklama ve etiketlerle cizimini topluluga sun.</p>
      </div>
      <UploadForm userId={user.id} />
    </section>
  );
}
