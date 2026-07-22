import { Handle } from "./Handle";

// Perfil — entidade. O no do grafo da rede: quem orbita o creator (assessor,
// creator, profissional criativo). Nucleo UNICO com variacao por `papel`, nunca
// duas entidades soltas (docs/specs/03-perfil-claim-assessor.md).
//
// O `id` e o perfilId usado como aresta em Prova/Oportunidade (criador_id,
// contratante_id, candidaturas). `usuarioId` liga ao auth quando o dono
// reivindica (claim) o perfil — pode ser undefined para um perfil ancorado em
// trabalho real que ainda nao foi ativado pela pessoa.

export type PapelPerfil = "assessor" | "creator" | "profissional";

const PAPEIS_VALIDOS: readonly PapelPerfil[] = [
  "assessor",
  "creator",
  "profissional",
];

const NOME_MAX = 80;
const BIO_MAX = 280;
const MAX_TAGS = 8;
const TAG_MAX = 40;

export interface DadosPerfil {
  id: string;
  handle: string;
  nome: string;
  papel: PapelPerfil;
  tags?: string[];
  avatarUrl?: string;
  bio?: string;
  usuarioId?: string;
}

export class Perfil {
  private constructor(
    readonly id: string,
    readonly handle: Handle,
    readonly nome: string,
    readonly papel: PapelPerfil,
    readonly tags: readonly string[],
    readonly avatarUrl: string | undefined,
    readonly bio: string | undefined,
    readonly usuarioId: string | undefined,
  ) {}

  static criar(dados: DadosPerfil): Perfil {
    const id = dados.id?.trim();
    const nome = dados.nome?.trim();

    if (!id) throw new Error("Perfil exige id.");
    if (!nome) throw new Error("Perfil exige nome.");
    if (nome.length > NOME_MAX) {
      throw new Error(`Nome deve ter no maximo ${NOME_MAX} caracteres.`);
    }
    if (!PAPEIS_VALIDOS.includes(dados.papel)) {
      throw new Error(`Papel de perfil invalido: ${String(dados.papel)}`);
    }

    const handle = Handle.criar(dados.handle);

    const bio = dados.bio?.trim();
    if (bio && bio.length > BIO_MAX) {
      throw new Error(`Bio deve ter no maximo ${BIO_MAX} caracteres.`);
    }

    const tags = normalizarTags(dados.tags ?? []);
    const usuarioId = dados.usuarioId?.trim();
    const avatarUrl = dados.avatarUrl?.trim();

    return new Perfil(
      id,
      handle,
      nome,
      dados.papel,
      tags,
      avatarUrl ? avatarUrl : undefined,
      bio ? bio : undefined,
      usuarioId ? usuarioId : undefined,
    );
  }

  // O assessor e o cavalo de Troia da rede: a tag de assessor tem destaque
  // proprio na UI (CLAUDE.md secao 3). Aqui so expomos o fato.
  ehAssessor(): boolean {
    return this.papel === "assessor";
  }

  // Reivindicado = ha um usuario de auth dono deste perfil. Perfil sem dono
  // ainda existe (ancorado em trabalho real), aguardando ativacao.
  estaReivindicado(): boolean {
    return this.usuarioId !== undefined;
  }
}

// Tags: sem vazias, sem duplicadas (case-insensitive), aparadas e limitadas.
function normalizarTags(entrada: readonly string[]): string[] {
  const vistas = new Set<string>();
  const saida: string[] = [];
  for (const bruta of entrada) {
    const tag = (bruta ?? "").trim();
    if (!tag) continue;
    if (tag.length > TAG_MAX) {
      throw new Error(`Tag deve ter no maximo ${TAG_MAX} caracteres.`);
    }
    const chave = tag.toLowerCase();
    if (vistas.has(chave)) continue;
    vistas.add(chave);
    saida.push(tag);
    if (saida.length >= MAX_TAGS) break;
  }
  return saida;
}
