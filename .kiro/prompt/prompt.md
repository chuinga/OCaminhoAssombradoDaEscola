# 🧙‍♀️ O Caminho Assombrado da Escola  
**Idioma:** pt-PT  
**Tema:** Halloween  
**Tipo:** Web App responsiva (jogável em telemóvel, tablet e desktop)  
**Perspetiva:** 2D side-scroller  

---

## 🎯 Descrição
“O Caminho Assombrado da Escola” é um jogo 2D visto de lado em que uma criança tem de sair de casa e chegar à escola durante a noite de Halloween, evitando monstros e recolhendo itens de vida.  
O jogador escolhe a personagem (menino ou menina) e uma arma (entre quatro) antes de começar.  
Não há tempo limite, nem buracos, nem níveis diferentes — é um único percurso contínuo.  
Todas as armas eliminam o inimigo ao primeiro ataque (“1-hit kill”).  

---

## ⚙️ Stack Tecnológica

| Categoria | Tecnologia |
|------------|-------------|
| Linguagem | TypeScript |
| Framework Web | **Next.js (App Router)** |
| Engine de Jogo | **Phaser 3 (Arcade Physics)** |
| Estilos | Tailwind CSS |
| Estado Global | Zustand |
| Áudio | Howler.js |
| Testes | Jest + React Testing Library (+ Playwright opcional) |
| Deploy | AWS (S3 + CloudFront + API Gateway + Lambda + DynamoDB) |
| IaC | AWS CDK (WebStack, ApiStack, DdbStack) |

---

## 🧩 Estrutura e Orientações para o Kiro

- O jogo deve correr dentro de um **componente client-only Phaser** (`<GameCanvas />`) em Next.js.  
- As rotas Next devem ser:  
  `/` (inicial com top 10) → `/nome` → `/personagem` → `/arma` → `/jogar` → `/final`.  
- O estado global (nome, personagem, arma) deve ser mantido via Zustand.  
- Assets em `/public/assets`.  
- Desativar SSR para o canvas.  
- Utilizar Howler para sons.  
- API REST `/scores` (para leaderboard) com GET e POST.

---

## 🎮 Jogabilidade

### Objetivo
Chegar ao portão da escola com pelo menos **1 vida**.

### Início
- Local inicial: Casa  
- Vidas iniciais: 10  
- Pontos iniciais: 0  
- Jogador deve introduzir **primeiro e último nome**  
- Escolher **personagem:** Menino ou Menina  
- Escolher **uma arma:** Espada, Pistola de Laser, Taco de Basebol ou Bazuca  
- Arma não pode ser trocada durante o jogo  

### Fim do Jogo
- Vitória: tocar no portão da escola com vidas > 0 → +500 pontos bónus  
- Derrota: vidas = 0  
- Em ambos os casos, o jogo termina e vai para o **ecrã final** (com tabela de pontuações)

---

## 🕹️ Controlo

| Ação | Tecla |
|------|-------|
| Mover esquerda | A / ← |
| Mover direita | D / → |
| Saltar | W / ↑ |
| Agachar | S / ↓ |
| Atacar | Espaço |
| Pausar | Esc |

---

## 🧠 Mecânicas

- Scroll lateral com parallax  
- Física Arcade (gravidade vertical, sem buracos)  
- Plataformas fixas e baixas  
- Itens de vida **em posições altas** (precisa saltar para apanhar)  
- Cada monstro eliminado: +100 pontos  
- Vitória: +500 pontos extra  

---

## 👾 Entidades

### Jogador
- 10 vidas  
- Invencibilidade breve após dano (800ms)  
- Velocidade: 180 (X), salto: 360 (Y)

### Inimigos
| Nome | Tipo | Evitar | Movimento | Dano |
|------|------|--------|------------|------|
| Fantasma | Voador baixo | Agachar | Flutuação baixa | 1 |
| Morcego | Voador baixo | Agachar | Padrão sinusoidal | 1 |
| Vampiro | Chão | Saltar | Patrulha no chão | 2 |
| Múmia | Chão | Saltar | Anda lentamente em linha reta | 1 |

### Armas (todas 1-hit)
| Nome | Tipo | Alcance / Cadência | Observações |
|------|------|--------------------|--------------|
| Espada | Corpo-a-corpo | 40px / 300ms | — |
| Pistola de Laser | Distância | 500px/s / 200ms | projétil rápido |
| Taco de Basebol | Corpo-a-corpo | 55px / 450ms | com knockback |
| Bazuca | Distância | 900ms cadência | dano em área, 6 munições |

