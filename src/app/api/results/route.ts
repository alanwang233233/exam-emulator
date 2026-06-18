import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function POST(request: Request) {
  const body = await request.json();
  const userName = String(body?.userName ?? "").trim();
  const subject = String(body?.subject ?? "").trim();
  const score = Number(body?.score ?? 0);
  const totalScore = Number(body?.totalScore ?? score);

  if (!userName || !subject || Number.isNaN(score)) {
    return NextResponse.json({ message: "参数不完整" }, { status: 400 });
  }

  const date = new Date().toISOString().slice(0, 10);
  mockStore.scores.push({
    userName,
    subject,
    score,
    totalScore,
    date,
  });

  return NextResponse.json({ ok: true, date });
}
