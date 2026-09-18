import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BhuVista - 3D Land Intelligence Platform",
  description:
    "Government-grade 3D Land Intelligence & Volumetric Cadastral Mapping Platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
