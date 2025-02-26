document.addEventListener("DOMContentLoaded", () => {
    // UI Element References
    let introScreen = document.getElementById("intro-screen");
    let playArea = document.getElementById("play-area");
    let playerOneInput = document.getElementById("player-one");
    let playerTwoInput = document.getElementById("player-two");
    let themeColorInput = document.getElementById("theme-color");
    let beginGameButton = document.getElementById("begin-game");
    let activePlayerDisplay = document.getElementById("active-player");
    let boardGrid = document.getElementById("board-grid");
    let pointsOneDisplay = document.getElementById("points-one");
    let pointsTwoDisplay = document.getElementById("points-two");
    let infoButton = document.getElementById("info-btn");
    let resetButton = document.getElementById("reset-btn");
    let infoBox = document.getElementById("info-box");
    let modeSelector = document.getElementById("mode-selector");
    let mainMenuButton = document.getElementById("main-menu");

    // Game Variables
    let player1, player2; // Player names
    let currentPlayer; // Tracks the current player
    let isSinglePlayer = true; // Determines if it's single player or multiplayer
    let score1 = 0, score2 = 0; // Player scores
    let firstCard = null, secondCard = null; // The two cards being flipped
    let lockBoard = false; // Prevents the board from being interacted with while checking for matches
    let timer, timeLeft = 60, gameStarted = false; // Timer variables

    // Card Icons
    const icons = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
    let cards = [...icons, ...icons]; // Duplicated icons for the memory game

    // Shuffle Cards Function
    // Shuffles the cards array using the Fisher-Yates algorithm
    function shuffleCards() {
        for (let i = cards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // Random index
            [cards[i], cards[j]] = [cards[j], cards[i]]; // Swap elements
        }
    }

    // Create Cards Function
    // Creates the game cards dynamically and adds event listeners
    function createCards() {
        boardGrid.innerHTML = ""; // Clear any existing cards
        shuffleCards(); // Shuffle cards
        cards.forEach(icon => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.dataset.icon = icon; // Store the card's icon in a data attribute
            card.innerHTML = "?"; // Initially display the "?" symbol
            card.addEventListener("click", flipCard); // Add click event to flip the card
            boardGrid.appendChild(card); // Append card to the board grid
        });
    }

    // Show Message Function
    // Displays a message on the screen for a short period
    function showMessage(message) {
        const messageBox = document.createElement("div");
        messageBox.id = "message-box";
        messageBox.innerText = message;
        messageBox.style.position = "fixed";
        messageBox.style.top = "300px";
        messageBox.style.left = "50%";
        messageBox.style.transform = "translateX(-50%)";
        messageBox.style.background = "#ffcc00";
        messageBox.style.padding = "10px 20px";
        messageBox.style.borderRadius = "5px";
        messageBox.style.zIndex = "1000";
        document.body.appendChild(messageBox);

        setTimeout(() => {
            document.body.removeChild(messageBox); // Remove message after 3 seconds
        }, 3000);
    }

    // Flip Card Function
    // Flips the clicked card and checks if two cards are flipped
    function flipCard() {
        if (lockBoard || this == firstCard) return; // Prevent flipping the same card twice

        this.classList.add("flipped"); // Add flipped class to show card
        this.innerHTML = this.dataset.icon; // Show the card's icon

        if (!firstCard) {
            firstCard = this; // First card clicked
            return;
        }
        secondCard = this; // Second card clicked
        lockBoard = true; // Lock board to prevent further interaction
        setTimeout(checkForMatch, 800); // Check for match after a short delay
    }

    // Reset Board Function
    // Resets the cards and board after a match or mismatch
    function resetBoard() {
        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }

    // Check for Match Function
    // Checks if the two flipped cards match
    function checkForMatch() {
        if (firstCard.dataset.icon === secondCard.dataset.icon) {
            disableCards(); // Disable matched cards
            updateScore(); // Update the score
        } else {
            setTimeout(unflipCards, 1000); // Unflip cards after a delay
        }
    }

    // Unflip Cards Function
    // Unflips the cards if they don't match
    function unflipCards() {
        firstCard.innerHTML = "?";
        secondCard.innerHTML = "?";
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetBoard();
        if (!isSinglePlayer) switchPlayer(); // Switch player turn in multiplayer mode
    }

    // Update Score Function
    // Updates the score of the current player
    function updateScore() {
        if (currentPlayer === player1) {
            score1 += 10;
            pointsOneDisplay.textContent = score1;
        } else {
            score2 += 10;
            pointsTwoDisplay.textContent = score2;
        }
    }

    // Disable Cards Function
    // Disables the cards so they cannot be clicked after matching
    function disableCards() {
        firstCard.removeEventListener("click", flipCard);
        secondCard.removeEventListener("click", flipCard);
        resetBoard();
        checkGameOver(); // Check if the game is over after every match
    }

    // Switch Player Function
    // Switches the current player after each turn
    function switchPlayer() {
        currentPlayer = (currentPlayer === player1) ? player2 : player1;
        activePlayerDisplay.textContent = `${currentPlayer}'s Turn`;
    }

    // Restart Game Function
    // Resets all the game variables and restarts the game
    function restartGame() {
        clearInterval(timer); // Stop the timer
        timerStarted = false;
        timeLeft = 60; // Reset timer
        document.getElementById("countdown").textContent = timeLeft;
        score1 = 0;
        score2 = 0;
        pointsOneDisplay.textContent = "0";
        pointsTwoDisplay.textContent = "0";
        currentPlayer = player1;
        activePlayerDisplay.textContent = `Turn: ${currentPlayer}`;
        createCards(); // Create a new set of cards
        startTimer(); // Start the timer again
    }

    // Check Game Over Function
    // Checks if all the cards have been matched (game over condition)
    function checkGameOver() {
        if (document.querySelectorAll(".card.flipped").length === cards.length) {
            setTimeout(() => {
                clearInterval(timer);
                if (isSinglePlayer) {
                    showMessage(`🎉 Game Over! You scored ${score1} points!`);
                } else {
                    let winner = score1 > score2 ? player1 : (score1 < score2 ? player2 : "It's a tie!");
                    showMessage(`🏆 Game Over! ${winner} wins!`);
                }
                restartGame();
            }, 500);
        }
    }

    // Begin Game Button Event
    beginGameButton.addEventListener("click", () => {
        if (!playerOneInput.value.trim()) {
            showMessage("Enter Player 1 Name!");
            return;
        }

        player1 = playerOneInput.value;
        player2 = playerTwoInput.value || "Computer"; // Default to 'Computer' if no player 2 is entered
        currentPlayer = player1;

        isSinglePlayer = modeSelector.value === "single";
        if (isSinglePlayer) {
            playerTwoInput.style.display = "none"; // Hide player 2 input for single player mode
        } else {
            if (!playerTwoInput.value.trim()) {
                showMessage("Enter a player name!");
                return;
            }
            playerTwoInput.style.display = "block"; // Show player 2 input for multiplayer mode
        }

        const selectedColor = themeColorInput.value;
        // Change the body background color based on the theme color selected
        document.body.style.backgroundColor = selectedColor;
        // Set the CSS variable for the theme color
        document.documentElement.style.setProperty('--theme-color', selectedColor);

        introScreen.style.display = "none"; // Hide intro screen
        playArea.style.display = "block"; // Show game area
        activePlayerDisplay.textContent = `${currentPlayer}'s Turn`; // Display current player's turn
        createCards(); // Create cards for the game

        if (isSinglePlayer) {
            startTimer(); // Start the timer if in single-player mode
        }
    });

    // Reset Button Event
    resetButton.addEventListener("click", restartGame);

    // Info Button Event
    infoButton.addEventListener("click", () => {
        infoBox.style.display = infoBox.style.display === "none" || infoBox.style.display === ""
            ? "block"
            : "none"; // Toggle the info box visibility
    });

    // Timer Function
    function startTimer() {
        timerStarted = true;
        timer = setInterval(() => {
            if (--timeLeft > 0) {
                document.getElementById("countdown").textContent = timeLeft; // Update countdown
            } else {
                clearInterval(timer); // Stop the timer
                showMessage(`⏳ Time's up! You scored ${score1} points.`); // Show message
                restartGame(); // Restart the game
            }
        }, 1000); // Update timer every second
    }

    // Mode Selector Event
    modeSelector.addEventListener("change", function () {
        if (modeSelector.value === "multi") {
            playerTwoInput.style.display = "block"; // Show player 2 input for multiplayer mode
            showMessage("2 Player Mode Enabled!");
        } else {
            playerTwoInput.style.display = "none"; // Hide player 2 input for single-player mode
            showMessage("Single Player Mode Enabled!");
        }
    });

    // Main Menu Button Event
    mainMenuButton.addEventListener("click", function () {
        window.location.href = "index.html"; // Navigate to the main menu
    });
});
