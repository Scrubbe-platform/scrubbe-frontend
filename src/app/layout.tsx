import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { StoreProvider } from "@/store/StoreProvider";
import NextJsTopLoader from "@/lib/NextJsTopLoader";
import AuthProvider from "@/provider/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider";
import Image from "next/image";
import { QueryClientProviders } from "@/provider/QueryClientProvider";

const bersley = localFont({
  src: [
    {
      path: "./fonts/bersley/Besley-Bold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/bersley/Besley-ExtraBold.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-bersley",
  display: "swap",
});
const bigshotOne = localFont({
  src: "./fonts/BigshotOne-Regular.ttf",
  variable: "--font-bigshotOne",
  display: "swap",
});
const electrolize = localFont({
  src: "./fonts/Electrolize-Regular.ttf",
  variable: "--font-electrolize",
  display: "swap",
});

const IBM = localFont({
  src: [
    {
      path: "./fonts/IBMPlexSans-Regular.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexSans-Medium.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexSans-SemiBold.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ibm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scrubbe | Governed Incident Intelligence platform",
  description:
    "AI-Powered Engineering Incident Management & Code Intelligence Platform",
};
//overflow-hidden
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${IBM.variable} ${bersley.variable} ${bigshotOne.variable} ${electrolize.variable}`}
    >
      <head>
        <script
          src="https://t.contentsquare.net/uxa/8af75147dbd67.js"
          defer
        ></script>
      </head>
      <body className="antialiased min-h-screen w-full flex flex-col font-airbnb">
        <Suspense
          fallback={
            <div className="h-screen bg-white flex justify-center items-center">
              <Image
                src="/blacklogo.png"
                alt="scrubbe-logo-01.png"
                fill
                sizes="(min-width: 300px) 100vw"
                className="object-contain scale-75 "
              />{" "}
            </div>
          }
        >
          <QueryClientProviders>
            <ThemeProvider>
              <AuthProvider>
                <NextJsTopLoader />
                <StoreProvider>
                  {/*  <AnnouncementBar /> disabled for now till official launch */}
                  {/* <NavbarWrapper /> */}
                  <main className="flex-grow h-full w-full">{children}</main>
                  {/* <FooterWrapper /> */}
                </StoreProvider>
                <Toaster position="top-center" />
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProviders>
        </Suspense>
      </body>
    </html>
  );
}
