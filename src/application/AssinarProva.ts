import { ProvaRepositorio } from "@dominio/ports/ProvaRepositorio";
import { Prova } from "@dominio/prova/Prova";
import { Assinatura, type PapelAssinatura } from "@dominio/prova/Assinatura";

// Caso de uso: a contraparte assina uma Prova existente. O lado e DERIVADO de
// qual parte o assinante e (criador ou contratante) — ninguem assina o lado do
// outro. Quando os dois lados assinam, a entidade Prova vira `verificada`.

export interface EntradaAssinarProva {
  provaId: string;
  assinanteId: string;
}

export class AssinarProva {
  constructor(private readonly repositorio: ProvaRepositorio) {}

  async executar(entrada: EntradaAssinarProva): Promise<Prova> {
    const prova = await this.repositorio.buscarPorId(entrada.provaId);
    if (!prova) {
      throw new Error(
        `AssinarProva: prova "${entrada.provaId}" nao encontrada.`,
      );
    }

    let lado: PapelAssinatura;
    if (entrada.assinanteId === prova.criadorId) {
      lado = "criador";
    } else if (entrada.assinanteId === prova.contratanteId) {
      lado = "contratante";
    } else {
      throw new Error("AssinarProva: o assinante nao e parte desta prova.");
    }

    const assinada = prova.assinar(
      Assinatura.criar({ autorId: entrada.assinanteId, papel: lado }),
    );
    await this.repositorio.salvar(assinada);
    return assinada;
  }
}
