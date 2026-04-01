import WebSocket, { WebSocketServer } from 'ws';
import { gameState } from './repository/gameState.js';
import { handleBet } from './services/betService.js';
import { startTimer } from './services/timerService.js';
import { handleSpin } from './services/spinService.js';
import { handlePayout } from './services/payoutService.js';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Player connected');
    gameState.connections.push(ws);

    // Send initial game state
    // Display (graphical interface) in the client 
    ws.send(JSON.stringify({ type: 'GAME_STATE', data: gameState }));

    ws.on('message', (message) => {
        const msg = JSON.parse(message);
        switch(msg.type) {
            case 'PUT_BET':
            case 'POST_BET':
                handleBet(msg.data, ws);
                break;
            case 'GET_GAME_STATE':
                ws.send(JSON.stringify({ type: 'GAME_STATE', data: gameState }));
                break;
            default:
                console.log('Unknown message type', msg.type);
        }
    });

    ws.on('close', () => {
        gameState.connections = gameState.connections.filter(c => c !== ws);
        console.log('Player disconnected');
    });
});

// Start game timer
startTimer();