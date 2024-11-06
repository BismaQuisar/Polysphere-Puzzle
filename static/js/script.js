// JavaScript to create a 5x11 grid of circles
let draggedShape = null;
let tooltip = null;
document.addEventListener('DOMContentLoaded', () => {
    tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    document.body.appendChild(tooltip);
    
    const gridContainer = document.getElementById('circleGrid');
    const puzzleContainer = document.getElementById('puzzleContainer');
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');

    gridContainer.addEventListener('dragover', dragOver);
    gridContainer.addEventListener('drop', dropInGrid);
    puzzleContainer.addEventListener('dragover', dragOver);
    puzzleContainer.addEventListener('drop', dropInPuzzle);
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);

    // Create 5x11 grid of circles
    initializeGrid();
    // Initialize the shapes in the puzzle container
    initializeShapes();
});

// Shapes
const shapes = [
    {
        id: 'shape-1',
        color: '#ef4444',
        pattern: [
            [1, 1, 1],
            [1, 0, 1]
        ]
    },
    {
        id: 'shape-2',
        color: '#ec4899',
        pattern: [
            [0, 0, 1, 1],
            [1, 1, 1, 0]
        ]
    },
    {
        id: 'shape-3',
        color: '#f9a8d4',
        pattern: [
            [0, 1],
            [1, 1],
            [0, 1, 1]
        ]
    },
    {
        id: 'shape-4',
        color: '#60a5fa',
        pattern: [ 
            [0, 1],
            [1, 1, 1]
        ]
    },
    {
        id: 'shape-5',
        color: '#facc15',
        pattern: [
            [0, 1, 0, 0],
            [1, 1, 1, 1]
        ]
    },
    {
        id: 'shape-6',
        color: '#a855f7',
        pattern: [
            [0, 1, 1],
            [1, 1, 1]
        ]
    },
    {
        id: 'shape-7',
        color: '#6b21a8',
        pattern: [
            [0, 1, 1],
            [1, 1]
        ]
    },
    {
        id: 'shape-8',
        color: '#6CC24A',
        pattern: [
            [1, 1],
            [1],
            [1]
        ]
    },
    {
        id: 'shape-9',
        color: '#f97316',
        pattern: [
            [1, 1, 1],
            [0, 0, 1],
            [0, 0, 1]
        ]
    },
    {
        id: 'shape-10',
        color: '#22c55e',
        pattern: [
            [1, 0, 0, 0],
            [1, 1, 1, 1]
        ]
    },
    {
        id: 'shape-11',
        color: '#eab308',
        pattern: [
            [1],
            [1, 1]
        ]
    },
    {
        id: 'shape-12',
        color: '#7EC8E3',
        pattern: [
            [1, 1],
            [0, 1, 1],
            [0, 0, 1]
        ]
    }
];

function initializeGrid() {
    const gridContainer = document.getElementById('circleGrid');
    const rows = 5;
    const cols = 11;

    for (let i = 0; i < rows * cols; i++) {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        gridContainer.appendChild(circle);

        circle.addEventListener('mouseenter', (event) => {
            const currentColor = circle.style.backgroundColor;
            if (currentColor && currentColor !== 'transparent') {
                const shape = findShapeByColor(currentColor);
                if (shape) {
                    showTooltip(shape.id, event);
                }
            }
        });
        circle.addEventListener('mouseleave', hideTooltip);
    }
}

function initializeShapes() {
    const puzzleContainer = document.getElementById('puzzleContainer');
    puzzleContainer.innerHTML = ''; 

    shapes.forEach(shape => {
        const shapeElement = createShape(shape.id, shape.color, shape.pattern);
        puzzleContainer.appendChild(shapeElement);
    });
}

function startGame() {
    resetGame();

    // Assigning the shapes Random Position
    const puzzleContainer = document.getElementById('puzzleContainer');
    Array.from(puzzleContainer.children).forEach(shape => {
        shape.style.order = Math.floor(Math.random() * puzzleContainer.children.length);
    });
}

function resetGame() {
    const gridContainer = document.getElementById('circleGrid');
    const circles = Array.from(gridContainer.children);

    circles.forEach(circle => {
        circle.style.backgroundColor = '';
    });

    initializeShapes();
    displayLastUsedShape(null);
}

function createShape(id, color, pattern) {
    const shapeDiv = document.createElement('div');
    shapeDiv.classList.add('shape');
    shapeDiv.id = id;
    shapeDiv.draggable = true;

    shapeDiv.addEventListener('mouseenter', () => showTooltip(id, null));
    shapeDiv.addEventListener('mouseleave', hideTooltip);

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
            }
            rowDiv.appendChild(circleDiv);
        });
        shapeDiv.appendChild(rowDiv);
    });

    return shapeDiv;
}

function clearCellColors(circles, shapeData) {
    circles.forEach(circle => {
        if (circle.style.backgroundColor == hexToRgb(shapeData.color)) {
            circle.style.backgroundColor = '';
        }
    });
}

