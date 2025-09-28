import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold">Новината не е намерена</h1>
        <p className="text-gray-600 mt-2">Възможно е да е премахната или временно недостъпна.</p>
        <Link href="/news" className="mt-4 inline-flex rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
          Към всички новини
        </Link>
      </div>
    </section>
  );
}