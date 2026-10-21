<p align="center">
  <img src="assets/pio-scripts-logo.png" alt="PIO Scripts by KimJongDudu" width="900">
</p>

<p align="center">
  <strong>Uma coleção de userscripts para facilitar sua jornada no PokéIdle.</strong><br>
  Pokédex, caça, mercado e acompanhamento de farm — direto no navegador.
</p>

<p align="center">
  <a href="https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/autodex.user.js">📖 Instalar AutoDex</a>
  &nbsp; · &nbsp;
  <a href="https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/auto-sniper.user.js">🎯 Instalar Auto-Sniper</a>
  &nbsp; · &nbsp;
  <a href="https://pokeidle.io/app">🎮 Abrir o jogo</a>
</p>

## O que cada script faz

| Script | Para que serve | Versão |
| --- | --- | --- |
| [AutoDex](autodex.user.js) | Completa a Pokédex ou refaz capturas na corrida semanal, com ordem por nível (padrão), número da Dex ou aleatória; agenda o retorno ao Centro após capturar. | 0.2.6 |
| [Auto-Sniper](auto-sniper.user.js) | Reúne regras de compra automática, consultas e operações do mercado, estatísticas de farm, catálogos de hunts e bosses e ferramentas de oferendas em um cockpit dentro do jogo. | 1.5.2.1 |

## Como instalar

