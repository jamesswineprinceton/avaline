import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avaline — Concert Price Concierge",
  description: "British-voiced market insights for concert ticket pricing",
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
