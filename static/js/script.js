// JavaScript to create a 5x11 grid of circles
document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('circleGrid');
    const rows = 5;
    const cols = 11;

    for (let i = 0; i < rows * cols; i++) {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        gridContainer.appendChild(circle);
    }
});
