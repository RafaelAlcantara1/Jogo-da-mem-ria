class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.gameStarted = false;
        this.timer = null;
        this.seconds = 0;
        this.canFlip = true;

        // Símbolos para as cartas (emojis relacionados à Barbie/Computaria)
        this.symbols = ['💻', '🖥️', '⌨️', '🖱️', '💾', '📱', '🎮', '🔌'];
        
        this.initializeGame();
        this.bindEvents();
    }

    initializeGame() {
        this.createCards();
        this.shuffleCards();
        this.renderCards();
        this.updateDisplay();
    }

    createCards() {
        this.cards = [];
        // Criar pares de cartas
        this.symbols.forEach(symbol => {
            this.cards.push({ symbol, isFlipped: false, isMatched: false });
            this.cards.push({ symbol, isFlipped: false, isMatched: false });
        });
    }

    shuffleCards() {
        // Algoritmo Fisher-Yates para embaralhar
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    renderCards() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';

        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = index;

            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            cardFront.textContent = '?';

            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardBack.textContent = card.symbol;

            cardElement.appendChild(cardFront);
            cardElement.appendChild(cardBack);

            if (card.isFlipped) {
                cardElement.classList.add('flipped');
            }
            if (card.isMatched) {
                cardElement.classList.add('matched');
            }

            gameBoard.appendChild(cardElement);
        });
    }

    bindEvents() {
        const gameBoard = document.getElementById('game-board');
        const restartBtn = document.getElementById('restart-btn');
        const playAgainBtn = document.getElementById('play-again-btn');
        const modal = document.getElementById('modal');

        gameBoard.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (card && this.canFlip) {
                const index = parseInt(card.dataset.index);
                this.flipCard(index);
            }
        });

        restartBtn.addEventListener('click', () => {
            this.restartGame();
        });

        playAgainBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            this.restartGame();
        });

        // Fechar modal clicando fora dele
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

    flipCard(index) {
        const card = this.cards[index];
        
        // Não permitir virar cartas já viradas ou combinadas
        if (card.isFlipped || card.isMatched) {
            return;
        }

        // Iniciar timer na primeira jogada
        if (!this.gameStarted) {
            this.startTimer();
            this.gameStarted = true;
        }

        // Virar a carta
        card.isFlipped = true;
        this.flippedCards.push(index);
        this.renderCards();

        // Verificar se temos duas cartas viradas
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            this.checkMatch();
        }
    }

    checkMatch() {
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];

        if (card1.symbol === card2.symbol) {
            // Match encontrado!
            card1.isMatched = true;
            card2.isMatched = true;
            this.matchedPairs++;
            this.score += 10;
            
            // Bônus por velocidade
            if (this.seconds < 60) {
                this.score += 5;
            }

            this.flippedCards = [];
            this.renderCards();
            this.updateDisplay();

            // Verificar se o jogo acabou
            if (this.matchedPairs === this.symbols.length) {
                this.endGame();
            }
        } else {
            // Não é um match, virar as cartas de volta
            this.canFlip = false;
            setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;
                this.flippedCards = [];
                this.renderCards();
                this.canFlip = true;
            }, 1000);
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.seconds++;
            this.updateDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('moves').textContent = this.moves;
        
        const minutes = Math.floor(this.seconds / 60);
        const remainingSeconds = this.seconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = timeString;
    }

    endGame() {
        this.stopTimer();
        
        // Atualizar modal com estatísticas finais
        document.getElementById('final-moves').textContent = this.moves;
        document.getElementById('final-score').textContent = this.score;
        
        const minutes = Math.floor(this.seconds / 60);
        const remainingSeconds = this.seconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        document.getElementById('final-time').textContent = timeString;

        // Mostrar modal
        setTimeout(() => {
            document.getElementById('modal').classList.add('show');
        }, 500);
    }

    restartGame() {
        this.stopTimer();
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.gameStarted = false;
        this.seconds = 0;
        this.canFlip = true;

        this.initializeGame();
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
