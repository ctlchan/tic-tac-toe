const gameSettings = (() => {

    // SETUP
    
    // Add listener to reload game when settings are changed
    let container = document.querySelector('.gameSettings');
    container.addEventListener('change', () => {console.log("settings were changed"); game.initialize()}) // TODO: call function to reload game

    
    // Add listeners to dynamiclly show/hide additional settings based on radio button values
    let radioButtons = document.querySelectorAll('.gameSettings input');

    radioButtons.forEach( (button) => {

        let selector = button.dataset.player == 'one' ? '.pOne':'.pTwo';

        // Add event listener for when the 'Bot' option is SELECTED
        if (button.className == 'botOption') 
            button.addEventListener('change', () => document.querySelector(selector).style.visibility = 'visible');

        else
            button.addEventListener('change', () => document.querySelector(selector).style.visibility = 'hidden');
    })


    const getPlayerSettings = (forPlayerOne) => {

        let settings = forPlayerOne ? document.querySelectorAll('.playerOneSettings input') : document.querySelectorAll('.playerTwoSettings input');
        let isBot = settings[1].checked; // Check if "bot" is selected for the respective player's settings
        let botDifficulty;

        if (isBot) {
            let difficultySettings = isPlayerOne ? document.querySelector('.playerOneSettings select') : document.querySelector('.playerTwoSettings select');

            botDifficulty = difficultySettings.value;
        }

        return (_SettingsFactory(isBot, botDifficulty));

    }

    return { getPlayerSettings}

})();


const _SettingsFactory = (isBot, botDifficulty) => {

    return {isBot, botDifficulty}
}

const _Difficulty = (() => {
    return {
        'easy': 0,
        'normal': 0.5,
        'hard': 0.75,
        'impossible': 1
    }
})();


const gameboard = (() => {

    let board = [
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined]
    ];

    const getCell = (row, col) => board[row][col];
    
    const setCell = (row, col, isPlayerOne) => board[row][col] = isPlayerOne;

    const reset = () => board = [
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined]
    ];

    return { getCell, setCell, reset}

})();


const displayController = (() => {

    const grid = document.querySelector('.grid').children;
    const message = document.querySelector('.message');

    // Update the UI based on the state of the gameboard
    const updateDisplay = () => {
        
        for (let i = 0; i < 9; i++) {
            let row = Math.floor(i / 3);
            let col = i % 3;

            let cellValue = gameboard.getCell(row, col);

            if (cellValue != undefined) {
                grid[i].textContent = cellValue ? 'X': '0';
                grid[i].removeEventListener('click', _makeMove);
            }

            else 
                grid[i].textContent = '';
            
        }
    }

    // Reset the display by updating it and re-establishing click listeners - assumes the board state has been reset before
    const reset = () => {
        message.style.visibility = 'hidden';
        updateDisplay()
        setUpListeners();
    }

    // Add click listeners to grid cells
    const setUpListeners = () => {
        for (let i = 0; i < 9; i++) {
            grid[i].addEventListener('click', _makeMove);
        }
    }

    // Call back function used to update the board state based on the index of the clicked cell and whose turn it is in the game
    const _makeMove = (e) => {
        let i = e.target.dataset.index;
        let row = Math.floor(i / 3);
        let col = i % 3;

        gameboard.setCell(row, col, game.getPlayerOnesTurn());
        updateDisplay();
        e.target.removeEventListener('click', _makeMove);
        game.checkWin(row, col);
        game.toggleTurn();
        game.incrTurnNum();
    }

    const displayResultMessage = (isTie) => {
        if (isTie) {
            message.textContent = "Game tied!";
        }

        else {
            message.textContent = `Player ${game.getPlayerOnesTurn ? '1': '2'} wins!`
        }

        message.style.visibility = 'visible';
    }

    const messageToReset = () => {
        let beforeText = message.textContent;

        
    }

    return {grid, reset, displayResultMessage}
})();


// IIFE which represents and manages the current game state
const game = (() => {

    let playerOnesTurn = true;
    let turnNumber = 1;

    const getPlayerOnesTurn = () => playerOnesTurn;

    const toggleTurn = () => playerOnesTurn = !playerOnesTurn;

    const incrTurnNum = () => turnNumber++;

    const initialize = () => {
        gameboard.reset();
        displayController.reset();
    }

    // Return true if the given cell lands on a winning line - intended to be called after a move is made as it checks for a win based on whose turn it is
    const checkWin = (row, col) => {
        let winner = false;

        console.log({turnNumber, row, col})

        if (turnNumber >= 5) {
            
            // Check row 
            let i = 0;
            while (i < 3 && !winner) {
                let value = gameboard.getCell(row, i);

                if (value != playerOnesTurn)
                    break;

                if (i == 2)
                    winner = true;
                
                i++;
            }

            // Check column
            i = 0;
            while (i < 3 && !winner) {
                let value = gameboard.getCell(i, col);

                if (value != playerOnesTurn)
                    break;

                if (i == 2)
                    winner = true;
                
                i++;
            }

            // Check forward diagonal (/)
            if (row + col == 2) {

                i = 0;
                while (i < 3 && !winner) {
                    let value = gameboard.getCell(i, 2 - i);

                    if (value != playerOnesTurn)
                        break;

                    else if (i == 2)
                        winner = true;
                        
                    i++
                }
            }

            // Check backwards diagonal (\)
            if (row == col) {
                i = 0;
                while (i < 3 && !winner) {
                    let value = gameboard.getCell(i, i);

                    if (value != playerOnesTurn)
                        break;

                    else if (i == 2)
                        winner = true;
                        
                    i++;
                }
            }

        }

        if (winner) {
            console.log("winner found!");
            processWin();
        }

        if (turnNumber == 9 && !winner) {
            // game.end('draw');  -> call message
            displayController.displayResultMessage(true);
        }
    }

    const processWin = () => {
        displayController.displayResultMessage(false);

        // Update message so that it acts as a button?
    }



    initialize();

    return {initialize, getPlayerOnesTurn, toggleTurn, checkWin, incrTurnNum}

})()

