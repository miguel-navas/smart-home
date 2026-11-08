# Saúde do sistema

## Purpose

Permitir ensaiar falhas e recuperação em uma residência configurável com dados claramente simulados.

## ADDED Requirements

### Requirement: Diagnóstico de serviços configurados

O simulador SHALL indicar conectividade, última comunicação e bateria dos sensores, condição de gravação, energia de reserva e resultado do backup conforme os serviços configurados e os dados disponíveis.

#### Scenario: Casa sem câmeras
- **WHEN** o inventário não tem câmeras
- **THEN** o painel apresenta gravação como não configurada.

#### Scenario: Dados ausentes
- **WHEN** uma câmera perde comunicação ou um sensor deixa de fornecer telemetria
- **THEN** o painel indica indisponibilidade e distingue o último dado conhecido de uma leitura atual.

### Requirement: Cenários de falha e recuperação

O simulador SHALL permitir ensaiar queda de internet, falta de energia, falha de backup e recuperação, distinguindo serviços locais de serviços externos.

#### Scenario: Internet cai com rede local ativa
- **WHEN** o usuário simula queda da internet com a rede local e o gravador operacionais
- **THEN** o painel apresenta acesso externo indisponível e mantém a gravação local como ativa.

#### Scenario: Nobreak em bateria
- **WHEN** o usuário simula perda de energia e existe reserva configurada
- **THEN** o painel mostra operação em bateria e indica quais serviços simulados continuam disponíveis.

#### Scenario: Backup falhou
- **WHEN** a tentativa mais recente de backup falha
- **THEN** o painel mostra a falha e preserva a data do último sucesso, se houver.
