import express from 'express';
import { WebSocketServer } from 'ws';
import url from 'url';
import { AddressInfo } from 'net';
import crypto from 'crypto';
import { receiveWebsocketMessage } from './game/game.controller';

const app = express();

const httpServer = app.listen(4040, () => {
    console.log('HTTP server listening on port 4040');
});

const wss = new WebSocketServer({noServer: true});

wss.on('connection', (ws, req) => {
    ws.on('error', console.error);

    const address = req.socket.address() as AddressInfo;

    console.log('connected from ' + address.address);

    ws.on('message', (data, isBinary) => {
        try {
            const jsonData = JSON.parse(data.toString());
            receiveWebsocketMessage(ws, jsonData);
        } catch (error) {
            ws.send(JSON.stringify({'error': 'invalid message'}));            
        }
    });
});

httpServer.on('upgrade', (req, socket, head) => {
    if (req.url === undefined) {
        return;
    }

    const { pathname } = url.parse(req.url, false);

    if (pathname === '/gameSocket') {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    }
    else {
        socket.destroy();
    }
});