# Requirements Document

## Introduction

"O Caminho Assombrado da Escola" é um jogo web 2D side-scroller desenvolvido para Halloween, onde uma criança deve navegar de casa até à escola durante o dia, evitando monstros e recolhendo itens de vida. O jogo será uma aplicação web responsiva construída com Next.js, Phaser 3, e TypeScript, com um sistema de leaderboard baseado em cloud.

## Requirements

### Requirement 1

**User Story:** Como jogador, quero poder inserir o meu primeiro e último nome antes de começar o jogo, para que a minha pontuação seja registada no leaderboard.

#### Acceptance Criteria

1. WHEN o jogador acede à página `/nome` THEN o sistema SHALL apresentar campos obrigatórios para primeiro e último nome
2. WHEN o jogador submete o formulário sem preencher ambos os campos THEN o sistema SHALL não permitir avançar
3. WHEN o jogador preenche ambos os campos corretamente THEN o sistema SHALL guardar o nome no estado global e permitir avançar

### Requirement 2

**User Story:** Como jogador, quero escolher uma personagem (menino ou menina), uma arma e um nível de dificuldade antes de começar, para que possa personalizar a minha experiência de jogo.

#### Acceptance Criteria

1. WHEN o jogador acede à página `/personagem` THEN o sistema SHALL apresentar opções para escolher entre menino ou menina
2. WHEN o jogador seleciona uma personagem THEN o sistema SHALL guardar a escolha no estado global
3. WHEN o jogador acede à página `/arma` THEN o sistema SHALL apresentar quatro opções de armas (Katana, Pistola de Laser, Taco de Basebol, Bazuca)
4. WHEN o jogador seleciona uma arma THEN o sistema SHALL guardar a escolha no estado global
5. WHEN o jogador acede à página `/dificuldade` THEN o sistema SHALL apresentar três níveis: Fácil, Médio, Impossível
6. WHEN o jogador seleciona um nível de dificuldade THEN o sistema SHALL guardar a escolha e não permitir alteração durante o jogo

### Requirement 3

**User Story:** Como jogador, quero controlar a minha personagem com teclas intuitivas, para que possa navegar pelo mundo do jogo facilmente.

#### Acceptance Criteria

1. WHEN o jogador pressiona A ou ← THEN a personagem SHALL mover-se para a esquerda
2. WHEN o jogador pressiona D ou → THEN a personagem SHALL mover-se para a direita
3. WHEN o jogador pressiona W ou ↑ THEN a personagem SHALL saltar com velocidade 360 no eixo Y
4. WHEN o jogador pressiona S ou ↓ THEN a personagem SHALL agachar-se
5. WHEN o jogador pressiona Espaço THEN a personagem SHALL atacar com a arma selecionada
6. WHEN o jogador pressiona Esc THEN o jogo SHALL pausar

### Requirement 4

**User Story:** Como jogador, quero enfrentar diferentes tipos de inimigos com comportamentos únicos, para que o jogo seja desafiante e variado.

#### Acceptance Criteria

1. WHEN um Fantasma aparece THEN ele SHALL mover-se em flutuação baixa, retirar uma vida ao jogador e desaparecer ao contacto
2. WHEN um Morcego aparece THEN ele SHALL mover-se em flutuação baixa, retirar uma vida ao jogador e desaparecer ao contacto
3. WHEN um Vampiro aparece THEN ele SHALL andar lentamente em linha reta, retirar uma vida ao jogador e desaparecer ao contacto
4. WHEN uma Múmia aparece THEN ela SHALL andar lentamente em linha reta, retirar uma vida ao jogador e desaparecer ao contacto
5. WHEN o jogador agacha-se THEN SHALL evitar dano de Fantasmas e Morcegos
6. WHEN o jogador salta THEN SHALL evitar dano de Vampiros e Múmias

### Requirement 5

**User Story:** Como jogador, quero que todas as armas eliminem inimigos com um único ataque, para que o combate seja rápido e satisfatório.

#### Acceptance Criteria

1. WHEN o jogador ataca com Katana THEN ela SHALL ter alcance de 40px e cadência de 300ms
2. WHEN o jogador ataca com Pistola de Laser THEN ela SHALL disparar projéteis a 500px/s com cadência de 200ms
3. WHEN o jogador ataca com Taco de Basebol THEN ele SHALL ter alcance de 55px, cadência de 450ms e aplicar knockback
4. WHEN o jogador ataca com Bazuca THEN ela SHALL ter cadência de 900ms, dano em área e máximo de 6 munições
5. WHEN qualquer arma atinge um inimigo THEN o inimigo SHALL ser eliminado imediatamente

### Requirement 6

**User Story:** Como jogador, quero recolher itens de vida posicionados em locais altos, para que possa recuperar saúde através de habilidade de plataforma.

#### Acceptance Criteria

