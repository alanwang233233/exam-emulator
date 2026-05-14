import { NextResponse } from "next/server";
import { mockExam } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockExam);
}
