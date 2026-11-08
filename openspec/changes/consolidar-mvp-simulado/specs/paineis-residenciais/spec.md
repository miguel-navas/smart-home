# Painéis residenciais

## Purpose

Dar ao morador acesso aos mesmos controles residenciais pelo celular e pelas duas centrais fixas.

## ADDED Requirements

### Requirement: Perfis das centrais fixas

O sistema SHALL manter URLs diretas e favoritos próprios para escritório e suíte, com acesso a toda a casa em ambos os perfis.

#### Scenario: Abrir as duas centrais
- **WHEN** o morador abre `/painel/escritorio` e `/painel/suite` em telas horizontais
- **THEN** cada tela identifica seu perfil e estado da conexão, exibe seus favoritos e oferece acesso aos demais ambientes.

### Requirement: Controle dedicado de coberturas

O sistema SHALL oferecer a tela de coberturas em `/coberturas`, `/painel/escritorio/coberturas` e `/painel/suite/coberturas`, com abertura, fechamento e posição inteira de 0 a 100%.

#### Scenario: Inventário e alteração de posição
- **WHEN** o morador abre o painel e ajusta a posição da cortina da sala de estar ou de uma das persianas do escritório, suíte, quarto 2 ou quarto 3
- **THEN** o painel identifica cômodo e tipo, apresenta a posição confirmada e os demais clientes refletem a alteração.

#### Scenario: Posição não confirmada
- **WHEN** a gravação falha ou o painel está sem estado confirmado
- **THEN** o painel informa a indisponibilidade ou a falha, não indica sucesso e preserva a última posição confirmada quando disponível.
