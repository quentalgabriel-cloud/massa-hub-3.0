import { Oportunidade } from "../oportunidade/Oportunidade";

// Porta de persistencia da Oportunidade. Implementada por um adapter Supabase
// na infraestrutura; o dominio nunca conhece o banco (D11).

export interface OportunidadeRepositorio {
  buscarPorId(id: string): Promise<Oportunidade | null>;
  salvar(oportunidade: Oportunidade): Promise<void>;
  listarAbertas(limite?: number): Promise<Oportunidade[]>;
  listarPorAutor(autorId: string): Promise<Oportunidade[]>;
  // Varios autores numa consulta — usado ao explorar a rede, onde contar as
  // oportunidades de cada assessor separadamente seria N+1.
  listarPorAutores(autorIds: string[]): Promise<Oportunidade[]>;
}
