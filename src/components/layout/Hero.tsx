export default function Hero() {
  return (
    <section
      className="relative h-[640px] bg-center bg-cover bg-no-repeat flex items-center justify-center text-center"
      style={{
        backgroundImage:
          "url('/hero-image-4k.png')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
      <div className="relative container mx-auto pb-12 px-6">
        <h1 className="text-white text-3xl md:text-5xl font-extrabold uppercase leading-tight">
          Добре дошли на pchelarstvo.bg
          <span className="block">— българския портал за пчеларство</span>
        </h1>
      </div>
    </section>
  );
}
