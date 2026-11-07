# Entregas — Casa Inteligente

## [x] Painel web e experiência móvel responsiva
- Entregar aplicativo web para monitoramento e controle da casa, com acesso responsivo em desktop e celular.
- Disponibilizar o painel no celular como PWA instalável; deixar explícito que esta primeira entrega não é aplicativo nativo Android/iOS separado.
- Incluir estados e leituras demonstrativos, controles por ambiente e climatização, sem alegar conexão com equipamentos reais; avisar que gateway, protocolo, marcas/modelos e credenciais ainda precisam ser escolhidos.

## [x] Casa de dois pavimentos e plantas conceituais — revisadas conforme referência e confirmações
- O terreno é plano, com 10 m de largura e 25 m de profundidade.
- A casa terá dois pavimentos, com planta baixa conceitual e ambientes identificados. Terreno plano: 10 m de largura × 25 m de profundidade; frente/rua no lado de 10 m; fundo no extremo oposto; corredor externo lateral de 2 m livres à direita. Mostrar somente cotas confirmadas; dimensões internas e recuos legais permanecem pendentes. O desenho antigo foi retirado; o novo deve seguir a referência do Planner 5D e as confirmações seguintes, com divisões internas marcadas como esquemáticas/sem escala.
- No térreo: no lado dos fundos, jardim externo; churrasqueira/área gourmet à esquerda e lavanderia à direita; sala de jantar à esquerda e cozinha à direita; escada/circulação e jardim de inverno aberto ao céu; na frente, sala de estar/entrada social e escritório. O escritório permanece junto à sala e comporta sofá, mesa para computador e televisão. Posicionar o lavabo perto do escritório. Na frente, garagem para dois carros lado a lado e acesso/jardim; coifa/exaustão na cozinha e churrasqueira.
- No pavimento superior: os quartos 2 e 3 ficam nos fundos, cada um com armário embutido e espaço para mesa/computador e televisão; as sacadas desses dois quartos ficam voltadas para os fundos. Incluir hall de quartos e banheiro social; escada/circulação junto ao vazio sobre o jardim de inverno; na frente, suíte com closet e banheiro próprio; a sacada da suíte fica voltada para a frente.
- Prever climatização central por zonas nos ambientes aprovados, sem dimensionar capacidade final. O lavabo, jardim de inverno, churrasqueira e ambos os banheiros não precisam de ar-condicionado; removê-los das zonas e dos controles.

## [x] Lista preliminar de materiais
- Entregar lista organizada de materiais para automação, sensores, controlador/gateway, rede, atuadores, climatização e exaustão, com quantidades apenas indicativas ou marcadas como a definir.
- Indicar claramente que não é cotação nem dimensionamento executivo e depende da compatibilidade dos equipamentos e de levantamento profissional.

## [x] Diagramas conceituais dos circuitos e sistema
- Entregar desenho de circuito/topologia conceitual que mostre controlador/gateway, sensores, rede, atuadores, quadros e cargas/zonas.
- Não fornecer valores de disjuntores, tensões, correntes, bitolas, proteções ou instrução pronta para instalação; submeter desenho final à revisão de profissional habilitado.

## [x] Limites e validação técnica
- Manter explícitas as premissas e as lacunas: cidade/regras de recuo, dimensões finais, orientação solar, dimensionamento estrutural/elétrico/térmico, protocolo/gateway e seleção dos equipamentos reais.
- Não descrever dados simulados como telemetria real nem tratar planta/circuitos conceituais como projeto executivo.

## [x] PRD do MVP e direção de integração por voz
- Criar o PRD em HTML com objetivos, escopo, requisitos funcionais, arquitetura, segurança, critérios de aceite e pendências de decisão.
- Documentar Home Assistant como hub/fonte canônica proposto, voz via Assist/Alexa/Google e limite entre simulação e integração real.

## [x] Protótipo das duas centrais fixas touchscreen: escritório e suíte
- Disponibilizar uma tela/URL direta para a central do escritório (`/painel/escritorio`) e outra para a central da suíte (`/painel/suite`).
- Ambas as telas podem controlar toda a casa; diferenciar os atalhos/favoritos conforme o local. Usar o mesmo app e prever um Home Assistant compartilhado como fonte canônica quando houver integração real; não criar dois gateways/controladores independentes.
- Projetar as telas para toque e deixar as rotas fáceis de abrir/fixar nos dois dispositivos.
- Marcar estados e comandos como demonstrativos; nenhuma tela deve alegar que acionou equipamento real.
- Incluir dois painéis fixos e acessórios de montagem/alimentação/rede a definir na lista preliminar; refletir os dois clientes no diagrama funcional.

