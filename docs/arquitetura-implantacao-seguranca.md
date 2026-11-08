# Casa+ — Arquitetura de implantação, segurança e continuidade

**Status:** proposta de implantação. O simulador atual usa dados locais do navegador. As integrações, os equipamentos e as metas de continuidade dependem de validação no imóvel.

## Arquitetura de referência

- Um Home Assistant OS em hub dedicado ou mini-PC, ligado à rede local. O Home Assistant é a fonte dos estados físicos. O backend do Casa+ consulta entidades explicitamente mapeadas por imóvel e fornece aos painéis apenas os dados e comandos autorizados.
- Sensores sem fio usam um coordenador compatível com o protocolo escolhido. Para Zigbee, testar alcance e cobertura entre pavimentos e na garagem. Preservar os controles manuais dos equipamentos.
- Câmeras IP PoE em segmento separado, ligadas a um switch PoE e a um gravador local (NVR). Validar visualização local, compatibilidade ONVIF quando aplicável e exportação de gravações. Definir retenção e acesso por imóvel. Evitar captar ambientes privados e áreas externas ao perímetro necessário.
- Rede administrativa separada dos dispositivos. Permitir no firewall apenas os fluxos necessários entre câmeras, NVR, hub e clientes autorizados. Acesso de fora por VPN ou Home Assistant Cloud para o próprio Home Assistant. Se o Casa+ também for exposto remotamente, usar acesso autenticado com TLS e autorização própria.
- Usar contas individuais, MFA para acesso remoto e administrativo, credenciais únicas por serviço e permissões por função. Manter tokens no servidor. Registrar comandos, falhas e alterações de acesso com data e identidade, sem incluir tokens ou imagens nos logs.

## Estados e monitoramento

| Ponto | Leitura mínima para o piloto |
| --- | --- |
| Abertura e trava | Separar a leitura da folha da leitura do mecanismo de trava. Indicar trancado somente com confirmação do mecanismo. |
| Sensores | Último evento ou comunicação, disponibilidade e bateria quando informada pelo dispositivo. O intervalo de espera depende do modelo, em especial nos sensores que dormem. |
| Câmeras | Distinguir câmera acessível de gravação ativa. Confirmar gravação com informação do NVR ou reprodução de trecho recente. |
| Energia | Indicar alimentação normal, operação em bateria e bateria baixa quando o nobreak fornecer esses dados. |
| Backups | Exibir data e resultado do último backup e, quando disponível, a data do último teste de restauração. |

## Comportamento em falhas

| Cenário | Operação esperada | Evidência de aceite |
| --- | --- | --- |
| Internet indisponível e rede local ativa | Sensores, comandos locais compatíveis e gravação local continuam com energia. Acesso externo depende de outro link, se adotado. | Desconectar apenas a WAN, verificar evento de sensor e reproduzir gravação feita durante a interrupção. |
| Falta de energia | Hub, rede e equipamentos de vídeo escolhidos continuam pela autonomia medida do nobreak. Portão e fechaduras têm procedimento manual conforme fabricante. | Testar com as cargas de reserva previstas e registrar duração e retorno. |
| Sensor, câmera ou hub indisponível | Informar indisponibilidade e horário do último dado conhecido. Bloquear comandos que dependam de confirmação indisponível. | Desconectar um dispositivo e observar a indicação e a recuperação. |
| Perda do servidor ou disco | Recuperar Home Assistant e configuração do Casa+ de cópia protegida em equipamento de teste. A retenção das gravações segue política separada. | Restaurar, verificar entidades, usuários e controles autorizados e registrar tempo e perda de dados observados. |

## Energia, rede e infraestrutura por imóvel

Inventariar as cargas essenciais do nobreak. Incluir hub, switch, ponto de acesso e, se a gravação contínua for necessária, switch PoE e NVR. Incluir modem ou ONT para acesso remoto quando houver serviço do provedor. Definir autonomia em minutos e medir consumo e autonomia sob carga. Avaliar um segundo link somente se acesso e alertas externos precisarem sobreviver à queda da operadora.

Registrar pontos de alimentação, dados e montagem de sensores, câmeras, motores e telas. O profissional habilitado define circuitos, proteções, aterramento, cabeamento e a separação entre potência e dados conforme o imóvel e os equipamentos.

## Backup e recuperação

Configurar backups automáticos criptografados do Home Assistant e da configuração efetivamente usada pelo Casa+. Manter uma cópia fora do servidor e outra fora do imóvel conforme a meta de recuperação. Guardar o kit de emergência e as chaves separadamente. Definir frequência, retenção, perda de dados tolerável e tempo de recuperação antes do aceite. Testar a restauração e documentar os resultados no [manual de operação](manual-operacao-recuperacao.md).

Use a [lista de materiais](lista-materiais.md) para registrar os equipamentos por residência. Quantidade, modelos e autonomia ficam sujeitos ao levantamento do imóvel.

## Referências

- [Home Assistant — segurança e acesso remoto](https://www.home-assistant.io/docs/configuration/securing/)
- [Home Assistant — hardware](https://www.home-assistant.io/hardware/)
- [Home Assistant — Zigbee/ZHA](https://www.home-assistant.io/integrations/zha/)
- [Home Assistant — ONVIF](https://www.home-assistant.io/integrations/onvif/)
- [Home Assistant — monitoramento do nobreak via NUT](https://www.home-assistant.io/integrations/nut/)
- [Home Assistant — backups](https://www.home-assistant.io/common-tasks/general/backups)
- [Ministério do Trabalho — segurança em instalações elétricas](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-paritaria-permanente/normas-regulamentadoras/normas-regulamentadoras-vigentes/norma-regulamentadora-no-10-nr-10)
