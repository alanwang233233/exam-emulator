import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Exam Emulator 考试模拟器",
  description: "重温学校考试氛围的在线模拟系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
