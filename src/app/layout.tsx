import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "团圆学习平台",
  description: "本地优先的主观题刷题与复习平台"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
