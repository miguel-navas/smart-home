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
- No protótipo, marcar estados e comandos como demonstrativos: armazenamento atual é local por navegador, não sincroniza entre telas e não aciona equipamentos.
- Incluir dois painéis fixos e acessórios de montagem/alimentação/rede a definir na lista preliminar; refletir os dois clientes no diagrama funcional.

## [ ] Integração real e sincronização das duas centrais
- Definir tamanho/modelo, fixação, alimentação e rede de cada tela; instalar/configurar um único controlador Home Assistant e os dispositivos/protocolos compatíveis.
- Proteger o acesso com autenticação adequada e backend seguro, sem credenciais no navegador; ambas as telas devem receber os mesmos estados do controlador e confirmar o resultado real de cada comando.
- Hardware, credenciais, conectividade e integração real ainda não foram fornecidos ou configurados; não apresentar o protótipo atual como operação de equipamentos.
