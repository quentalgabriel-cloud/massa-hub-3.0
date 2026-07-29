import type { SupabaseClient } from "@supabase/supabase-js";
import { Prova, type DadosProva, type TipoProva } from "@dominio/prova/Prova";
import { Assinatura, type PapelAssinatura } from "@dominio/prova/Assinatura";
import type { ProvaRepositorio } from "@dominio/ports/ProvaRepositorio";

// Adapter Supabase da porta ProvaRepositorio. Traduz entre as linhas do Postgres
// e a entidade de dominio. O status (em_andamento | verificada) NAO e persistido:
// e derivado das assinaturas quando a Prova e reconstruida. Ver D11 e AGENTS.md.

interface ProvaRow {
  id: string;
  tipo: TipoProva;
  titulo: string;
  descricao: string;
  resultado: string | null;
  criador_id: string;
  contratante_id: string;
  participantes: string[];
  data: string;
}

interface AssinaturaRow {
  prova_id: string;
  autor_id: string;
  papel: PapelAssinatura;
  assinado_em: string;
}

const COLUNAS_PROVA =
  "id, tipo, titulo, descricao, resultado, criador_id, contratante_id, participantes, data";
const COLUNAS_ASSINATURA = "prova_id, autor_id, papel, assinado_em";

export class ProvaRepositorioSupabase implements ProvaRepositorio {
  constructor(private readonly cliente: SupabaseClient) {}

  async buscarPorId(id: string): Promise<Prova | null> {
    const { data: prova, error } = await this.cliente
      .from("provas")
      .select(COLUNAS_PROVA)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Erro ao buscar prova: ${error.message}`);
    if (!prova) return null;

    const { data: assinaturas, error: erroAss } = await this.cliente
      .from("assinaturas")
      .select(COLUNAS_ASSINATURA)
      .eq("prova_id", id)
      .limit(100);
    if (erroAss) {
      throw new Error(`Erro ao buscar assinaturas: ${erroAss.message}`);
    }

    return this.reconstruir(
      prova as ProvaRow,
      (assinaturas ?? []) as AssinaturaRow[],
    );
  }

  async salvar(prova: Prova): Promise<void> {
    const { error } = await this.cliente.from("provas").upsert({
      id: prova.id,
      tipo: prova.tipo,
      titulo: prova.titulo,
      descricao: prova.descricao,
      resultado: prova.resultado ?? null,
      criador_id: prova.criadorId,
      contratante_id: prova.contratanteId,
      participantes: [...prova.participantes],
      data: prova.data.toISOString(),
    });
    if (error) throw new Error(`Erro ao salvar prova: ${error.message}`);

    // A Prova e um agregado: as assinaturas atuais substituem as anteriores.
    const { error: erroDel } = await this.cliente
      .from("assinaturas")
      .delete()
      .eq("prova_id", prova.id);
    if (erroDel) {
      throw new Error(`Erro ao limpar assinaturas: ${erroDel.message}`);
    }

    if (prova.assinaturas.length > 0) {
      const linhas = prova.assinaturas.map((a) => ({
        prova_id: prova.id,
        autor_id: a.autorId,
        papel: a.papel,
        assinado_em: a.assinadoEm.toISOString(),
      }));
      const { error: erroIns } = await this.cliente
        .from("assinaturas")
        .insert(linhas);
      if (erroIns) {
        throw new Error(`Erro ao inserir assinaturas: ${erroIns.message}`);
      }
    }
  }

  async listarPorCriador(criadorId: string): Promise<Prova[]> {
    const { data: provas, error } = await this.cliente
      .from("provas")
      .select(COLUNAS_PROVA)
      .eq("criador_id", criadorId)
      .limit(50);
    if (error) throw new Error(`Erro ao listar provas: ${error.message}`);
    if (!provas || provas.length === 0) return [];

    const linhas = provas as ProvaRow[];
    const ids = linhas.map((p) => p.id);

    const { data: assinaturas, error: erroAss } = await this.cliente
      .from("assinaturas")
      .select(COLUNAS_ASSINATURA)
      .in("prova_id", ids)
      .limit(1000);
    if (erroAss) {
      throw new Error(`Erro ao listar assinaturas: ${erroAss.message}`);
    }

    const porProva = new Map<string, AssinaturaRow[]>();
    for (const a of (assinaturas ?? []) as AssinaturaRow[]) {
      const lista = porProva.get(a.prova_id) ?? [];
      lista.push(a);
      porProva.set(a.prova_id, lista);
    }

    return linhas.map((p) => this.reconstruir(p, porProva.get(p.id) ?? []));
  }

  async listarPorParte(perfilId: string): Promise<Prova[]> {
    return this.listarPorPartes([perfilId]);
  }

  async listarPorPartes(perfilIds: string[]): Promise<Prova[]> {
    // Ids entram num filtro PostgREST montado como string: sanitiza para que
    // vírgula/parêntese num id não consiga reescrever a expressão do filtro.
    const ids = [...new Set(perfilIds)].filter((id) =>
      /^[A-Za-z0-9._:-]+$/.test(id),
    );
    if (ids.length === 0) return [];

    const lista = ids.join(",");
    const { data: provas, error } = await this.cliente
      .from("provas")
      .select(COLUNAS_PROVA)
      .or(`criador_id.in.(${lista}),contratante_id.in.(${lista})`)
      .limit(500);
    if (error) throw new Error(`Erro ao listar provas: ${error.message}`);
    if (!provas || provas.length === 0) return [];

    const linhas = provas as ProvaRow[];
    const idsDeProvas = linhas.map((p) => p.id);

    const { data: assinaturas, error: erroAss } = await this.cliente
      .from("assinaturas")
      .select(COLUNAS_ASSINATURA)
      .in("prova_id", idsDeProvas)
      .limit(1000);
    if (erroAss) {
      throw new Error(`Erro ao listar assinaturas: ${erroAss.message}`);
    }

    const porProva = new Map<string, AssinaturaRow[]>();
    for (const a of (assinaturas ?? []) as AssinaturaRow[]) {
      const lista = porProva.get(a.prova_id) ?? [];
      lista.push(a);
      porProva.set(a.prova_id, lista);
    }

    return linhas.map((p) => this.reconstruir(p, porProva.get(p.id) ?? []));
  }

  private reconstruir(prova: ProvaRow, assinaturas: AssinaturaRow[]): Prova {
    const dados: DadosProva = {
      id: prova.id,
      tipo: prova.tipo,
      titulo: prova.titulo,
      descricao: prova.descricao,
      criadorId: prova.criador_id,
      contratanteId: prova.contratante_id,
      resultado: prova.resultado ?? undefined,
      participantes: prova.participantes ?? [],
      data: new Date(prova.data),
      assinaturas: assinaturas.map((a) =>
        Assinatura.criar({
          autorId: a.autor_id,
          papel: a.papel,
          assinadoEm: new Date(a.assinado_em),
        }),
      ),
    };
    return Prova.criar(dados);
  }
}
