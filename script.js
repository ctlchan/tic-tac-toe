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

    const reset = () => {
        updateDisplay()
        setUpListeners();
    }

    const setUpListeners = () => {
        for (let i = 0; i < 9; i++) {
            grid[i].addEventListener('click', _makeMove);
        }
    }

    const _makeMove = (e) => {
        let i = e.target.dataset.index;

        let row = Math.floor(i / 3);
        let col = i % 3;

        gameboard.setCell(row, col, true); // TODO: update THIS to make move based on whose turn it is
        updateDisplay();
        e.target.removeEventListener('click', _makeMove);
    }

    return {grid, reset}
})();

const game = (() => {

    const initialize = () => {
        gameboard.reset();
        displayController.reset();
    }

    initialize();

    return {initialize}

})()

