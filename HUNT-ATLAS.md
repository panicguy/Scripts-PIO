# Atlas de Hunts — arquivo único

Instale no hub em **Ferramentas → Scripts & Extensões**, usando o campo de URL do GitHub:

https://github.com/panicguy/Scripts-PIO/blob/main/hunt-atlas.user.js

Este arquivo contém o coletor, a troca segura pelo Centro, a galeria e o minimapa móvel. Não depende de outros scripts Atlas. Remova as versões antigas e mantenha somente esta entrada. Instalar por URL permite usar **Atualizar** no hub; colar somente o código não cria o vínculo com o GitHub. Siga o aviso do hub para aplicar uma atualização após recarregar.

## Conta e coleta

Executa exclusivamente em KimJongDudu. A coleta requer treinador nível 2000 ou superior e Tyranitar ativo. Mapeia as hunts acessíveis de Outland, Johto, Hoenn e Sinnoh com requisito até nível 2000. Não mede XP nem abates por hora. Aguarda a saída normal da batalha para voltar ao Centro e mudar de hunt. Pause o AutoDex antes de coletar.

## Minimapa

Botão Minimapa abaixo do rank para abrir/fechar. Arraste pelo título ou mapa. Só mapa esconde os controles; dois cliques no mapa restauram o painel. Modo economia oculta temporariamente o minimapa. Pontos verdes indicam respawns observados, roxos são posições provisórias; laranja mostra Pokémon normal em movimento e estrela rosa indica shiny informado pelo jogo. A interpolação usa apenas passos recebidos do servidor.

## Seus dados

Os mapas ficam no IndexedDB local `PIO-HuntAtlas-v1`, mantendo compatibilidade com as versões anteriores. As preferências continuam em `pio:atlas-ui:v1:KimJongDudu`. Atualizar o script não apaga esses dados. Abra **Mapas** para consultar e **Exportar** para fazer backup JSON. Os mapas não são enviados ao GitHub e não ficam disponíveis automaticamente em outro computador/perfil. Limpar os dados do launcher pode apagá-los.

Leituras incompletas continuam identificadas como parciais. Distâncias são estimativas sobre a geometria lida, não o caminho garantido pelo servidor.

## Coleta rápida — versão 1.2.0

Após carregar a geometria, salva somente as posições únicas dos Pokémon vivos recebidos no pacote de entrada e solicita a troca segura pelo Centro. Não aguarda outro ciclo de respawn nem repete automaticamente leituras parciais. Essas posições não são tratadas como pontos de respawn confirmados; por isso o contador não usa mais o total esperado como denominador. Leituras antigas são identificadas e passam novamente pela coleta, preservando o histórico no banco.

Se o jogo informar um shiny vivo, a coleta permanece na hunt e suspende a saída agendada pelo Atlas. Quando ele morrer ou sair da lista recebida do servidor, a troca pode continuar. Isso não garante captura, nem detecta Pokémon que o servidor não informou. Não usa Escape Rope nem Desistir do Combate. Mapas com áreas sem leitura continuam parciais; o modo rápido não os torna completos artificialmente.

## Visualização independente e som — versão 1.3.0

Pausar interrompe a navegação automática; o minimapa continua acompanhando hunts abertas manualmente, sem registrar novas leituras no banco. A visualização não requer Tyranitar nem nível 2000, mantendo a restrição à conta KimJongDudu. A coleta automática continua exigindo os requisitos anteriores.

Um shiny vivo informado pelo jogo dispara três notas. Movimentos do mesmo Pokémon não repetem o som; outra aparição após morte/remoção pode alertar novamente. Há botões Som: ligado/desligado e Testar som. Clique em Testar som para liberar o áudio e conferir o volume. Se o navegador bloquear o áudio, o alerta pendente é tocado após interação. O som continua com a coleta pausada e o minimapa oculto pelo modo economia, desde que a página continue recebendo os eventos do jogo. Não detecta shiny que o servidor não enviou.

## Rankings — versão 1.4.0

Abra Mapas e selecione Menor área ou Menores trajetos. A galeria se atualiza ao salvar novas leituras e usa a leitura mais recente de cada hunt. Menor área ordena pela quantidade de tiles caminháveis; Menores trajetos ordena pela média de passos entre todos os pares de posições válidas, com maior trajeto como desempate.

O cálculo usa busca em largura sobre tiles livres em quatro direções, contornando bloqueios e sem atravessar áreas desconhecidas. Mostra passos médios e máximos, pares alcançáveis e sem caminho, posições excluídas, área e densidade por 100 tiles caminháveis. São estimativas entre posições observadas na entrada, não respawns confirmados nem a rota do servidor. Não mede XP nem abates por hora.

