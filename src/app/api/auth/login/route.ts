import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function POST(request: Request) {
  const body = await request.json();
  const userName = String(body?.userName ?? "").trim();
  const password = String(body?.password ?? "").trim();

  const found = mockStore.users.find((user) => user.userName === userName && user.password === password);
  if (!found) {
    return NextResponse.json({ message: "用户名或密码错误" }, { status: 401 });
  }

  return NextResponse.json({ token: `mock-token-${userName}`, userName });
}
