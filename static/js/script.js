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

const shapes = [
    {
        color: '#ef4444',
        pattern: [
            [1, 1, 1],
            [1, 0, 1]
        ]
    },
    {
        color: '#ec4899',
        pattern: [
            [0, 0, 1, 1],
            [1, 1, 1, 0]
        ]
    },
    {
        color: '#f9a8d4',
        pattern: [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 1]
        ]
    },
    {
        color: '#60a5fa',
        pattern: [ 
            [0, 1, 0],
            [1, 1, 1]
        ]
    },
    {
        color: '#facc15',
        pattern: [
            [0, 1, 0, 0],
            [1, 1, 1, 1]
        ]
    },
    {
        color: '#a855f7',
        pattern: [
            [0, 1, 1],
            [1, 1, 1]
        ]
    },
    {
        color: '#6b21a8',
        pattern: [
            [0, 1, 1],
            [1, 1, 0]
        ]
    },
    {
        color: '#6CC24A',
        pattern: [
            [1, 1],
            [1, 0],
            [1, 0]
        ]
    },
    {
        color: '#f97316',
        pattern: [
            [1, 1, 1],
            [0, 0, 1],
            [0, 0, 1]
        ]
    },
    {
        color: '#22c55e',
        pattern: [
            [1, 0, 0, 0],
            [1, 1, 1, 1]
        ]
    },
    {
        color: '#eab308',
        pattern: [
            [1, 0],
            [1, 1]
        ]
    },
    {
        color: '#7EC8E3',
        pattern: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 1]
        ]
    }
];

const container = document.getElementById('puzzleContainer');

function createShape(color, pattern) {
    const shapeDiv = document.createElement('div');
    shapeDiv.classList.add('shape');
    
    pattern.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.style.display = 'flex';

        row.forEach(cell => {
            const circleDiv = document.createElement('div');
            circleDiv.classList.add('shape_circle');

            if (cell === 1) {
                circleDiv.style.backgroundColor = color;
            } else {
                // Empty space (no color)
            }
            rowDiv.appendChild(circleDiv);
        });
        shapeDiv.appendChild(rowDiv);
    });

    return shapeDiv;
}
let draggedShape = null;

shapes.forEach(shape => {
    const shapeElement = createShape(shape.color, shape.pattern);
    container.appendChild(shapeElement);
});