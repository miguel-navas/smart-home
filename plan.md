# Plano de implementação — Casa Inteligente

## Escopo e premissas propostas

Entregar uma primeira versão funcional como painel web responsivo e instalável como PWA em celular, cobrindo monitoramento e comandos demonstrativos dos ambientes. Isso oferece acesso no navegador e instalação na tela inicial, mas **não é um aplicativo nativo Android/iOS separado**. A conexão futura usará Home Assistant como camada de integração e fonte canônica de estado; credenciais permanecerão no servidor e nunca no navegador. Voz poderá ser usada por Home Assistant Assist, Alexa ou Google, conforme decisão do usuário. Nesta versão, sensores e dispositivos são simulados e controles têm estado demonstrativo local; não alegar que há telemetria real.

A planta e os diagramas elétricos serão estudos conceituais preliminares, não desenhos executivos. Terreno plano confirmado: 10 m de largura × 25 m de profundidade. A referência do Planner 5D indica rua/frente no lado de 10 m (parte inferior do esquema), fundos no extremo oposto e corredor lateral externo de 2 m à direita. No térreo, a referência posiciona jardim externo nos fundos; churrasqueira/área gourmet à esquerda e lavanderia à direita; jantar à esquerda e cozinha à direita; escada/circulação e jardim de inverno aberto ao céu; estar/entrada social e escritório na frente; garagem para dois carros lado a lado e acesso/jardim na parte frontal. Por confirmação do usuário, localizar o lavabo junto ao escritório. No superior, dispor quartos 2 e 3 na área dos fundos, hall e banheiro social, escada com vazio sobre o jardim de inverno, e suíte com closet/banho na frente; usuário confirmou sacadas dos quartos 2 e 3 voltadas aos fundos e sacada da suíte voltada à frente. Não foram fornecidas cotas internas, detalhes de aberturas nem recuos legais: o desenho interno é esquemático e sem escala, e nenhuma dimensão do envelope residencial está aprovada. Prever climatização central por zonas, exceto lavabo, jardim de inverno, churrasqueira e banheiros (compartilhado e suíte), que não precisam de ar-condicionado. Estrutura, insolação, capacidade térmica, circuitos, proteções, aterramento, cargas e conformidade normativa dependem de levantamento e validação local.

## Direção visual

Três opções (probabilidades pequenas de amostragem de cauda):
1. **Painel técnico editorial** — 0,04: diagramas claros, papel quente e organização de oficina de arquitetura.
2. **Noite de automação** — 0,06: interface escura de sala de controle com cores luminosas.
3. **Jardim conectado** — 0,08: natureza doméstica, tons de sálvia e interfaces acolhedoras.

**Escolha proposta: Painel técnico editorial.**

- **Movimento:** modernismo suíço aplicado a uma prancheta de arquitetura e instrumentação residencial.
- **Princípios centrais:** leitura imediata do estado; precisão visual sem ruído; controles acessíveis; distinção clara entre dado simulado e equipamento conectado.
- **Filosofia de cor:** base marfim e grafite para remeter a desenho técnico impresso; verde sálvia como assinatura de casa eficiente; âmbar reservado para alertas e exceções.
- **Paradigma de layout:** navegação lateral de sala de controle no desktop; em celular, navegação inferior e cartões em coluna, mantendo a planta como foco visual.
- **Elementos de assinatura:** traços finos de planta baixa; pontos circulares de telemetria; etiquetas de estado como em um quadro elétrico.
- **Interação:** comandos com estado evidente e feedback imediato, confirmação apenas para ações de impacto; filtros de pavimento e cômodo atualizam conteúdo sem perder contexto.
- **Animação:** transições curtas de 160–220 ms; pulsação discreta só em leituras simuladas recentes; nenhuma animação contínua que pareça indicar sensor real.
- **Tipografia:** Manrope para interface, IBM Plex Mono para unidades, leituras e etiquetas; escala com títulos compactos, números destacados e texto de apoio legível.
- **Essência da marca:** um centro de comando doméstico que transforma planta e instalações em uma visão operacional; personalidade: cuidadosa, clara, confiável.
- **Voz:** direta e serena. Exemplos: “Tudo tranquilo por aqui.” / “Modo demonstração — conecte um gateway para usar equipamentos reais.”
- **Marca/logotipo:** casa em contorno construída por duas linhas de circuito, com um ponto-sensor na interseção.
- **Cor de assinatura:** verde sálvia profundo.

## Produto e arquitetura de implementação

