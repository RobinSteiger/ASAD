import WebSocket from 'ws';
import * as UI from './ui.js';

// Initialiser l'UI
const { screen, gridBox } = UI.initUI();

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('Connected to server');

    // Demander le game state
    ws.send(JSON.stringify({ type: 'GET_GAME_STATE' }));

    // Exemple de mise automatique
    ws.send(JSON.stringify({
        type: 'POST_BET',
        data: { userId: 'player1', number: Math.floor(Math.random() * 37), amount: 10 }
    }));
});

ws.on('message', (message) => {
    const msg = JSON.parse(message);

    if (msg.type === 'GAME_STATE') {
        UI.updateGrid(gridBox, msg.data);
        screen.render();
    } else if (msg.type === 'BET_CONFIRMED') {
        // on peut afficher un petit message si on veut
    }
});

// Quitter avec Q ou Ctrl+C
screen.key(['q', 'C-c'], () => process.exit(0));