function dragStart(event) {
    draggedShape = event.target;
    draggedShape.style.opacity = '1';
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
    if (draggedShape) {
        const gridContainer = document.getElementById('circleGrid');
        const rect = gridContainer.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const col = Math.floor(mouseX / (rect.width / 11));
        const row = Math.floor(mouseY / (rect.height / 5));

        const shapeId = draggedShape.id;
        const shapeData = shapes.find(shape => shape.id === shapeId);
        const circles = Array.from(gridContainer.children);

        if (shapeData) {
            clearCellColors(circles, shapeData);

            let canPlace = true;
            for (let r = 0; r < shapeData.pattern.length; r++) {
                for (let c = 0; c < shapeData.pattern[r].length; c++) {
                    const targetRow = row + r;
                    const targetCol = col + c;
                    const targetIndex = targetRow * 11 + targetCol;

                    if (shapeData.pattern[r][c] === 1) {
                        if (targetRow >= 5 || targetCol >= 11 || targetIndex >= circles.length || circles[targetIndex].style.backgroundColor !== '') {
                            canPlace = false;
                            break;
                        }
                    }
                }
                if (!canPlace) break;
            }

            if (canPlace) {
                for (let r = 0; r < shapeData.pattern.length; r++) {
                    for (let c = 0; c < shapeData.pattern[r].length; c++) {
                        if (shapeData.pattern[r][c] === 1) {
                            const targetRow = row + r;
                            const targetCol = col + c;
                            const targetIndex = targetRow * 11 + targetCol;
                            circles[targetIndex].style.backgroundColor = shapeData.color;
                        }
                    }
                }
            }
        }
    }
}

function dropInGrid(event) {
    event.preventDefault();

    if (draggedShape) {
        const gridContainer = document.getElementById('circleGrid');
        const circles = Array.from(gridContainer.children);

        const rect = gridContainer.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const col = Math.floor(mouseX / (rect.width / 11));
        const row = Math.floor(mouseY / (rect.height / 5));

        const shapeId = draggedShape.id;
        const shapeData = shapes.find(shape => shape.id === shapeId);

        if (shapeData) {
            let fits = true;
            for (let r = 0; r < shapeData.pattern.length; r++) {
                for (let c = 0; c < shapeData.pattern[r].length; c++) {
                    if (shapeData.pattern[r][c] === 1) {
                        const targetRow = row + r;
                        const targetCol = col + c;
                        const targetIndex = targetRow * 11 + targetCol;
                        if (
                            targetRow >= 5 || targetCol >= 11 ||
                            targetIndex >= circles.length ||
                            ((circles[targetIndex].style.backgroundColor !== hexToRgb(shapeData.color)) &&
                            (circles[targetIndex].style.backgroundColor !== ''))) {
                            fits = false;
                            break;
                        }
                    }
                }
                if (!fits) break;
            }

            if (fits) {
                for (let r = 0; r < shapeData.pattern.length; r++) {
                    for (let c = 0; c < shapeData.pattern[r].length; c++) {
                        if (shapeData.pattern[r][c] === 1) {
                            const targetIndex = (row + r) * 11 + (col + c);
                            circles[targetIndex].style.backgroundColor = shapeData.color;
                        }
                    }
                }
                displayLastUsedShape(shapeData);
                draggedShape.remove();
                //clearCellColors(circles);
                draggedShape = null;
            } else {
                console.log('Shape does not fit in this position!');
            }
        }
    }
}

function dropInPuzzle(event) {
    event.preventDefault();
    if (draggedShape) {
        const puzzleContainer = document.getElementById('puzzleContainer');
        puzzleContainer.appendChild(draggedShape);
        draggedShape.style.opacity = '1';
        draggedShape = null;
    }
}

function handlePieceClick(event) {
    const clickedCell = event.target;
    const gridContainer = document.getElementById('circleGrid');

    if (clickedCell.style.backgroundColor) {
        const shapeColor = clickedCell.style.backgroundColor;
        const shapeData = shapes.find(shape => hexToRgb(shape.color) === shapeColor);
        if (shapeData) {
            const circles = Array.from(gridContainer.children);
            circles.forEach(circle => {
                if (circle.style.backgroundColor === shapeColor) {
                    circle.style.backgroundColor = '';
                }
            });
            const puzzleContainer = document.getElementById('puzzleContainer');
            const shapeElement = createShape(shapeData.id, shapeData.color, shapeData.pattern);
            puzzleContainer.appendChild(shapeElement);
        }
    }
}

document.getElementById('circleGrid').addEventListener('click', handlePieceClick);

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgb(${r}, ${g}, ${b})`;
}

function displayLastUsedShape(shapeData) {
    const lastUsedShapeDisplay = document.getElementById('lastUsedShapeDisplay');
    lastUsedShapeDisplay.innerHTML = '';
    if (shapeData) {
        const shapeElement = createShape(shapeData.id, shapeData.color, shapeData.pattern);
        lastUsedShapeDisplay.appendChild(shapeElement);
    } else {
        lastUsedShapeDisplay.innerHTML = '';
    }
}

function findShapeByColor(color) {
    return shapes.find(shape => hexToRgb(shape.color) === color);
}

function showTooltip(shapeId, event) {
    if(event){
    tooltip.textContent = `Click on the Shape to remove it from the grid.`;
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
    tooltip.classList.add('active');
    }
}

function hideTooltip() {
    tooltip.classList.remove('active');
}