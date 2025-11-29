"use client";

import { useSearchParams, useRouter } from "next/navigation";
import NewListingForm from "@/components/market/NewListingForm.client";
import { Suspense } from "react";

function NewListingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = searchParams.get("returnTo");

  const handleCreated = (id: string) => {
    if (returnTo) {
      // Redirect back to the specified page after a short delay to show success message
      setTimeout(() => {
        router.push(returnTo);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[900px] mx-auto px-4">
        <NewListingForm onCreated={handleCreated} />
      </div>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[900px] mx-auto px-4">
          <div className="text-gray-600">Зареждане...</div>
        </div>
      </div>
    }>
      <NewListingPageContent />
    </Suspense>
  );
}