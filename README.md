# Pokédex

Pokédex do anime com dois painéis, feito com HTML, CSS e JavaScript, consumindo a [PokeAPI v2](https://pokeapi.co).

- **Painel esquerdo (interativo):** tela principal, telinha de info, D-pad e botões CONFIRM, BACK, TAB e LANGUAGE.
- **Painel direito (visor):** tela secundária (descrição e efetividade de tipos), duas telinhas com os tipos, teclado numérico 0–9 e botões LEFT/RIGHT, SCROLL e L/R.

## Funcionalidades

- Grade com as 1025 espécies, sprites animados, cursor pelo D-pad e scroll infinito.
- Filtro por geração (BACK cicla `ALL → I → … → IX`) e busca por nome ou número (TAB).
- Visor ao vivo: descrição e efetividade de tipos do Pokémon sob o cursor.
- Atalho por número: digite no teclado numérico e aperte CONFIRM.
- Página de detalhes com quatro abas, selecionadas com TAB:
  - **INFO**: sprite, nº, nome, gênero, altura, peso, trocador de formas e fatos da espécie (habilidades, habitat, grupos de ovo, taxa de captura, gênero);
  - **EVOL.**: trocador dos membros da família, com a condição de cada evolução;
  - **STATS**: atributos base do pokémon (HP, ATTACK, DEFENSE, SPECIAL ATTACK, SPECIAL DEFENSE, SPEED);
  - **MOVS.**: habilidades com seu efeito e golpes ordenados pelo nível que libera da geração mais recente.
- Idiomas: inglês, espanhol, português do Brasil e japonês (menu LANGUAGE, persistido).
- Áudio: beep sintetizado (Web Audio) em todo botão, blip de erro para número inválido e o grito do Pokémon ao abrir os detalhes com CONFIRM (e de novo a cada CONFIRM nos detalhes).
- Cache das respostas da API em `localStorage`.
- Layout responsivo: imagem do aparelho no desktop (> 1280 px), painéis empilhados abaixo disso.

## Controles

| Teclado         | Botão            | Ação                                             |
| --------------- | ---------------- | ------------------------------------------------ |
| Setas           | D-pad            | Move o cursor, troca formas/membros, rola a aba  |
| Enter           | CONFIRM          | Abre o Pokémon; executa o número digitado        |
| Backspace / Esc | BACK             | Limpa o número; cicla a geração; volta da página |
| Tab             | TAB              | Foca a busca (grade); troca de aba (detalhes)    |
| 0–9             | Teclado numérico | Digita o número nacional                         |
| Q / E           | LEFT / RIGHT     | Descrição / efetividade de tipos                 |
| − / +           | SCROLL           | Rola a tela secundária                           |
| L               | LANGUAGE         | Abre o menu de idioma                            |

Todo botão do aparelho também responde a clique e toque.

## Estrutura

```
index.html            marcação do aparelho (um único documento)
assets/               SVGs do corpo, visor, D-pad e luzes
javascript/           scripts globais, carregados em ordem pelo index.html
styles/               globals, reset, componentes e telas
docs/                 especificação, fluxo de usuário, planejamento e arquitetura
```

Veja [docs/arquitetura.md](docs/arquitetura.md) para a responsabilidade de cada módulo e as decisões de implementação.

## Documentação

- [Especificação](docs/especificacao.md): requisitos e situação de cada um.
- [Fluxo de usuário](docs/fluxo-de-usuário.md): telas, botões e funcionalidades.
- [Arquitetura](docs/arquitetura.md): como foi implementado.
- [Planejamento](docs/planejamento.md): cronograma por fase.

## Referências

- [PokeAPI v2](https://pokeapi.co/docs/v2): dados (`pokemon-species`, `pokemon`, `evolution-chain`, `type`, `ability`).
- [PokeAPI/sprites](https://github.com/PokeAPI/sprites): sprites animados (`other/showdown`) e estáticos.
- Fontes: [Silkscreen](https://fonts.google.com/specimen/Silkscreen) e [DotGothic16](https://fonts.google.com/specimen/DotGothic16) (Google Fonts), esta para o japonês.
