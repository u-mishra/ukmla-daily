import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UKMLA Daily — One question. Every morning.",
  description:
    "A free daily UKMLA practice question straight to your inbox. Two minutes. Build the habit.",
  openGraph: {
    title: "UKMLA Daily — One question. Every morning.",
    description:
      "A free daily UKMLA practice question straight to your inbox. Two minutes. Build the habit.",
    type: "website",
    siteName: "UKMLA Daily",
  },
  twitter: {
    card: "summary_large_image",
    title: "UKMLA Daily — One question. Every morning.",
    description:
      "A free daily UKMLA practice question straight to your inbox.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${plusJakarta.variable} font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        {children}
      </body>
    </html>
  );
}
