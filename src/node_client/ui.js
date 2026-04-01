import blessed from 'blessed';

// Initialiser l'écran et la grille
export function initUI() {
    const screen = blessed.screen({
        smartCSR: true,
        title: 'Roulette Node Client'
    });

    const gridBox = blessed.box({
        top: 'center',
        left: 'center',
        width: 50,
        height: 20,
        border: { type: 'line' },
        tags: true,
        content: ''
    });

    screen.append(gridBox);
    screen.render();

    return { screen, gridBox };
}

// Mettre à jour la grille
export function updateGrid(gridBox, gameState) {
    let content = '';

    for (let i = 0; i <= 36; i++) {
        let color = '{green-fg}';
        if (i === 0) color = '{green-fg}';
        else if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(i)) color = '{red-fg}';
        else color = '{black-fg}';

        let cell = `${color}${i}{/}`;

        // Vérifier si une mise est dessus
        if (gameState.tableState?.some(bet => bet.number === i)) {
            cell = `{yellow-bg}${cell}{/}`;
        }

        content += cell.padEnd(6, ' ');

        if (i % 12 === 11) content += '\n';
    }

    gridBox.setContent(content);

    // Mettre en évidence le numéro gagnant
    if (gameState.rngResult !== null) {
        highlightWinning(gridBox, gameState.rngResult);
    }
}

// Surbrillance numéro gagnant
export function highlightWinning(gridBox, number) {
    const lines = gridBox.getContent().split('\n');
    for (let y = 0; y < lines.length; y++) {
        const regex = new RegExp(`\\b${number}\\b`);
        if (regex.test(lines[y])) {
            lines[y] = lines[y].replace(regex, `{blue-bg}{white-fg}${number}{/}`);
        }
    }
    gridBox.setContent(lines.join('\n'));
}