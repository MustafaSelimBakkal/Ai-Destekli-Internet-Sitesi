import AuthPanel from "@/components/auth-panel";
import { createClient } from "@/lib/supabase/server";

export default async function AuthPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <section className="stack">
      <div className="hero glass-card">
        <h1>Hesabini olustur ve eserlerini paylas</h1>
        <p>
          Giris yapan kullanicilar cizim yukleyebilir, etiket ekleyebilir ve AI yardimiyla
          portfolyo aciklamasi hazirlayabilir.
        </p>
      </div>
      <AuthPanel isLoggedIn={!!user} userEmail={user?.email} />
    </section>
  );
}