Geometrias parciais aparecem ao final sem classificação. O ranking de trajetos também exige pelo menos duas posições válidas, todos os pontos sobre tiles caminháveis e todos os pares conectados. Leituras antigas não entram no ranking de trajetos até serem refeitas; sua área conhecida ainda pode ser comparada quando a geometria está completa. As métricas novas são salvas junto do mapa e incluídas no JSON exportado.

## Coleta por nascimentos — versão 1.5.0 (substitui o modo rápido)

As posições na entrada voltam a ser provisórias. A confirmação usa reaparição viva após morte observada, ou primeira aparição viva explícita e sem passo de movimento no pacote. Movimentos não criam pontos. Coordenadas repetidas são deduplicadas, mesmo com IDs diferentes em ciclos posteriores. Trata-se de evidência recebida do cliente; não se presume que um ponto não observado exista.

Cada passagem aguarda até 180 segundos, podendo terminar após 15 segundos quando todos os pontos esperados forem confirmados e houver geometria. Leituras parciais podem voltar à fila, no máximo três passagens. Um shiny vivo continua segurando a saída. Uma leitura só é completa com geometria sem áreas desconhecidas e contagem confirmada igual ao total esperado; divergências permanecem parciais. Dados antigos de entrada não dispensam nova coleta.

O ranking de trajetos passa a usar exclusivamente coordenadas confirmadas das novas leituras. A galeria informa a cobertura confirmada/esperada; comparações com cobertura parcial podem mudar conforme mais nascimentos são observados. As distâncias continuam estimadas em quatro direções, sem reproduzir o pathfinding do servidor. Permanecem o minimapa durante a pausa e o alerta sonoro de shiny.

## Limpar mapeamentos — versão 1.5.1

O botão Limpar todos os mapeamentos aparece no painel e na galeria. Uma confirmação informa que serão apagados todos os mapas, histórico e progresso locais. Cancelar não altera dados nem pausa a coleta. Confirmar pausa a navegação e limpa as duas lojas do banco em uma única transação, protegendo contra gravações antigas em andamento. Os rankings ficam vazios; Retomar inicia uma nova coleta. Preferências do minimapa, som e arquivos JSON já exportados são preservados. Exporte um backup antes se quiser guardar o histórico. A atualização do script por si só não apaga os mapas.

## Centro Pokémon — versão 1.5.2

Pokémon shiny no Centro são ignorados para alertas sonoros e bloqueio da troca de hunt, tanto no pacote inicial como nas atualizações seguintes. Entrar no Centro limpa qualquer alerta pendente da hunt anterior. O alerta e a permanência por shiny vivo continuam ativos nas hunts.

## Ordem da coleta — versão 1.5.3

A primeira passagem segue Outland → Johto → Hoenn → Sinnoh. Dentro de cada região, ordena pelo nome visível da hunt em A–Z, sem priorizar o nível; o limite de acesso até 2000 continua valendo. Hunts com leitura completa já salva são puladas. As revisões de leituras parciais entram no fim da fila, depois da primeira passagem, e aparecem identificadas como Revisão. A ordem de coleta é independente dos rankings por área e trajeto na galeria.

## Reiniciar a sequência — versão 1.5.4

Começar do início A–Z refaz toda a fila em Outland → Johto → Hoenn → Sinnoh, sem excluir leituras existentes nem pular hunts já completas. Requer os mesmos requisitos da coleta e catálogo Outland disponível; caso contrário permanece pausado. Retomar conserva o alvo anterior. A tela passa a mostrar o alvo solicitado durante a navegação. Entrada não confirmada pausa em vez de pular automaticamente; Retomar tenta o mesmo alvo novamente. O temporizador de coleta também fica disponível após limpeza/reinício do progresso.

## Início manual — versão 1.6.0 (substitui os controles anteriores)

Ao abrir ou recarregar a página, inclusive por F5, a coleta sempre inicia desligada e não envia troca de hunt. Iniciar reconstrói a fila A–Z na ordem Outland → Johto → Hoenn → Sinnoh e muda para Parar. Parar encerra a execução e cancela a saída pendente criada pelo Atlas, voltando a Iniciar. Não sai automaticamente da hunt atual e não apaga os mapas. Um novo Iniciar começa a sequência do início.

Pausar/Retomar é um botão separado: preserva o alvo para continuar a execução. Fica desabilitado quando a coleta está desligada. O antigo botão Começar do início A–Z foi incorporado a Iniciar. A visualização manual e os alertas de shiny nas hunts continuam ativos com a coleta desligada. Não interfere em outros scripts que possam iniciar caça por conta própria.

