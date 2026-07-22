import { Perfil } from "../perfil/Perfil";

// Porta de persistencia do Perfil. O dominio DEFINE este contrato; a
// infraestrutura (Supabase) o implementa. O dominio nunca conhece o adapter — a
// dependencia aponta para ca (AGENTS.md secao 2, decisao D11).

export interface PerfilRepositorio {
  buscarPorId(id: string): Promise<Perfil | null>;
  buscarPorHandle(handle: string): Promise<Perfil | null>;
  // Perfil que o usuario de auth reivindicou (claim). Base para editar o proprio
  // perfil sem confiar em id vindo do cliente.
  buscarPorUsuario(usuarioId: string): Promise<Perfil | null>;
  salvar(perfil: Perfil): Promise<void>;
  // Diretorio: busca por nome/handle para escolher a contraparte de uma prova ou
  // candidato de uma oportunidade por nome, em vez de colar UUID cru.
  buscar(termo: string, limite?: number): Promise<Perfil[]>;
}
