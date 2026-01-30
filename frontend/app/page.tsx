import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-6">
          <span className="text-cyan uppercase tracking-[0.3em] text-xs">TripTree</span>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            O teu hub de viagens com estilo <span className="text-lime">móvel-first</span>.
          </h1>
          <p className="text-white/70 max-w-2xl">
            Cria um perfil público com links e um mapa do mundo iluminado com os sítios que já visitaste.
          </p>
          <div className="flex gap-4">
            <Link className="btn-primary" href="/signup">Criar conta</Link>
            <Link className="btn-secondary" href="/login">Entrar</Link>
          </div>
        </header>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { title: "Links inteligentes", desc: "Ícones automáticos e organização instantânea." },
            { title: "Mapa interativo", desc: "Pinpoints luminosos das viagens." },
            { title: "Painel rápido", desc: "Tudo administrado no teu telemóvel." }
          ].map((card) => (
            <div key={card.title} className="glass rounded-3xl p-6">
              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
              <p className="text-white/60">{card.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
