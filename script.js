const gameboard = ( () => {
    let board = [
                    [undefined, undefined, undefined], 
                    [undefined, undefined, undefined], 
                    [undefined, undefined, undefined]
                ];

    const update = (row, col, isX) => {
        board[row][col] = isX;

        console.log({row, col, board})

        return board;
    }

    const getBoard = () => board;

    const getCell = (row, col) => board[row][col]; 

    const reset = () => {
        board = [
            [undefined, undefined, undefined], 
            [undefined, undefined, undefined], 
            [undefined, undefined, undefined]
        ];
    }

    return {
        update,
        getBoard,
        getCell,
        reset,
    }
    
})();

const displayController = ( () => {

    const initializeBoard = () => {

        let cells = document.querySelector('.grid').children;
        let row, col;

        for (let i = 0; i < cells.length; i++) {

           cells[i].addEventListener('click', () => {
            
                row = Math.floor(i / 3);
                col = i % 3;

                gameboard.update(row, col, game.getTurn());
                updateDisplay();
                game.checkWin(row, col);
           })

        }

        // So this function may be used to "reset" the board visually
        updateDisplay();
    }


    // Private method which sets the UI grid based on the value of the current state of the board
    const updateDisplay = () => {

        let cells =  document.querySelector('.grid').children;
        let row, col;
        let cellValue;

        for (let i = 0; i < cells.length; i++) {

            row = Math.floor(i / 3);
            col = i % 3;

            cellValue = gameboard.getCell(row, col);

            if (cellValue != undefined) 
                cells[i].textContent = (cellValue) ? 'X' : 'O';

            else
                cells[i].textContent = "";
            

        }
        
    };

    return {
        initializeBoard
    }


} )();

const playerFactory = (name, isPlayerOne) => {
    return {name, isPlayerOne};
}

const game = (() => {

    let playerOnesTurn;
    let turnCount


    const getTurn = () => playerOnesTurn;

    const toggleTurn = () => playerOnesTurn = !playerOnesTurn;
    
    const initialize = () => {
        playerOnesTurn = true;
        turnCount = 1;
        gameboard.reset();
        displayController.initializeBoard();
    }

    const checkWin = (row, col) => {

        // Can't win with less than 5 moves
        if (turnCount >= 5) {

            // Check row of the move
            for (let i = 0; i < 3; i++) {
                if (gameboard.getCell(row, i) != playerOnesTurn) {
                    break;
                }

                if (i == 2) 
                    reportWin()
            }

            // Check row of the move
            for (let i = 0; i < 3; i++) {
                if (gameboard.getCell(i, col) != playerOnesTurn) {
                    break;
                }

                if (i == 2) 
                    reportWin()
            }

            // Check diagonals
            if (row === col) {
                for (let i = 0; i < 3; i++) {

                    if (gameboard.getCell(i, i) != playerOnesTurn)
                        break;

                    if (i == 2) {
                        reportWin()
                    }

                }
            }

            if (row + col === 2) {

                for (let i = 0; i < 3; i++) {
                    if (gameboard.getCell(i, 2 - i) != playerOnesTurn) {
                        break;
                    }

                    if (i == 2) {
                        reportWin() 
                    }
                }

            }
        }

        // if (turnCount == )

        turnCount++;

        // Toggle turn
        toggleTurn();

    }

    const reportWin = () => {

        let message = document.querySelector('.message');

        message.style.visibility = 'visible'

        message.textContent = `Player ${playerOnesTurn ? '1':'2'} wins!`;


    }

    return { initialize, checkWin, getTurn }
})();
