# Scripts PIO — AutoDex v0.2.1

Userscript para [pokeidle.io](https://pokeidle.io/app). Painel **AutoDex by Dudu**, ao lado da Pokédex, com o mesmo ícone e visual marrom/dourado inspirado no jogo.

## Instalação / atualização

1. No Tampermonkey, atualize o script existente ou instale [autodex.user.js](https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/autodex.user.js).
2. **Recarregue a página do jogo**, para retirar a versão antiga que continua na memória da aba.
3. Clique em **AutoDex → Sincronizar → Criar fila → Iniciar**.
4. **Antes da primeira viagem, esteja no Centro Pokémon.** Se estiver caçando, volte manualmente ao Centro e clique em Iniciar outra vez. Esse bloqueio evita tentar viajar diretamente entre hunts.

## O que foi corrigido nesta versão

- **Nomes legíveis:** o DOM usa `.dex-card` com `.pego`, `.visto`, `.desconhecido`; a palavra `???` era realmente exibida pela Pokédex para desconhecidos. O AutoDex resolve nomes usando um **catálogo de 1.247 espécies** exportado pelo jogador, dando prioridade ao nome exibido pelo próprio jogo quando conhecido. Uma espécie adicionada depois desse catálogo pode aparecer como `Pokémon #ID`; não é inventado um nome.
- **✓ e ×:** estado capturado/pendente direto na lista, exibida somente após **Sincronizar**; filtro, pesquisa e painel mais compacto no estilo do jogo.
- **Fila:** prioriza espécies `visto` e depois as ainda `desconhecido`. Espécies especiais sem hunt normal identificadas no catálogo são marcadas como pendentes especiais, não como capturadas.
- **Viajar:** só inicia a hunt partindo do Centro Pokémon; tenta abrir a ficha e clica em `#ficha-corpo .fi-hunts button.fi-hunt[data-hunt]`, confirmando a entrada por `#hud-hunt`.
- **Captura:** a Pokédex sinaliza **+1** no botão superior da Pokédex quando uma espécie nova é capturada. O script observa aumento em relação ao valor de antes da hunt, **enquanto o HUD corresponde à espécie selecionada**. Também aceita `.dex-card.pego` atualizado.
- **Retorno:** após detectar a captura, utiliza `#rb-center-schedule` **uma única vez**; se `aria-pressed="true"`, não clica, pois outro clique cancelaria o agendamento. O próprio jogo controla os três segundos sem combate.
- **Próxima hunt:** o script não libera nova viagem até `#hud-hunt` mostrar `Centro Pokémon`.
- **Pausa/Retomada:** conserva a posição da fila. Se a hunt não for confirmada, pausa; ao retomar do Centro, tenta a mesma espécie outra vez.
- A janela AutoDex pode permanecer **fechada** enquanto funciona, mas a aba do jogo precisa continuar aberta.

## Teste controlado

1. Instale v0.2.1 e recarregue a página.
2. Vá ao Centro Pokémon, abra o AutoDex, clique em **Sincronizar** e confira se nomes como Caterpie, Gastly e Ivysaur aparecem, sem `???`.
3. Clique em **Criar fila → Iniciar** e verifique a hunt escolhida.
4. Após surgir o aviso **Pokédex +1** (espécie nova), confira se o retorno fica agendado e se a próxima hunt só começa quando o Centro aparecer no HUD.
5. Se parar ou errar a localização, abra F12 → Console e execute:

```javascript
PIOAutoDex.diagnostico()
```

Envie a saída para investigar. **Não compartilhe tokens, cookies nem credenciais.**

## Limitações

**A sintaxe foi verificada, mas a v0.2.1 ainda precisa de teste de ponta a ponta numa conta autenticada.** A leitura do catálogo é baseada numa exportação com 1.247 espécies enquanto a interface mostrou 1.248. O indicador `Pokédex +1` informa uma nova espécie, mas não revela o ID dela sozinho; por isso o script relaciona o evento à hunt atual confirmada no HUD, e pode pausar se o jogo mudar o layout. Captura/bolas dependem das opções normais do jogo. Retorno agendado por outro script não é cancelado pelo botão Parar do AutoDex. Ao recarregar a página, o script **não volta a caçar automaticamente**.

Crédito conceitual: [PIW Auto Pokédex — Luis Ferreira](https://github.com/luishferreira/poke-standalone-scripts/blob/master/auto-pokedex.user.js), criado para outro jogo. O código AutoDex desta versão é próprio.
