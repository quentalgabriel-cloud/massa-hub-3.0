// Pagina inicial provisoria — apenas confirma que o scaffold e os tokens estao de pe.
// A primeira tela real e a Screen 10 (publicar oportunidade), ver PROMPTS.md PROMPT 5.

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-7 py-24">
      <p className="font-[family-name:var(--font-plex-mono)] text-xs uppercase tracking-widest text-ink3">
        massa·hub · fase 1
      </p>
      <h1 className="mt-6 font-[family-name:var(--font-archivo)] text-5xl font-black leading-none tracking-tight text-ink">
        A prova que fica.
      </h1>
      <p className="mt-5 max-w-xl text-ink2">
        Scaffold de pe. Arquitetura hexagonal pronta para o modulo de
        oportunidades. O dominio vem primeiro — ver{" "}
        <span className="font-[family-name:var(--font-plex-mono)] text-violet-deep">
          docs/specs/
        </span>
        .
      </p>
    </main>
  );
}
