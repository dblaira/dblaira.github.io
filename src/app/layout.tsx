import type { Metadata } from "next";
import "./globals.css";
import StudioSidebar from "@/components/StudioSidebar";

export const metadata: Metadata = {
  title: "SAVY",
  description: "Personal experiments and tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0A0A0A" />
        <link rel="apple-touch-icon" sizes="180x180" href="/savy-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/savy-icon-167x167.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/savy-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/savy-icon-120x120.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/savy-icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/savy-icon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <StudioSidebar />
      </body>
    </html>
  );
}
