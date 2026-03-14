"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  isLoggedIn: boolean;
  userEmail?: string;
};

export default function AuthPanel({ isLoggedIn, userEmail }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) {
    return (
      <div className="glass-card">
        <h2>Hesap Durumu</h2>
        <p>Giris yapildi: {userEmail}</p>
        <form action="/api/auth/signout" method="post">
          <button className="btn" type="submit">
            Cikis Yap
          </button>
        </form>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const endpoint = mode === "signin" ? "/api/auth/signin" : "/api/auth/signup";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Bir hata olustu.");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      setStatus("Kayit tamamlandi. E-posta dogrulama baglantisini kontrol et.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="glass-card">
      <h2>{mode === "signin" ? "Giris Yap" : "Kayit Ol"}</h2>
      <div className="segmented">
        <button
          className={mode === "signin" ? "segmented-item active" : "segmented-item"}
          type="button"
          onClick={() => setMode("signin")}
        >
          Giris
        </button>
        <button
          className={mode === "signup" ? "segmented-item active" : "segmented-item"}
          type="button"
          onClick={() => setMode("signup")}
        >
          Kayit
        </button>
      </div>

      <form className="stack" onSubmit={onSubmit}>
        <label>
          E-posta
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Sifre
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Bekleniyor..." : mode === "signin" ? "Giris" : "Kayit"}
        </button>
      </form>

      {status ? <p>{status}</p> : null}
    </div>
  );
}
