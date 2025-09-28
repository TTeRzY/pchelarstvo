import NewListingForm from "@/components/market/NewListingForm.client";

export default function NewListingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[900px] mx-auto px-4">
        <NewListingForm />
      </div>
    </div>
  );
}