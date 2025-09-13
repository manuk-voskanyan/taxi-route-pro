import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TaxiRoute Pro - Քաղաքարի տաքսի ամրագրման հարթակ",
  description: "Կապակցիր վարորդների և ուղևորների քաղաքարի տաքսի ճանապարհորդությունների համար: Ամրագրիր ճանապարհ կամ առաջարկիր ծառայություն այսօր:",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hy">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
