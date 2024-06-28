// Example minesweeper.js with timer, mine count, and game status below board

const boardSize = 10; // Size of the Minesweeper board (10x10 in this example)
const numMines = 20; // Number of mines on the board

let board = []; // Array to store the board state (tiles)
let mineCount = numMines; // Number of remaining mines
let gameStartTime = null; // Variable to store game start time
let gameEndTime = null; // Variable to store game end time
let timerInterval = null; // Interval to update the timer

// Function to initialize Minesweeper board
function initializeBoard() {
    const boardElement = document.getElementById('minesweeperBoard');
    boardElement.innerHTML = ''; // Clear existing board
    board = []; // Clear board array
    mineCount = numMines; // Reset mine count
    gameStartTime = null; // Reset game start time
    gameEndTime = null; // Reset game end time

    // Create the grid of tiles
    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        const row = document.createElement('div');
        row.classList.add('row');
        for (let j = 0; j < boardSize; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.dataset.row = i;
            tile.dataset.col = j;
            tile.textContent = ''; // Initialize empty content
            row.appendChild(tile);
            board[i][j] = { isMine: false, revealed: false, flagged: false }; // Initialize each tile object
            // Add click event listeners
            tile.addEventListener('click', (event) => {
                event.preventDefault();
                if (event.button === 0) {
                    handleClick(i, j); // Left click
                } else if (event.button === 2) {
                    flagTile(i, j); // Right click
                }
            });
            // Add context menu event listener (for right-click)
            tile.addEventListener('contextmenu', (event) => {
                event.preventDefault(); // Prevent default context menu
                flagTile(i, j); // Flag the tile on right-click
            });
        }
        boardElement.appendChild(row);
    }

    // Randomly place mines on the board
    let minesPlaced = 0;
    while (minesPlaced < numMines) {
        const randomRow = Math.floor(Math.random() * boardSize);
        const randomCol = Math.floor(Math.random() * boardSize);
        if (!board[randomRow][randomCol].isMine) {
            board[randomRow][randomCol].isMine = true;
            minesPlaced++;
        }
    }

    // Update mine count display
    updateMineCountDisplay();
    // Start timer
    startTimer();
}

// Function to start the game timer
function startTimer() {
    gameStartTime = Date.now(); // Set the game start time
    // Update timer every second
    timerInterval = setInterval(() => {
        if (gameStartTime && !gameEndTime) {
            const currentTime = Date.now();
            const timeElapsed = Math.floor((currentTime - gameStartTime) / 1000); // Time in seconds
            updateTimerDisplay(timeElapsed);
        }
    }, 1000); // Update timer every second
}

// Function to update the timer display
function updateTimerDisplay(seconds) {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = formatTime(seconds); // Format time and update display
}

// Function to format time (mm:ss)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Function to handle tile click (left click)
function handleClick(row, col) {
    if (board[row][col].isMine) {
        // Game over logic (reveal all mines, highlight clicked mine)
        revealAllMines();
        highlightCell(row, col, 'red'); // Highlight clicked mine in red
        endGame(false); // End game with loss
        // You can add more game over logic here (reveal all mines, end game state, etc.)
    } else {
        // Update tile appearance (reveal number or empty space)
        revealTile(row, col);
        // Check if clicked cell is a number tile
        if (!board[row][col].isMine && countAdjacentMines(row, col) > 0) {
            // Highlight adjacent cells and empty cells nearby
            highlightAdjacentAndEmptyCells(row, col);
        }
        // Check for win condition (all non-mine tiles revealed)
        checkWinCondition();
    }
}

