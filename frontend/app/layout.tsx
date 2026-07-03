import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Vectorizer",
  description: "Convert PNG/JPG images to clean SVG vectors",
  other: {
    "google-adsense-account": "ca-pub-6292269650358396",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased flex flex-col">
        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-slate-800 text-slate-300 py-8 px-4 mt-12">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm mb-4 sm:mb-0">
              <p className="font-semibold text-white">Image to SVG</p>
              <p>Convert images to scalable vectors</p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="/about" className="hover:text-white transition-colors">About</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6292269650358396"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Google IMA SDK for AdSense video ads */}
        <Script
          src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"
          strategy="afterInteractive"
          async
        />
      </body>
    </html>
  );
}
