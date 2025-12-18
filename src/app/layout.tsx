import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TwinSpec Console",
  description: "Dataset-aware instrument console (web-owned state, Unity + data twin consumers)."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}