// Configuração das expansões
const expansions = {
  "A3": { name: "Celestial Guardians", maxCards: 239 },
  "A2b": { name: "Shining Revelry", maxCards: 111 },
  "A2a": { name: "Triumphant Light", maxCards: 96 },
  "A2": { name: "Space-Time Smackdown", maxCards: 207 },
  "A1a": { name: "Mythical Island", maxCards: 86 },
  "A1": { name: "Genetic Apex", maxCards: 286 },
  "P-A": { name: "Promo-A", maxCards: 73 }
};

// Variáveis do jogo
let cards = [];
let chosenIndex = null;
let chosenCard = null;
let hidden = false;
let selectedExpansion = "random";
let selectedMaxCards = 0;
let gameActive = false;
let shuffleTimer = null;

// Retorna uma URL aleatória para uma carta de uma expansão específica
function getRandomCardUrl(serie, maxNum) {
  const cardNumber = String(Math.floor(Math.random() * maxNum) + 1).padStart(3, '0');
  return `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/pocket/${serie}/${serie}_${cardNumber}_EN.webp`;
}

// Retorna uma URL aleatória de qualquer expansão
function getRandomCardFromAnyExpansion() {
  const series = Object.keys(expansions);
  const randomSerie = series[Math.floor(Math.random() * series.length)];
  const maxNum = expansions[randomSerie].maxCards;
  return getRandomCardUrl(randomSerie, maxNum);
}

// Seleciona uma expansão no menu
function selectExpansion(serie, maxCards) {
  document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
  });
  document.querySelector(`.menu-item[data-serie="${serie}"]`).classList.add('active');
  selectedExpansion = serie;
  selectedMaxCards = maxCards;
  initGame();
}

// Animação de embaralhamento
function animateShuffle() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
      card.classList.add('shuffling');
  });
  setTimeout(() => {
      cards.forEach(card => {
          card.classList.remove('shuffling');
      });
  }, 900);
}

// Inicializa o jogo
function initGame() {
    if (shuffleTimer) {
        clearTimeout(shuffleTimer);
    }

    // Gerar 5 URLs de cartas aleatórias
    cards = [];
    for (let i = 0; i < 5; i++) {
        if (selectedExpansion === "random") {
            cards.push(getRandomCardFromAnyExpansion());
        } else {
            cards.push(getRandomCardUrl(selectedExpansion, selectedMaxCards));
        }
    }

    chosenIndex = null;
    chosenCard = null;
    hidden = false;
    gameActive = false;

    document.getElementById("result").textContent = "";
    document.getElementById("start-btn").disabled = true;
    document.getElementById("play-again-btn").style.display = "none";

    // Mostra as cartas com as imagens reais por 3 segundos
    renderCards(false);

    // Após 3 segundos, embaralha e oculta as cartas
    shuffleTimer = setTimeout(() => {
        shuffleArray(cards); // Embaralha as cartas
        animateShuffle(); // Animação de embaralhamento
        setTimeout(() => {
            hidden = true;
            gameActive = true;
            renderCards(true); // Mostra as cartas com a imagem de fundo
        }, 1000);
    }, 2000);
}

// Revela todas as cartas
function revealAllCards(clickedIndex) {
    const delay = 700; // Tempo entre revelações
    let revealOrder = [...Array(cards.length).keys()];

    // Remove a carta clicada da ordem e a adiciona no final
    revealOrder = revealOrder.filter(index => index !== clickedIndex);
    revealOrder.push(clickedIndex);

    // Revela as cartas na ordem definida
    revealOrder.forEach((index, i) => {
        setTimeout(() => {
            const cardElement = document.getElementById(`card-${index}`);
            if (cardElement) {https://davidcorbetta.github.io/mysterious-choice-pokemon-tcg-pocket/
                cardElement.classList.remove('hidden');
                cardElement.classList.add('revealed');

                // Atualiza a imagem da carta
                const img = document.createElement('img');
                img.src = cards[index];
                img.alt = `Card ${index + 1}`;
                img.className = 'card-front';
                img.onerror = function () {
                    this.src = 'https://s3.pokeos.com/pokeos-uploads/tcg/pocket/back.webp';
                };
                cardElement.innerHTML = '';
                cardElement.appendChild(img);

                // Adiciona um efeito especial para a carta escolhida
                if (index === clickedIndex) {
                    cardElement.classList.add('chosen');
                }
            }
        }, i * delay);
    });

    // Exibe o resultado e o botão "Jogar Novamente" após todas as cartas serem reveladas
    setTimeout(() => {
        document.getElementById("result").textContent = 
            `Você escolheu a carta da posição ${clickedIndex + 1}`;
        document.getElementById("play-again-btn").style.display = "block"; // Exibe o botão
    }, revealOrder.length * delay);
}

// Renderiza as cartas no tabuleiro
function renderCards(hide = false, highlight = -1) {
    cards.forEach((cardUrl, index) => {
        const el = document.getElementById(`card-${index}`);
        el.className = 'card';
        el.innerHTML = ''; // Limpa o conteúdo anterior

        if (hide) {
            // Mostra a imagem de fundo
            el.classList.add("hidden");
            el.style.background = "url('https://s3.pokeos.com/pokeos-uploads/tcg/pocket/back.webp') no-repeat center center";
            el.style.backgroundSize = "cover";
        } else {
            // Mostra a imagem real da carta
            el.classList.remove("hidden");
            const img = document.createElement('img');
            img.src = cardUrl;
            img.alt = `Card ${index + 1}`;
            img.className = 'card-front';
            img.onerror = function () {
                this.src = 'https://s3.pokeos.com/pokeos-uploads/tcg/pocket/back.webp';
            };
            el.appendChild(img);
        }

        if (index === highlight) {
            el.classList.add("chosen");
        }
    });
}

// Escolhe uma carta
function chooseCard(index) {
  if (!gameActive || !hidden || chosenIndex !== null) return;

  gameActive = false;
  chosenIndex = index;
  chosenCard = cards[index];

  setTimeout(() => {
      revealAllCards(index);
  }, 1000);
}

// Jogar novamente após completar uma rodada
function playAgain() {
  document.getElementById("play-again-btn").style.display = "none";
  initGame();
}

// Embaralha um array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Inicializa o jogo quando a página carregar
window.onload = function () {
  document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', function () {
          const serie = this.getAttribute('data-serie');
          const maxCards = parseInt(this.getAttribute('data-max'));
          selectExpansion(serie, maxCards);
      });
  });

  const playAgainBtn = document.createElement('button');
  playAgainBtn.id = 'play-again-btn';
  playAgainBtn.textContent = 'Jogar Novamente';
  playAgainBtn.onclick = playAgain;
  playAgainBtn.style.display = 'none';
  document.getElementById('game').appendChild(playAgainBtn);

  initGame();
};