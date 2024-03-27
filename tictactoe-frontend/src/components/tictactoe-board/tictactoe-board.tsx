import './tictactoe-board.css';
import { BoardState, PlayerEnum } from './tictactoe-types';

const crossEmoji = '❌';
const circleEmoji = '⭕';

type TictactoeBoardProps = {
    boardValue: BoardState,
    onBoardCellClicked: (row: number, col: number) => void,
    winner: PlayerEnum | null,
    turn: PlayerEnum,
};

export default function TictactoeBoard({boardValue, onBoardCellClicked, winner, turn}: TictactoeBoardProps) {
    const getTurnString = (turn: PlayerEnum) => {
        return turn === PlayerEnum.Me ? 'Is your turn' : 'Is other player turn';
    };

    const getWinnerString = (winner: PlayerEnum) => {
        return winner === PlayerEnum.Me ? 'You win' : 'You lose';
    }
    
    const boardCells = boardValue.flatMap((row, i) => row.map((el, j) => {
        return (
            <span className="board-cell" onClick={() => onBoardCellClicked(i, j)}>
                <span>
                    {el === null ? '' :
                    (el === PlayerEnum.Me) ? crossEmoji : circleEmoji}
                </span>
            </span>
        )
    }));

    return (
        <div className='game-container'>
            <div className='board'>
                {...boardCells}
            </div>
            <div className='game-text'>{winner !== null ? getWinnerString(winner) : getTurnString(turn)}</div>
        </div>
    );
}