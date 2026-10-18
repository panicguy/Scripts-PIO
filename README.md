# Scripts PIO — AutoDex

Userscript **AutoDex • Dudu**, desenvolvido para [pokeidle.io](https://pokeidle.io/app).

## Instalação
1. Instale Tampermonkey no navegador.
2. Abra [Instalar AutoDex](https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/autodex.user.js) e confirme a instalação.
3. Dentro do jogo, procure **AutoDex** ao lado de **Pokédex** no menu superior.
4. Abra a Pokédex ao menos uma vez, clique em **Sincronizar**, **Criar fila**, **Iniciar**.

## Funcionamento esperado
- Lê as espécies no painel Pokédex e seleciona as ainda não capturadas.
- Acessa a ficha e clica na hunt do campo **Onde encontrar**.
- Usa o estado **.dex-cell.caught** para detectar capturas (não depende do histórico limitado a 100 capturas).
- **Após detectar uma captura: clica uma única vez em Voltar ao Centro Pokémon. O jogo agenda o retorno, espera a batalha e seus próprios 3 segundos. O AutoDex aguarda o HUD confirmar a chegada antes de iniciar a próxima hunt. Não usa uma espera fixa nem repete o clique.**
- A lógica permanece ativa quando o **painel AutoDex** é fechado, desde que a **aba do jogo** permaneça aberta.
- Usa os comandos do próprio jogo; arremessos e combate continuam dependendo das automações configuradas pelo jogador.
- Pausa diante de falhas e conserva a fila.

## Importante — versão inicial 0.1.2
Esta é uma **primeira implementação, ainda não testada em sessão autenticada**. Se o DOM da Pokédex desaparecer ao fechar a ficha/modal, a detecção de captura poderá não funcionar até sincronizar novamente. O retorno é agendado pelo botão nativo. O script tenta confirmar o Centro por indicadores de localização no HUD e, **se não os reconhecer**, continuará aguardando sem iniciar a próxima hunt; os seletores de localização precisam ser conferidos dentro de uma sessão autenticada. Não há temporizador próprio de batalha. Também não foram validadas restrições de viagem e os tipos especiais de captura (Boss, Safari, Mystic Ticket, Mega).

Referência conceitual: [PIW Auto Pokédex de Luis Ferreira](https://github.com/luishferreira/poke-standalone-scripts/blob/master/auto-pokedex.user.js), criado para outro jogo/domínio. O código deste AutoDex foi escrito separadamente.