### Itens de Vida (altos)
| Item | Efeito | Posição |
|------|---------|----------|
| Abóbora | +1 vida (máx. 10) | Alta |
| Chupa | +1 vida (máx. 10) | Alta |
| Maçã | +1 vida (máx. 10) | Alta |

### Meta
**Portão da Escola** → termina o jogo (aplica bónus de 500 pontos se vitória)

---

## 🌆 Nível
- Apenas **um nível** (sem progressão)
- Corredor lateral contínuo com pequenas variações e plataformas baixas
- Largura: 3500px  
- Altura: 720px  
- Arte: pixel art com camadas de parallax (`lua_nuvens`, `casas`, `árvores`, `rua`)
- Inimigos e itens de vida distribuídos ao longo do mapa

---

## 💬 Interface

### HUD
Mostra:
- Nome do jogador  
- Vidas  
- Pontos  

### Ecrãs
| ID | Título | Conteúdo / Ações |
|----|---------|------------------|
| `/` | Top 10 Jogadores | Tabela leaderboard (GET /scores/top10) + botão “Jogar” |
| `/nome` | Escreve o teu nome | Campos: Primeiro Nome + Último Nome (obrigatórios) + botão “Próximo” |
| `/personagem` | Escolhe personagem | Menino ou Menina + botão “Próximo” |
| `/arma` | Escolhe a tua arma | Espada / Laser / Taco / Bazuca + botão “Start” |
| `/jogar` | Cena de jogo | Phaser GameCanvas (HUD + física) |
| `/final` | Resultado final | Pontuação do jogador + tabela com top 10 + botão “Voltar ao início” |

---

## 🔊 Áudio

- Música ambiente: vento e grilos (loop)
- Efeitos:
  - salto.wav  
  - dano.wav  
  - item.wav  
  - slash.wav  
  - laser.wav  
  - rocket.wav  
  - explosion.wav  

---

## ☁️ Backend (Leaderboard)

### Endpoints API
| Método | Caminho | Descrição |
|--------|----------|-----------|
| GET | `/scores/top10` | Retorna top 10 pontuações |
| POST | `/scores` | Regista nova pontuação |

### DynamoDB
- Tabela: `Scores`
- Chave primária: `scoreId (uuid)`
- Índice GSI: `pontos (ordem decrescente)`
- Campos: primeiroNome, ultimoNome, pontos, personagem, arma, createdAt

### Segurança
- Acesso anónimo (MVP)  
- Origem limitada via CloudFront  
- Throttling no API Gateway

---

## 🧰 Tarefas para o Kiro

1. Criar projeto **Next.js + TypeScript + Tailwind + Zustand + Howler + Phaser (client-only)**  
2. Implementar **rotas**: `/`, `/nome`, `/personagem`, `/arma`, `/jogar`, `/final`  
3. Guardar (nome, personagem, arma) em Zustand  
4. Validar campos de nome (primeiro e último obrigatórios)  
5. Implementar **GameScene (Phaser)**:
   - Movimento (A/D), salto (W/↑), agachar (S/↓)
   - Ataque com Espaço (todas as armas 1-hit)
   - Fantasma/Morcego → evitáveis a agachar  
   - Vampiro/Múmia → evitáveis a saltar  
   - Itens de vida altos (precisa saltar)
   - Portão da Escola = fim do jogo (+500 pontos se vitória)
6. HUD com Nome, Vidas, Pontos  
7. Ecrã inicial → tabela top 10 via API  
8. Ecrã final → pontuação + top 10 + botão “Voltar ao início”  
9. API client para GET/POST `/scores`  
10. Preparar assets em `/public/assets`  
11. Testes (Jest) para regras e fluxo  
12. Build para **AWS S3 + CloudFront**; backend via **API Gateway + Lambda + DynamoDB**

---

## ✅ Critérios de Aceitação

- Web app responsiva (mobile/tablet/desktop)  
- Fluxo completo: `/` → `/nome` → `/personagem` → `/arma` → `/jogar` → `/final`  
- Nome completo obrigatório  
- HUD mostra nome, vidas e pontos  
- Itens de vida estão altos (só apanháveis com salto)  
- Fantasma/Morcego evitáveis a agachar  
- Vampiro/Múmia evitáveis a saltar  
- Todas as armas eliminam monstros à primeira  
- Vitória concede +500 pontos  
- Sempre vai ao ecrã final (vitória ou derrota)  
- Leaderboard funcional (Top 10 via API)  
- Build pronta para AWS (S3 + CloudFront + Lambda + DynamoDB)

---
