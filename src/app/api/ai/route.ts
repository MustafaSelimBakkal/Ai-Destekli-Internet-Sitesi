import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getClientIp, hitRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limiter = hitRateLimit({
      key: `ai:${ip}`,
      limit: 15,
      windowMs: 60_000
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Cok fazla AI istegi gonderildi. Lutfen kisa sure sonra tekrar dene." },
        { status: 429 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY tanimli degil." }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { message, drawingContext } = (await request.json()) as {
      message?: string;
      drawingContext?: string;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Mesaj bos olamaz." }, { status: 400 });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Sen cizim platformunda yardimci bir asistansin. Kisa, net, yapici tavsiyeler ver. Kullaniciya bir sonraki adimlari somut olarak oner."
        },
        {
          role: "user",
          content: `Kullanici mesaji: ${message}\nCizim baglami: ${drawingContext ?? "Belirtilmedi"}`
        }
      ]
    });

    return NextResponse.json({ reply: response.output_text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
