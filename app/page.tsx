import Link from "next/link";

export default function Home() {
  const experiments = [
    {
      id: "hypervortex",
      name: "HyperVortex",
      description: "Interactive particle simulation with tunable physics parameters.",
      href: "/labs/hypervortex",
    },
  ];

  return (
    <main className="min-h-screen p-8 md:p-24 max-w-5xl mx-auto">
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          Labs
        </h1>
        <p className="text-zinc-400 text-lg">
          Personal experimentation platform.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiments.map((exp) => (
          <Link
            key={exp.id}
            href={exp.href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-6 transition-all hover:bg-zinc-800/80 hover:border-zinc-700 hover:-translate-y-1"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2 text-zinc-100 group-hover:text-blue-400 transition-colors">
                {exp.name}
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {exp.description}
              </p>
            </div>
            <div className="mt-8 flex items-center text-sm font-medium text-blue-500 opacity-0 transform translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0">
              Launch Experiment
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
