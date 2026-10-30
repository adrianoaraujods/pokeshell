# Arquitetura

Aplicativo estático, sem build e sem módulos: o `index.html` carrega os scripts de `javascript/` em ordem, e todos compartilham o escopo global.

## Fluxo

```
botão / tecla ──► entrada normalizada ──► ação da tela atual ──► estado ──► renderização
```

- **Entrada:** cliques, toques e teclas viram o mesmo conjunto de entradas (`up`, `confirm`, `digit`…). Todas fazem um beep.
- **Telas:** cada tela é uma função que devolve o conteúdo das cinco janelas do aparelho; `display` as renderiza. Cada tela só responde às entradas que mapeia.
- **Estado:** variáveis globais em cada módulo, alteradas pelas ações.

## Módulos

| Arquivo                                  | Responsabilidade                                          |
| ---------------------------------------- | --------------------------------------------------------- |
| `controls.js`                            | Mapeia botões e teclas e envia a entrada à tela atual     |
| `screens.js`                             | Renderiza as telas e as abas                              |
| `grid.js`, `search.js`, `generations.js` | Grade, cursor, busca e filtro de geração                  |
| `details.js`, `evolutions.js`, `moves.js` | Página de detalhes, família de evolução e golpes         |
| `readout.js`, `types.js`                 | Visor direito: descrição e efetividade de tipos           |
| `keypad.js`                              | Busca direta por número                                   |
| `language.js`, `locale.js`               | Menu de idioma e textos traduzidos                        |
| `api.js`                                 | Acesso à PokeAPI com cache em `localStorage`, e sprites   |
| `audio.js`                               | Beeps sintetizados e gritos                               |
| `utils.js`, `script.js`                  | Funções auxiliares e inicialização                        |

## Decisões

- **Cache:** toda resposta da API é guardada em `localStorage`; se encher, descarta as mais antigas.
- **Visor derivado:** nunca recebe foco e acompanha o Pokémon sob o cursor ou o aberto; respostas antigas são descartadas.
- **Idioma:** conteúdo vem da API no idioma escolhido, com inglês como alternativa; a interface usa um dicionário local.
- **Áudio:** beep por Web Audio em toda entrada; CONFIRM nos detalhes toca o grito (`pokemon.cries`).

## Estilos

`styles/` tem tokens e reset globais, componentes e estilos por tela. Acima de 1280 px o corpo é a imagem do aparelho; abaixo, é desenhado em CSS com os painéis empilhados.
