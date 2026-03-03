import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { StoreProvider } from "@/store/StoreProvider";
import NextJsTopLoader from "@/lib/NextJsTopLoader";
import AuthProvider from "@/provider/AuthProvider";
import ModalManager from "@/components/landing/ModalManager";
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

const airbnbCereal = localFont({
  src: [
    {
      path: "./fonts/airbnb-cereal/AirbnbCereal_W_Lt.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/airbnb-cereal/AirbnbCereal_W_Bk.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/airbnb-cereal/AirbnbCereal_W_Md.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/airbnb-cereal/AirbnbCereal_W_Bd.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/airbnb-cereal/AirbnbCereal_W_XBd.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/airbnb-cereal/AirbnbCereal_W_Blk.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-airbnb-cereal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scrubbe",
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
      className={`${airbnbCereal.variable} ${bersley.variable} ${bigshotOne.variable} ${electrolize.variable}`}
    >
      <body className="antialiased min-h-screen w-full flex flex-col font-airbnb">
        <Suspense
          fallback={
            <div className="h-screen bg-white flex justify-center items-center">
              <Image
                src="/scrubbe-logo-01.png"
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

                  <ModalManager />
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
