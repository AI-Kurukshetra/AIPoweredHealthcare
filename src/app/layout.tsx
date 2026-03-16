import type { Metadata } from "next";
import "./globals.css";
import { AppQueryProvider } from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "AI-Powered Healthcare Workforce Platform",
  description: "Healthcare workforce and operations management system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  );
}
