# Assistente CASA+

## Purpose

Permitir interação textual em português com o Casa+ e limitar as ações aos comandos demonstrativos autorizados.

## ADDED Requirements

### Requirement: Conversa textual

O assistente SHALL receber texto em português, informar o processamento pelo serviço de IA e permitir leitura da resposta quando a síntese do navegador estiver disponível. A interface não deve capturar áudio.

#### Scenario: Navegador sem síntese
- **WHEN** o morador envia uma pergunta textual e o navegador não oferece síntese
- **THEN** a resposta permanece disponível em texto.

### Requirement: Comando explícito de cobertura

O assistente SHALL alterar no máximo uma cobertura simulada por mensagem e somente quando a mensagem atual identificar explicitamente cômodo, tipo de cobertura e ação ou posição compatível.

#### Scenario: Pedido válido
- **WHEN** o morador pede para colocar a persiana da suíte em 50% e o backend confirma o comando
- **THEN** o assistente indica a alteração simulada e os demais clientes recebem a posição confirmada.

#### Scenario: Pedido ambíguo ou incompatível
- **WHEN** a mensagem é hipotética, refere-se a múltiplos cômodos ou a intenção do modelo diverge do pedido
- **THEN** o assistente não altera o estado e não declara sucesso.

### Requirement: Limite de uso

O backend SHALL limitar o assistente de desenvolvimento a oito chamadas por minuto por usuário autenticado ou endereço IP na mesma instância.

#### Scenario: Limite atingido
- **WHEN** a nona solicitação chega na mesma janela para a mesma identidade
- **THEN** o backend recusa a solicitação antes de chamar o serviço de IA.
