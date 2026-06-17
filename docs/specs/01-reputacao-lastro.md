# Spec — Reputação: Lastro, Prova e Ritmo

Status: **decidido** · Prioridade: fechar modelo de dados antes de qualquer UI de reputação.

## Princípio

A reputação na Massa Hub **emerge do trabalho verificável**, não de um cálculo.
Referência mental: GitHub. Você não recebe uma nota; você mostra repositórios,
commits, contribuições. Aqui é a mesma lógica.

❌ Não existe score numérico. Nada de "Trust Index 92", "Capital Reputacional 7.4".
Se aparecer em mockup antigo, ignore — esta decisão prevalece.

## Por que o Lastro é o moat (dados que ancoram a decisão)

Não é feature cosmética — é a defesa estratégica do produto. Dados das pesquisas
YOUPIX/Nielsen que justificam:
- **Só 20% das agências** dão feedback estruturado pós-campanha. O Lastro preenche
  exatamente esse buraco — vira camada de dados proprietária via avaliação bilateral.
- **Reputação como critério de contratação subiu de 32% para 51%.** A demanda por
  reputação verificável está crescendo no mercado, não estável.
Conclusão para o código: reputação é prioridade de roadmap, não badge bonito.

## Prova (unidade atômica)

Uma Prova é um registro de trabalho real, **assinado pelos dois lados**.

Campos mínimos:
- `marca` / contratante (ref)
- `profissional` autor (ref)
- `tipo` (campanha, consultoria, festival, negociação, ...)
- `titulo` e `descricao` curta do papel desempenhado
- `resultado` (texto livre verificável: "+2,3M impressões")
- `assinaturas`: lista de partes que confirmaram (mínimo 2 para virar "verificada")
- `status`: `em_andamento` | `verificada`
- `participantes`: refs dos colaboradores (squad), para formar arestas do grafo
- `data`

Regra: uma Prova só conta como **verificada** quando assinada por ≥2 partes
(ex.: creator + marca). Antes disso é `em_andamento`.

A Prova é o objeto central do perfil. É o que renderiza primeiro.

## Lastro (agregado de fatos)

Lastro NÃO é uma nota. É a soma de fatos contáveis, derivados das Provas:
- nº de provas verificadas
- nº de marcas distintas que assinaram
- nº de marcas que voltaram a contratar (recorrência)
- nº de recomendações de colaboradores

Renderizar como números crus + rótulo. Incluir a frase-âncora de posicionamento:
"Aqui não tem nota nem score. Lastro é trabalho real, assinado por quem participou."

## Ritmo (assinatura visual)

Heatmap de colaborações ao longo do tempo, estilo contribution graph do GitHub,
em escala violeta (`#F0EFE8` → `#DCD8FB` → `#A99CFF` → `#6C5BFF` → `#2B1FA8`).

⚠️ Só renderizar quando houver volume real de eventos. Heatmap vazio comunica o
oposto do pretendido. Em perfil novo, omitir o Ritmo e deixar as Provas carregarem
o perfil sozinhas. Reavaliar quando o módulo de oportunidades gerar registros.

## Implicação para o grafo

Cada Prova com `participantes` cria arestas entre perfis. O grafo de relacionamento
(quem trabalhou com quem, sob qual marca) é o ativo difícil de copiar. As Provas
são o mecanismo que popula esse grafo organicamente — não cadastro manual em massa.
