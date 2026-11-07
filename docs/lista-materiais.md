# Lista preliminar de materiais — casa inteligente

**Terreno:** 10 m × 25 m, plano. **Referência de layout:** Planner 5D, rua no lado de 10 m, fundos no extremo oposto e corredor externo lateral de 2 m à direita. A distribuição interna é esquemática; medidas internas, envelope da edificação e recuos legais ainda não foram definidos.

Esta lista é uma base para orçamento após definição de marcas, protocolos, cargas, planta final e exigências locais. Ela não é especificação de compra nem projeto executivo. Quantidades, bitolas, capacidade, proteção e compatibilidade devem ser determinadas por profissionais habilitados.

| Grupo | Material / função | Estimativa inicial |
| --- | --- | --- |
| Centrais fixas | Painel touchscreen/tablet fixo do escritório | 1 unidade; tamanho, modelo, sistema e montagem a escolher |
| Centrais fixas | Painel touchscreen/tablet fixo da suíte | 1 unidade; tamanho, modelo, sistema e montagem a escolher |
| Centrais fixas | Suportes/fixação, alimentação e ligação à rede | 2 pontos; solução depende dos painéis escolhidos e da instalação |
| Controle | Hub/controlador local único (Home Assistant proposto) | 1 unidade para as duas telas; hardware/protocolo a escolher |
| Controle | Módulos de comando para iluminação | Quantidade por circuito e carga, a definir |
| Controle | Interfaces/contatores aprovados para climatização | 1 interface por zona definida após revisão do layout; validar fabricante |
| Controle | Módulos de comando de coifa e exaustão | Cozinha e churrasqueira; solução compatível a dimensionar |
| Controle | Caixas, fontes e acessórios dos módulos | Conforme topologia e local de instalação |
| Coberturas | Persianas blackout motorizadas na suíte, quartos 2 e 3 e escritório | 4 ambientes; quantidade de motores conforme número/largura dos vãos, a confirmar |
| Coberturas | Cortina motorizada na sala de estar | 1 ambiente; quantidade de motores conforme vãos, a confirmar |
| Coberturas | Interfaces/módulos de comando e comandos manuais para motores | Compatibilidade com motor, protocolo e operação de contingência a validar |
| Voz local | Microfone/satélite dedicado com palavra de ativação local | Quantidade e posicionamento após teste de cobertura acústica; ainda não selecionado |
| Voz local | Hardware/pipeline Home Assistant para wake word e processamento local de fala | Dimensionar após escolha de STT/TTS, frase de ativação e teste de qualidade em pt-BR |
| Sensoriamento | Sensor de temperatura e umidade | Como referência, 1 por zona aprovada de climatização; quantidade final a definir |
| Sensoriamento | Sensor de presença | Ambientes e cobertura a validar |
| Sensoriamento | Sensor de abertura | Portas/janelas selecionadas após planta de esquadrias |
| Comandos locais | Interruptores e comandos manuais compatíveis | Conforme pontos e estratégia de contingência |
| Rede | Roteador/switch e pontos de acesso Wi-Fi | Cobertura a verificar em projeto; pode exigir mais de um ponto |
| Rede | Cabeamento, conectores e patch panel (se adotado) | Metragem e categoria a definir após levantamento |
| Infraestrutura | Eletrodutos, caixas, eletrocalhas e identificação | Conforme planta elétrica e separação entre circuitos |
| Quadros | Quadro(s) e reserva para automação | Dimensionados conforme carga e norma local |
| Climatização | Sistema central por zonas, distribuição e controles | Sem zonas no lavabo, jardim de inverno, churrasqueira e banheiros; capacidade das demais zonas após cálculo térmico e compatibilidade a confirmar |
| Exaustão | Coifa da cozinha e duto/acessórios | Vazão, percurso e descarga dimensionados |
| Exaustão | Coifa/exaustão da área de churrasqueira | Seleção considerando calor, gordura, renovação e duto |
| Proteção/segurança | Dispositivos de proteção, aterramento e seccionamento | Definidos no projeto elétrico, sem valores nesta lista |

## Critérios para cotação

1. Confirmar município, recuos, orientação solar, cotas internas, aberturas e posição dos quadros. Validar o desenho esquemático com profissional local antes de dimensionar.
2. Selecionar os dois painéis (tamanho, modelo, fixação, alimentação e rede) e confirmar que serão clientes de um único controlador; dimensionar o hub e o protocolo conforme os dispositivos.
3. Escolher o gateway/protocolo e motores/atuadores compatíveis; confirmar quantos vãos haverá em cada cômodo e validar operação local/manual sem internet.
4. Escolher o satélite/microfone após teste de cobertura acústica; validar palavra de ativação, STT/TTS e qualidade de português brasileiro. Não considerar áudio ambiente para nuvem; o fluxo CASA+ aprovado envia apenas transcrição após a ativação.
5. Fechar projeto elétrico, climatização e exaustão, incluindo separação de potência/controle e operação manual de contingência.
6. Solicitar quantitativos e especificações a engenheiro eletricista, profissional de automação/voz, projetista de climatização e instalador de exaustão.
