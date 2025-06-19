import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dance Battle Tournament - Epic Dance Battles",
  description:
    "Join the ultimate dance battle tournament where legends are born. Register as a participant or manage as admin.",
  keywords: "dance battle, tournament, dance competition, hip hop, breakdance",
  authors: [{ name: "Dance Battle Tournament" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#00d4ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
