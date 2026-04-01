export function startTimer(onSpin) {
    const spinInterval = 10000; // 10 secondes pour tester
    setInterval(() => {
        onSpin();
    }, spinInterval);
}