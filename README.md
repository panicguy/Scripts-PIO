# Scripts PIO — AutoDex v0.2.0

Userscript **AutoDex • Dudu** para [pokeidle.io](https://pokeidle.io/app).

## Instalação

1. Instale Tampermonkey.
2. Abra [Instalar AutoDex](https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/autodex.user.js) e confirme a atualização/instalação.
3. **Recarregue a página** do jogo para desligar a versão antiga.
4. Clique no botão **AutoDex**, com o mesmo ícone da **Pokédex**, na barra superior.
5. Clique em **Sincronizar → Criar fila → Iniciar**. A fila prioriza os Pokémon *vistos* e ainda não capturados.

## Funcionamento

- Identifica os 1.248 cards da Pokédex por `.dex-card`. `pego` = espécie já registrada; `visto` ou `desconhecido` = ainda não registrada.
- Usa a ficha e o botão **Onde encontrar** (`#ficha-corpo .fi-hunts .fi-hunt[data-hunt]`) para viajar para hunts normais. Ao chegar, verifica o `#hud-hunt`.
- Durante a hunt, monitora o botão superior `nav.menu-topo button[data-modal="pokedex"]`, que passa a mostrar **Pokédex +1** quando uma espécie nova é registrada.
- **Um aviso anterior não conta como captura:** guarda o valor do contador antes de entrar na hunt e só aceita aumento posterior enquanto o HUD ainda mostra a espécie selecionada. Também considera o card atualizado para `.dex-card.pego`.
- Ao detectar a captura, **clica uma única vez no agendador `#rb-center-schedule`**, se ainda não estiver em `aria-pressed="true"`. Não clica no botão `#ir-centro`, que pode estar desabilitado durante a luta.
- O jogo gerencia o fim da batalha e os **3 segundos sem combate**. O script não adiciona espera artificial: aguarda o HUD identificar **Centro Pokémon**, e só então vai para a próxima hunt.
- O painel **AutoDex pode ser fechado**; a automação continua na aba do jogo enquanto esta permanecer aberta.
- Pokémon sem hunt comum são marcados como **pendentes especiais** (Boss, Mystic Ticket, Mega, Safari etc.), nunca como capturados. A captura em si usa as configurações normais de combate e Poké Balls do jogo.

## Teste recomendado

1. Faça o teste com um Pokémon **visto, mas não capturado**, de captura rápida e em uma hunt acessível.
2. Clique em **Sincronizar**, **Criar fila** e **Iniciar**. Acompanhe o HUD: o AutoDex deve entrar na hunt correta.
3. Quando surgir **Pokédex +1**, o botão nativo de agendamento do Centro deverá ativar; espere o personagem chegar ao Centro.
4. Confira se a próxima hunt começa **somente depois** do retorno.

Se algo falhar, abra o Console (F12) e execute:

```javascript
PIOAutoDex.diagnostico()
```

Envie a saída e explique em qual etapa ficou parado. **Não compartilhe cookies, tokens, URLs de sessão, nem cabeçalhos de autenticação.**

## Estado e limites

**v0.2.0 — integração ainda não validada ponta a ponta em uma conta autenticada.** Os seletores da Pokédex, do aviso +1, do HUD e do agendador foram fundamentados nos diagnósticos fornecidos, mas abrir a ficha e viajar programaticamente ainda precisam ser testados no jogo.

- O script pausa quando não consegue confirmar uma entrada na hunt, um botão de retorno ou a localização correta.
- Ele não força uma viagem, não contorna bloqueios de navegação nem desiste do combate.
- Se a página for atualizada, o script **não retoma sozinho**: conserva a fila e a posição, e você decide quando reiniciar.
- Parar o AutoDex **não cancela** um retorno já agendado pelo próprio jogo.
- O aviso **Pokédex +1** não identifica a espécie sozinho; a associação é inferida pela hunt atual indicada no HUD, então deve ser validada em teste real.
- A Pokédex pode montar/desmontar cards quando a janela é aberta. Por isso o aviso do menu é a principal detecção em tempo real; o histórico de capturas não é necessário para decidir a próxima hunt.

Referência conceitual: [PIW Auto Pokédex de Luis Ferreira](https://github.com/luishferreira/poke-standalone-scripts/blob/master/auto-pokedex.user.js), criado para outro jogo/domínio. O AutoDex utiliza código próprio.
