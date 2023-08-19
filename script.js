const gameSettings = (() => {

    // SETUP
    
    // Add listener to reload game when settings are changed
    let container = document.querySelector('.gameSettings');
    container.addEventListener('change', () => { game.initialize()})

    
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
            let difficultySettings = forPlayerOne ? document.querySelector('.playerOneSettings select') : document.querySelector('.playerTwoSettings select');

            botDifficulty = difficultySettings.value;
        }

        return (_SettingsFactory(isBot, botDifficulty));

    }

    return { getPlayerSettings }

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

    const getAvailableCells = () => {

        const result = [];
        let temp = [];

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {

                if (board[i][j] == undefined) {
                    temp.push(i, j);
                    result.push(temp);
                    temp = [];
                }
            }
        }

        return result;
    }


    const _evaluate = (b, player) => {

        // Checking for Rows for X or O victory.
        for(let row = 0; row < 3; row++)
        {
            if (b[row][0] == b[row][1] &&
                b[row][1] == b[row][2])
            {
                if (b[row][0] == player)
                    return +10;
                    
                else if (b[row][0] == !player)
                    return -10;
            }
        }
    
        // Checking for Columns for X or O victory.
        for(let col = 0; col < 3; col++)
        {
            if (b[0][col] == b[1][col] &&
                b[1][col] == b[2][col])
            {
                if (b[0][col] == player)
                    return +10;
    
                else if (b[0][col] == !player)
                    return -10;
            }
        }
    
        // Checking for Diagonals for X or O victory.
        if (b[0][0] == b[1][1] && b[1][1] == b[2][2])
        {
            if (b[0][0] == player)
                return +10;
                
            else if (b[0][0] == !player)
                return -10;
        }
    
        if (b[0][2] == b[1][1] && 
            b[1][1] == b[2][0])
        {
            if (b[0][2] == player)
                return +10;
                
            else if (b[0][2] == !player)
                return -10;
        }
    
        // Else if none of them have
        // won then return 0
        return 0;
    }

    const _minimax = (player, depth, board, isMax) => {

        let availCells = getAvailableCells();

        let score = _evaluate(board, player);

        if (score == 10)
            return score - depth;

        if (score == -10)
            return score + depth;

        if (availCells.length == 0)
            return 0;

        if (isMax) {
            let best = -1000;

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {

                    if (board[i][j] == undefined) {

                        // Make move
                        setCell(i, j, player);

                        // Recurse and find best possible move
                        best = Math.max(best, _minimax(player, depth + 1, board, !isMax));

                        // Undo move (only "made" within the algorithm which checks all possible game states)
                        setCell(i, j, undefined);
                    }

                }
            }

            return best;
        }

        // !isMax ==> minimizer's "move"
        else {

            let best = 1000;

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {

                    if (board[i][j] == undefined) {

                        // Make move
                        setCell(i, j, !player);

                        // Recurse and find best possible move
                        best = Math.min(best, _minimax(player, depth + 1, board, !isMax));

                        // Undo move (only "made" within the algorithm which checks all possible game states)
                        setCell(i, j, undefined);
                    }

                }
            }
            return best;
        }

    }


    const getBestMove = (player) => {

        let bestVal = -1000;
        let bestMove = {row: -1, col: -1};

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] == undefined) {

                    setCell(i, j, player);

                    let moveVal = _minimax(player, 0, board, false);

                    setCell(i, j, undefined);

                    if (moveVal > bestVal) {
                        bestMove.row = i;
                        bestMove.col = j;
                        bestVal = moveVal;
                    }
                }
            }
        }
        return bestMove;
    }

    return { getCell, setCell, reset, getAvailableCells, getBestMove}

})();


