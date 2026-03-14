"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
};

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function UploadForm({ userId }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (!file) {
      setStatus("Lutfen bir cizim dosyasi sec.");
      return;
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      setStatus("Sadece PNG, JPEG ve WEBP dosyalari yuklenebilir.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setStatus("Dosya boyutu 5MB'dan buyuk olamaz.");
      return;
    }

    setLoading(true);
    const safeFileName = file.name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
    const path = `${userId}/${Date.now()}-${safeFileName}`;

    const uploadResult = await supabase.storage.from("artworks").upload(path, file, {
      upsert: false,
      cacheControl: "3600"
    });

    if (uploadResult.error) {
      setStatus(uploadResult.error.message);
      setLoading(false);
      return;
    }

    const imageUrl = supabase.storage.from("artworks").getPublicUrl(path).data.publicUrl;
    const normalizedTags = tags
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const insertResult = await supabase.from("artworks").insert({
      user_id: userId,
      title,
      description,
      image_path: path,
      image_url: imageUrl,
      tags: normalizedTags
    });

    if (insertResult.error) {
      setStatus(insertResult.error.message);
      setLoading(false);
      return;
    }

    setStatus("Cizim basariyla paylasildi.");
    setTitle("");
    setDescription("");
    setTags("");
    setFile(null);
    router.push("/");
    router.refresh();
  }

  return (
    <form className="glass-card stack" onSubmit={onSubmit}>
      <h2>Yeni Cizim Yukle</h2>
      <label>
        Baslik
        <input required value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        Aciklama
        <textarea
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <label>
        Etiketler (virgulle)
        <input
          placeholder="anime, portrait, charcoal"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />
      </label>
      <label>
        Cizim Dosyasi
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            if (nextFile && !ALLOWED_TYPES.has(nextFile.type)) {
              setStatus("Sadece PNG, JPEG ve WEBP dosyalari yuklenebilir.");
              setFile(null);
              return;
            }

            if (nextFile && nextFile.size > MAX_FILE_SIZE) {
              setStatus("Dosya boyutu 5MB'dan buyuk olamaz.");
              setFile(null);
              return;
            }

            setStatus("");
            setFile(nextFile);
          }}
          required
        />
      </label>

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Yukleniyor..." : "Paylas"}
      </button>
      {status ? <p>{status}</p> : null}
    </form>
  );
}
