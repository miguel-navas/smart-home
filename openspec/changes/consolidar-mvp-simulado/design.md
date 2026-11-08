# Design do MVP simulado

## Context

A main guarda o estado por navegador. A branch `feature/shared-backend-ha-simulation` já contém o provedor simulado, o armazenamento transacional e os clientes sincronizados. A proposta registra as diferenças do PRD entre as branches.

## Goals / Non-Goals

**Objetivo.** Reaproveitar a implementação da branch avançada e validar uma única fonte de estado para o ambiente de desenvolvimento.

**Fronteira.** O aceite desta entrega cobre demonstração em uma instância. A integração física, o provisionamento de SQL Server e a captura de voz ficam para mudanças próprias.

## Decisions

1. **Integrar a branch existente como base.** Revisar seu delta antes de integrá-lo à main para preservar as rotas públicas e reaproveitar a UI, o backend e as validações existentes. A integração deve incluir os ajustes que surgirem do roteiro de aceite.
2. **Usar snapshot tRPC como fonte da UI.** O backend grava comando ou cena e revisão na mesma transação SQLite. O SSE publica a revisão, que invalida a consulta do cliente. Ao reconectar ou recuperar foco, a UI relê o snapshot. Esse desenho evita transportar estados completos em eventos e recupera notificações perdidas.
3. **Isolar origem do estado e persistência.** Preservar os contratos `SmartHomeProvider` e `SmartHomeStateStore`. A simulação usa SQLite local, enquanto a futura integração física poderá consultar o Home Assistant para estado de entidades. O banco de produto terá decisão e migração próprias.
4. **Manter IA e validação no servidor.** O modelo sugere somente a ação de posição. O servidor compara os argumentos com a mensagem atual, aplica a lista permitida de cômodos e executa pelo provedor simulado. A interface mantém a conversa na sessão e usa síntese de fala quando disponível.
5. **Diferenciar os modos na operação.** Preservar indicação de demonstração, falha e conexão. Manter SQLite e as rotas públicas de simulação em ambiente de desenvolvimento restrito.

## Risks / Trade-offs

- **Divergência após desconexão.** Confirmar a releitura na reconexão e a atualização entre três clientes. Em falha, mostrar indisponibilidade.
- **Dependência do ambiente.** Verificar suporte a `node:sqlite` na versão local do Node e documentar um comando de inicialização para Windows. Validar o chat em ambiente com serviço LLM configurado.
- **Exposição das rotas públicas.** Restringir o ambiente de demonstração e verificar o bloqueio do provedor simulado em produção. O limite local do assistente protege apenas uma instância.
- **Estado local antigo.** Inicializar a simulação no SQLite com os valores de referência. Informar a transição e deixar os valores anteriores no navegador fora do estado compartilhado.

## Migration Plan

1. Revisar o delta da branch de simulação contra a main e integrar em branch de trabalho.
2. Subir uma instância em desenvolvimento e validar o fluxo com uma base nova e com a mesma base após reinício.
3. Consolidar os documentos e registrar a evidência de aceite antes de integrar à main.
4. Em caso de regressão, reverter a integração e preservar o arquivo SQLite para diagnóstico e recuperação.
