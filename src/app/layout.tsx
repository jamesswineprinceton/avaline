import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avaline",
  description: "Market insights for Oasis tickets... courtesy of Avaline of northern Britain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
