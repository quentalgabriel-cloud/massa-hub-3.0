import { Prova } from "../prova/Prova";

// Porta de persistencia da Prova. O dominio DEFINE este contrato; a
// infraestrutura (ex.: Supabase) o implementa. O dominio nunca conhece o
// adapter — a dependencia aponta para ca (AGENTS.md secao 2, decisao D11).

export interface ProvaRepositorio {
  buscarPorId(id: string): Promise<Prova | null>;
  salvar(prova: Prova): Promise<void>;
  listarPorCriador(criadorId: string): Promise<Prova[]>;
  // Provas em que o perfil e parte (criador OU contratante) — base para listar
  // pendencias de assinatura e, depois, o lastro da pessoa.
  listarPorParte(perfilId: string): Promise<Prova[]>;
  // Mesma coisa para VARIOS perfis numa consulta — usado ao explorar a rede,
  // onde derivar o Lastro perfil a perfil seria N+1.
  listarPorPartes(perfilIds: string[]): Promise<Prova[]>;
}