const displayController = (() => {

    const grid = document.querySelector('.grid').children;
    const message = document.querySelector('.message');
    const scores = document.querySelectorAll('.score');
    const turnIndicator = document.querySelector('.turn-indicator');

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
    const reset = (reset = false) => {
        message.style.visibility = 'hidden';
        turnIndicator.textContent = "X's turn"
        updateScore(reset);
        updateDisplay()
        // setUpListeners();
    }

    // Add click listeners to grid cells
    const setUpListeners = (remove = false) => {
        for (let i = 0; i < 9; i++) {
            if (!remove)
                grid[i].addEventListener('click', _makeMove);

            else
                grid[i].removeEventListener('click', _makeMove);
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
        let win = game.checkWin(row, col);
        if (!win) {
            game.toggleTurn();
            turnIndicator.textContent = `${game.getPlayerOnesTurn() ? 'X':'0'}'s turn`;
        }
    }

    const displayResultMessage = (isTie) => {
        if (isTie) {
            message.textContent = "Game tied!";
        }

        else {
            message.textContent = `Player ${game.getPlayerOnesTurn() ? '1': '2'} wins!`
        }

        message.style.visibility = 'visible';

        message.addEventListener('mouseover', messageToReset)
    }

    const messageToReset = () => {
        let beforeText = message.textContent;
        message.textContent = 'Play Again?';

        message.addEventListener('click', game.newRound )
        message.addEventListener('mouseout', () => {
            message.textContent = beforeText;
            message.removeEventListener('click', game.newRound);
        })
    }

    const updateScore = (reset = false) => {

        if (reset) {
            scores[0].textContent = 0;
            scores[1].textContent = 0;
        }

        else {
            let newScores = game.getScores();

            scores[0].textContent = newScores['p1Score'];
            scores[1].textContent = newScores['p2Score']
        }
    }

    return {grid, reset, displayResultMessage, updateScore, setUpListeners, updateDisplay}
})();

const PlayerFactory = (isPlayerOne, aiDifficulty = undefined) => {

    // Updates the board with a new move based on the level of the AI
    const play = () => {
        
        if (aiDifficulty != undefined) {
            let rng = Math.random();
            let row, col;

            // aiDifficulty determines the likelihood that the bot uses the minimax algorithm
            if (rng > aiDifficulty) {
                [row, col] = randomMove();
            }
            else {
                let move = bestMove();
                row = move.row;
                col = move.col;
            }

            gameboard.setCell(row, col, isPlayerOne);
            displayController.updateDisplay();
            let win = game.checkWin(row, col);

            // Avoided doing !win because win can be "undefined" and !undefined == true;
            if (win == false)
                game.toggleTurn();
        }

    }

    // The bot makes a random move
    const randomMove = () => {

        let moves = gameboard.getAvailableCells();

        const random = Math.floor(Math.random() * moves.length);

        return moves[random];
    }

    // The bot makes a move based on a minimax algorithm
    const bestMove = () => gameboard.getBestMove(isPlayerOne)

    return {isPlayerOne, isBot: aiDifficulty != undefined,score: 0, play}
}


// IIFE which represents and manages the current game state
const game = (() => {

    let playerOne;
    let playerTwo;
    let playerOnesTurn = true;
    let turnNumber = 1;
    const scores = {p1Score: 0, p2Score: 0};

    const getPlayerOnesTurn = () => playerOnesTurn;

    const toggleTurn = () => {

        // Base functionality
        playerOnesTurn = !playerOnesTurn;
        incrTurnNum();

        // Make bot(s) move - if applicable
        if (playerOne.isBot && playerOnesTurn) {
            setTimeout(() => {
                playerOne.play();
                displayController.updateDisplay();
                // toggleTurn()
            }, 300)
            
        }

        if (playerTwo.isBot && !playerOnesTurn) {
            setTimeout( () => {
                playerTwo.play();
                displayController.updateDisplay();
                // toggleTurn()
            }, 300)
        }
    };

    const incrTurnNum = () => turnNumber++;

    const getScores = () => scores;

    const initialize = () => {

        playerOnesTurn = true;
        turnNumber = 1;
        scores['p1Score'] = 0;
        scores['p2Score'] = 0;

        gameboard.reset();
        displayController.reset(true);


        let p1Settings = gameSettings.getPlayerSettings(true);
        let p2Settings = gameSettings.getPlayerSettings(false);

        if (!p1Settings.isBot || !p2Settings.isBot)
            displayController.setUpListeners();

        if (p1Settings.isBot) {
            playerOne = PlayerFactory(true, _Difficulty[p1Settings.botDifficulty]);
            playerOne.play();
        }
        else
            playerOne = PlayerFactory(true);

        if (p2Settings.isBot) 
            playerTwo = PlayerFactory(false, _Difficulty[p2Settings.botDifficulty]);
        else
            playerTwo = PlayerFactory(false);

    }

    const newRound = () => {
        playerOnesTurn = true;
        turnNumber = 1;

        let p1Settings = gameSettings.getPlayerSettings(true);
        let p2Settings = gameSettings.getPlayerSettings(false);

        gameboard.reset();
        displayController.reset(false);


        if (p1Settings.isBot) {
            playerOne.play();
        }

        if (!p1Settings.isBot || !p2Settings.isBot)
            displayController.setUpListeners();
    }

    // Return true if the given cell lands on a winning line - intended to be called after a move is made as it checks for a win based on whose turn it is
    const checkWin = (row, col) => {
        let winner = false;


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
            processWin();
        }

        if (turnNumber == 9 && !winner) {
            displayController.displayResultMessage(true);
            winner = undefined;
        }

        return winner
    }

    const processWin = () => {

        if (playerOnesTurn)
            scores['p1Score']++;
        else
            scores['p2Score']++;
        
        displayController.updateScore();
        displayController.displayResultMessage(false);
        displayController.setUpListeners(true);
        
    }

    initialize();

    return {initialize, newRound, getPlayerOnesTurn, toggleTurn, checkWin, incrTurnNum, getScores}

})();




