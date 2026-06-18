import { NextResponse } from "next/server";
import { examDataJsonSpec } from "@/lib/exam-contract";

export async function GET() {
  return NextResponse.json(examDataJsonSpec);
}
