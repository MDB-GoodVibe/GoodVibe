import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { AppFrame } from "@/components/app-frame";
import { GlobalInteractionLoader } from "@/components/global-interaction-loader";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "Good Vibe",
    template: "%s | Good Vibe",
  },
  description:
    "아이디어 보드, 지식창고, Vibe Coding Helper를 한곳에서 연결하는 Good Vibe 서비스입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className={`${manrope.variable} min-h-full flex flex-col overflow-x-hidden`}>
        <GlobalInteractionLoader />
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
