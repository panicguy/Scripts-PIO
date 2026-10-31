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
