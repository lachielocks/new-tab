import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "New Tab — calm Chrome new tab",
  description:
    "A calm new tab with weather, Unsplash backgrounds, search, and AI. Install in Chrome developer mode.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={display.variable}>
      <body>{children}</body>
    </html>
  );
}
