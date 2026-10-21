# Regras de manutenção — Scripts-PIO

Estas instruções se aplicam a todo o repositório e devem ser lidas antes de alterar código, documentação ou assets.

## REGRA PRINCIPAL — preservar a identidade visual do README

O arquivo `README.md` é **a página visual oficial do repositório PIO Scripts by KimJongDudu**, e **não deve ser substituído por um README genérico**, mesmo quando um userscript recebe novas funcionalidades.

Elementos que devem ser preservados:
- Banner original: `<img src="assets/pio-scripts-logo.png" alt="PIO Scripts by KimJongDudu" width="900">`.
- Cabeçalho e descrição centralizada, links visuais de instalação para AutoDex e Auto-Sniper e link para o PokeIdle.
- Tabela **O que cada script faz**, contendo os dois projetos.
- Seções **📖 AutoDex** e **🎯 Auto-Sniper**, com seus recursos e como usar.
- Instruções de instalação, testes/limitações, problemas e créditos.
- A identidade **PIO Scripts by KimJongDudu** e imagens/assets existentes.

### Em cada atualização de versão
1. Leia **o README atual** do branch antes de editar (nunca partir de modelo genérico).
2. Mude somente a **versão e a descrição/funcionalidades pertinentes ao script atualizado**, em suas posições já existentes.
3. Atualize a linha daquele script na tabela, seus recursos, instruções ou limitações *apenas se necessário*.
4. **Não reescreva o README inteiro, não altere o topo visual e não remova seções de outros scripts**. Preserve o restante byte a byte sempre que possível.
5. Se for necessário registrar novidades muito detalhadas, prefira adicionar entradas em `CHANGELOG.md` em vez de transformar o README numa lista de versões.
6. Compare o README antes/depois. Confirme que a identidade visual e seções dos outros scripts continuam intactas.
7. Execute ou confira o workflow `README Branding Guard` em alterações que envolvam documentação.
8. Caso um README novo seja necessário, **peça autorização explícita** ao dono do repositório antes de mudar o layout.

### Regra para AutoDex
- O modo **Completar Pokédex** e o modo **Corrida semanal de catch** precisam estar descritos corretamente.
- A ordem padrão é **por nível da hunt**; a opção por número da Dex continua disponível. Aleatório é opção do modo Completar Pokédex.
- Atualize o número exibido na tabela de scripts de acordo com `@version` em `autodex.user.js`.
- Não afirmar como confirmado o reset semanal do aviso `Pokédex +1` sem teste real.
- Preserve o funcionamento no Modo Economia de Bateria e as regras de exclusão de lendários/míticos.

**Resumo:** alterações de código são livres dentro do pedido; alterações no README devem ser mínimas e localizadas, preservando identidade visual e conteúdo dos demais projetos.
