# Especificação — Pokédex v1

Aplicativo de navegador, sem frameworks e sem build, que renderiza a Pokédex do anime: um aparelho portátil de dois painéis. O painel esquerdo é interativo (tela principal, ticker, D-pad e botões de navegação); o painel direito é um visor vivo (tela secundária grande com descrição e efetividade de tipos, duas telinhas com os badges de tipo e um teclado numérico 0–9 para busca direta por número). Todos os dados vêm da PokeAPI v2, com cache local. Os sprites são animados, o grito real de cada Pokémon toca ao abrir a página de detalhes, e o aparelho fala inglês, espanhol, português do Brasil ou japonês.

## Regras gerais do aparelho

- **Escopo por painel:** cada botão age apenas nas telas do seu próprio painel. Única exceção: CONFIRM (painel esquerdo) executa o número digitado no teclado do painel direito.
- **Teclado físico:** setas = D-pad, Enter = CONFIRM, Backspace/Esc = BACK, Tab = TAB, 0–9 = teclado numérico, Q/E = alternar visor esquerdo/direito, -/+ = rolar o visor, L = menu de idioma.
- **Somente leitura:** sem contas, favoritos ou marcação de capturados. O que persiste é o idioma e o cache de recursos.
- **Estados:** carregamento é texto de boot em fonte pixel; falha é uma tela de erro retrô com CONFIRM para tentar de novo; a grade mostra cards-skeleton enquanto carrega.

## Tabela de requisitos