1. Instale o [Tampermonkey](https://www.tampermonkey.net/) no navegador e conclua a configuração indicada pela extensão para permitir userscripts.
2. Clique em **Instalar AutoDex** ou **Instalar Auto-Sniper** nos links acima. Cada script é instalado separadamente; escolha os que quiser usar.
3. Na tela do Tampermonkey, confira o nome e clique em **Instalar**. Se o arquivo abrir como texto, confira se a extensão está instalada e habilitada.
4. Abra o [PokéIdle](https://pokeidle.io/app) e **recarregue a página**. Se o jogo já estava aberto, esse passo também é necessário.
5. Confira se o script está habilitado no Tampermonkey e abra seu painel dentro do jogo.

**Para atualizar:** use a verificação de atualizações do Tampermonkey ou abra novamente o link de instalação e confirme a atualização. Depois, recarregue o jogo para carregar a nova versão. Evite manter cópias duplicadas do mesmo script.

## 📖 AutoDex

### Recursos

- Lista de espécies com **✓ capturado / × pendente**, pesquisa e filtros.
- Limpa automaticamente buscas esquecidas no campo da Pokédex antes de sincronizar ou abrir a próxima ficha, evitando travar a fila.
- Nomes de Pokémon resolvidos com apoio de um catálogo de **1.247 espécies**; o estado de captura é lido do jogo.
- Dois modos: **Completar Pokédex** (ignora espécies já capturadas) e **Corrida semanal de catch** (inclui novamente as espécies já registradas).
- Ordenação: **nível da hunt, do menor ao maior (padrão)**, **número da Pokédex** ou **aleatória** (neste momento, aleatória só para Completar Pokédex).
- A tabela conhecida de níveis cobre **1.065 hunts**; espécies sem nível identificado ficam no fim da fila. Pokémon de **Outland** entram quando disponíveis na Pokédex.
- Início de hunt a partir do Centro Pokémon; confirmação pelo **HUD ou Hunt Analyser**, inclusive no modo economia de bateria.
- Detecção de nova captura pelo aviso **Pokédex +1**, confirmado em relação ao valor antes da hunt; no modo Completar, também pelo card atualizado da Pokédex. Na corrida semanal, verifica adicionalmente o histórico de capturas recente quando disponível.
- Retorno agendado ao Centro após a captura; a próxima viagem aguarda a chegada.
- **Lendários e míticos excluídos** da lista e da fila automática.
- Se a viagem não sair do Centro, até **duas retentativas**; se já estiver fora do Centro, não força nova viagem sem confirmar a localização.
- Controles para pausar, retomar e parar, preservando a fila.

### Como usar

1. Vá ao **Centro Pokémon**.
2. Clique em **AutoDex**, ao lado da Pokédex.
3. Clique em **Sincronizar** e confira a lista.
4. Selecione **Modo** (Completar Pokédex ou Corrida semanal) e **Ordem** (nível, Pokédex ou aleatório no modo Completar).
5. Clique em **Criar fila → Iniciar**.
6. Acompanhe a primeira hunt e o primeiro retorno para conferir o comportamento no seu jogo. Para iniciar uma nova corrida semanal, use **Parar → Criar fila**: isso reinicia o progresso da corrida, sem apagar a Dex permanente.

O painel pode ficar fechado durante a execução. Espécies especiais sem hunt normal ficam pendentes; elas não são marcadas como capturadas. As opções de captura e as bolas continuam sendo as configuradas no próprio jogo.

**Ao recarregar a página, o AutoDex não retoma a caça automaticamente.** Parar o script não cancela um retorno já agendado no jogo.

## 🎯 Auto-Sniper

Conversão da extensão **Rotom Sniper 1.5.2** em um único userscript, com cockpit integrado à página.

### Recursos

- **Regras de compra:** seleção de item/Pokémon, limites de preço, quantidades e acompanhamento das compras.
- **Radar global:** filtros para shiny, potência P5 e nota, com tetos de preço por configuração.
- **Mercado:** consulta de ofertas, anúncios próprios, compras manuais e ferramentas de diamantes.
- **Farm:** estatísticas e telemetria das hunts recebidas do jogo.
- **Hunts e bosses:** catálogos, rotas, drops e calculadora de probabilidade de recompensas de bosses.
- **Oferendas:** consulta de candidatos e ferramentas de execução em lote.
- **Configurações persistentes:** regras e preferências salvas no armazenamento local do site.

### Como usar

1. Instale e **recarregue o jogo** para que o script capture a conexão desde o carregamento.
2. Clique em **Auto-Sniper**, no canto inferior direito.
3. A primeira instalação começa **pausada**. Cadastre suas regras e confira preços, moedas e quantidades antes de ativar **AUTO-SNIPE**.
4. Use as abas do cockpit para acessar mercado, farm, hunts e oferendas.
5. Para interromper as compras automáticas, desative **AUTO-SNIPE**. Fechar o painel apenas esconde a interface.

Use uma única aba do jogo e desative a extensão Rotom Sniper original enquanto usa esta conversão. As configurações da extensão não são importadas automaticamente.

## Testes e limitações

| Script | O que foi verificado | O que ainda precisa de validação |
| --- | --- | --- |
| AutoDex | Sintaxe JavaScript e verificações simuladas de ordenação e preservação da fila. | Fluxo completo em conta autenticada, especialmente recapturas da corrida semanal e reset do indicador Pokédex +1. |
| Auto-Sniper | Sintaxe e teste em Chrome com página simulada: painel, navegação em hunts, ativação/pausa, envio único do comando e persistência após recarregar, sem erros JavaScript. | Compras, vendas, oferendas e telemetria em sessão real do jogo. |

- Mantenha a aba aberta. A suspensão de abas pelo navegador pode atrasar as automações.
- Mudanças no layout ou no protocolo do jogo podem exigir ajustes nos scripts.
- O catálogo do AutoDex possui 1.247 espécies, enquanto a interface observada mostrava 1.248. Espécies posteriores podem aparecer como `Pokémon #ID`.
- O indicador **Pokédex +1** não informa sozinho o ID capturado; o AutoDex relaciona o aviso à hunt pelos sinais do HUD ou do Hunt Analyser. Se não reconhecer a localização, pode precisar de intervenção manual.
- **Corrida semanal:** ainda não foi confirmado se o aviso Pokédex +1 reinicia semanalmente. O histórico é uma confirmação auxiliar quando disponível; uma recaptura sem novo aviso nem histórico carregado pode não ser detectada.
- Limpar os dados do site apaga configurações salvas. No Auto-Sniper, o armazenamento é compartilhado por origem/navegador e não é separado por personagem ou conta.
- Os scripts incluem seus próprios módulos, mas imagens e dados atuais continuam dependendo do jogo e das fontes usadas pelo código original.

## Encontrou um problema?

Abra uma [issue](https://github.com/panicguy/Scripts-PIO/issues) com o nome e a versão do script, o que você fez e o que aconteceu. Para obter um diagnóstico, abra o console do navegador (**F12 → Console**) e execute o comando do script correspondente:

```javascript
PIOAutoDex.diagnostico()
```

```javascript
PIOAutoSniper.diagnostico()
```

Revise a saída antes de compartilhar e remova tokens, cookies ou credenciais.

## Créditos

- **PIO Scripts by KimJongDudu** — identidade e coleção do repositório.
- **AutoDex by Dudu** — código próprio desta versão. Referência conceitual: [PIW Auto Pokédex, de Luis Ferreira](https://github.com/luishferreira/poke-standalone-scripts/blob/master/auto-pokedex.user.js), criado para outro jogo.
- **Auto-Sniper** — conversão da extensão Rotom Sniper 1.5.2, preservando os módulos e créditos presentes no material original.