1. WHEN itens de vida (Abóbora, Chupa, Maçã) aparecem THEN eles SHALL estar posicionados em alturas que requerem salto
2. WHEN o jogador toca num item de vida THEN SHALL ganhar +1 vida e +50 pontos até ao máximo de 10 vidas
3. WHEN o jogador recolhe um item THEN o item SHALL desaparecer e reproduzir som de item

### Requirement 7

**User Story:** Como jogador, quero um sistema de vidas e pontuação claro, para que possa acompanhar o meu progresso e desempenho.

#### Acceptance Criteria

1. WHEN o jogo inicia THEN o jogador SHALL começar com 10 vidas e 0 pontos
2. WHEN o jogador elimina um inimigo THEN SHALL ganhar +100 pontos
3. WHEN o jogador é atacado THEN SHALL perder uma vida
4. WHEN o jogador sofre dano THEN SHALL ter invencibilidade por 800ms
5. WHEN o jogador chega ao portão da escola com vidas > 0 THEN SHALL ganhar +500 pontos bónus
6. WHEN as vidas chegam a 0 THEN o jogo SHALL terminar em derrota

### Requirement 8

**User Story:** Como jogador, quero ver um HUD informativo durante o jogo, para que possa monitorizar o meu estado atual.

#### Acceptance Criteria

1. WHEN o jogo está ativo THEN o HUD SHALL mostrar o nome do jogador
2. WHEN o jogo está ativo THEN o HUD SHALL mostrar as vidas atuais
3. WHEN o jogo está ativo THEN o HUD SHALL mostrar a pontuação atual
4. WHEN qualquer valor muda THEN o HUD SHALL atualizar imediatamente

### Requirement 9

**User Story:** Como jogador, quero ver um leaderboard com as melhores pontuações, para que possa comparar o meu desempenho com outros jogadores.

#### Acceptance Criteria

1. WHEN o jogador acede à página inicial THEN o sistema SHALL mostrar o top 10 de pontuações via API
2. WHEN o jogo termina THEN o sistema SHALL registar a pontuação via POST /scores
3. WHEN o jogo termina THEN o sistema SHALL mostrar todos os registos das pontuações com scroll via API
4. WHEN há erro na API THEN o sistema SHALL mostrar uma mensagem de erro apropriada

### Requirement 10

**User Story:** Como jogador, quero uma experiência responsiva em diferentes dispositivos, para que possa jogar em telemóvel, tablet ou desktop.

#### Acceptance Criteria

1. WHEN o jogo é acedido em qualquer dispositivo THEN a interface SHALL adaptar-se ao tamanho do ecrã
2. WHEN o jogo corre em tablet ou telemóvel THEN SHALL ter botões no ecrã: lado direito para saltar, agachar e atacar; lado esquerdo para mover direita ou esquerda
3. WHEN o jogo corre em desktop THEN os controlos de teclado SHALL funcionar corretamente
4. WHEN o canvas do jogo é renderizado THEN SHALL manter proporções adequadas em todos os dispositivos

### Requirement 11

**User Story:** Como jogador, quero feedback áudio durante o jogo, para que a experiência seja mais imersiva.

#### Acceptance Criteria

1. WHEN o jogo inicia THEN SHALL reproduzir música ambiente em loop (vento e grilos)
2. WHEN o jogador salta THEN SHALL reproduzir som de salto
3. WHEN o jogador sofre dano THEN SHALL reproduzir som de dano
4. WHEN o jogador recolhe item THEN SHALL reproduzir som de item
5. WHEN o jogador ataca THEN SHALL reproduzir som específico da arma (Katana e taco de basebol: slash, laser, bazuca: explosion)

### Requirement 12

**User Story:** Como jogador, quero escolher entre diferentes níveis de dificuldade, para que possa ajustar o desafio do jogo às minhas habilidades.

#### Acceptance Criteria

1. WHEN o jogador seleciona dificuldade "Fácil" THEN o jogo SHALL ter poucos inimigos e muitos itens de vida
2. WHEN o jogador seleciona dificuldade "Médio" THEN o jogo SHALL ter alguns inimigos e poucos itens de vida
3. WHEN o jogador seleciona dificuldade "Impossível" THEN o jogo SHALL ter muitos inimigos e zero itens de vida
4. WHEN o jogo termina THEN a dificuldade SHALL ser registada junto com a pontuação no leaderboard

### Requirement 13

**User Story:** Como utilizador do sistema, quero que os dados do leaderboard sejam persistidos de forma segura na cloud, para que as pontuações sejam mantidas entre sessões.

#### Acceptance Criteria

1. WHEN uma pontuação é submetida THEN SHALL ser guardada na tabela DynamoDB com scoreId único
2. WHEN o top 10 é solicitado THEN SHALL ser retornado ordenado por pontos decrescentes
3. WHEN há acesso à API THEN SHALL ser limitado por origem via CloudFront
4. WHEN há múltiplos pedidos THEN SHALL aplicar throttling no API Gateway