## [x] Tela inicial React otimizada para central provisória de 10 polegadas em paisagem
- Nas rotas `/painel/escritorio` e `/painel/suite`, apresentar um layout inicial próprio para tela touch de 10 polegadas em paisagem; 10 polegadas é referência provisória de interface e não especifica modelo/resolução do equipamento.
- Manter visíveis identificação do perfil, estado de conexão/sincronização do backend e aviso de modo demonstração; quando o backend não confirmar o estado, informar erro/indisponibilidade e desativar comandos em vez de indicar sucesso.
- Exibir cenas rápidas, favoritos acionáveis do perfil local, resumo/acesso às zonas válidas de climatização e acesso a todos os ambientes; os dois painéis podem controlar a casa toda, mas mantêm favoritos diferentes e sincronizam o estado compartilhado.
- Usar alvos principais de toque com pelo menos 48 px; conservar layout responsivo para celulares/PWA e para telas fora do modo paisagem.
- Usar fundo escuro nas telas das centrais, com cartões/superfícies contrastantes, texto legível e cores de status distinguíveis.
- Não exibir lavabo, jardim de inverno, churrasqueira nem os dois banheiros como zonas de ar-condicionado. Não acionar hardware físico; todos os estados desta tela continuam identificados como demonstração.

## [x] Persianas blackout e cortinas motorizadas — controle em todos os painéis
- Prever persianas blackout motorizadas na suíte, nos quartos 2 e 3 e no escritório; prever cortinas motorizadas na sala de estar.
- Mostrar o controle do dispositivo no cômodo correspondente e permitir que as duas centrais fixas, o app e o assistente CASA+ por texto controlem a casa toda.
- Permitir abrir/fechar e ajustar a posição em faixa de 0–100% (0 = fechada; 100 = aberta); estados e comandos permanecem simulados e sincronizados pelo backend compartilhado entre central Escritório, central Suíte e app.
- Não alegar que existe motor, persiana/cortina física ou integração Home Assistant conectada; hardware, canal de controle e calibração serão definidos posteriormente.

## [x] Painel React dedicado para cortinas e persianas
- Disponibilizar `/coberturas` e rotas dentro dos dois painéis (`/painel/escritorio/coberturas` e `/painel/suite/coberturas`) com controle dedicado, separado da lista geral de ambientes.
- Apresentar os cinco dispositivos simulados: cortina da sala de estar e persianas blackout do escritório, suíte e quartos 2 e 3; agrupar por pavimento e identificar o cômodo e tipo de cobertura.
- Exibir posição confirmada de 0–100%, permitir abrir, fechar e ajustar a posição por slider e posições rápidas; sincronizar comandos pelo hook tRPC/SSE e backend comum.
- Desativar comandos sem snapshot confirmado ou quando o backend estiver indisponível; após falha, manter/retornar à última posição confirmada e informar que não houve confirmação.
- Usar layout touch responsivo e o tema escuro das centrais, com rótulos acessíveis; deixar claro que os estados são demonstrativos e nenhum motor físico está conectado.

## [x] Assistente CASA+ por texto e respostas faladas quando suportadas
- Oferecer conversa em português sobre a casa e comandos simples; manter o texto como alternativa de interação e permitir a leitura audível da resposta quando a síntese de fala do navegador estiver disponível.
- Neste protótipo, aceitar pelo assistente somente um comando explícito de posição por vez para persiana/cortina simulada; validar ambiente, tipo de cobertura, ação/posição e correspondência com a mensagem atual no backend antes de persistir, e não oferecer serviços ou entidades arbitrários.
- Chamar o LLM do projeto exclusivamente pelo servidor; não expor credenciais no navegador. Informar que o texto e o snapshot simulado são processados pelo serviço e que o uso pode consumir créditos; manter as mensagens somente na tela durante a sessão.
- Quando o backend estiver indisponível, bloquear envio; em erro não declarar sucesso. Limitar chamadas a 8 por minuto por usuário/IP nesta instância de desenvolvimento; isso não substitui autenticação/limite compartilhado em produção.
- Os comandos físicos continuam desabilitados até a futura integração real; o assistente atua somente sobre o estado simulado e informa quando não compreender ou quando o backend estiver indisponível.

