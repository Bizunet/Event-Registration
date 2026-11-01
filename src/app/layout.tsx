import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DDUECSF | Thanksgiving Program",
  description: "Register for the 100 Days Left Overnight Thanksgiving Program.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
