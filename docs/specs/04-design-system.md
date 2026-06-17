# Spec — Sistema de Design (tokens)

Status: derivado dos protótipos aprovados. Use como base visual.

A estética é **editorial-criativa com vocabulário de ferramenta de dev** — não SaaS
genérico arredondado. Paper off-white, tinta quase-preta, violeta de marca, dados
em mono. Tipografia dura.

## Cores

```
--paper:      #FAFAF6   /* fundo */
--card:       #FFFFFF
--ink:        #16151D   /* texto principal */
--ink2:       #5C5A66   /* secundário */
--ink3:       #74727D   /* terciário (contraste mínimo AA ok) */
--line:       #E8E6DD
--violet:     #6C5BFF   /* marca */
--violet-deep:#2B1FA8
--violet-soft:#EFEDFF
--ember:      #FF5A2D   /* destaque quente, usar com parcimônia */
--ok:         #117A53
```

Escala do heatmap Ritmo (violeta):
`#F0EFE8` → `#DCD8FB` → `#A99CFF` → `#6C5BFF` → `#2B1FA8`

## Tipografia

- **Archivo** (display, pesos 700–900, font-stretch comprimido ~75%) para títulos.
  Dá o ar duro/editorial. Não usar fontes arredondadas-amigáveis.
- **Inter** para corpo de texto.
- **IBM Plex Mono** para dados, números, handles, labels, metadados. É o que dá o
  "vocabulário GitHub". Use mono em: contadores, valores (budget, datas), handles
  (@fulano), rótulos de campo em CAIXA ALTA com letter-spacing.

## Forma

- Raio de borda contido (8–12px), não pílulas exageradas.
- Bordas de 1px em `--line`, sombras quase ausentes. Hierarquia por contraste e
  tipografia, não por sombra pesada.
- Selo de prova bilateral: "✓✓ assinada pelos dois lados".
- Evitar over-formatting. Densidade informacional alta, como uma boa ferramenta.

## Responsividade (lições da auditoria mobile)

- Em CSS Grid, sempre `min-width: 0` nos filhos para conteúdo largo (heatmap) não
  estourar o layout. Esse foi o bug nº1 do protótipo.
- Mobile: navegação principal vira tab bar inferior fixa com safe-area.
- Modais viram bottom sheet no mobile; textarea com font-size 16px (evita zoom iOS).
- Alvos de toque ≥ 44px. Filtros horizontais com scroll sem barra visível.
- Workspaces de 2 painéis (oportunidades) viram fluxo de 2 telas no mobile.
- Auditar overflow horizontal a cada mudança de layout (medir scrollWidth vs
  clientWidth em 360/390px). É barato e pega regressão.
