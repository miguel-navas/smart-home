# Arquitetura do backend compartilhado — Casa Inteligente

## Objetivo e status

As centrais touch `/painel/escritorio` e `/painel/suite`, além do painel aberto no celular, são clientes do mesmo backend. Nesta branch, eles compartilham o estado **simulado** de cada ambiente; nenhum endpoint controla equipamentos físicos. O Home Assistant continua sendo o hub escolhido para a futura integração física. A persistência do produto deverá migrar para SQL Server antes de uso comercial ou implantação com múltiplas instâncias.

## Fonte de verdade e componentes

- **React em cada cliente:** consulta o snapshot, envia comandos tipados e mantém somente preferências visuais locais. Estado de dispositivo não é mantido em `localStorage`.
- **API tRPC no Express:** `smartHome.snapshot` lê o estado; `smartHome.command` aplica um comando; `smartHome.scene` aplica uma cena predefinida. As rotas são atualmente `publicProcedure` e manipulam somente a simulação; não recebem URL ou token do Home Assistant.
- **SQLite local no desenvolvimento:** `.data/smart-home.sqlite` armazena uma linha por ambiente e uma linha global de revisão. A inicialização cria tabelas e insere estados iniciais com `INSERT OR IGNORE`, sem sobrescrever alterações existentes. O arquivo é ignorado pelo Git.
- **Limite do SQLite:** todos os painéis conectados ao mesmo backend de desenvolvimento compartilham esse arquivo. O arquivo local não é um banco distribuído, não replica entre contêineres/hosts e não é persistência válida para produção. O endpoint da simulação recusa execução com `NODE_ENV=production` para não sugerir que um arquivo efêmero é banco de produto.
- **Contrato de armazenamento:** `SmartHomeStateStore` isola as operações de snapshot, revisão, comando e cena. `SqliteSmartHomeStore` o implementa no desenvolvimento; um adaptador SQL Server é trabalho futuro e ainda não está conectado.
- **Contrato de provedor:** `SmartHomeProvider` separa a origem do estado consumida pela API. `SimulationProvider` usa o armazenamento SQLite. Um provedor Home Assistant futuro será outro componente; para estados físicos, o Home Assistant deverá ser a fonte canônica, evitando cópias de estado divergentes.
- **MySQL gerenciado preexistente:** continua disponível ao scaffold e aos recursos preexistentes de usuário/autenticação. As tabelas e a migração MySQL da tentativa anterior foram preservadas, sem `DROP`, mas o novo simulador não as consulta nem as atualiza.
- **SSE (`/api/smart-home/events`):** a conexão observa a revisão persistida no armazenamento e envia somente o número da revisão. O evento não transporta estado nem comando.

```mermaid
flowchart LR
  A[Painel Escritório] -->|query/comando tRPC| API[Express + tRPC]
  B[Painel Suíte] -->|query/comando tRPC| API
  C[Celular / navegador] -->|query/comando tRPC| API
  API --> SIM[SimulationProvider]
  SIM -->|contrato SmartHomeStateStore| STORE[SqliteSmartHomeStore]
  STORE -->|transação de estado + revisão| DB[(Arquivo SQLite local)]
  DB -->|poll da revisão| SSE[Endpoint SSE]
  SSE --> A
  SSE --> B
  SSE --> C
  A -->|invalida e relê snapshot| API
  B -->|invalida e relê snapshot| API
  C -->|invalida e relê snapshot| API
  STORE -. adaptador futuro .-> SQL[(SQL Server do produto)]
  HA[Home Assistant futuro] -. fonte física canônica .-> API
```

O diagrama separa duas decisões futuras: SQL Server será o armazenamento do produto; Home Assistant será o hub/origem canônica dos estados de dispositivos reais. Nenhum dos dois adaptadores está implementado nesta branch.

## Fluxo de snapshot e comando

