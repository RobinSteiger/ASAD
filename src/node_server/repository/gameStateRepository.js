export const gameState = {
    tableState: [], // list of bets
    rngResult: null, 
    connections: [],
    users: {} // { userId: balance }
};

export function updateConnections(ws) {
    gameState.connections.push(ws);
}

export function addBet(bet) {
    gameState.tableState.push(bet);
    if (!gameState.users[bet.userId]) gameState.users[bet.userId] = 1000;
}