// Function to handle tile right-click (flagging)
function flagTile(row, col) {
    const tileElement = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
    if (!board[row][col].revealed) {
        if (!board[row][col].flagged) {
            board[row][col].flagged = true;
            tileElement.textContent = '🚩'; // Display flag emoji or any symbol for flag
            tileElement.classList.add('flagged');
            mineCount--; // Decrement mine count
        } else {
            board[row][col].flagged = false;
            tileElement.textContent = ''; // Clear flag content
            tileElement.classList.remove('flagged');
            mineCount++; // Increment mine count
        }
        // Update mine count display
        updateMineCountDisplay();
    }
}

// Function to reveal tile
function revealTile(row, col) {
    const tileElement = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
    if (!board[row][col].revealed) {
        board[row][col].revealed = true;
        // Example: Set text content to number of adjacent mines
        let adjacentMines = countAdjacentMines(row, col);
        if (adjacentMines > 0) {
            tileElement.textContent = adjacentMines;
            tileElement.classList.add(`adjacent${adjacentMines}`);
        } else {
            tileElement.textContent = ''; // Clear content for empty tiles
            // TODO: Implement logic to recursively reveal adjacent tiles if they are also empty
        }
    }
}

// Function to count adjacent mines
function countAdjacentMines(row, col) {
    let count = 0;
    // Check 8 possible directions around the tile
    for (let i = Math.max(0, row - 1); i <= Math.min(boardSize - 1, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(boardSize - 1, col + 1); j++) {
            if (!(i === row && j === col) && board[i][j].isMine) {
                count++;
            }
        }
    }
    return count;
}

// Function to reveal all mines on game over
function revealAllMines() {
    board.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
            if (tile.isMine) {
                const tileElement = document.querySelector(`.tile[data-row="${rowIndex}"][data-col="${colIndex}"]`);
                tileElement.textContent = '💣'; // Display bomb emoji or any symbol for bomb
                tileElement.classList.add('mine');
            }
        });
    });
}

// Function to highlight adjacent and empty cells around a number
function highlightAdjacentAndEmptyCells(row, col) {
    // Mark the clicked cell as revealed
    board[row][col].revealed = true;
    // Highlight adjacent cells and empty cells nearby
    for (let i = Math.max(0, row - 1); i <= Math.min(boardSize - 1, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(boardSize - 1, col + 1); j++) {
            if (!(i === row && j === col) && !board[i][j].isMine && !board[i][j].revealed) {
                revealTile(i, j); // Ensure adjacent cells are revealed
                highlightCell(i, j, 'lightblue');
                // Recursively reveal adjacent cells if they are also empty
                if (countAdjacentMines(i, j) === 0) {
                    highlightAdjacentAndEmptyCells(i, j);
                }
            }
        }
    }
}

// Function to highlight a single cell
function highlightCell(row, col, color) {
    const tileElement = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
    tileElement.style.backgroundColor = color;
    tileElement.style.color = 'black'; // Ensure text is readable
    tileElement.classList.add('highlighted'); // Add a class to indicate it's highlighted
}

// Function to update mine count display
function updateMineCountDisplay() {
    const mineCountElement = document.getElementById('mineCount');
    mineCountElement.textContent = `Mines remaining: ${mineCount}`;
}

// Function to end the game (win or lose)
function endGame(isWin) {
    gameEndTime = Date.now(); // Set the game end time
    clearInterval(timerInterval); // Stop timer
    const gameStatusElement = document.getElementById('gameStatus');
    if (isWin) {
        gameStatusElement.textContent = 'Congratulations! You have won!';
    } else {
        gameStatusElement.textContent = 'Game Over! You clicked on a mine.';
    }
}

// Function to check win condition
function checkWinCondition() {
    // Example: Check if all non-mine tiles are revealed
    let allRevealed = true;
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (!board[i][j].isMine && !board[i][j].revealed) {
                allRevealed = false;
                break;
            }
        }
        if (!allRevealed) {
            break;
        }
    }
    if (allRevealed) {
        endGame(true); // End game with win
        // You can add more logic here for winning the game
    }
}

// Initialize the board when the page loads
document.addEventListener('DOMContentLoaded', initializeBoard);
