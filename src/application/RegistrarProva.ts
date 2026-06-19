import { ProvaRepositorio } from "@dominio/ports/ProvaRepositorio";
import { Prova, type TipoProva } from "@dominio/prova/Prova";
import { Assinatura, type PapelAssinatura } from "@dominio/prova/Assinatura";

// Caso de uso: registra uma Prova de trabalho real. Nasce `em_andamento`, ja
// assinada por quem registra (uma das duas partes). Vira `verificada` quando a
// contraparte assinar (ver AssinarProva). As regras (partes distintas, dedupe,
// status derivado) vivem na entidade Prova.

export interface EntradaRegistrarProva {
  id: string;
  tipo: TipoProva;
  titulo: string;
  descricao: string;
  criadorId: string;
  contratanteId: string;
  resultado?: string;
  participantes?: string[];
  data?: Date;
  // Quem registra e em que lado assina — precisa ser a parte que declara.
  registranteId: string;
  ladoRegistrante: PapelAssinatura;
}

export class RegistrarProva {
  constructor(private readonly repositorio: ProvaRepositorio) {}

  async executar(entrada: EntradaRegistrarProva): Promise<Prova> {
    const idDoLado =
      entrada.ladoRegistrante === "criador"
        ? entrada.criadorId
        : entrada.contratanteId;
    if (entrada.registranteId !== idDoLado) {
      throw new Error(
        "RegistrarProva: o registrante deve ser a parte que ele declara assinar.",
      );
    }

    const assinatura = Assinatura.criar({
      autorId: entrada.registranteId,
      papel: entrada.ladoRegistrante,
    });

    const prova = Prova.criar({
      id: entrada.id,
      tipo: entrada.tipo,
      titulo: entrada.titulo,
      descricao: entrada.descricao,
      criadorId: entrada.criadorId,
      contratanteId: entrada.contratanteId,
      resultado: entrada.resultado,
      participantes: entrada.participantes,
      data: entrada.data,
      assinaturas: [assinatura],
    });

    await this.repositorio.salvar(prova);
    return prova;
  }
}
