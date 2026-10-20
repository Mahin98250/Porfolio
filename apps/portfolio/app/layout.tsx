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
    "Mahin Patel builds digital tools while exploring AI, robotics and automation. A portfolio of experiments, prototypes and the questions behind them.",
  applicationName: "Mahin Patel Portfolio",
  openGraph: {
    type: "website",
    title: "Mahin Patel — Programmer & Builder",
    description: "Code is only the beginning. Follow the experiments, systems and questions shaping Mahin Patel’s path.",
    siteName: "Mahin Patel Portfolio",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08070d",
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
