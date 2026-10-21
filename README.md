# PIO AutoDex by Dudu — v0.2.3

Automação de Pokédex do [PokeIdle](https://pokeidle.io/app) em um userscript Tampermonkey.

**[Instalar / atualizar autodex.user.js](https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/autodex.user.js)**

## Atualização v0.2.3

- **Ordem numérica da Pokédex na fila.** Ao clicar em **Criar fila**, percorre todos os cards da Pokédex por ID crescente, sem priorizar vistos. Exemplo: #001 Bulbasaur, #002 Ivysaur, #003 Venusaur e assim por diante, pulando apenas as espécies já capturadas e as excluídas.
- **Outland também incluída.** Espécies de Outland presentes nos cards da Pokédex entram na fila seguindo seu número (por exemplo #2001, #2002). Não é necessário que a espécie exista no catálogo de nomes embutido; o critério é aparecer no DOM da Pokédex.
- **Atualização da fila antiga.** Ao recarregar a página, ordena numericamente somente a parte ainda não percorrida, preservando o progresso. Para reconstruir tudo desde o primeiro Pokémon ainda pendente, clique em **Sincronizar → Criar fila** antes de iniciar. 

### Recursos trazidos da versão anterior

- **Lendários e míticos removidos da interface e da fila.** A exclusão utiliza 137 IDs classificados como `LENDÁRIO` ou `MÍTICO` no catálogo fornecido, incluindo formas e Mega correspondentes, além da marcação textual do próprio card (`LENDÁRIO ???` / `MÍTICO ???`). Não são marcados como capturados; simplesmente ficam fora da lista do AutoDex.
- **Compatível com Modo Economia de Bateria.** Não usa nem procura imagens da cena de combate; compara a hunt escolhida ao **`#hud-hunt`** e ao **`#hunt-analyser`** (fallback **`#hunt-analyser-corpo`**).
- **Confirmação tolerante a atraso:** não pausa apenas por não reconhecer a hunt em 35 segundos quando já saiu do Centro; continua monitorando o HUD e o Analyser, mostrando um aviso periódico.
- **Recuperação de viagem:** se ainda estiver no **Centro Pokémon** sem entrar na hunt após cerca de 15 segundos, tenta novamente a **mesma espécie**, até duas vezes. Não repete a viagem enquanto estiver fora do Centro ou com retorno agendado. Após duas falhas confirmadas no Centro, pausa por segurança.
- **Fila anterior preservada** com migração que retira lendários/míticos de uma fila salva da v0.2.1, mantendo a posição dos demais Pokémon.
- **Correção de classificação:** o catálogo antigo marcava algumas espécies normais como sem hunt. A v0.2.3 verifica o botão **Onde encontrar** real da ficha antes de concluir que não há hunt.

## Como usar

1. Atualize o Tampermonkey com o script acima e **recarregue a página** do jogo.
2. Vá ao **Centro Pokémon**.
3. Abra o menu **AutoDex** (ícone igual ao da Pokédex).
4. Clique em **Sincronizar**, **Criar fila** e **Iniciar**. A fila segue a numeração real da Pokédex, incluindo Outland.
5. Pode fechar apenas o painel AutoDex, deixando a aba do jogo aberta. O modo economia de bateria pode ficar ativado.

Quando um **Pokédex +1** novo surgir na hunt confirmada, o AutoDex aciona **`#rb-center-schedule`** uma única vez (se ainda não estiver agendado), aguarda o fim da batalha e os três segundos administrados pelo próprio jogo, confirma o **Centro Pokémon** em `#hud-hunt` e prossegue.

## Diagnóstico em caso de falha

Abra F12 → Console e execute:

```javascript
PIOAutoDex.diagnostico()
```

O diagnóstico agora inclui localização, nome lido do Hunt Analyser, evidência da hunt, estado do agendamento, espécie atual, retentativas, próximos 12 Pokémon da fila e confirmação de ordem numérica. Mande a saída junto com a descrição de onde travou. Não compartilhe cookies, tokens ou dados de autenticação.

## Limitações

**Ainda precisa ser validado numa sessão real.** O Hunt Analyser foi identificado em um diagnóstico anterior como `#hunt-analyser` e `#hunt-analyser-corpo`, mas o texto pode mudar em atualizações. Se nenhum sinal confirmar a espécie fora do Centro, o script continua observando sem atribuir uma captura a outra hunt; isso evita viagens duplicadas, mas pode exigir inspeção manual. A v0.2.3 mantém capturas, combate e Poké Balls sob controle das configurações nativas do jogo.

Outras espécies especiais, incluindo algumas Megas não lendárias, podem continuar na lista; na falta de um botão de hunt normal são marcadas como pendentes especiais. O AutoDex não retoma automaticamente depois de atualizar o navegador. Parar a automação não cancela um retorno que o jogo já tenha agendado.

Crédito conceitual: [PIW Auto Pokédex, de Luis Ferreira](https://github.com/luishferreira/poke-standalone-scripts/blob/master/auto-pokedex.user.js). O código aqui é uma implementação própria para o PokeIdle.