- React/TypeScript em uma SPA responsiva, aproveitando o scaffold atual (Vite, Tailwind, Wouter e lucide-react).
- Rotas propostas: `/` visão geral; `/ambientes` lista e controle por cômodo; `/climatizacao` zonas de ar-condicionado; `/plantas` plantas dos dois pavimentos; `/materiais` lista preliminar; `/circuitos` diagramas conceituais; `/painel/escritorio` e `/painel/suite` são entradas diretas para as centrais touchscreen.
- O painel mostrará indicadores demonstrativos de temperatura, umidade, energia e conectividade, seletor de pavimento, estado de dispositivos, cenas e atalhos de automação. Os controles ficam locais ao navegador no protótipo e são marcados como demonstração.
- A instalação móvel inicial será PWA: manifest, ícones simples próprios e layout móvel. Sem notificações push ou alegação de funcionamento offline enquanto não houver backend/gateway e sincronização definidos.
- Duas centrais fixas em tablets/painéis touchscreen, uma no escritório e outra na suíte; ambas podem controlar toda a casa, com atalhos/favoritos distintos por local. As URLs diretas são `/painel/escritorio` e `/painel/suite`; botões e alvos de toque serão ampliados para uso fixo.
- As duas interfaces são clientes, não controladores independentes: a arquitetura proposta usa um único Home Assistant como fonte canônica quando integrado. Na demonstração atual, cada navegador salva localmente (`localStorage`); dois dispositivos não sincronizam estados e nenhum comando opera hardware real.
- Ainda dependem de escolha: tamanho/modelo dos painéis, suporte/fixação, alimentação e rede; antes de controle real, é necessário instalar/configurar o Home Assistant e dispositivos compatíveis, além de autenticação, backend e sincronização seguros.
- Sem login obrigatório na demonstração. O starter oferece servidor e MySQL gerenciado; não escrever ou migrar esquema de banco até definir integração e necessidade de persistência multiusuário. Não expor segredo no navegador.
- Lista de materiais estimativa, incluindo dois painéis fixos (1 escritório e 1 suíte), suportes/alimentação/rede a definir e um único hub/controlador compatível; quantidades e capacidades restantes são indicativas ou “a definir por projeto”, não cotação nem dimensionamento final.
- Plantas conceituais em SVG para térreo e superior, baseadas na referência Planner 5D e nas confirmações do usuário. Manter dimensões de lote (10 × 25 m) e corredor (2 m) como únicas cotas explícitas; marcar divisões internas como esquemáticas e sem escala. Mostrar lavabo junto ao escritório; duas sacadas dos dormitórios 2/3 para os fundos e uma da suíte para a frente. Diagramas de automação/circuitos permanecem funcionais e não executivos; diagrama mostrará os dois painéis de interface conectados pela mesma rede ao hub único proposto.
- A casa contempla: térreo com garagem para dois carros, estar, jantar, cozinha com coifa, churrasqueira coberta com exaustão, lavabo perto do escritório, escritório com espaço para sofá/mesa de computador/TV, jardim de inverno aberto ao céu e lavanderia. A frente/rua fica no lado de 10 m; corredor lateral externo de 2 m à direita; fundos e jardim externo ao lado oposto; o escritório fica na frente, junto à sala. Pavimento superior: suíte com closet/banho, quartos 2 e 3 com armários embutidos, mesa/computador/TV, banheiro social, sacadas dos dois quartos para os fundos e sacada da suíte para a frente; escada alinhada ao vazio do jardim de inverno. Posições internas seguem a referência compartilhada e as confirmações do usuário, mas as dimensões internas/recuos não foram fornecidos. Prever climatização central apenas nos demais cômodos, sem ar-condicionado no lavabo, jardim de inverno, churrasqueira ou nos dois banheiros.

## Estrutura principal do projeto

- `client/src/App.tsx`: rotas e estrutura compartilhada da SPA.
- `client/src/pages/`: páginas Visão Geral, Ambientes, Climatização, Plantas, Materiais, Circuitos e perfis das duas centrais fixas dentro do painel principal.
- `client/src/components/`: navegação, cartões, controles, etiquetas de estado e componentes de planta.
- `client/src/lib/`: dados demonstrativos, estado dos dispositivos e persistência local.
- `client/public/`: `manus-routes.json` com URLs diretas dos painéis, manifesto PWA, ícones e arquivos públicos de plantas/diagramas; não alegar funcionamento offline.
- `docs/`: arquivos fonte e exportações dos desenhos conceituais e lista preliminar.
- `server/`, `drizzle/`: manter scaffolding; não adicionar endpoints, login ou tabelas sem um protocolo/gateway escolhido.

## Fluxo de entrega

1. Aguardar aprovação deste plano e confirmação de que a primeira entrega móvel como PWA é aceitável.
2. Registrar os resultados por página em `TODO.md`, incluindo as condições do pedido original e as premissas de demonstração.
3. Construir a interface, os desenhos vetoriais e a documentação preliminar dentro do projeto.
4. Executar verificações do projeto, confirmar manifesto de rotas e iniciar a prévia.

## Limites de segurança e uso

Os circuitos serão blocos funcionais ilustrativos (alimentação/proteção, controlador, sensores, atuadores, rede e cargas), sem valores de disjuntores, tensão, corrente, bitolas ou esquema de ligação pronto para instalação. A integração real demanda seleção de hardware e compatibilidade (por exemplo, gateway e protocolo como Matter, Zigbee ou integração equivalente), e projeto/revisão por engenheiro eletricista, arquiteto e profissionais locais habilitados.
Plantas e diagramas são estudos conceituais, não desenhos executivos. As plantas seguem a referência Planner 5D e as confirmações registradas acima; não devem ser tratadas como arquitetura aprovada. Só lote (10 × 25 m) e corredor lateral (2 m) estão cotados; divisões internas, envelope residencial, aberturas, recuos e orientação solar exigem levantamento. Os circuitos, proteções, cargas, aterramento, capacidade térmica e conformidade normativa exigem dimensionamento e validação por profissionais habilitados.
