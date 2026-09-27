import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuickMenu Starter",
  description: "Multi-restaurant digital menu starter"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Browser extensions can inject attributes on <html> before hydration.
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
