import crypto from 'crypto';
import { EventEmitter } from 'stream';
import { Game, PlayerEnum } from './game';
import ws from 'ws';

const userWebsockets = new Map<string, ws.WebSocket>();

enum GameServerMessageType {
    START = 'Start',
    INVALID_ACTION = 'InvalidAction',
    UPDATE = 'Update',
    SEARCHING = 'Searching',
}

type GameServerMessage = {
    type: GameServerMessageType,
    data?: unknown,
};

enum GameClientMessageType {
    SEARCH_MATCH = 'SearchMatch',
    MOVE = 'Move',
}

type GameClientData = {
    playerId: string,
    col: number,
    row: number,
};

type GameClientMessage = {
    type: GameClientMessageType,
    data?: GameClientData | unknown,
};

function isGameClientMessage(obj: object): obj is GameClientMessage {
    return 'type' in obj && typeof obj.type === 'string';
}

function isGameClientData(obj: object): obj is GameClientData {
    const hasPlayerId = 'playerId' in obj && typeof obj.playerId === 'string';
    const hasCol = 'col' in obj && typeof obj.col === 'number';
    const hasRow = 'row' in obj && typeof obj.row === 'number';

    return hasPlayerId && hasCol && hasRow;
}

const gameStartMessage: GameServerMessage = {
    type: GameServerMessageType.START
};

const invalidPlayMessage: GameServerMessage = {
    type: GameServerMessageType.INVALID_ACTION
};

class MatchmakingQueue extends EventEmitter {
    private queue: string[] = [];

    public add(userId: string) {
        this.queue.push(userId);

        this.tryToPairUsersInQueue();
    }

    private tryToPairUsersInQueue() {
        if (this.queue.length < 2) {
            return;
        }

        const firstUser = this.queue.shift();
        const secondUser = this.queue.shift();

        this.emit('paired', firstUser, secondUser);
    }
}

type MatchInfo = {
    game: Game;
    firstPlayer: string;
    secondPlayer: string;
};

class MatchManager extends EventEmitter {
    private matchs = new Map<string, MatchInfo>();
    private playerToMatch = new Map<string, string>();

    public createMatch(firstPlayer: string, secondPlayer: string) {
        const newMatch: MatchInfo = {
            game: new Game(),
            firstPlayer: firstPlayer,
            secondPlayer: secondPlayer
        };

        const newMatchId = `match-${crypto.randomUUID()}`;

        this.matchs.set(newMatchId, newMatch);

        this.playerToMatch.set(firstPlayer, newMatchId);
        this.playerToMatch.set(secondPlayer, newMatchId);
    }

    public makePlayInMatch(player: string, row: number, col: number) {
        const match = this.getMatchForPlayer(player);

        if (match === undefined) {
            return;
        }

        const playerEnum = player === match.firstPlayer ? PlayerEnum.PlayerOne : PlayerEnum.PlayerTwo;

        const wasValidPlay = match.game.makePlay(playerEnum, row, col);

        if (!wasValidPlay) {
            this.emit('invalidPlay', player);
        }

        const boardState = match.game.getBoardState();
        const isPlayerTurn = match.game.isPlayerTurn(playerEnum);
        const isPlayerWinner = match.game.hasWinner() ? match.game.getWinner() === playerEnum : undefined;

        return {boardState, isPlayerTurn, isPlayerWinner};
    }

    private getMatchForPlayer(player: string) {
        const matchId = this.playerToMatch.get(player);

        if (matchId === undefined) {
            return undefined;
        }

        return this.matchs.get(matchId);
    }
}

const matchmakingQueue = new MatchmakingQueue();
matchmakingQueue.on('paired', onUsersPaired);

const matchManager = new MatchManager();
matchManager.on('invalidPlay', onUserInvalidPlay);

function onUsersPaired(firstUserId: string, secondUserId: string) {
    matchManager.createMatch(firstUserId, secondUserId);

    sendMessageToPlayer(firstUserId, gameStartMessage);
    sendMessageToPlayer(secondUserId, gameStartMessage);
}

function onUserInvalidPlay(userId: string) {
    sendMessageToPlayer(userId, invalidPlayMessage);
}

function sendMessageToPlayer(playerId: string, message: GameServerMessage) {
    const ws = userWebsockets.get(playerId);

    if (!ws) {
        return;
    }

    ws.send(JSON.stringify(message));
}

export function receiveWebsocketMessage(ws: ws.WebSocket, message: unknown) {
    if (!message || !isGameClientMessage(message)) {
        return;
    }

    if (message.type === GameClientMessageType.SEARCH_MATCH) {
        addUserToMatchmaking(ws);
    }
    else if (message.type === GameClientMessageType.MOVE) {
        if (!message.data || !isGameClientData(message.data)) {
            return;
        }

        const { playerId, col, row } = message.data;

        makePlayForUser(playerId, row, col);
    }
}

function addUserToMatchmaking(userWs: ws.WebSocket) {
    const userId = `user-${crypto.randomUUID()}`;

    userWebsockets.set(userId, userWs);

    const searchingMessage: GameServerMessage = {
        type: GameServerMessageType.SEARCHING,
        data: {userId: userId}
    };

    userWs.send(JSON.stringify(searchingMessage));

    matchmakingQueue.add(userId);
}

function makePlayForUser(userId: string, row: number, col: number) {
    const result = matchManager.makePlayInMatch(userId, row, col);

    if (!result) {
        return;
    }

    const updateMessage: GameServerMessage = {
        type: GameServerMessageType.UPDATE,
        data: result,
    };

    sendMessageToPlayer(userId, updateMessage);
}