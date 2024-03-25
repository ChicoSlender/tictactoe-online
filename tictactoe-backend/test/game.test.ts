import { Game, PlayerEnum } from "../src/app/game/game";
import { expect, test, describe } from '@jest/globals';

const emptyBoard = [[null, null, null],
                    [null, null, null],
                    [null, null, null]];

const exampleBoard1 = [[null, null,                 null],
                       [null, PlayerEnum.PlayerOne, null],
                       [null, null,                 null]];

const exampleBoard2 = [[null, null,                 null],
                       [null, PlayerEnum.PlayerOne, null],
                       [null, null,                 PlayerEnum.PlayerTwo]];

describe('game board state', () => {
    test('game board should start empty', () => {
        const game = new Game();
    
        expect(game.getBoardState()).toEqual(emptyBoard);
    });

    test('game board should update after plays are done', () => {
        const game = new Game();

        game.makePlay(1, 1, 1);
    
        expect(game.getBoardState()).toEqual(exampleBoard1);

        game.makePlay(2, 2, 2);

        expect(game.getBoardState()).toEqual(exampleBoard2);
    });

    test('game board should NOT change after an invalid move', () => {
        const game = new Game();

        game.makePlay(1,1,1);

        const currentState = game.getBoardState();

        game.makePlay(1,0,0); // Play outside player turn

        expect(game.getBoardState()).toEqual(currentState);

        game.makePlay(2,1,1); // Try mark already marked cell

        expect(game.getBoardState()).toEqual(currentState);
        
        game.makePlay(2,3,2); // Try mark invalid index

        expect(game.getBoardState()).toEqual(currentState);
    });
});

describe('game turns', () => {
    test('initial turn should be for player one', () => {
        const game = new Game();

        expect(game.isPlayerTurn(PlayerEnum.PlayerOne)).toBe(true);
    });

    test('turn should change between player one and two after valid plays', () => {
        const game = new Game();

        game.makePlay(1, 0, 0);

        expect(game.isPlayerTurn(PlayerEnum.PlayerOne)).toBe(false);
        expect(game.isPlayerTurn(PlayerEnum.PlayerTwo)).toBe(true);

        game.makePlay(2, 1, 1);

        expect(game.isPlayerTurn(PlayerEnum.PlayerOne)).toBe(true);
    });

    test('turn should not change after an invalid play', () => {
        const game = new Game();

        game.makePlay(1, 2, 4); // Invalid index

        expect(game.isPlayerTurn(PlayerEnum.PlayerTwo)).toBe(false);

        game.makePlay(2, 1, 1); // Play outside turn

        expect(game.isPlayerTurn(PlayerEnum.PlayerOne)).toBe(true);

        game.makePlay(1, 0, 0); // Valid play

        expect(game.isPlayerTurn(PlayerEnum.PlayerTwo)).toBe(true);
    });
});

describe('game winner', () => {
    test('game should start with no winner', () => {
        const game = new Game();

        expect(game.hasWinner()).toBe(false);
        expect(game.getWinner()).toBeNull();
    });

    test('game should only have a winner on a winner position', () => {
        const game = new Game();

        game.makePlay(1, 0, 0);
        game.makePlay(2, 1, 0);
        game.makePlay(1, 2, 0);
        game.makePlay(2, 1, 1);
        game.makePlay(1, 2, 2);

        expect(game.hasWinner()).toBe(false);

        game.makePlay(2, 1, 2); // Winner move

        expect(game.hasWinner()).toBe(true);
        expect(game.getWinner()).toEqual(PlayerEnum.PlayerTwo);
    });

    test('nor board state nor winner should change after a winner is first determined', () => {
        const game = new Game();

        game.makePlay(1, 0, 0);
        game.makePlay(2, 1, 0);
        game.makePlay(1, 2, 0);
        game.makePlay(2, 1, 1);
        game.makePlay(1, 2, 2);
        game.makePlay(2, 1, 2); // Winner move

        const currentBoardState = game.getBoardState();

        game.makePlay(1, 2, 1); // What should be a winner move for player 1 if he was still allowed to play and win

        expect(game.hasWinner()).toBe(true);
        expect(game.getWinner()).toEqual(PlayerEnum.PlayerTwo);

        expect(game.getBoardState()).toEqual(currentBoardState);
    });
});