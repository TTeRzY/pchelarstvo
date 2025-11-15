import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/context/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import ModalProvider from "@/components/modal/ModalProvider";
import ReportSwarmModal from "@/components/swarm/ReportSwarmModal";
import SwarmTicker from "@/components/swarm/SwarmTicker";
import LocaleProvider from "@/context/LocaleProvider";
import MainContent from "@/components/layout/MainContent";
import ContactSellerModal from "@/components/market/ContactSellerModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
// Validate environment variables on server startup
import "@/lib/env";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pchelarstvo.bg",
  description:
    "?'???>??????????? ???????'???> ???? ?????>???????'????, ???????????, ?????>???? ?+???????? ?? ??????'?? ???? ?????>?????'??.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <LocaleProvider>
            <ModalProvider>
              <AuthProvider>
                <Header />
                <SwarmTicker />
                <MainContent>{children}</MainContent>
                <Footer />
                {/* Modal root lives once, at the end */}
                <AuthModal />
                <ContactSellerModal />
                <ReportSwarmModal />
              </AuthProvider>
            </ModalProvider>
          </LocaleProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

