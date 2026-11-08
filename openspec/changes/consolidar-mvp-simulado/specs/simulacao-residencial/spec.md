# Simulação residencial

## Purpose

Oferecer um estado demonstrativo consistente para todos os clientes conectados à mesma instância de desenvolvimento.

## ADDED Requirements

### Requirement: Estado simulado compartilhado

O sistema SHALL apresentar a mesma fonte de estado simulado aos clientes da mesma instância e preservar os comandos confirmados após recarga e reinício do servidor com o mesmo armazenamento.

#### Scenario: Alteração aparece nas outras telas
- **WHEN** o escritório altera a luz da sala e recebe confirmação
- **THEN** a suíte e o celular refletem o novo estado sem recarregar manualmente.

#### Scenario: Recuperação após desconexão
- **WHEN** o cliente retorna após perder a conexão e o servidor volta com o mesmo armazenamento
- **THEN** o cliente obtém o estado confirmado mais recente.

### Requirement: Validação de capacidades

O sistema SHALL validar cada comando contra o ambiente e a capacidade autorizada antes de confirmar a alteração.

#### Scenario: Ambientes sem ar-condicionado
- **WHEN** a interface lista zonas ou a API recebe um comando de climatização para lavabo, jardim de inverno, churrasqueira, banheiro social ou banheiro da suíte
- **THEN** esses ambientes ficam fora da lista e o comando é recusado sem alteração de estado.

#### Scenario: Exaustão e ajuste térmico
- **WHEN** um cliente pede exaustão fora da cozinha ou churrasqueira, ou tenta mover o ajuste térmico além de 16–30 °C
- **THEN** o sistema não aciona a exaustão nesse ambiente nem permite uma temperatura fora da faixa.

### Requirement: Cenas consistentes

O sistema SHALL aplicar cada cena válida como uma única alteração confirmada.

#### Scenario: Cena executada com sucesso
- **WHEN** o cliente aciona Cheguei, Noite ou Sair
- **THEN** os demais clientes recebem o estado final de todas as alterações da cena, sem estados intermediários.

### Requirement: Demonstração identificável

O sistema SHALL identificar os estados e comandos como simulados e sinalizar a indisponibilidade sem declarar sucesso.

#### Scenario: Backend indisponível
- **WHEN** um comando não pode ser confirmado pelo backend
- **THEN** a interface apresenta falha ou indisponibilidade e não sinaliza confirmação.
