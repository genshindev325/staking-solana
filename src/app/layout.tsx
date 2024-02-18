import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Toaster } from "react-hot-toast";
import { ContextProvider } from "@/contexts/ContextProvider";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

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
      <body>
        <Toaster
          toastOptions={{
            className: "",
            style: {
              borderRadius: "10px",
              background: "#0a4c8f",
              color: "#fff",
              fontFamily: "LilitaOne"
            },
            position: "top-center",
          }}
        />
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  );
}