1. Ao montar, ao recuperar foco e ao reconectar o `EventSource`, o cliente solicita `smartHome.snapshot`. A resposta informa `source: "simulation"`, revisão, horário e estados. Ela é a leitura autoritativa; um evento SSE perdido não deixa a tela dependente de memória local.
2. Um comando chega em `smartHome.command`. O schema Zod limita ambiente e capacidade a valores conhecidos. O backend recusa ar-condicionado fora das zonas aprovadas e exaustão fora da cozinha/churrasqueira; temperatura só aceita delta `-1` ou `1` e o SQLite aplica o limite demonstrativo de 16–30 °C.
3. O armazenamento inicia `BEGIN IMMEDIATE`, lê o estado atual, valida a capacidade, atualiza o registro do ambiente e incrementa a revisão global na mesma transação. Se qualquer etapa falha, a transação é revertida. O backend só devolve sucesso depois do commit e da leitura do snapshot resultante.
4. A conexão SSE envia a revisão vigente ao conectar. Enquanto aberta, consulta essa revisão a cada segundo e envia um evento `message` quando ela muda; envia heartbeat após período sem alterações e um evento `backend-status` quando o armazenamento cai ou volta.
5. Cada cliente recebe a revisão e invalida a query tRPC, então consulta o snapshot completo. Em nova conexão, o cliente recebe a revisão atual antes de esperar novos eventos. Essa combinação de snapshot autoritativo + notificação de invalidação reduz o risco de estado desatualizado por desconexões.

O acesso ao arquivo SQLite usa transação de escrita imediata para serializar comandos concorrentes na instância de desenvolvimento. Para múltiplas instâncias em hosts diferentes, a revisão e a mudança precisam ser atômicas em um banco compartilhado SQL Server; SSE sozinho não distribui dados.

## Fluxo de cena

`smartHome.scene` aceita somente as cenas enumeradas no código. `cheguei` acende a sala e o escritório; `noite` apaga luzes e desliga climatização apenas nas zonas autorizadas; `sair` apaga as luzes. A cena inteira e o incremento da revisão são gravados numa única transação SQLite. As cenas são demonstrações, sem acionamento físico.

## Segurança, falhas e limites

- As rotas de leitura/comando da simulação não exigem login nesta versão; qualquer pessoa que tenha acesso à aplicação pode alterar o estado demonstrativo. Não há segredo Home Assistant no browser, no servidor desta branch ou no banco simulado, pois não existe integração real.
- A ausência de autenticação é aceitável somente para a simulação de desenvolvimento. Antes de controlar hardware ou expor um produto, exigir autenticação/autorização adequada, validar origem/CSRF conforme o transporte, limitar ações a entidades e serviços allowlisted, proteger tokens no servidor e registrar/auditar operações relevantes.
- Erro de validação devolve falha e não altera estado nem revisão. Falha dentro da transação faz rollback. Falha de snapshot/armazenamento deve ser apresentada como indisponibilidade, nunca como comando concluído.
- Se o SSE cair, `EventSource` tenta reconectar; a query também é refeita periodicamente e ao recuperar foco. O navegador usa o snapshot do backend, não uma cópia local como fonte de verdade.
- O arquivo `.data/smart-home.sqlite` persiste entre reaberturas de página e reinícios do servidor enquanto o ambiente local persistir. Ele pode não sobreviver à substituição do Sandbox ou ao ciclo de vida de um contêiner publicado; não usar como banco do produto.
- A migração SQL Server deverá preservar estado/configuração pertinente e implementar atomicidade equivalente para comando + revisão. Essa implementação requer ambiente e validação próprios; não é coberta pela simulação SQLite.
- A integração real exigirá um Home Assistant instalado e configurado, entidades compatíveis, autenticação, allowlist, mapeamento de cômodos e confirmação de estado real. URL/token não devem entrar no frontend, no controle de versão ou em logs.

## Decisões futuras

1. Definir versão e hospedagem suportadas para o SQL Server de produto, credenciais e processo de migração.
2. Determinar quais dados ficam em SQL Server (contas, preferências, auditoria e configurações) e quais estados físicos permanecem canônicos no Home Assistant.
3. Implementar e testar a troca do adaptador de armazenamento antes de habilitar múltiplas instâncias, venda ou controle físico.
4. Definir autenticação e papéis das telas fixas e do aplicativo móvel; as duas centrais devem controlar a mesma casa sem duplicar gateways.
