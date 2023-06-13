window.addEventListener("load", (event) => {
    minesweeper.init()
});

const minesweeper = {
    startTime: 0,
    logic: null,
    openedCells: 0,
    placedFlags: 0,

    gameTypes: [
        {name: 'small', size: 9, mines: 10},
        {name: 'medium', size: 16, mines: 40},
        {name: 'large', size: 24, mines: 150}
    ],

    init() {
        this.logic = localLogic
        this.blocksGenerator();
        this.newGame("small");
    },

    blocksGenerator() {
        const myBody = document.body;
        const createContent = document.createElement('div');
        createContent.classList.add('content');
        myBody.appendChild(createContent);

        //builds the header
        createContent.appendChild(this.buildHeader());

        //builds the playfield not the cells
        createContent.appendChild(this.buildPlayfield());

        //builds the buttonbar
        createContent.appendChild(this.buildButtonbar());

        //builds the footer
        createContent.appendChild(this.buildFooter());
    },

    buildHeader() {
        const myHeader = document.createElement('header');

        const heading1 = document.createElement('h1');
        heading1.innerText = "Minesweeper";
        myHeader.appendChild(heading1);

        const heading2 = document.createElement('h2');
        heading2.innerText = "by sheg0";
        myHeader.appendChild(heading2);

        return myHeader;
    },

    buildPlayfield() {
        const myPlayfield = document.createElement('div');
        myPlayfield.id = "playfield";

        return myPlayfield;
    },

    buildButtonbar() {
        const myButtonbar = document.createElement('div');
        myButtonbar.id = "buttonbar";

        const smallButton = this.buildSingleButton("small", "smallbutton");
        const mediumButton = this.buildSingleButton("medium", "mediumbutton");
        const largeButton = this.buildSingleButton("large", "largebutton");

        smallButton.addEventListener("click", () => {
            this.newGame("small")
        });
        mediumButton.addEventListener("click", () => {
            this.newGame("medium")
        });
        largeButton.addEventListener("click", () => {
            this.newGame("large")
        });

        myButtonbar.appendChild(smallButton);
        myButtonbar.appendChild(mediumButton);
        myButtonbar.appendChild(largeButton);

        return myButtonbar;
    },

    buildSingleButton(text, buttonID) {
        const button = document.createElement('button');
        button.innerText = text;

        button.id = buttonID;

        return button;
    },

    buildFooter() {
        const myFooter = document.createElement('footer');
        myFooter.innerHTML = "&#169; 2026 by Esra Balci";

        return myFooter;
    },

    clearPlayfield() {
        const playfield = document.querySelector("#playfield");
        playfield.innerHTML = '';

        for (let row = 0; row < this.logic.size; row++) {
            for (let column = 0; column < this.logic.size; column++) {
                playfield.appendChild(this.generateCell(row, column));
            }
        }
    },

    generateCell(row, column) {
        const myCell = document.createElement('div');
        myCell.classList.add('cell', 'covered');
        myCell.dataset.x = column;
        myCell.dataset.y = row;

        const style = `calc(100% / ${this.logic.size} - 8px)`;
        myCell.style.width = style;
        myCell.style.height = style;


        myCell.addEventListener('click', (evt) => {
            this.cellClicked(evt)
        });
        myCell.addEventListener('contextmenu', (evt) => {
            this.cellRightClicked(evt)
        });

        myCell.addEventListener('touchstart', (evt) => {
            this.touchstartClicked(evt)
        });
        myCell.addEventListener('touchend', (evt) => {
            this.touchendClicked(evt)
        });

        return myCell;
    },

    newGame(gameType) {
        this.logic.init(gameType)
        this.clearPlayfield(this.gameTypes.find(elem => elem.name === gameType).size)
        this.openedCells = 0;
        this.placedFlags = 0;
    },

    openCell(y, x) {
        this.logic.sweep(y, x)
        this.getCell(y, x).classList.remove('covered')
        this.placeSymbol(y, x)

        if (this.logic.CountMinesAround(y, x) === 0) {
            this.logic.OpenEmptyCells(y, x)
        }
    },

    openAllMines() {
        for (let i = 0; i < this.logic.size; i++) {
            for (let j = 0; j < this.logic.size; j++) {
                if (this.logic.field[i][j]) {
                    this.openCell(i, j);
                }
            }
        }
    },

    getCell(y, x) {
        return document.querySelector('[data-y="' + y + '"][data-x="' + x + '"]');
    },

    placeSymbol(y, x) {
        const myCell = this.getCell(y, x)

        if (this.logic.isMine(y, x)) {
            myCell.classList.add("symbolbomb")
        } else {
            let mySymbol = "symbol" + this.logic.minelogic(y, x)
            myCell.classList.add(mySymbol)
        }
    },

    cellClicked(evt) {
        evt.preventDefault();
        let xPos = parseInt(evt.target.dataset.x);
        let yPos = parseInt(evt.target.dataset.y);

        if (!(this.getCell(yPos, xPos).classList.contains("symbolflag"))) {
            this.openCell(yPos, xPos);
            this.openedCells++;
            if (this.logic.isMine(yPos, xPos)) {
                this.getCell(yPos, xPos).classList.add("symbolhitbomb");
                this.openAllMines();
                this.generatePopup(false);
            }
        }
        this.isGameOver();
    },

    cellRightClicked(evt) {
        evt.preventDefault();
        let xPos = evt.target.dataset.x;
        let yPos = evt.target.dataset.y;

        let maxFlagCount = this.logic.mineCount;

        if (this.placedFlags < maxFlagCount && !(this.getCell(yPos, xPos).classList.contains("symbolflag")) && this.getCell(yPos, xPos).classList.contains("covered")) {
            this.getCell(yPos, xPos).classList.add("symbolflag")
            this.placedFlags++;
        } else if (this.getCell(yPos, xPos).classList.contains("symbolflag")) {
            this.getCell(yPos, xPos).classList.remove("symbolflag")
            this.placedFlags--;
        } else if (this.getCell(yPos, xPos).classList.contains("covered")) {
            alert("There are only " + this.logic.mineCount + " mines");
        }

        this.isGameOver();
    },

    isGameOver() {
        if (this.placedFlags === this.logic.mineCount && this.openedCells === (((this.logic.size) ** 2) - this.logic.mineCount)) {
            this.generatePopup(true)
        }
    },

    generatePopup(hasPlayerWon) {
        if (document.querySelector("div.popup") !== null) {
            document.getElementById("playfield").removeChild(document.querySelector("div.popup"));
        }
        let popup = document.createElement("div");
        popup.classList.add("popup");

        let popupText = document.createElement("div");
        popupText.classList.add("popupText");
        hasPlayerWon ? popupText.innerHTML = "You won 🎊" : popupText.innerHTML = "You lose 👽";

        popup.appendChild(popupText);
        document.getElementById("playfield").appendChild(popup);

        popup.style.display = "flex";
    },

    touchstartClicked(evt) {
        evt.preventDefault();
        this.startTime = new Date().getTime();
    },

    touchendClicked(evt) {
        evt.preventDefault();
        const end = new Date().getTime() - this.startTime;
        end <= 500 ? this.cellClicked(evt) : this.cellRightClicked(evt);
    },

};

