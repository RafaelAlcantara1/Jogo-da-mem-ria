class MemoryGame {
  constructor() {
    this.cards = []
    this.flippedCards = []
    this.matchedPairs = 0
    this.moves = 0
    this.score = 0
    this.gameStarted = false
    this.timer = null
    this.seconds = 0
    this.canFlip = true

    this.gameMode = null // 'single' or 'two-player'
    this.currentPlayer = 1
    this.player1Name = "Jogador 1"
    this.player2Name = "Jogador 2"
    this.player1Pairs = 0
    this.player2Pairs = 0

    // Símbolos para as cartas (emojis relacionados à Barbie/Computaria)
    this.symbols = ["💻", "🖥️", "⌨️", "🖱️", "💾", "📱", "🎮", "🔌"]

    this.bindMenuEvents()
  }

  bindMenuEvents() {
    const singlePlayerBtn = document.getElementById("single-player-btn")
    const twoPlayerBtn = document.getElementById("two-player-btn")
    const startGameBtn = document.getElementById("start-game-btn")

    singlePlayerBtn.addEventListener("click", () => {
      this.gameMode = "single"
      this.startSinglePlayerGame()
    })

    twoPlayerBtn.addEventListener("click", () => {
      this.gameMode = "two-player"
      this.showPlayerSetup()
    })

    startGameBtn.addEventListener("click", () => {
      this.startTwoPlayerGame()
    })
  }

  showPlayerSetup() {
    document.getElementById("game-mode-selection").style.display = "none"
    document.getElementById("player-setup").style.display = "block"
    document.getElementById("player1-name").focus()
  }

  startSinglePlayerGame() {
    document.getElementById("game-mode-selection").style.display = "none"
    document.getElementById("game-info").style.display = "flex"
    document.getElementById("game-board").style.display = "grid"
    document.getElementById("restart-btn").style.display = "block"

    this.initializeGame()
    this.bindEvents()
  }

  startTwoPlayerGame() {
    const player1Input = document.getElementById("player1-name")
    const player2Input = document.getElementById("player2-name")

    this.player1Name = player1Input.value.trim() || "Jogador 1"
    this.player2Name = player2Input.value.trim() || "Jogador 2"

    document.getElementById("player-setup").style.display = "none"
    document.getElementById("current-player-display").style.display = "block"
    document.getElementById("players-info").style.display = "flex"
    document.getElementById("game-board").style.display = "grid"
    document.getElementById("restart-btn").style.display = "block"

    // Update player names in display
    document.getElementById("player1-display").textContent = this.player1Name
    document.getElementById("player2-display").textContent = this.player2Name
    document.getElementById("current-player-name").textContent = this.player1Name

    this.initializeGame()
    this.bindEvents()
  }

  initializeGame() {
    this.createCards()
    this.shuffleCards()
    this.renderCards()
    this.updateDisplay()
  }

  createCards() {
    this.cards = []
    // Criar pares de cartas
    this.symbols.forEach((symbol) => {
      this.cards.push({ symbol, isFlipped: false, isMatched: false })
      this.cards.push({ symbol, isFlipped: false, isMatched: false })
    })
  }

  shuffleCards() {
    // Algoritmo Fisher-Yates para embaralhar
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
    }
  }

  renderCards() {
    const gameBoard = document.getElementById("game-board")
    gameBoard.innerHTML = ""

    this.cards.forEach((card, index) => {
      const cardElement = document.createElement("div")
      cardElement.className = "card"
      cardElement.dataset.index = index

      const cardFront = document.createElement("div")
      cardFront.className = "card-front"
      cardFront.textContent = "?"

      const cardBack = document.createElement("div")
      cardBack.className = "card-back"
      cardBack.textContent = card.symbol

      cardElement.appendChild(cardFront)
      cardElement.appendChild(cardBack)

      if (card.isFlipped) {
        cardElement.classList.add("flipped")
      }
      if (card.isMatched) {
        cardElement.classList.add("matched")
      }

      gameBoard.appendChild(cardElement)
    })
  }

  bindEvents() {
    const gameBoard = document.getElementById("game-board")
    const restartBtn = document.getElementById("restart-btn")
    const playAgainBtn = document.getElementById("play-again-btn")
    const modal = document.getElementById("modal")

    gameBoard.addEventListener("click", (e) => {
      const card = e.target.closest(".card")
      if (card && this.canFlip) {
        const index = Number.parseInt(card.dataset.index)
        this.flipCard(index)
      }
    })

    restartBtn.addEventListener("click", () => {
      this.restartGame()
    })

    playAgainBtn.addEventListener("click", () => {
      modal.classList.remove("show")
      this.restartGame()
    })

    // Fechar modal clicando fora dele
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show")
      }
    })
  }

  flipCard(index) {
    const card = this.cards[index]

    // Não permitir virar cartas já viradas ou combinadas
    if (card.isFlipped || card.isMatched) {
      return
    }

    // Iniciar timer na primeira jogada
    if (!this.gameStarted) {
      this.startTimer()
      this.gameStarted = true
    }

    // Virar a carta
    card.isFlipped = true
    this.flippedCards.push(index)
    this.renderCards()

    // Verificar se temos duas cartas viradas
    if (this.flippedCards.length === 2) {
      this.moves++
      this.updateDisplay()
      this.checkMatch()
    }
  }

  checkMatch() {
    const [index1, index2] = this.flippedCards
    const card1 = this.cards[index1]
    const card2 = this.cards[index2]

    if (card1.symbol === card2.symbol) {
      // Match encontrado!
      card1.isMatched = true
      card2.isMatched = true
      this.matchedPairs++

      if (this.gameMode === "single") {
        this.score += 10
        // Bônus por velocidade
        if (this.seconds < 60) {
          this.score += 5
        }
      } else {
        // In 2-player mode, award pair to current player
        if (this.currentPlayer === 1) {
          this.player1Pairs++
        } else {
          this.player2Pairs++
        }
        // Player gets another turn for finding a match
      }

      this.flippedCards = []
      this.renderCards()
      this.updateDisplay()

      // Verificar se o jogo acabou
      if (this.matchedPairs === this.symbols.length) {
        this.endGame()
      }
    } else {
      // Não é um match, virar as cartas de volta
      this.canFlip = false
      setTimeout(() => {
        card1.isFlipped = false
        card2.isFlipped = false
        this.flippedCards = []
        this.renderCards()
        this.canFlip = true

        if (this.gameMode === "two-player") {
          this.switchPlayer()
        }
      }, 1000)
    }
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1
    const currentPlayerName = this.currentPlayer === 1 ? this.player1Name : this.player2Name
    document.getElementById("current-player-name").textContent = currentPlayerName
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.seconds++
      this.updateDisplay()
    }, 1000)
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  updateDisplay() {
    if (this.gameMode === "single") {
      document.getElementById("score").textContent = this.score
    }

    document.getElementById("moves").textContent = this.moves

    const minutes = Math.floor(this.seconds / 60)
    const remainingSeconds = this.seconds % 60
    const timeString = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    document.getElementById("timer").textContent = timeString

    // Update player pairs in 2-player mode
    if (this.gameMode === "two-player") {
      document.getElementById("player1-pairs").textContent = this.player1Pairs
      document.getElementById("player2-pairs").textContent = this.player2Pairs
    }
  }

  endGame() {
    this.stopTimer()

    if (this.gameMode === "single") {
      // Single player results
      document.getElementById("single-player-results").style.display = "block"
      document.getElementById("two-player-results").style.display = "none"
      document.getElementById("modal-title").textContent = "🎉 Parabéns! 🎉"

      document.getElementById("final-moves").textContent = this.moves
      document.getElementById("final-score").textContent = this.score

      const minutes = Math.floor(this.seconds / 60)
      const remainingSeconds = this.seconds % 60
      const timeString = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
      document.getElementById("final-time").textContent = timeString
    } else {
      // Two player results
      document.getElementById("single-player-results").style.display = "none"
      document.getElementById("two-player-results").style.display = "block"

      // Determine winner
      let winnerText
      if (this.player1Pairs > this.player2Pairs) {
        winnerText = `🎉 ${this.player1Name} Venceu! 🎉`
      } else if (this.player2Pairs > this.player1Pairs) {
        winnerText = `🎉 ${this.player2Name} Venceu! 🎉`
      } else {
        winnerText = "🤝 Empate! 🤝"
      }

      document.getElementById("modal-title").textContent = winnerText
      document.getElementById("winner-announcement").textContent = winnerText
      document.getElementById("final-player1-name").textContent = this.player1Name
      document.getElementById("final-player2-name").textContent = this.player2Name
      document.getElementById("final-player1-pairs").textContent = this.player1Pairs
      document.getElementById("final-player2-pairs").textContent = this.player2Pairs

      const minutes = Math.floor(this.seconds / 60)
      const remainingSeconds = this.seconds % 60
      const timeString = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
      document.getElementById("final-time-2p").textContent = timeString
    }

    // Mostrar modal
    setTimeout(() => {
      document.getElementById("modal").classList.add("show")
    }, 500)
  }

  restartGame() {
    this.stopTimer()

    this.cards = []
    this.flippedCards = []
    this.matchedPairs = 0
    this.moves = 0
    this.score = 0
    this.gameStarted = false
    this.seconds = 0
    this.canFlip = true
    this.currentPlayer = 1
    this.player1Pairs = 0
    this.player2Pairs = 0

    // Hide all game elements and show mode selection
    document.getElementById("game-info").style.display = "none"
    document.getElementById("current-player-display").style.display = "none"
    document.getElementById("players-info").style.display = "none"
    document.getElementById("game-board").style.display = "none"
    document.getElementById("restart-btn").style.display = "none"
    document.getElementById("player-setup").style.display = "none"
    document.getElementById("game-mode-selection").style.display = "block"

    // Clear input fields
    document.getElementById("player1-name").value = ""
    document.getElementById("player2-name").value = ""

    this.gameMode = null
  }
}

// Inicializar o jogo quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  new MemoryGame()
})