## [ ] Palavra de ativação contínua com detecção local em satélite/microfone dedicado
- O usuário escolheu palavra de ativação sempre ouvindo, com detecção local na residência e microfone/satélite dedicado; o áudio de espera pela palavra não deve ser transmitido continuamente a um serviço de nuvem.
- Após a palavra ser detectada localmente, capturar o comando por um pipeline residencial; somente a transcrição poderá seguir para o serviço LLM do projeto após informar esse fluxo ao morador.
- O protótipo React/PWA não deve afirmar que tem escuta contínua ativa nem pedir acesso contínuo ao microfone sem satélite/pipeline configurado; manter a integração real pendente até selecionar, instalar e validar o hardware e Home Assistant.

## [x] Backend compartilhado para simulação e sincronização das duas centrais
- Criar a branch `feature/shared-backend-ha-simulation` a partir do estado aprovado, preservando a branch `main`.
- Remover estado de dispositivos de `localStorage` e da memória do navegador. Os painéis do escritório (`/painel/escritorio`), da suíte (`/painel/suite`) e o app móvel devem ler o mesmo snapshot de dispositivos persistido no arquivo SQLite local do backend de desenvolvimento; a persistência deve sobreviver a atualização/reabertura de página e reinício do servidor. A SQLite desta etapa atende clientes da mesma instância de backend e não é armazenamento de produção para réplicas em hosts/contêineres distintos.
- Enviar comandos pela API comum do backend, validar ambiente, capacidade e valor antes da gravação e alterar o estado do dispositivo e a revisão compartilhada na mesma transação SQLite; o backend só confirma sucesso após persistir a mudança.
- Publicar uma rota SSE que observa a revisão persistida em SQLite e notifica os clientes; ao receber a mudança, cada painel refaz a leitura do snapshot. Ao conectar ou reconectar, cada tela carrega o snapshot atual, evitando depender de notificações perdidas ou do estado apenas em memória do servidor.
- Manter as ações na simulação: luzes, zonas de climatização autorizadas, coifa/exaustão e temperaturas demonstrativas; lavabo, jardim de inverno, churrasqueira e os dois banheiros permanecem sem zona de ar. Não acionar nenhum dispositivo físico nesta entrega.
- Isolar o armazenamento da simulação atrás de contrato, para uma implementação SQL Server futura substituir SQLite sem alterar a interface; manter o Home Assistant como integração física futura separada. URL/token do Home Assistant devem ficar no servidor; entidades e ações reais exigirão autenticação e allowlist antes de habilitar controle físico.
- Manter favoritos específicos do escritório e da suíte, mas refletir entre os painéis e o celular o estado comum do mesmo cômodo; expor indisponibilidade, espera, erro e reconexão sem simular sucesso.
- Documentar o fluxo navegador → API → transação SQLite no desenvolvimento → revisão persistente → SSE → nova consulta dos clientes; explicar os limites da simulação, do futuro adaptador SQL Server e da integração Home Assistant.

## [ ] Preparar persistência de produto em SQL Server
- Nesta branch, SQL Server é alvo arquitetural futuro: implementar e validar o adaptador somente quando houver ambiente/credenciais de produto; não declarar que a aplicação já se conecta a SQL Server.
- Antes de publicar múltiplas instâncias ou vender o produto, substituir o arquivo SQLite local por persistência compartilhada SQL Server, validar transações/concorrência e manter Home Assistant como fonte canônica dos estados físicos conforme decisão de integração.
- Preservar tabelas e histórico de migração MySQL já existentes; não executar DROP nem apagar estados para fazer a troca de desenvolvimento.

## [ ] Integração real e controle de equipamentos com Home Assistant
- Definir tamanho/modelo, fixação, alimentação e rede de cada tela; instalar/configurar um único controlador Home Assistant e os dispositivos/protocolos compatíveis.
- Proteger o acesso com autenticação adequada e backend seguro, sem credenciais no navegador; as duas telas devem consultar a fonte de estado real do Home Assistant e confirmar o resultado real de cada comando.
- Hardware, credenciais, conectividade e integração real ainda não foram fornecidos ou configurados; não apresentar o protótipo atual como operação de equipamentos.
