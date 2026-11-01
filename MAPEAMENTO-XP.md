# Mapeamento de XP

Instale pelo campo de URL em Scripts & Extensões:

https://github.com/panicguy/Scripts-PIO/blob/main/mapeamento-xp.user.js

Script separado, exclusivo de KimJongDudu, com Tyranitar ativo. Começa desligado após F5. Clique Iniciar para medir nesta ordem: Yanmega, Staravia, Drifblim, Kricketune, Weavile, Honchkrow e Wormadam. Seleciona a correspondência exata do catálogo; se faltar ou houver ambiguidade, não inicia.

Cada hunt tem 15 minutos medidos após confirmação da entrada. Contadores próprios de XP, abates e tempo começam em zero em cada hunt. Não reseta o painel Sessão do jogo nem usa seu acumulado. Deslocamento não entra no tempo. As sete sessões somam 1h45 mais deslocamentos. Volta ao Centro pela saída normal, sem usar Escape Rope ou Desistir. Se não conseguir entrar em três minutos, interrompe.

Conta somente eventos de morte de Pokémon selvagem da hunt atual. Calcula XP/h do treinador, XP/h do Pokémon e abates/h pelo tempo observado, guardando também os totais. O bônus é lido do campo bonusXp do servidor, incluindo parcelas que expiram. Cada mudança de fator é registrada. O XP recebido já inclui o bônus, portanto não é multiplicado novamente. A estimativa sem bônus divide o XP de cada abate pelo fator vigente naquele abate; se o fator estiver indisponível, não inventa a normalização. Diferenças por arredondamento do servidor podem existir. O relatório identifica sessões parciais e dados ausentes.

Parar salva a sessão atual como parcial. F5/reconexão não retoma automaticamente. Faz salvamento periódico a cada minuto, então uma recarga pode perder até o último minuto; essa sessão permanece parcial. Mudança manual de campo, alteração do Pokémon ativo, perda de conexão/dados e início de outra coleta do Atlas interrompem a medição. O script pausa a coleta de geometria ao iniciar; pause o AutoDex antes de usar. Ganhos de nível do mesmo Pokémon são permitidos e podem influenciar a comparação.

Os dados ficam no IndexedDB local PIO-XPMapping-v1, loja results, sem apagar PIO-HuntAtlas-v1. Resultados mostra as sessões por hunt e Exportar gera JSON. Atualize o Atlas para 1.9.0 ou superior para exibir as medições nos cartões já mapeados. O Atlas prefere a leitura completa mais recente, ou a parcial mais recente quando não há completa. Se ainda não houver mapa daquela hunt, o resultado continua acessível no script de XP; não cria geometria fictícia.

Validação automatizada cobre filtros de eventos, sete hunts, isolamento dos contadores entre hunts, cálculo de taxas de 15 minutos, bônus variável, expiração e dados ausentes. A sequência de 1h45 ainda requer validação no jogo.
