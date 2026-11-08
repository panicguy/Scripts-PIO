# PIO Scripts — Dock e Chocadeira

Versão 1.0.0. [Instalar](https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/pio-dock.user.js).

No hub, adicione esse endereço em Ferramentas → Scripts & Extensões. O dock aparece em cada conta com jogo aberto. Clique no ovo e em **Ligar** em cada conta desejada; a configuração fica salva por personagem. A primeira instalação começa desligada.

- Dock arrastável e recolhível. Recolher o menu não desliga a automação.
- Envia o comando nativo `chocadeira.colocar`, sem abrir mochila ou menus.
- Usa um ovo por vez em cada conta, aguardando confirmação do servidor. Enquanto qualquer ovo estiver chocando, espera a vaga ficar livre.
- Prioridade configurável: P2 → P3 → P4 → Shiny ou ordem inversa.
- Não compra ovos, vagas ou aceleração.
- Funciona nas quatro contas em modo visual, inclusive Economia. Headless puro não executa userscripts nesta versão do launcher.

## Verificação

Contrato conferido no código público do PokeIdle 1.412.3. Testes automatizados cobrem inventário, prioridade, ocupação, confirmação, reconexão, envio único e isolamento das quatro contas. Alterações futuras no protocolo podem exigir atualização.

Validação no hub: dock presente e automação ativada nas quatro contas. As quatro indicaram ovo chocando após confirmação do estado; a tela nativa da primeira confirmou 1/1 e o tempo de choca de um P2. O ciclo completo de seis horas ainda não foi acompanhado. Testes: `node pio-dock.test.cjs`.
