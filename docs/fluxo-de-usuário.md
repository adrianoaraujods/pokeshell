# Fase 1 — Fluxo de Usuário

## Telas

### Painel esquerdo (interativo)

| Tela                              | Conteúdo                                                      | Entra por                                                 | Sai por                            |
| --------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------- |
| **Loading**                       | "LOADING…"                                                    | Início do app / entre saltos                              | Automática, ao carregar            |
| **Grid** (início)                 | Barra de busca, cards (sprite animado, nome, nº), cursor, skeletons | Fim do Loading; BACK                                      | CONFIRM → Detalhe · TAB → barra de busca |
| **Detalhe** (4 abas)              | INFO · EVOL. · STATS · MOVS.                           | CONFIRM no Grid; saltos (evolução, nº do keypad) | BACK (desempilha)                  |
| **Menu de idioma** (sobreposição) | EN / ES / PT-BR / JA                                          | LANGUAGE em qualquer tela                                 | CONFIRM aplica · BACK cancela      |
| **Erro de conexão**               | "CONNECTION ERROR — PRESS CONFIRM TO RETRY"                   | Falha de rede                                             | CONFIRM (retry)                    |

### Painel direito

| Elemento             | Conteúdo                                                                    |
| -------------------- | --------------------------------------------------------------------------- |
| **Secondary screen** | **DESCRIÇÃO** (padrão) ↔ **EFETIVIDADE DE TIPO**; ecoa os dígitos do keypad |
| **Type screens**     | Badges do tipo 1 / tipo 2 do pokémon selecionado                            |

O readout atualiza conforme o cursor se move (lê do cache), até no Grid.

---

## 2. Regras globais

**Escopo por painel**

- Botões da esquerda (D-pad, CONFIRM, BACK, TAB, LANGUAGE) só mexem na tela principal.
- Botões da direita (keypad, LEFT, RIGHT, scroll) só mexem na tela auxiliar.
- **Exceção:** CONFIRM (esquerda) executa o nº digitado no keypad (direita).

**Regra do buffer**

- Se há um nº sendo digitado: **CONFIRM = pular para o pokémon** e **BACK = limpar o buffer** — com prioridade sobre qualquer outra ação desses botões.

**Botões globais** (mesma ação em toda tela carregada)

| Botão        | Ação                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| LANGUAGE     | Abre o menu de idioma                                                               |
| Keypad 0–9   | Digita o nº da dex; dígitos aparecem no readout (máx. 4; nº > 1025 recusa com blip) |
| LEFT         | Readout → página DESCRIÇÃO                                                          |
| RIGHT        | Readout → página EFETIVIDADE DE TIPO                                                |
| Scroll L./R. | Rola a página atual do readout ↑/↓                                                  |

**Equivalentes de teclado**

| Teclado         | Botão        |
| --------------- | ------------ |
| Setas           | D-pad        |
| Enter           | CONFIRM      |
| Backspace / Esc | BACK         |
| Tab             | TAB          |
| 0–9             | Keypad       |
| Q / E           | LEFT / RIGHT |
| − / +           | Scroll       |
| L               | LANGUAGE     |

---

## 3. Botões por tela (só o que é específico de cada tela)

### Grid

| Botão   | Ação                                                                              |
| ------- | --------------------------------------------------------------------------------- |
| D-pad   | Move o cursor card a card; ←/→ dão a volta na lista; ↑/↓ na borda auto-scrollam 1 linha |
| CONFIRM | Abre o pokémon destacado                                                          |
| BACK    | Cicla o filtro de geração (ALL → I → … → IX → ALL); a regra do buffer tem prioridade |
| TAB     | Foca a barra de busca (TAB ou Esc de novo devolve o foco à grade)                 |

### Detalhe (4 abas)

| Botão   | Ação                                                                |
| ------- | ------------------------------------------------------------------- |
| D-pad   | ←/→ trocam o switcher da aba (forma na INFO, membro na EVOL.); ↑/↓ rolam o conteúdo |
| CONFIRM | Na EVOL., pula para o membro exibido; com número no keypad, abre-o  |
| BACK    | Volta à tela anterior (pilha)                                       |
| TAB     | Cicla as abas: INFO → EVOL. → STATS → MOVS. → INFO           |

