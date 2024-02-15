import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Urbanist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ContextProvider } from "@/contexts/ContextProvider";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
const urbanist = Urbanist({ subsets: ["latin"] });

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#131313",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={urbanist.className}>
        <Toaster
          toastOptions={{
            className: "",
            style: {
              borderRadius: "10px",
              background: "#39393e",
              color: "#fff",
            },
            position: "top-center",
          }}
        />
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  );
}
