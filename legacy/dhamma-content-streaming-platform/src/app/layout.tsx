import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "DhammaStream - Buddhist Content Streaming Platform",
  description:
    "Access thousands of Buddhist teachings, meditation guides, and spiritual content. Stream video, audio, and read ebooks from renowned teachers and practitioners.",
  keywords:
    "Buddhism, Dharma, meditation, teachings, spiritual content, Buddhist videos, audio, ebooks",
  authors: [{ name: "DhammaStream" }],
  creator: "DhammaStream",
  metadataBase: new URL("https://dhammastream.com"),
  openGraph: {
    title: "DhammaStream - Buddhist Content Streaming Platform",
    description:
      "Access thousands of Buddhist teachings, meditation guides, and spiritual content.",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "DhammaStream - Buddhist Content Streaming Platform",
    description:
      "Access thousands of Buddhist teachings, meditation guides, and spiritual content."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