## Dois ciclos e ranking sem explorar todos os tiles — versão 1.7.0

Menores trajetos agora classifica leituras de nascimentos confirmados quando há pelo menos dois pontos válidos e caminhos conhecidos entre todos eles. Tiles desconhecidos fora desses caminhos não bloqueiam a classificação. A distância permanece estimada e pode diminuir se um atalho ainda desconhecido for descoberto. O ranking de área continua exigindo geometria completa, pois área desconhecida afeta a comparação.

Dois ciclos é um ranking separado de passos observados: uma rodada exige um nascimento em cada coordenada confirmada; após isso, começa a segunda rodada. Nascimentos repetidos em um único ponto não substituem os outros. Ao descobrir outro ponto, o histórico é recalculado para exigir também essa coordenada. O total vai da entrada na hunt até o último nascimento que completa a segunda rodada. A cobertura continua indicada como confirmados/esperados e pode ser parcial.

Cada mudança observada para um tile vizinho conta um passo (inclusive diagonal). Posições repetidas não contam. Saltos maiores são lacunas de observação, sem inventar o caminho intermediário; nesses casos o ranking por dois ciclos fica sem classificação. Sem posição inicial também é parcial. O painel mostra passos e ciclos durante a leitura. A coleta termina ao observar duas rodadas sobre os pontos conhecidos, após pelo menos 15 segundos e com geometria disponível, ou salva parcial após cinco minutos; a permanência por shiny continua valendo. Não é necessário caminhar todos os tiles. As leituras anteriores são reavaliadas para o ranking de distância, mas precisam de nova coleta para medir passos em dois ciclos.

## Dois rankings e contagem compatível — versão 1.7.3

A interface mantém somente Menor área e Menores trajetos. A coleta não exige mais duas rodadas: pode terminar após 15 segundos quando todos os pontos esperados forem confirmados, ou salvar uma leitura parcial após três minutos; o bloqueio por shiny permanece. Os dados históricos são preservados.

Pokémon no respawn usa primeiro o total esperado já salvo na leitura e, se ausente, o total de pontos informado pelo catálogo atual da mesma hunt. Ambos são identificados como esperados. Se não houver total disponível, mostra somente a quantidade de coordenadas confirmadas e informa que o total é desconhecido. Isso funciona com mapas antigos sem refazer a coleta; não inventa um total a partir de uma leitura parcial.

## Filtros de região — versão 1.7.4

Menor área e Menores trajetos têm um seletor Região com Todas, Outland, Outras regiões (Johto, Hoenn e Sinnoh), e cada região individualmente. Cada menu mantém sua seleção enquanto a página estiver aberta. A classificação reinicia em #1 dentro do filtro escolhido. O filtro afeta apenas a visualização dos mapas salvos; não altera a fila de coleta nem os arquivos exportados.

## Refazer somente uma hunt — versão 1.8.0

Cada cartão oferece Refazer este mapa. O Atlas interrompe sua fila atual e coleta somente a hunt escolhida, usando a saída segura pelo Centro. Não apaga o histórico nem outros mapas. A nova leitura substitui a anterior na visualização quando for salva ao final; deixou de salvar um cartão inicial vazio sobre a leitura existente. Aguarde uma gravação em andamento antes de solicitar outra coleta.

O filtro Outras regiões foi removido. Pokémon no respawn mostra apenas a contagem de coordenadas de nascimento confirmadas, deduplicadas, sem apresentar o número previsto pelo catálogo como medido. Quando não há confirmação, mostra não confirmado. Isso é cobertura observada, não garantia de total real se a leitura for parcial.

A passagem pode encerrar quando a contagem coincide com o catálogo após 15 segundos, ou quando há pelo menos dois pontos confirmados e passam 30 segundos sem descobrir outra coordenada, com geometria disponível. A divergência do catálogo mantém a leitura parcial; não obriga a esperar por um ponto que não foi observado. O limite continua três minutos e o shiny vivo continua segurando a saída. Leituras parciais não voltam automaticamente à fila; use Refazer este mapa para tentar novamente.

## Resultados de XP — Atlas 1.9.0

Instale separadamente [Mapeamento de XP](https://github.com/panicguy/Scripts-PIO/blob/main/mapeamento-xp.user.js). As instruções estão em [MAPEAMENTO-XP.md](MAPEAMENTO-XP.md). O Atlas consulta as medições locais e adiciona XP/h de treinador/Pokémon, abates, abates/h e bônus aos cartões da hunt correspondente. Os bancos de mapas e de XP são separados. Atualizar o Atlas não inicia nenhuma medição.
