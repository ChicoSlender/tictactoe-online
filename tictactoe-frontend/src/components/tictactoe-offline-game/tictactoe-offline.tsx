import { useState } from "react";
import { BoardState, PlayerEnum } from "../tictactoe-board/tictactoe-types";
import TictactoeBoard from "../tictactoe-board/tictactoe-board";

const emptyBoard: BoardState = [[null, null, null],
                                [null, null, null],
                                [null, null, null]];

export default function TictactoeOfflineGame() {
    const [board, setBoard] = useState(emptyBoard);
    const [turn, setTurn] = useState(PlayerEnum.Me);

    const onBoardCellClicked = (row: number, col: number): void => {
        if (board[row][col] !== null) {
            return;
        }

        const newBoard = structuredClone(board);
        newBoard[row][col] = turn;
        setBoard(newBoard);

        const nextTurn = turn === PlayerEnum.Me ? PlayerEnum.Other : PlayerEnum.Me;
        setTurn(nextTurn);
    }

    return (
        <>
            <TictactoeBoard boardValue={board} onBoardCellClicked={onBoardCellClicked} winner={null} turn={turn}/>
        </>
    );
}