import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function POST(request: Request) {
  const body = await request.json();
  const userName = String(body?.userName ?? "").trim();
  const password = String(body?.password ?? "").trim();

  if (userName.length < 2 || password.length < 6) {
    return NextResponse.json({ message: "用户名至少2位，密码至少6位" }, { status: 400 });
  }

  if (mockStore.users.some((user) => user.userName === userName)) {
    return NextResponse.json({ message: "用户已存在" }, { status: 409 });
  }

  mockStore.users.push({ userName, password });

  return NextResponse.json({ token: `mock-token-${userName}`, userName });
}
