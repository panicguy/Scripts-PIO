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
- **Após detectar uma captura: volta para o Centro Pokémon, espera 4,5 segundos e avança à próxima espécie.**
- A lógica permanece ativa quando o **painel AutoDex** é fechado, desde que a **aba do jogo** permaneça aberta.
- Usa os comandos do próprio jogo; arremessos e combate continuam dependendo das automações configuradas pelo jogador.
- Pausa diante de falhas e conserva a fila.

## Importante — versão inicial 0.1.0
Esta é uma **primeira implementação, ainda não testada em sessão autenticada**. Se o DOM da Pokédex desaparecer ao fechar a ficha/modal, a detecção de captura poderá não funcionar até sincronizar novamente. O script usa o botão do Centro Pokémon e um atraso de segurança, mas **não possui confirmação independente de que o servidor terminou a batalha**; isso precisa ser integrado depois de verificar os controles reais do jogo. Também não foram validadas restrições de viagem e os tipos especiais de captura (Boss, Safari, Mystic Ticket, Mega).

Referência conceitual: [PIW Auto Pokédex de Luis Ferreira](https://github.com/luishferreira/poke-standalone-scripts/blob/master/auto-pokedex.user.js), criado para outro jogo/domínio. O código deste AutoDex foi escrito separadamente.