| #   | Área             | Requisito                                                                                                                                                                  |
| --- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Shell            | Renderizar o aparelho Pokédex com corpo de dois painéis, como segurar o gadget do anime                                                                                    |
| 2   | Shell            | Fonte pixelada e acabamento plástico robusto, fiel ao material de origem                                                                                                   |
| 3   | Shell            | Desktop: painéis lado a lado, aparelho centralizado em tamanho confortável                                                                                                 |
| 4   | Shell            | Mobile: painéis empilhados (interativo em cima, visor embaixo), sem imagem de shell — as telas preenchem a viewport de borda a borda e o próprio app é a shell             |
| 5   | Shell            | Desktop: corpo do aparelho como uma única imagem de fundo (um asset só, sem fatiamento) atrás dos dois painéis centralizados                                               |
| 6   | Shell            | Teclado físico controla tudo: setas, Enter, Backspace/Esc, Tab, dígitos, Q/E, -/+, L                                                                                       |
| 7   | Shell            | Todo botão na tela também funciona com toque/clique                                                                                                                        |
| 8   | Shell            | LEDs e detalhes do gabinete são puramente decorativos, sem controles falsos                                                                                                |
| 9   | Grid Page        | Ao iniciar, mostrar a grade dos 1025 Pokémon (ordenados por número nacional)                                                                                               |
| 10  | Grid Page        | Cada card mostra sprite animado, nome e número nacional                                                                                                                    |
| 11  | Grid Page        | D-pad move um cursor visível card a card, como menu de console                                                                                                             |
| 12  | Grid Page        | Cima/baixo na borda das linhas rola a grade suavemente uma linha (auto-scroll)                                                                                             |
| 13  | Grid Page        | Esquerda/direita dão volta dentro da linha; última carta da linha salta para a primeira da seguinte e volta                                                                |
| 14  | Grid Page        | Scrollbar oculta, mas rolagem nativa por mouse/toque continua funcionando                                                                                                  |
| 15  | Grid Page        | Novas páginas de cards carregam automaticamente perto do fim (scroll infinito)                                                                                             |
| 16  | Grid Page        | CONFIRM no card destacado abre a página de detalhes daquele Pokémon                                                                                                        |
| 17  | Grid Page        | Cards-skeleton como placeholder durante o carregamento                                                                                                                     |
| 18  | Grid Page        | Formas alternativas nunca aparecem como entradas da grade — apenas as 1025 espécies padrão                                                                                 |
| 19  | Grid Page        | BACK na grade, sem número em digitação, alterna o filtro de geração (I→IX, com volta)                                                                                      |
| 20  | Grid Page        | Filtro de geração derivado de faixas fixas de número nacional: I 1–151, II 152–251, III 252–386, IV 387–493, V 494–649, VI 650–721, VII 722–809, VIII 810–905, IX 906–1025 |
| 21  | Visor            | Tela secundária e telinhas de tipo descrevem o Pokémon destacado pelo cursor — mesmo rolando a grade, ao vivo                                                              |
| 22  | Visor            | Página padrão do visor: DESCRIÇÃO (a mais desejada, de zero esforço)                                                                                                       |
| 23  | Visor            | RIGHT mostra sempre EFETIVIDADE DE TIPOS; LEFT mostra sempre DESCRIÇÃO — seleção direta, sem ciclo                                                                         |
| 24  | Visor            | Botões SCROLL L./R. rolam a página quando o conteúdo transborda                                                                                                            |
| 25  | Visor            | As duas telinhas pequenas mostram sempre os badges de tipo primário e secundário do Pokémon destacado                                                                      |
| 26  | Visor            | Visor atualiza na hora a partir do cache local para Pokémon já vistos — navegação nunca espera a rede                                                                      |
| 27  | Visor            | O visor é uma vista derivada: nunca recebe foco; renderiza o cursor da grade ou o Pokémon do detalhe aberto                                                                |
| 28  | Teclado numérico | Dígitos digitados (ex.: 0, 2, 5) aparecem na tela secundária                                                                                                               |
| 29  | Teclado numérico | CONFIRM pula direto para a página de detalhes daquele número                                                                                                               |
| 30  | Teclado numérico | BACK limpa um número pela metade (sempre antes de qualquer outra ação do BACK)                                                                                             |
| 31  | Teclado numérico | Números inválidos (acima de 1025) são rejeitados com um blip breve de erro, sem travar                                                                                     |
| 32  | Pesquisa         | TAB na grade abre uma tela de busca dedicada                                                                                                                               |
| 33  | Pesquisa         | Digitação com o teclado físico ou do celular — sem grade de letras na tela; o D-pad não digita                                                                             |
| 34  | Pesquisa         | A busca casa nome no idioma atual, nome em inglês e número nacional                                                                                                        |
| 35  | Pesquisa         | Linha selecionável por D-pad dentro da tela de busca escolhe a geração diretamente                                                                                         |
| 36  | Pesquisa         | Resultados reutilizam o mesmo modelo de cards e navegação por cursor da grade                                                                                              |
| 37  | Pesquisa         | BACK sai da busca e volta para onde o jogador estava                                                                                                                       |
| 38  | Pesquisa         | Índice de nomes localizados construído preguiçosamente e cacheado — sem pré-buscar todos os detalhes                                                                       |
| 39  | Detalhes         | Página dividida em 4 abas: INFO, EVOLUÇÃO, STATUS, HABILIDADES & GOLPES                                                                                                    |
| 40  | Detalhes         | TAB circula as 4 abas (com volta) de qualquer ponto da página — sem foco em barra de abas                                                                                  |
| 41  | Detalhes         | D-pad navega apenas dentro do conteúdo da aba atual; troca de aba e navegação nunca conflitam                                                                              |
| 42  | Detalhes         | A INFO mostra sprite animado, número nacional, nome e gênero ("Pokémon Semente")                                                                                           |
| 43  | Detalhes         | Trocador de formas na INFO (ex.: ‹ Alolan ›) quando o Pokémon tem formas alternativas                                                                                      |
| 44  | Detalhes         | Trocar de forma atualiza sprite, tipos e status em todo o aparelho                                                                                                         |
| 45  | Detalhes         | Padrão único de trocador: ↓ entra, ←/→ muda, ↑ sai, CONFIRM confirma — idêntico nos dois trocadores                                                                        |
| 46  | Evolução         | A família aparece como trocador de membros (‹ Ivysaur ›), não como diagrama em árvore — famílias grandes como a da Eevee continuam simples                                 |
| 47  | Evolução         | O trocador mostra _como_ cada membro evolui: nível, item, troca, felicidade, horário etc.                                                                                  |
| 48  | Evolução         | O trocador também anda para trás: formas evoluídas mostram de onde vieram                                                                                                  |
| 49  | Evolução         | CONFIRM num membro selecionado pula para a página de detalhes dele                                                                                                         |
| 50  | Evolução         | Formas alternativas aparecem no trocador apenas onde a própria cadeia ramifica para elas                                                                                   |
| 51  | Status           | A aba STATUS mostra os 6 status base como barras, altura, peso e habilidades                                                                                               |
| 52  | Status           | Rodapé pequeno com habitat, grupos de ovo, taxa de captura e proporção de gênero                                                                                           |
| 53  | Habilidades      | A aba lista as 2–3 habilidades com efeito de uma linha cada                                                                                                                |
| 54  | Habilidades      | Golpes de subida de nível apenas da geração mais recente, em lista rolável — sem despejo entre jogos                                                                       |
| 55  | Detalhes         | O grito real do Pokémon toca ao abrir a página de detalhes; não há botão dedicado de grito                                                                                 |
| 56  | Detalhes         | As abas lembram a posição ao trocar e voltar                                                                                                                               |
| 57  | Idioma           | Botão LANGUAGE (vermelho, pequeno) abre um menu de idioma com cara de menu do aparelho                                                                                     |
| 58  | Idioma           | Opções: inglês (padrão), espanhol, português do Brasil e japonês                                                                                                           |
| 59  | Idioma           | A escolha persiste entre sessões (localStorage)                                                                                                                            |
| 60  | Idioma           | Nomes, descrições e gêneres dos Pokémon no idioma escolhido, onde a API fornece                                                                                            |
| 61  | Idioma           | Todo texto de interface (abas, dicas, telas de carregamento/erro) traduzido via dicionário escrito à mão, chaveado por locale (en, es, pt-BR, ja)                          |
| 62  | Idioma           | Entradas pt-BR anteriores à geração 7 caem silenciosamente para o inglês, sem erro                                                                                         |
| 63  | Áudio            | Um único beep sintetizado (Web Audio) ao pressionar CONFIRM — sem suíte completa de sons                                                                                   |
| 64  | Áudio            | Gritos obtidos dos assets de som da API, tocados na abertura do detalhe                                                                                                    |
| 65  | Sprites          | Sprites animados estilo Showdown em todo o aparelho, com arte oficial moderna como fallback estático                                                                       |
| 66  | Sprites          | Um único estilo de sprite, consistente em todas as telas, sem variar por filtro                                                                                            |
| 67  | Dados            | Texto de boot "LOADING…" em fonte pixel durante buscas — sem spinners                                                                                                      |
| 68  | Dados            | Tela "CONNECTION ERROR — PRESS CONFIRM TO RETRY" em fonte pixel quando a requisição falha                                                                                  |
| 69  | Dados            | Todo recurso buscado é cacheado localmente (localStorage): no máximo uma busca por sessão, idealmente uma só vez — polido com a API gratuita                               |
| 70  | Dados            | Apenas HTTP GETs sem autenticação; roda em hospedagem estática                                                                                                             |
| 71  | Ticker           | Telinha de info abaixo da tela principal mostra `№ 025 — PIKACHU` do Pokémon destacado, idioma e geração atual                                                             |
| 72  | Arquitetura      | Máquina de estados de tela no topo do app: entradas (botões, teclado, toque, texto) e dados da API entram; o estado completo do aparelho sai para um único renderizador    |
| 73  | Arquitetura      | Toda interação física/virtual normalizada num único conjunto de eventos de entrada no nível do app; o controlador só vê esses                                              |
| 74  | Arquitetura      | BACK volta uma tela (com pilha definida); o pulo da evolução e o do teclado reentram no detalhe com outro Pokémon                                                          |

## Fora do escopo

Favoritos/contas/marcação de vistos; formas alternativas como entradas da grade ou busca por forma ("alola"); navegador completo de golpes ou por jogo além dos level-up da última geração; sprites por era; teclado de letras na tela; outros idiomas; berries, itens, localidades, encontros, concursos; temas alternativos; botão dedicado de grito.

## Dados (PokeAPI v2)

| Recurso           | Uso                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Lista paginada    | Grade do app                                                                                                                      |
| `pokemon`         | Status, tipos, habilidades, altura/peso, golpes, sprites                                                                          |
| `species`         | Nomes localizados, gênero, flavor text, habitat, grupos de ovo, taxa de captura, gênero (macho/fêmea), link da cadeia de evolução |
| `evolution-chain` | Membros da família e condições de evolução                                                                                        |
| `type`            | Relações de dano (efetividade)                                                                                                    |
