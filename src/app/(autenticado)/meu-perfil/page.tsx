import { redirect } from "next/navigation";
import Link from "next/link";
import { criarClienteSSR } from "@infra/supabase/cliente";
import { PerfilRepositorioSupabase } from "@infra/supabase/PerfilRepositorioSupabase";

// "Meu perfil" — a entrada direta do logado para a própria superfície de
// reputação (/handle). Resolve o Perfil do usuário e redireciona. Se ainda não
// há Perfil, é honesto sobre como ele nasce — NÃO auto-provisiona (isso quebraria
// o claim do creator, que loga para reivindicar um pendente, não para virar
// assessor). O nó do assessor nasce lazy, ao publicar/vincular.

export const dynamic = "force-dynamic";

export default async function MeuPerfilPage() {
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const perfil = await new PerfilRepositorioSupabase().buscarPorUsuario(user.id);
  if (perfil) redirect(`/${perfil.handle.valor}`);

  return (
    <main
      className="min-h-screen px-4 py-16"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="max-w-xl mx-auto">
        <h1
          className="text-3xl font-black leading-none mb-4"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-ink)",
            fontStretch: "condensed",
          }}
        >
          Você ainda não tem um perfil público
        </h1>
        <p className="text-base mb-8" style={{ color: "var(--color-ink2)" }}>
          Na Massa, o perfil nasce do trabalho — nunca de um cadastro vazio. Ele
          aparece de duas formas:
        </p>
        <ul className="flex flex-col gap-4 mb-10">
          <li
            className="p-4 rounded-[12px] border border-line"
            style={{ background: "var(--color-card)" }}
          >
            <span
              className="text-xs uppercase tracking-wider block mb-1"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink3)" }}
            >
              como assessor
            </span>
            <span style={{ color: "var(--color-ink)" }}>
              Publique uma oportunidade. Seu nó nasce ancorado nesse trabalho
              real.
            </span>
          </li>
          <li
            className="p-4 rounded-[12px] border border-line"
            style={{ background: "var(--color-card)" }}
          >
            <span
              className="text-xs uppercase tracking-wider block mb-1"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink3)" }}
            >
              como creator
            </span>
            <span style={{ color: "var(--color-ink)" }}>
              Reivindique um vínculo que um assessor abriu para você, pela
              oportunidade.
            </span>
          </li>
        </ul>
        <Link
          href="/oportunidades/nova"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-[8px] text-sm font-semibold"
          style={{
            background: "var(--color-violet)",
            color: "#fff",
            fontFamily: "var(--font-body)",
            minHeight: "44px",
          }}
        >
          Publicar uma oportunidade
        </Link>
      </div>
    </main>
  );
}
