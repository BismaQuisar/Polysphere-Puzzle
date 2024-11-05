// JavaScript to create a 5x11 grid of circles
let draggedShape = null;
document.querySelectorAll('.shape').forEach(shape => {
    shape.addEventListener('dragstart', dragStart);
    shape.addEventListener('dragend', dragEnd);
});
document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('circleGrid');
    const puzzleContainer = document.getElementById('puzzleContainer');
    gridContainer.addEventListener('dragover', dragOver);
    gridContainer.addEventListener('drop', dropInGrid);
    puzzleContainer.addEventListener('dragover', dragOver);
    puzzleContainer.addEventListener('drop', dropInPuzzle);
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
    shapeDiv.draggable = true;

    shapeDiv.addEventListener('dragstart', dragStart);
    shapeDiv.addEventListener('dragend', dragEnd);
    
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
const circles = document.querySelectorAll('.circle');
circles.forEach(circle => {
    circle.addEventListener('dragover', dragOver);
    circle.addEventListener('drop', drop);
});

function dragStart(event) {
    draggedShape = this;
    this.style.opacity = '1';
    event.dataTransfer.setData('text/plain', null);
}

function dragEnd(event) {
    if (draggedShape) {
        draggedShape.style.opacity = '1';
        draggedShape = null;
    }
}

function dragOver(event) {
    event.preventDefault();
}

function dropInGrid(event) {
    event.preventDefault();

    if (draggedShape) {
        const gridContainer = document.getElementById('circleGrid');
        const availableCircles = Array.from(gridContainer.querySelectorAll('.circle:not(:has(.shape))'));

        if (availableCircles.length > 0) {
            availableCircles[availableCircles.length - 1].appendChild(draggedShape);
        } else {
            console.log("No available spaces in the grid.");
        }

        draggedShape.style.opacity = '1'; // Reset opacity
        draggedShape = null;
    }
}

function dropInPuzzle(event) {
    event.preventDefault();

    if (draggedShape) {
        puzzleContainer.appendChild(draggedShape);
        draggedShape.style.opacity = '1'; 
        draggedShape = null;
    }
}
shapes.forEach(shape => {
    const shapeElement = createShape(shape.color, shape.pattern);
    container.appendChild(shapeElement);
});

document.addEventListener('mousemove', function(event) {
    if (draggedShape) {
        draggedShape.style.left = event.clientX - (draggedShape.offsetWidth / 2) + 'px';
        draggedShape.style.top = event.clientY - (draggedShape.offsetHeight / 2) + 'px';
    }
});