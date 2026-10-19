import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteShell } from "../components/site-shell";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mahin.runs-on.dev"),
  title: {
    default: "Mahin Patel — Programmer & Builder",
    template: "%s · Mahin Patel",
  },
  description:
    "The portfolio of Mahin Patel, a student programmer exploring software, AI, robotics and automation through practical projects.",
  applicationName: "Mahin Patel Portfolio",
  openGraph: {
    type: "website",
    title: "Mahin Patel — Programmer & Builder",
    description: "Curiosity, compiled into real things.",
    siteName: "Mahin Patel Portfolio",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#070b16",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