const localLogic = {
    minesweeper: minesweeper,
    moveCounter: 0,

    init(gameType) {
        this.moveCounter = 0;
        this.size = this.minesweeper.gameTypes.find(elem => elem.name === gameType).size;
        this.mineCount = this.minesweeper.gameTypes.find(elem => elem.name === gameType).mines;
        this.field = [];

        for (let i = 0; i < this.size; i++) {
            let column = [];

            for (let y = 0; y < this.size; y++) {
                column.push(false);
            }
            this.field.push(column);
        }
    },

    placeSingleMine(y, x) {
        while (true) {
            const tryX = Math.floor(Math.random() * (this.size));
            const tryY = Math.floor(Math.random() * (this.size));

            if (!(x === tryX && y === tryY || this.field[tryY][tryX])) {
                this.field[tryY][tryX] = true;
                return;
            }
        }
    },

    isMine(y, x) {
        return this.field[y][x]
    },

    AccessSafe(y, x) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            return false
        } else {
            return this.field[y][x]
        }
    },

    CountMinesAround(y, x) {
        let mineCount = 0;
        for (let deltaX = -1; deltaX <= 1; deltaX++) {
            for (let deltaY = -1; deltaY <= 1; deltaY++) {
                if (this.AccessSafe(y + deltaY, x + deltaX)) {
                    mineCount++;
                }
            }
        }
        return mineCount;
    },

    OpenEmptyCells(y, x) {
        const neighbors = this.getNeighorsCells(y, x)
        for (let i = 0; i < neighbors.length; i++) {
            if (this.minesweeper.getCell(neighbors[i].y, neighbors[i].x).classList.contains("covered")) {
                this.minesweeper.openCell(neighbors[i].y, neighbors[i].x)
                this.minesweeper.openedCells++;
            }
        }
    },

    getNeighorsCells(y, x) {
        const cells = []
        for (let i = y - 1; i <= y + 1; i++) {
            for (let j = x - 1; j <= x + 1; j++) {
                if (i >= 0 && i < this.size && j >= 0 && j < this.size && !(i === y && j === x)) {
                    cells.push({y: i, x: j})
                }
            }
        }
        return cells
    },

    sweep(y, x) {
        if (this.moveCounter === 0) {
            for (let i = 0; i < this.mineCount; i++) {
                this.placeSingleMine(y, x)
            }
        }
        this.moveCounter++;
    },

    minelogic(y, x) {
        if (!this.isMine(y, x)) {
            return this.CountMinesAround(y, x);
        }
    },
}
