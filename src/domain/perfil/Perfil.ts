import { Handle } from "./Handle";
import { Email } from "./Email";

// Perfil — entidade. O no da rede. Assessor e creator sao VARIACOES do mesmo
// nucleo, nunca duas entidades soltas (spec 03). A distincao vive em `tipo`.
//
// Dois estados, e aqui mora a regra dura do produto:
// - reivindicado: existe uma pessoa real (usuarioId de auth) por tras.
// - pendente: criado por um assessor AO abrir uma oportunidade, ainda nao
//   reivindicado pela pessoa. So pode existir ANCORADO em trabalho real (origem).
//
// D7 (CLAUDE.md secao 3): PROIBIDO criar perfil sem aresta de trabalho real.
// "Claim profile pela porta da oportunidade" — nunca cadastro em massa. Essa
// regra nao e uma convencao de UI: e um invariante do dominio (ver `criar`).

export type TipoPerfil = "assessor" | "creator";
export type EstadoPerfil = "reivindicado" | "pendente";

// A aresta que ancora um perfil pendente: de qual oportunidade ele nasceu e
// qual assessor o trouxe. E o "primeira oportunidade" auditavel do perfil.
export interface OrigemPerfil {
  oportunidadeId: string; // a oportunidade que ancorou o perfil
  vinculadoPorId: string; // o assessor que vinculou
  vinculadoEm: Date;
}

export interface DadosPerfil {
  id: string;
  tipo: TipoPerfil;
  nome: string;
  handle: Handle;
  estado?: EstadoPerfil; // default derivado: usuarioId => reivindicado, senao pendente
  usuarioId?: string; // auth user; obrigatorio quando reivindicado
  origem?: OrigemPerfil; // a ancora; obrigatoria quando pendente (D7)
  email?: Email; // contato para convite de ativacao; nunca identidade
}

const TIPOS_VALIDOS: readonly TipoPerfil[] = ["assessor", "creator"];

export class Perfil {
  private constructor(
    readonly id: string,
    readonly tipo: TipoPerfil,
    readonly nome: string,
    readonly handle: Handle,
    readonly estado: EstadoPerfil,
    readonly usuarioId: string | undefined,
    readonly origem: OrigemPerfil | undefined,
    readonly email: Email | undefined,
  ) {}

  static criar(dados: DadosPerfil): Perfil {
    const id = dados.id?.trim();
    const nome = dados.nome?.trim();
    if (!id) throw new Error("Perfil exige id.");
    if (!nome) throw new Error("Perfil exige nome.");
    if (!TIPOS_VALIDOS.includes(dados.tipo)) {
      throw new Error(`Tipo de perfil invalido: ${String(dados.tipo)}`);
    }

    const usuarioId = dados.usuarioId?.trim() || undefined;
    const estado: EstadoPerfil =
      dados.estado ?? (usuarioId ? "reivindicado" : "pendente");

    if (estado === "reivindicado" && !usuarioId) {
      throw new Error(
        "Perfil reivindicado exige usuarioId (a pessoa real por tras).",
      );
    }

    // O invariante do D7: um perfil pendente NUNCA existe sem ancora de
    // trabalho real. Sem origem, seria um perfil fantasma (base degradavel).
    if (estado === "pendente" && !Perfil.origemValida(dados.origem)) {
      throw new Error(
        "Perfil pendente exige origem (oportunidadeId + vinculadoPorId): " +
          "nao se cria perfil sem ancora de trabalho real (D7).",
      );
    }
    if (estado === "pendente" && usuarioId) {
      throw new Error(
        "Perfil pendente nao tem usuarioId — reivindique-o para vincular a pessoa.",
      );
    }

    return new Perfil(
      id,
      dados.tipo,
      nome,
      dados.handle,
      estado,
      usuarioId,
      dados.origem ? { ...dados.origem } : undefined,
      dados.email,
    );
  }

  private static origemValida(origem: OrigemPerfil | undefined): boolean {
    return Boolean(
      origem?.oportunidadeId?.trim() && origem?.vinculadoPorId?.trim(),
    );
  }

  // Reivindicar: a pessoa real assume o perfil pendente (via auth). Imutavel —
  // retorna um NOVO perfil (AGENTS.md: nunca mutar). Preserva a origem, que
  // vira o historico "primeira oportunidade" do perfil ja reivindicado.
  reivindicar(usuarioId: string): Perfil {
    const uid = usuarioId?.trim();
    if (!uid) throw new Error("Reivindicar exige usuarioId.");
    if (this.estado === "reivindicado") {
      throw new Error("Perfil ja reivindicado.");
    }
    return Perfil.criar({
      ...this.paraDados(),
      estado: "reivindicado",
      usuarioId: uid,
    });
  }

  estaPendente(): boolean {
    return this.estado === "pendente";
  }

  // Registra/atualiza o contato. Imutável, como reivindicar — o e-mail é dado
  // de contato, então mudá-lo não altera identidade nem estado do nó.
  comEmail(email: Email): Perfil {
    return Perfil.criar({ ...this.paraDados(), email });
  }

  private paraDados(): DadosPerfil {
    return {
      id: this.id,
      tipo: this.tipo,
      nome: this.nome,
      handle: this.handle,
      estado: this.estado,
      usuarioId: this.usuarioId,
      origem: this.origem ? { ...this.origem } : undefined,
      email: this.email,
    };
  }
}
