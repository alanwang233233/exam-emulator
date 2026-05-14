import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const todayRank = mockStore.scores
    .filter((item) => item.date === today)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const totalMap = new Map<string, { userName: string; totalScore: number }>();
  for (const item of mockStore.scores) {
    const previous = totalMap.get(item.userName);
    if (!previous) {
      totalMap.set(item.userName, { userName: item.userName, totalScore: item.totalScore });
      continue;
    }
    totalMap.set(item.userName, { userName: item.userName, totalScore: Math.max(previous.totalScore, item.totalScore) });
  }

  const totalRank = [...totalMap.values()].sort((a, b) => b.totalScore - a.totalScore).slice(0, 10);

  return NextResponse.json({
    todayRank,
    totalRank,
  });
}
