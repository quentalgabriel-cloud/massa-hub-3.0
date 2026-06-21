# Eval — qualidade de extração de ticket

Avalia `src/infrastructure/anthropic/ExtratorDeTicketAnthropic.ts` contra casos reais ou
sintéticos de briefing bruto. Existe para versionar o `SYSTEM_PROMPT` desse adapter por
evidência, em vez de por intuição — conforme já previsto em `AGENTS.md` (estrutura
`eval/ticket/`) e `docs/specs/05-prototipo-screen10.md` ("o system prompt é o ativo
central deste módulo... iterar com briefings reais").

## Isto NÃO é score de reputação

Este eval mede o **acerto de extração de um campo estruturado a partir de texto livre**
— é uma métrica de engenharia de software sobre um adapter, comparando a saída do modelo
contra um gabarito escrito por humano. **D1 proíbe score numérico de reputação** (Lastro
de uma pessoa). São namespaces diferentes: qualidade de extração de IA vs. reputação de
pessoa. Não confundir os dois — esta nota existe para que uma leitura apressada futura
não use este eval como pretexto para reabrir D1.

## Como rodar

```bash
npm run eval:ticket
```

Requer `ANTHROPIC_API_KEY` no ambiente (a mesma variável que o adapter de produção já
usa — nenhuma chave nova).

## O que isto é e o que não é

- **É um esqueleto.** Hoje tem 2 casos em `ticket/fixtures/`, propositalmente opostos
  (briefing rico vs. briefing raso). Quando briefings reais passarem pela Screen 10 em
  produção, capture as divergências — o que o autor editou manualmente vs. o que a IA
  propôs — como novos arquivos de fixture aqui. Isso fecha o loop evaluator-optimizer com
  humano como optimizer (ver `docs/estudos/loop-engineering.md`, seção 6).
- **NÃO é DSPy.** Sem otimizador automático (MIPROv2, GEPA, etc.). O optimizer desta
  versão é você: leia o relatório de divergências e ajuste o `SYSTEM_PROMPT` manualmente
  em `ExtratorDeTicketAnthropic.ts`. DSPy só justifica a infra quando houver dezenas a
  centenas de fixtures — ver critério na seção 5 do estudo de loop engineering.
- **NÃO é multi-agente.** Roda contra o único adapter de IA que já existe no produto. O
  avaliador é determinístico (comparação de campos), não uma segunda IA julgando a
  primeira.

## Estrutura

```
eval/
  ticket/
    fixtures/        # casos: briefing bruto + gabarito esperado
    run.ts            # script que chama o adapter real e compara
```

Separado de `tests/` (Vitest) de propósito: este script faz chamada de rede real à API
Anthropic (custo, latência, não-determinismo) — não roda em `npm test` nem em CI por
padrão, só sob comando explícito.
