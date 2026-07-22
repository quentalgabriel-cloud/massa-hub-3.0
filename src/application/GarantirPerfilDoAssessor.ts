import { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";
import { Perfil } from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";

// Caso de uso: garantir que o assessor logado tem um Perfil REAL (o no da rede).
//
// Fecha o fio solto da Fase 1: as acoes de oportunidade usavam `user.id` (id de
// auth) como se fosse perfilId. Sem um no em `perfis`, o assessor nao tem
// /handle, nao acumula Lastro, e o id colide com o namespace de perfilId das
// provas. Aqui ele ganha, no primeiro uso, um Perfil `reivindicado` do tipo
// assessor — sem formulario de onboarding (o handle e derivado do nome/e-mail).
//
// Get-or-create idempotente ("uma identidade, um no"): se o usuario ja tem um
// perfil (buscarPorUsuario), ele e retornado como esta. A criacao so acontece
// uma vez. O usuarioId vem SEMPRE da sessao de auth no servidor, nunca do
// cliente.

export interface EntradaGarantirPerfilDoAssessor {
  usuarioId: string; // da sessao de auth (server-side)
  nome: string; // nome de exibicao (Google)
  email?: string; // fallback para derivar o handle e o nome
  perfilId: string; // id a usar SE um perfil novo for criado
}

// Ate onde tentar desambiguar um handle em colisao antes de desistir.
const MAX_TENTATIVAS_HANDLE = 100;

export class GarantirPerfilDoAssessor {
  constructor(private readonly perfis: PerfilRepositorio) {}

  async executar(entrada: EntradaGarantirPerfilDoAssessor): Promise<Perfil> {
    const usuarioId = entrada.usuarioId?.trim();
    if (!usuarioId) {
      throw new Error(
        "GarantirPerfilDoAssessor: usuarioId da sessao e obrigatorio.",
      );
    }

    // Idempotente: um usuario tem no maximo um no. Se ja existe, devolve.
    const existente = await this.perfis.buscarPorUsuario(usuarioId);
    if (existente) return existente;

    const nome = this.derivarNome(entrada);
    const handle = await this.resolverHandleLivre(entrada);

    const perfil = Perfil.criar({
      id: entrada.perfilId,
      tipo: "assessor",
      nome,
      handle,
      usuarioId, // => estado reivindicado (a pessoa real por tras)
    });
    await this.perfis.salvar(perfil);
    return perfil;
  }

  // Nome de exibicao com fallback: nome do Google -> parte antes do @ do
  // e-mail -> "Assessor". Perfil.criar exige nome nao-vazio.
  private derivarNome(entrada: EntradaGarantirPerfilDoAssessor): string {
    const doNome = entrada.nome?.trim();
    if (doNome) return doNome;
    const doEmail = entrada.email?.split("@")[0]?.trim();
    if (doEmail) return doEmail;
    return "Assessor";
  }

  // Deriva um handle-base do nome (ou e-mail, ou "assessor" como ultimo
  // recurso) e desambigua por sufixo numerico ate achar um livre na rede.
  private async resolverHandleLivre(
    entrada: EntradaGarantirPerfilDoAssessor,
  ): Promise<Handle> {
    const base = this.derivarHandleBase(entrada);

    for (let n = 1; n <= MAX_TENTATIVAS_HANDLE; n++) {
      const candidato = Handle.criar(this.comSufixo(base, n));
      const ocupado = await this.perfis.buscarPorHandle(candidato.valor);
      if (!ocupado) return candidato;
    }
    throw new Error(
      `GarantirPerfilDoAssessor: nao foi possivel derivar um handle livre a partir de "${base}".`,
    );
  }

  private derivarHandleBase(
    entrada: EntradaGarantirPerfilDoAssessor,
  ): string {
    for (const bruto of [entrada.nome, entrada.email, "assessor"]) {
      try {
        return Handle.aPartirDe(bruto ?? "").valor;
      } catch {
        // tenta a proxima fonte
      }
    }
    // "assessor" sempre e um handle-base valido, entao nao chegamos aqui.
    return "assessor";
  }

  // base para n=1; base-n para n>1, truncando a base para caber em 30 chars.
  private comSufixo(base: string, n: number): string {
    if (n <= 1) return base;
    const sufixo = `-${n}`;
    const maxBase = 30 - sufixo.length;
    return base.slice(0, maxBase).replace(/-+$/g, "") + sufixo;
  }
}
