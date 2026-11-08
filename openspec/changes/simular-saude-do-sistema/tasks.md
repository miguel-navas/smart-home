# Tarefas

## 1. Inventário e persistência

- [x] 1.1 Adicionar câmera e nobreak como itens opcionais e associar estados de saúde por identificador. Verificar que configurações já salvas carregam e que remover um item também retira seu diagnóstico.
- [x] 1.2 Registrar conectividade, rede local, energia, gravação, comunicação de sensores, bateria e backup. Testar a distinção entre estado atual, último dado conhecido e item não configurado.

## 2. Painel e cenários

- [x] 2.1 Exibir o painel de saúde com marcação de simulação. Verificar que uma casa sem câmera ou nobreak apresenta esses itens como não configurados.
- [x] 2.2 Adicionar os cenários de queda de internet, perda de energia, perda de telemetria e recuperação. Verificar que a gravação local continua com a WAN desligada e que a perda de energia afeta somente os serviços sem reserva no cenário.
- [x] 2.3 Simular sucesso e falha de backup. Verificar que a falha mais recente aparece junto à data do último sucesso.
- [x] 2.4 Executar o roteiro no navegador com o inventário inicial e com uma casa personalizada. Registrar os resultados e executar as verificações de tipos e testes do projeto.

## Resultados da verificação

- Inventário inicial com 19 cômodos, 2 pavimentos e 45 equipamentos. Gravação e nobreak apareceram como não configurados. Simular falta de energia deixou hub e rede indisponíveis. Restaurar energia recuperou os serviços.
- Casa personalizada com bancada, câmera, janela e nobreak. A câmera sem leitura só passou a gravar depois do registro de comunicação. A perda de comunicação da janela preservou a última bateria de 15% e a recuperação atualizou a última comunicação.
- Sem internet, a gravação local permaneceu ativa e o acesso externo ficou indisponível. Na falta de energia, o vídeo voltou quando câmera e gravador entraram na reserva. Esgotar a reserva derrubou a rede e o hub.
- A falha de backup preservou a data do último sucesso. Após recarregar, a casa personalizada, o diagnóstico da câmera e os dados de backup foram preservados. Remover câmera e nobreak retirou seus diagnósticos.
- A verificação TypeScript, os seis testes existentes e o build Vite passaram.
