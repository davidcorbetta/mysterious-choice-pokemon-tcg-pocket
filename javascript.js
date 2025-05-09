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

function getRandomCardUrl(serie, maxNum) {
  const cardNumber = String(Math.floor(Math.random() * maxNum) + 1).padStart(3, '0');
  return `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/pocket/${serie}/${serie}_${cardNumber}_EN.webp`;
}

function getRandomCardFromAnyExpansion() {
  const series = Object.keys(expansions);
  const randomSerie = series[Math.floor(Math.random() * series.length)];
  const maxNum = expansions[randomSerie].maxCards;
  return getRandomCardUrl(randomSerie, maxNum);
}

function selectExpansion(serie, maxCards) {
  document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
  });
  document.querySelector(`.menu-item[data-serie="${serie}"]`).classList.add('active');
  selectedExpansion = serie;
  selectedMaxCards = maxCards;
  initGame();
}

function animateShuffle() {
  const cards = document.querySelectorAll('.card');
  const container = document.getElementById('game');
  const containerRect = container.getBoundingClientRect();

  const positions = [];

  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  // Calcula o deslocamento e usa 2x para movimento mais suave
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const offsetX = centerX - cardCenterX;
    const offsetY = centerY - cardCenterY;

    // 2x mais perto do centro
    positions.push({ x: offsetX * 2, y: offsetY * 2 });
  });

  const timeline = gsap.timeline();

  // Move pro centro com rotação 3D
  cards.forEach((card, i) => {
    timeline.to(card, {
      duration: 0.5,
      x: positions[i].x,
      y: positions[i].y,
      z: 300,
      scale: 1.4,
      rotationX: 360,
      rotationY: 360,
      ease: "power2.inOut"
    }, 0);
  });

  // Gira todas no centro
  timeline.to(cards, {
    duration: 0.8,
    rotationX: "+=720",
    rotationY: "+=720",
    rotationZ: "+=360",
    ease: "power2.inOut"
  }, 0.5);

  // Volta para as posições originais
  cards.forEach((card) => {
    timeline.to(card, {
      duration: 0.7,
      x: 0,
      y: 0,
      z: 0,
      scale: 1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      ease: "expo.out"
    }, 1.3);
  });
}


function initGame() {
    if (shuffleTimer) {
        clearTimeout(shuffleTimer);
    }

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

    renderCards(false);

    shuffleTimer = setTimeout(() => {
        shuffleArray(cards);
        animateShuffle();
        setTimeout(() => {
            hidden = true;
            gameActive = true;
            renderCards(true); 
        }, 1000);
    }, 2000);
}

function revealAllCards(clickedIndex) {
    const delay = 400;
    let revealOrder = [...Array(cards.length).keys()];

    revealOrder = revealOrder.filter(index => index !== clickedIndex);
    revealOrder.push(clickedIndex);

    revealOrder.forEach((index, i) => {
        setTimeout(() => {
            const cardElement = document.getElementById(`card-${index}`);
            if (cardElement) {https://davidcorbetta.github.io/mysterious-choice-pokemon-tcg-pocket/
                cardElement.classList.remove('hidden');
                cardElement.classList.add('revealed');

                const img = document.createElement('img');
                img.src = cards[index];
                img.alt = `Card ${index + 1}`;
                img.className = 'card-front';
                img.onerror = function () {
                    this.src = 'https://s3.pokeos.com/pokeos-uploads/tcg/pocket/back.webp';
                };
                cardElement.innerHTML = '';
                cardElement.appendChild(img);

                if (index === clickedIndex) {
                    cardElement.classList.add('chosen');
                }
            }
        }, i * delay);
    });

    setTimeout(() => {
        document.getElementById("play-again-btn").style.display = "block";
    }, revealOrder.length * delay);
}


function renderCards(hide = false, highlight = -1) {
    cards.forEach((cardUrl, index) => {
        const el = document.getElementById(`card-${index}`);
        el.className = 'card';
        el.innerHTML = '';

        if (hide) {
            el.classList.add("hidden");
            el.style.background = "url('https://s3.pokeos.com/pokeos-uploads/tcg/pocket/back.webp') no-repeat center center";
            el.style.backgroundSize = "cover";
        } else {
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

function chooseCard(index) {
  if (!gameActive || !hidden || chosenIndex !== null) return;

  gameActive = false;
  chosenIndex = index;
  chosenCard = cards[index];

  setTimeout(() => {
      revealAllCards(index);
  }, 200);
}

function playAgain() {
  document.getElementById("play-again-btn").style.display = "none";
  initGame();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

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
  playAgainBtn.textContent = 'Play Again';
  playAgainBtn.onclick = playAgain;
  playAgainBtn.style.display = 'none';
  document.getElementById('game').appendChild(playAgainBtn);

  initGame();
};