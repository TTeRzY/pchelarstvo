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
import ReportTreatmentModal from "@/components/treatments/ReportTreatmentModal";
import TreatmentTicker from "@/components/treatments/TreatmentTicker";
import LocaleProvider from "@/context/LocaleProvider";
import MainContent from "@/components/layout/MainContent";
import ContactSellerModal from "@/components/market/ContactSellerModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
// Validate environment variables on server startup
import "@/lib/env";
import { generateMetadata as generateSEOMetadata, generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = generateSEOMetadata({
  title: "Pchelarstvo.bg",
  description: "Българският портал за пчеларство. Намерете пчелари, разгледайте пчелна борса, карта на пчелините, новини и ресурси за пчелари.",
  keywords: ["пчеларство", "пчелари", "мед", "пчелини", "пчелна борса", "българия"],
  locale: "bg",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="bg">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <LocaleProvider>
            <ModalProvider>
              <AuthProvider>
                <Header />
                <SwarmTicker />
                <TreatmentTicker />
                <MainContent>{children}</MainContent>
                <Footer />
                {/* Modal root lives once, at the end */}
                <AuthModal />
                <ContactSellerModal />
                <ReportSwarmModal />
                <ReportTreatmentModal />
              </AuthProvider>
            </ModalProvider>
          </LocaleProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