### Menu de idioma

| Botão   | Ação                     |
| ------- | ------------------------ |
| D-pad   | ↑/↓ movem a seleção de idioma |
| CONFIRM | Aplica e fecha           |
| BACK    | Fecha sem aplicar        |

Nas tabelas acima valem sempre os **botões globais** e a **regra do buffer**. Em **Loading** e **Erro**, só o CONFIRM do _tentar novamente_; o resto fica desligado.

## 4. Grafo de navegação

![](navegação.svg)

> O grafo é o desenho original do planejamento e ainda mostra a Pesquisa como tela própria. Na implementação ela é a barra de busca da Grid (TAB foca, TAB/Esc sai).

## 5. Funcionalidades documentadas (por tela)

### Grid

- Cards: sprite animado (Showdown; artwork oficial como fallback estático), nome, nº nacional.
- Cursor: card a card; ←/→ viram a linha (última célula → primeira da linha seguinte); ↑/↓ na borda da área visível auto-scrollam uma linha; linhas viram na horizontal, não na vertical.
- Scroll infinito: mais páginas carregam conforme o cursor chega ao fim; scrollbar oculta (rolagem por mouse/toque continua como extra).
- Skeletons enquanto carrega; readout ao vivo acompanha o cursor.
- BACK cicla o filtro de geração (ALL→I→…→IX→ALL); a geração ativa aparece na telinha de info e no placeholder da busca.
- 1025 espécies padrão; formas alternativas **nunca** aparecem no grid.

### Pesquisa

- Barra de busca no topo da própria Grid, focada por TAB; texto livre digitado no teclado real (desktop ou mobile); D-pad **não** digita.
- Combina com: nome no idioma atual (das espécies já carregadas), nome em inglês e nº nacional exato.
- Filtra a grade em tempo real, dentro da geração ativa; o filtro de geração é o BACK da Grid.
- Ao sair da barra (TAB/Esc), o cursor volta ao pokémon anterior se ele ainda estiver nos resultados.

### Detalhe (4 abas)

- **INFO**: sprite animado, nº, nome, gênero ("Pokémon Semente"), altura, peso, o switcher de formas (`‹ Alolan ›`) quando existirem e a lista de fatos (habilidades, habitat, grupos de ovo, taxa de captura, razão de gênero); trocar a forma troca sprite, tipos e stats no app todo.
- **EVOL.**: switcher de membros (`‹ Ivysaur ›`) em vez de árvore desenhada; mostra _como_ cada um evolui (nível, item, troca, felicidade, período do dia…); anda também para trás ("evolui de"); CONFIRM pula pro membro; formas só aparecem onde a própria cadeia ramifica.
- **STATS**: 6 barras segmentadas de atributos base da forma selecionada.
- **MOVS.**: habilidades da forma com efeito de uma linha; lista de golpes por nível, **apenas da última geração**, com scroll (golpes vêm da forma padrão).
- **Áudio:** todo botão faz um beep sintetizado (tom por tipo de botão); CONFIRM que abre um pokémon (grade, keypad ou membro da EVOL.) toca o cry dele, e CONFIRM nos detalhes (sem número digitado) toca o cry de novo.
- A página de detalhes sempre abre na aba INFO.

### Switchers (padrão único, compartilhado)

`←/→` muda a escolha (com volta nas pontas) · `↑/↓` rolam o conteúdo da aba · `CONFIRM` (só na EVOL.) abre o membro.

### Keypad (lookup direto)

- Dígitos compõem o nº nacional no readout; CONFIRM pula; BACK limpa; nº > 1025 recusado com a mensagem `INVALID NUMBER` e um blip grave.

### Menu de idioma

- EN (padrão) / ES / PT-BR / JA; escolha persiste no localStorage; UI traduzida por dicionário; conteúdo traduzido vem da API; pt-BR pré-Gen 7 cai silenciosamente para inglês.

### Estados

- Loading: "LOADING…" em fonte pixel, sem spinners.
- Erro: mensagem informativa com retry por CONFIRM.
- Sem persistência de dados do usuário além do idioma e do cache (enciclopédia somente leitura).
