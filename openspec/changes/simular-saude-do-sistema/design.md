# Design

## Context

O simulador React mantém o inventário e os estados no navegador. O painel de saúde usa esse inventário para reproduzir os cenários documentados na arquitetura de implantação.

## Goals / Non-Goals

**Objetivo.** Tornar observáveis os efeitos de falhas e recuperação em imóveis com equipamentos diferentes.

**Fronteira.** Os eventos e os dados são sintéticos. A telemetria real, as credenciais de acesso remoto e a restauração física serão validadas no piloto.

## Decisions

- Usar os identificadores estáveis do inventário para associar telemetria a sensores e câmeras. Câmeras e nobreak são opcionais e o painel diferencia ausência de configuração de falha.
- Modelar internet, rede local, alimentação e reserva separadamente. O estado de gravação depende da câmera e do gravador. O acesso externo depende da conexão, enquanto o backup registra o último resultado e o último sucesso em campos distintos.
- Manter os cenários acionáveis pela interface e rotular suas consequências como simuladas. Reaproveitar a persistência do simulador com valores padrão compatíveis com configurações existentes.

## Risks / Trade-offs

- **Estado enganoso em falhas.** Diferenciar desconhecido, indisponível e não configurado. Validar combinações de internet, energia e vídeo.
- **Equipamento removido.** Excluir a telemetria associada da visão atual para evitar alertas órfãos.
