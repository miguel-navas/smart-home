# Consolidar o MVP simulado do Casa+

## Why

A main demonstra controles locais por navegador, enquanto a branch de simulação compartilhada já contém o backend e as interfaces mais recentes. Consolidar essa entrega dá ao MVP critérios verificáveis para uma demonstração consistente nas duas centrais e no celular.

## What Changes

- Consolidar na linha principal a simulação compartilhada, os painéis fixos, os controles de cortinas e persianas e o assistente textual da branch `feature/shared-backend-ha-simulation`.
- Validar o fluxo entre três clientes, a persistência local do servidor, a recuperação após falhas e as restrições de comandos.
- Alinhar as duas cópias HTML do PRD e os documentos de operação com a entrega consolidada. Identificar o PDF anterior por versão caso seja mantido como histórico.
- Tratar controle físico via Home Assistant, SQL Server de produto, acesso remoto e voz local por satélite como entregas posteriores.

## Capabilities

### New Capabilities

- `simulacao-residencial` — fonte compartilhada, comandos, cenas e sincronização demonstrativa.
- `paineis-residenciais` — centrais de escritório e suíte, interface móvel e controle de coberturas.
- `assistente-casa` — conversa em português e comandos explícitos sobre coberturas simuladas.

### Modified Capabilities

Nenhuma especificação publicada na raiz OpenSpec.

## Impact

Interfaces React, API Express/tRPC, canal SSE, armazenamento SQLite de desenvolvimento e documentação do MVP. A adoção deve preservar as rotas das centrais e deixar explícito que o estado anteriormente salvo em cada navegador não é migrado para o servidor.

## Validação do PRD

Foram comparadas as versões HTML em `docs/PRD-MVP-casa-inteligente.html` na main e na branch de simulação compartilhada, com o código e a documentação de arquitetura. A análise foi estática.

| Tema | Evidência | Ajuste para fechar o aceite |
| --- | --- | --- |
| Estado compartilhado | A main usa armazenamento por navegador. A branch avançada usa snapshot tRPC, SQLite e SSE. | Identificar a branch e a versão em cada cópia do PRD. Demonstrar sincronização, recarga, reinício e reconexão em três clientes. |
| Climatização e coberturas | A branch avançada acrescenta cinco coberturas e preserva as zonas autorizadas. | Nomear os cinco ambientes de cobertura e os cinco espaços sem ar. Testar rejeição também pela API. |
| Voz | O chat aceita texto e pode falar respostas. A ativação local depende de satélite e pipeline futuros. | Distinguir saída falada de entrada por microfone. Separar critérios de aceite da demonstração e do futuro piloto de voz. |
| Integração física e segurança | A simulação tem rotas públicas de desenvolvimento. Home Assistant e SQL Server são destinos futuros. | Separar aceite de demonstração, piloto físico e operação de produto. Definir autenticação, permissões e confirmação real antes do piloto. |
| Plantas | O PRD delimita lote, corredor e adjacências como referências conceituais. | Preservar essa distinção e manter cotas internas, recuos e projeto executivo como pendências. |
| Distribuição móvel | Há manifesto PWA. Instalação e comportamento em dispositivos-alvo não foram verificados. | Validar em navegadores-alvo e declarar dependência de conexão com o backend. |
