import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Maseray Temne Blogger — Community Fund", template: "%s | MTB Fund" },
  description:
    "A community mutual-support fund — members pool contributions so that whenever anyone faces hardship, the fund can step in and help.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
