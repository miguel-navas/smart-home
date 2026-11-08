# Simular a saúde do sistema

## Why

O simulador permite configurar cômodos e dispositivos. Falta uma forma de ensaiar quedas de conectividade, energia e telemetria antes do piloto em uma residência.

## What Changes

- Exibir um painel de saúde no simulador com estados de conectividade, sensores, gravação, nobreak e backup.
- Simular falhas e recuperação sem inferir disponibilidade ou travamento a partir de dados ausentes.
- Variar os itens de diagnóstico com o inventário configurado. Câmeras e nobreak entram como elementos opcionais da simulação.

## Capabilities

### New Capabilities

- `saude-do-sistema` — visão operacional e simulação de falhas para uma instalação residencial configurável.

### Modified Capabilities

Nenhuma especificação publicada é alterada.

## Impact

Simulador React, persistência local da configuração e documentação de operação. A integração física, o acesso remoto e a geração de backups reais pertencem ao piloto de implantação.
