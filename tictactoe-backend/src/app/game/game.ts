export enum PlayerEnum {
    PlayerOne = 1,
    PlayerTwo = 2,
}

const valuesInSequenceToWin = 3;

export type GameBoardValue = PlayerEnum | null;
export type GameBoard = GameBoardValue[][];

export class Game {

    private board: GameBoard = [[null, null, null],
                                [null, null, null],
                                [null, null, null]];

    private currentPlayerTurn: PlayerEnum = PlayerEnum.PlayerOne;

    private winner: PlayerEnum | null = null;

    public isPlayerTurn(player: PlayerEnum): boolean {
        return this.currentPlayerTurn === player;
    }

    public makePlay(player: PlayerEnum, row: number, col: number): boolean {
        if (this.hasWinner()) {
            return false;
        }

        if (!this.isPlayerTurn(player)) {
            return false;
        }

        if (!this.boardIndexIsValid(row, col)) {
            return false;
        }

        const indexedBoardValue = this.board[row][col];

        if (indexedBoardValue !== null) {
            return false;
        }

        this.board[row][col] = player;

        this.checkForWinner();
        
        this.changeTurn();

        return true;
    }

    public hasWinner() {
        return this.winner !== null;
    }

    public getWinner() {
        return this.winner;
    }

    public getBoardState(): GameBoard {
        return structuredClone(this.board);
    }

    public toString() {
        const rowsStr = [];

        for (const row of this.board) {
            rowsStr.push('|' + row.map(this.mapBoardValueToStr).join('|') + '|');
        }

        return rowsStr.join('\n');
    }

    private mapBoardValueToStr(value: GameBoardValue) {
        switch (value) {
            case null: return ' ';
            case PlayerEnum.PlayerOne: return 'X';
            case PlayerEnum.PlayerTwo: return 'O';
        }
    }

    private changeTurn() {
        if (this.currentPlayerTurn === PlayerEnum.PlayerOne) {
            this.currentPlayerTurn = PlayerEnum.PlayerTwo;
        }
        else {
            this.currentPlayerTurn = PlayerEnum.PlayerOne;
        }
    }

    private boardIndexIsValid(row: number, col: number)
    {
        if (row < 0 || row >= this.board.length) {
            return false;
        }

        return col >= 0 && col < this.board[row].length;
    }

    private checkForWinner() {
        if (this.winner !== null) {
            return;
        }

        if (this.checkIfPlayerWon(this.currentPlayerTurn)) {
            this.winner = this.currentPlayerTurn;
        }
    }

    private checkIfPlayerWon(playerToCheck: PlayerEnum): boolean
    {
        for (let i = 0; i < this.board.length; i++) {
            let valuesInRow = 0;
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] !== playerToCheck) {
                    break;
                }

                valuesInRow++;
            }
            if (valuesInRow >= valuesInSequenceToWin) {
                return true;
            }
        }

        for (let j = 0; j < this.board[0].length; j++) {
            let valuesInColumn = 0;
            for (let i = 0; i < this.board.length; i++) {
                if (this.board[i][j] !== playerToCheck) {
                    break;
                }

                valuesInColumn++;
            }
            if (valuesInColumn >= valuesInSequenceToWin) {
                return true;
            }
        }

        let valuesInDiagonal = 0;
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i][i] !== playerToCheck) {
                break;
            }

            valuesInDiagonal++;
        }

        if (valuesInDiagonal >= valuesInSequenceToWin) {
            return true;
        }

        let valuesInReverseDiagonal = 0;
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i][this.board.length - i - 1] !== playerToCheck) {
                break;
            }

            valuesInReverseDiagonal++;
        }

        if (valuesInReverseDiagonal >= valuesInSequenceToWin) {
            return true;
        }

        return false;
    }
}