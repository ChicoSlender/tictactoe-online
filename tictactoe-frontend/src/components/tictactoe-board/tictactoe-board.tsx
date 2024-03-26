import { useState } from 'react';
import './tictactoe-board.css';

const crossEmoji = '❌';
const circleEmoji = '⭕';

export default function TictactoeBoard() {
    const [ wea, setWea ] = useState('');

    const onClickRandom: React.MouseEventHandler<HTMLSpanElement> = (e) => {
        if (wea == '') {
            setWea(circleEmoji);
        }
        else {
            setWea('');
        }
    };

    return (
    <div className='board'>
        <span className="board-cell">
            <span>{crossEmoji}</span>
        </span>
        <span className="board-cell" onClick={onClickRandom}>
            <span>{wea}</span>
        </span>
        <span className="board-cell">
            <span>{circleEmoji}</span>
        </span>
        <span className="board-cell">
            <span>{crossEmoji}</span>
        </span>
        <span className="board-cell">
            <span>{circleEmoji}</span>
        </span>
        <span className="board-cell">
            <span></span>
        </span>
        <span className="board-cell">
            <span>{crossEmoji}</span>
        </span>
        <span className="board-cell">
            <span></span>
        </span>
        <span className="board-cell">
            <span></span>
        </span>
    </div>
    );
}