# Tarefas

## 1. Base de integração e documentação

- [ ] 1.1 Integrar o delta de `feature/shared-backend-ha-simulation` em uma branch de trabalho e confirmar que as rotas existentes continuam presentes, com `pnpm check` e `pnpm build` passando.
- [ ] 1.2 Documentar Node com suporte a `node:sqlite`, instalação, comando de desenvolvimento no Windows e configuração de LLM para o chat. Executar o procedimento documentado e confirmar que o painel e o snapshot carregam.
- [ ] 1.3 Alinhar o PRD de `docs/` com a cópia pública e identificar a versão do PDF se ele for mantido. Revisar os critérios de aceite em separado para demonstração, piloto físico e produto, incluindo as zonas sem ar e o inventário de coberturas.

## 2. Backend de simulação

- [ ] 2.1 Verificar persistência transacional com testes de snapshot, comando, cena e revisão antes e depois de reiniciar com o mesmo SQLite.
- [ ] 2.2 Verificar na API que comandos fora das capacidades dos cômodos e posições de cobertura inválidas são rejeitados sem mudar estado ou revisão e que o ajuste de temperatura permanece entre 16 e 30 °C.
- [ ] 2.3 Exercitar o SSE na conexão inicial, mudança de revisão, interrupção e recuperação. Confirmar que a UI relê o snapshot e que a simulação SQLite é bloqueada em produção.

## 3. Interfaces e assistente

- [ ] 3.1 Exercitar as duas rotas fixas e as três rotas de coberturas em desktop, celular e layout horizontal. Verificar favoritos, acesso a toda a casa, cinco coberturas, posição confirmada e feedback ao falhar um comando.
- [ ] 3.2 Verificar a experiência PWA em navegador-alvo e registrar a instalação, as limitações observadas e a dependência de conectividade no PRD.
- [ ] 3.3 Testar o chat com resposta em texto, síntese opcional, pedido explícito, pedido ambíguo, intenção divergente e limitação da nona chamada com o mesmo identificador. Confirmar que entradas rejeitadas deixam a posição intacta.

## 4. Aceite ponta a ponta

- [ ] 4.1 Abrir escritório, suíte e celular na mesma instância. Alterar luz, executar cena e ajustar uma cobertura, verificando que os três clientes convergem após cada ação, após recarga e após reconectar ao servidor.
- [ ] 4.2 Registrar evidências por cenário e executar `pnpm test`, `pnpm check` e `pnpm build` na revisão candidata. Relatar os cenários que dependam de ambiente ou credenciais indisponíveis.
