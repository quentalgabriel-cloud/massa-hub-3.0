import { OportunidadeRepositorio } from "@dominio/ports/OportunidadeRepositorio";
import { Oportunidade } from "@dominio/oportunidade/Oportunidade";
import { Squad } from "@dominio/oportunidade/Squad";
import { TicketExtraido } from "@dominio/oportunidade/TicketExtraido";

// Caso de uso: converte um TicketExtraido (proposta da IA, ja revisado pelo
// assessor) em uma Oportunidade publicada no mercado.
// Recebe revisadoPeloAutor=true como sinal explicito de que o humano confirmou
// os campos — sem isso, Oportunidade.criar lanca erro (spec 02).

export interface EntradaPublicarOportunidade {
  id: string;
  autorId: string;
  ticket: TicketExtraido;
  textoBruto: string;
  revisadoPeloAutor: true; // literal true: o caller e obrigado a ser explicito
}

export class PublicarOportunidade {
  constructor(private readonly repositorio: OportunidadeRepositorio) {}

  async executar(entrada: EntradaPublicarOportunidade): Promise<Oportunidade> {
    const squad = Squad.de([...entrada.ticket.papeis]);

    const oportunidade = Oportunidade.criar({
      id: entrada.id,
      autorId: entrada.autorId,
      marca: entrada.ticket.marca ?? "",
      squad,
      origem: {
        textoBruto: entrada.textoBruto,
        estruturadoPorIA: true,
        revisadoPeloAutor: entrada.revisadoPeloAutor,
      },
      budget: entrada.ticket.budget,
      prazo: entrada.ticket.prazo,
      local: entrada.ticket.local,
      regiao: entrada.ticket.regiao,
      entregaveis: [...entrada.ticket.entregaveis],
    });

    await this.repositorio.salvar(oportunidade);
    return oportunidade;
  }
}
