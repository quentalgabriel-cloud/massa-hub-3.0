import { Perfil } from "../perfil/Perfil";

// Porta de persistencia do Perfil. O dominio DEFINE o contrato; a
// infraestrutura (Supabase) o implementa. A dependencia aponta para ca — o
// dominio nunca conhece o adapter (AGENTS.md secao 2, decisao D11).

export interface PerfilRepositorio {
  buscarPorId(id: string): Promise<Perfil | null>;
  buscarPorHandle(handle: string): Promise<Perfil | null>;
  // O perfil ja reivindicado por uma pessoa (auth) — base do "meu perfil".
  buscarPorUsuario(usuarioId: string): Promise<Perfil | null>;
  salvar(perfil: Perfil): Promise<void>;
  // Perfis pendentes que um assessor trouxe pela oportunidade — a rede que ele
  // vinculou mas que ainda nao se reivindicou (spec 03, claim profile).
  listarPendentesVinculadosPor(assessorId: string): Promise<Perfil[]>;
}
