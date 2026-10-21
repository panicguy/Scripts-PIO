# AutoDex by Dudu — v0.2.4

Userscript para [PokeIdle](https://pokeidle.io/app) instalado pelo Tampermonkey.

**[Atualizar ou instalar AutoDex](https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/autodex.user.js)**

## Modos de captura

### Completar Pokédex
- **Não inclui Pokémon já capturados** na fila.
- Identifica uma espécie nova quando o contador **Pokédex +1** aumenta em relação ao valor registrado **ao entrar na hunt**, ou quando a Pokédex atualiza o card para `.pego`.
- Mantém a lógica **Captura → agendar retorno ao Centro → confirmar chegada → próxima hunt**.

### Corrida semanal de catch
- **Inclui novamente os Pokémon já capturados**; o estado `.pego` é ignorado para decidir se a espécie entra na fila.
- Cada Pokémon precisa ser capturado mais uma vez durante a corrida; os concluídos nesta execução são marcados separadamente dos registros permanentes da Pokédex.
- A detecção usa **um aumento novo do contador Pokédex +1**. **Ainda não está confirmado se ele realmente reinicia semanalmente**. Como verificação auxiliar, observa capturas recentes no histórico `.capturas-linha[data-k]` quando o histórico está carregado. Não depende da cena de combate.
- Se o contador não aumentar para capturas repetidas e o histórico não estiver carregado, o script pode continuar caçando; esse comportamento precisa de teste real.
- Para uma nova semana, selecione **Corrida semanal de catch → Criar fila**, que zera o progresso desta corrida (sem apagar a Pokédex permanente). Por enquanto, esse reinício é **manual**, não programado por calendário.

## Ordenação

**Padrão: Nível da hunt (menor para maior).**

- **Nível da hunt:** usa uma tabela de **753 níveis conhecidos** extraída do arquivo do jogo fornecido pelo jogador. Espécies sem nível conhecido ficam ao final, sem inventar um valor. Em empate, ordena por número.
- **Número da Pokédex:** ordem crescente por ID.
- **Aleatório:** embaralha a fila uma única vez quando a fila é criada (**somente no modo Completar Pokédex**).
- A escolha é salva no navegador. Trocar de modo ou ordem não reordena uma fila em execução; é preciso **Parar → Criar fila** para aplicar a nova seleção.

## Instalação e teste

1. Atualize o userscript no Tampermonkey e **recarregue a página do PokeIdle** para evitar manter uma versão antiga na memória.
2. Vá para o Centro Pokémon.
3. Abra **AutoDex** e clique em **Sincronizar**.
4. Selecione **Modo** e **Ordem**.
5. Clique em **Criar fila → Iniciar**.
6. Observe a sequência da primeira captura e chegada ao Centro antes da próxima viagem.

**Lendários e míticos permanecem excluídos** da interface e das filas. Outras espécies sem hunt direta ficam em pendentes especiais.

## Diagnóstico

Cole no Console (F12):

```javascript
PIOAutoDex.diagnostico()
```

Ele apresenta modo, ordem, contador, HUD, Hunt Analyser, retorno agendado e estado da fila. Evite enviar cookies, tokens e dados de autenticação.

## Limitações

Os ajustes foram verificados por teste de sintaxe e lógica simulada, **mas a corrida semanal precisa ser validada dentro de uma conta real**. A atualização de um contador de Pokédex não deve ser confundida com confirmação garantida de recaptura caso a regra semanal seja diferente da esperada.

O Modo Economia de Bateria é compatível com o reconhecimento por HUD e Hunt Analyser, sem depender da cena visual. A aba do jogo deve permanecer aberta para a automação continuar. A captura propriamente dita usa as configurações de combate e Poké Balls do jogo.

Referência conceitual: [PIW Auto Pokédex de Luis Ferreira](https://github.com/luishferreira/poke-standalone-scripts/blob/master/auto-pokedex.user.js). Implementação própria para o PokeIdle.
