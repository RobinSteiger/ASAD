import WebSocket, { WebSocketServer } from 'ws';
import { handleBet } from './services/betService.js';
import { startTimer } from './services/timerService.js';
import { handleSpin } from './services/spinService.js';
import { handlePayout } from './services/payoutService.js';
import { gameState, updateConnections } from './repository/gameStateRepository.js';

const wss = new WebSocketServer({ port: 8080 });
console.log('WebSocket server running on ws://localhost:8080');

// Broadcast helper
function broadcastGameState() {
    const payload = JSON.stringify({ type: 'GAME_STATE', data: gameState });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

// On connection
wss.on('connection', (ws) => {
    console.log('New client connected');
    updateConnections(ws);

    // Send initial state
    ws.send(JSON.stringify({ type: 'GAME_STATE', data: gameState }));

    ws.on('message', (message) => {
        const msg = JSON.parse(message);

        switch(msg.type) {
            case 'POST_BET':
                handleBet(msg.data);
                broadcastGameState();
                ws.send(JSON.stringify({ type: 'BET_CONFIRMED', data: msg.data }));
                break;
            case 'GET_GAME_STATE':
                ws.send(JSON.stringify({ type: 'GAME_STATE', data: gameState }));
                break;
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        gameState.connections = gameState.connections.filter(c => c !== ws);
    });
});

// Timer for spin
startTimer(() => {
    handleSpin();
    handlePayout();
    broadcastGameState();
});