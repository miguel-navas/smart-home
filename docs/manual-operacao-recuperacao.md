# Casa+ — Manual de operação e recuperação

Roteiro para a instalação física futura. Preencha responsáveis, contatos, metas de autonomia e recuperação e periodicidade dos testes no aceite de cada imóvel. Use a [arquitetura de implantação](arquitetura-implantacao-seguranca.md) como referência.

## Rotina de operação

- **Sensores e trancas.** Revisar alertas de baixa bateria ou perda de comunicação. Identificar o equipamento pelo inventário, seguir o fabricante para substituir a bateria e testar fisicamente abertura, fechamento e trava quando aplicável.
- **Câmeras.** Verificar data, hora, gravação e espaço disponível no NVR. Reproduzir um trecho recente das câmeras essenciais. Exportar imagens somente para destino autorizado.
- **Acessos.** Revisar usuários, permissões e MFA. Revogar credenciais de dispositivos ou pessoas que perderam acesso. Fazer backup antes de atualizações e verificar as integrações depois.
- **Nobreak.** Conferir alarmes e autonomia registrada. Programar teste de carga e manutenção conforme o fabricante e o instalador.
- **Backups.** Verificar a última execução bem-sucedida e a cópia externa. Confirmar que o kit de recuperação está disponível em local seguro separado.

## Diagnóstico e recuperação

1. **Identificar o alcance.** Registrar horário, sintomas e equipamentos afetados. Testar acesso pela rede local para diferenciar falha de internet de falha de rede ou hub.
2. **Usar contingência.** Se a internet cair, consultar o painel local e o NVR pela rede da casa. Se faltar energia, verificar estado do nobreak e recorrer aos comandos manuais previstos para as cargas fora da reserva.
3. **Recuperar a plataforma.** Se houver perda do servidor, escolher a cópia válida mais recente. Restaurar o Home Assistant em equipamento compatível usando o kit de emergência. Restaurar também a configuração persistida do Casa+ conforme o ambiente implantado. A configuração do protótipo atual fica no navegador e não integra o backup do hub.
4. **Validar antes de liberar.** Conferir relógio, contas, permissões, entidades e automações. Confirmar leitura de abertura e trava, gravação no NVR, comandos autorizados e acesso remoto conforme o escopo. Conferir se voltou a gerar backups.
5. **Registrar o resultado.** Anotar duração, data da cópia recuperada, perda observada e pendências. Manter no inventário o responsável pela próxima ação.

## Registro de testes

| Data e responsável | Cenário | Tempo observado | Resultado e evidência | Pendência |
| --- | --- | --- | --- | --- |
| A preencher | Queda de internet, energia, sensor indisponível ou restauração | A medir | A registrar | A definir |

[Home Assistant — backups e restauração](https://www.home-assistant.io/common-tasks/general/backups) · [Kit de recuperação](https://www.home-assistant.io/more-info/backup-emergency-kit)
