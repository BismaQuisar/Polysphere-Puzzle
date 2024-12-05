// JavaScript to create a 5x11 grid of circles
let draggedShape = null;
let clickTimeout = null;
let solutions = [];
let currentSolutionIndex = -1;
let stopRequested = false;
document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('circleGrid');
    const puzzleContainer = document.getElementById('puzzleContainer');
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');
    const solveButton = document.getElementById('solveButton');
    const stopButton = document.getElementById('stopButton');

    gridContainer.addEventListener('dragover', dragOver);
    gridContainer.addEventListener('drop', dropInGrid);
    puzzleContainer.addEventListener('dragover', dragOver);
    puzzleContainer.addEventListener('drop', dropInPuzzle);
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);
    solveButton.addEventListener('click', solvePuzzle);
    solveButton.addEventListener('click', updateCSS);
    stopButton.addEventListener('click', stopPuzzle);

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
        angle: 0,
        flippedHorizontally: false,
        flippedVertically: false,
        pattern: [
            [1, 1, 1],
            [1, 0, 1]
        ]
    },
    {
        id: 'shape-2',
        color: '#ec4899',
        angle: 0,
        flippedHorizontally: false,
        flippedVertically: false,
        pattern: [
            [0, 0, 1, 1],
            [1, 1, 1, 0]
        ]
    },
    {
        id: 'shape-3',
        color: '#f9a8d4',
        angle: 0,
        flippedHorizontally: false,
        flippedVertically: false,
        pattern: [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 1]
        ]
    },
    {
        id: 'shape-4',
        color: '#60a5fa',
        angle: 0,
        flippedHorizontally: false,
        flippedVertically: false,
        pattern: [ 
            [0, 1, 0],
            [1, 1, 1]
        ]
    },
    {
        id: 'shape-5',
        color: '#facc15',
        angle: 0,
        flippedHorizontally: false,
        flippedVertically: false,
        pattern: [
            [0, 1, 0, 0],
            [1, 1, 1, 1]
        ]
    },
    {
        id: 'shape-6',
        color: '#a855f7',
        angle: 0,
        flippedHorizontally: false,
        flippedVertically: false,
        pattern: [
            [0, 1, 1],
            [1, 1, 1]
        ]
    },
    {
        id: 'shape-7',
        color: '#6b21a8',
        angle: 0,
        flippedHorizontally: false,
        flippedVertically: false,
        pattern: [
            [0, 1, 1],
            [1, 1, 0]
        ]
    },
    {
        id: 'shape-8',
        color: '#6CC24A',
        angle: 0,
        flippedHorizontally: false,
        flippedVertically: false,
        pattern: [
            [1, 1],
            [1, 0],
            [1, 0]
        ]
    },
    {
        id: 'shape-9',
        color: '#f97316',
        angle: 0,
        flippedHorizontally: false,
        flippedVertically: false,
        pattern: [
            [1, 1, 1],
            [0, 0, 1],
            [0, 0, 1]
        ]
    },
    {
        id: 'shape-10',
        color: '#22c55e',
        angle: 0,
        flippedHorizontally: false,
        flippedVertically: false,
        pattern: [
            [1, 0, 0, 0],
            [1, 1, 1, 1]
        ]
    },
    {
        id: 'shape-11',
        color: '#eab308',
        angle: 0,
        flippedHorizontally: false,
        flippedVertically: false,
        pattern: [
            [1, 0],
            [1, 1]
        ]
    },
    {
        id: 'shape-12',
        color: '#7EC8E3',
        angle: 0,
        flippedHorizontally: false,
        flippedVertically: false,
        pattern: [
            [1, 1, 0],
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
    }
}

function initializeShapes() {
    const puzzleContainer = document.getElementById('puzzleContainer');
    puzzleContainer.innerHTML = ''; 

    shapes.forEach(shape => {
        const shapeElement = createShape(shape);
        puzzleContainer.appendChild(shapeElement);
    });
}

function startGame() {
    resetGame();

    shapes.forEach(shape => {
        shape.flippedHorizontally = false;
        shape.flippedVertically = false;
        shape.angle = 0;
    });

    initializeShapes();
}

function resetGame() {
    const gridContainer = document.getElementById('circleGrid');
    const circles = Array.from(gridContainer.children);

    circles.forEach(circle => {
        circle.style.backgroundColor = '';
    });

    currentSolutionIndex = -1;
    solutionControls.style.display = 'none';
    totalSolutions.style.display = 'none';
    solutionCount.textContent = '0 / 0';
    totalSolutions.textContent = 'Total Solutions: 0';
    stopButton.style.display = 'flex';

    initializeShapes();
    displayLastUsedShape(null);
    if (solveButton.textContent.trim() === 'Solving...') {
        stopPuzzle();
        solveButton.disabled = false;
        solveButton.textContent = 'Solve';
        solveButton.style.cursor = 'pointer';
    }
}

function createShape(shape) {
    const shapeDiv = document.createElement('div');
    shapeDiv.classList.add('shape');
    shapeDiv.id = shape.id;
    shapeDiv.draggable = true;

    shapeDiv.addEventListener('click',(event)=>{
        event.preventDefault();

        if (clickTimeout) {
            clearTimeout(clickTimeout);

            toggleFlip(shapeDiv, shape);
            renderShapePattern(shapeDiv, shape);

            clickTimeout = null;
        } else {
            clickTimeout = setTimeout(() => {
                rotateShape(shape);
                renderShapePattern(shapeDiv, shape);
                clickTimeout = null;
            }, 300);
        }
    });

    shapeDiv.addEventListener('dragstart', dragStart);
    shapeDiv.addEventListener('dragend', dragEnd);

    renderShapePattern(shapeDiv, shape);

    return shapeDiv;
}

function renderShapePattern(shapeDiv, shape) {
    shapeDiv.innerHTML = '';
    
    const transformedPattern = getTransformedPattern(shape);
    transformedPattern.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.style.display = 'flex';

        row.forEach(cell => {
            const circleDiv = document.createElement('div');
            circleDiv.classList.add('shape_circle');
            if (cell === 1) {
                circleDiv.style.backgroundColor = shape.color;
            }
            rowDiv.appendChild(circleDiv);
        });
        shapeDiv.appendChild(rowDiv);
    });
}

function toggleFlip(shapeElement) {
    const shapeData = shapes.find(shape => shape.id === shapeElement.id);

    if (shapeData.flippedHorizontally) {
        flipShape(shapeElement, 'vertical');
    } else {
        flipShape(shapeElement, 'horizontal');
    }
}

function rotateShape(shape) {
    shape.angle = (shape.angle + 90) % 360; // Rotate by 90 degrees
}

function flipShape(shapeElement, direction) {
    const shapeData = shapes.find(shape => shape.id === shapeElement.id);

    if (direction === 'horizontal') {
        shapeData.flippedHorizontally = !shapeData.flippedHorizontally;
        shapeData.pattern = flipPatternHorizontally(shapeData.pattern);
    } else if (direction === 'vertical') {
        shapeData.flippedVertically = !shapeData.flippedVertically;
        shapeData.pattern = flipPatternVertically(shapeData.pattern);
    }
}

function flipPatternHorizontally(pattern) {
    return pattern.map(row => row.reverse());
}

function flipPatternVertically(pattern) {
    return pattern.reverse();
}

function getTransformedPattern(shape) {
    let pattern = shape.pattern;

    for (let i = 0; i < shape.angle / 90; i++) {
        pattern = rotatePatternClockwise(pattern);
    }

    return pattern;
}

function rotatePatternClockwise(pattern) {
    const rows = pattern.length;
    const cols = pattern[0].length;
    const rotatedPattern = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            rotatedPattern[c][rows - r - 1] = pattern[r][c];
        }
    }
    return rotatedPattern;
}

function clearCellColors(circles, color) {
    circles.forEach(circle => {
        if (circle.style.backgroundColor == hexToRgb(color)) {
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
            clearCellColors(circles, shapeData.color);
            const transformedPattern = getTransformedPattern(shapeData);

            let canPlace = true;
            for (let r = 0; r < transformedPattern.length; r++) {
                for (let c = 0; c < transformedPattern[r].length; c++) {
                    const targetRow = row + r;
                    const targetCol = col + c;
                    const targetIndex = targetRow * 11 + targetCol;

                    if (transformedPattern[r][c] === 1) {
                        if (targetRow >= 5 || targetCol >= 11 || targetIndex >= circles.length || circles[targetIndex].style.backgroundColor !== '') {
                            canPlace = false;
                            break;
                        }
                    }
                }
                if (!canPlace) break;
            }

            if (canPlace) {
                for (let r = 0; r < transformedPattern.length; r++) {
                    for (let c = 0; c < transformedPattern[r].length; c++) {
                        if (transformedPattern[r][c] === 1) {
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
            const transformedPattern = getTransformedPattern(shapeData);
            for (let r = 0; r < transformedPattern.length; r++) {
                for (let c = 0; c < transformedPattern[r].length; c++) {
                    if (transformedPattern[r][c] === 1) {
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
                for (let r = 0; r < transformedPattern.length; r++) {
                    for (let c = 0; c < transformedPattern[r].length; c++) {
                        if (transformedPattern[r][c] === 1) {
                            const targetIndex = (row + r) * 11 + (col + c);
                            circles[targetIndex].style.backgroundColor = shapeData.color;
                        }
                    }
                }
                displayLastUsedShape(shapeData);
                draggedShape.remove();
                draggedShape = null;
                checkGameEnd();
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
        if (!isDuplicateID(draggedShape.id)){
            puzzleContainer.appendChild(draggedShape);
            draggedShape.style.opacity = '1';
        }

        draggedShape = null;
    }
}

function isDuplicateID(ID) {
    const puzzleContainer = document.getElementById('puzzleContainer');
    const existingShapes = Array.from(puzzleContainer.children);

    for (const shape of existingShapes) {
        if (shape.id === ID) {
            return true;
        }
    }
    return false;
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
            const shapeElement = createShape(shapeData);
            
            if (!isDuplicateID(shapeElement.id)){
                puzzleContainer.appendChild(shapeElement);
            }
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
        const shapeElement = createShape(shapeData);
        lastUsedShapeDisplay.appendChild(shapeElement);
    } else {
        lastUsedShapeDisplay.innerHTML = '';
    }
}

function checkGameEnd() {
    const gridCells = document.querySelectorAll('.circle');

    const allCellsFilled = Array.from(gridCells).every(cell => {
        return cell.style.backgroundColor !== '';
    });

    if (allCellsFilled) {
        const gameEndOverlay = document.getElementById('gameEndOverlay');
        gameEndOverlay.style.display = 'flex';
    }
}

function closeGameEndOverlay() {
    const gameEndOverlay = document.getElementById('gameEndOverlay');
    gameEndOverlay.style.display = 'none';
    startGame();
}

// Instruction Model
function openInstructions() {
    document.getElementById('instructionsModal').style.display = 'flex';
}

function closeInstructions() {
    document.getElementById('instructionsModal').style.display = 'none';
}

window.onclick = function(event) {
    var modal = document.getElementById('instructionsModal');
    if (event.target == modal) {
        closeInstructions();
    }
}

// Function to handle showing solutions
function showSolutions() {
    const solutionControls = document.getElementById('solutionControls');
    const gridContainer = document.getElementById('circleGrid');
    const circles = Array.from(gridContainer.children);

    if (!solutionControls.style.display || solutionControls.style.display === 'none') {
        solutionControls.style.display = 'flex';
    }

    function updateDisplay(index) {
        const currentSolution = solutions[index];
        for (let i = 0; i < circles.length; i++) {
            circles[i].style.backgroundColor = currentSolution[i] || '';
        }

        document.getElementById('solutionCount').textContent = `${index + 1} / ${solutions.length}`;
        document.getElementById('prevButton').disabled = index === 0;
        document.getElementById('nextButton').disabled = index === solutions.length - 1;
    }

    if (currentSolutionIndex === -1 && solutions.length > 0) {
        currentSolutionIndex = 0;
        updateDisplay(currentSolutionIndex);
    }

    document.getElementById('prevButton').onclick = () => {
        if (currentSolutionIndex > 0) {
            currentSolutionIndex--;
            updateDisplay(currentSolutionIndex);
        }
    };

    document.getElementById('nextButton').onclick = () => {
        if (currentSolutionIndex < solutions.length - 1) {
            currentSolutionIndex++;
            updateDisplay(currentSolutionIndex);
        }
    };

    updateDisplay(currentSolutionIndex);

}

function streamSolutions() {
    const eventSource = new EventSource('/stream_solutions');

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.done || stopRequested) {
            console.log('All solutions have been received.');
            eventSource.close();
            return;
        }

        solutions.push(data);
        console.log('New unique solution received:', data);
        document.getElementById('totalSolutions').textContent = `Total Solutions: ${solutions.length}`;

        showSolutions();
    };

    eventSource.onerror = () => {
        console.error('Error receiving solutions.');
        eventSource.close();
    };
}

// Function to start solving the puzzle
async function solvePuzzle() {
    console.log("Puzzle solving started...");
    solutions = [];
    currentSolutionIndex = -1;
    stopRequested = false;

    const gridContainer = document.getElementById('circleGrid');
    const circles = Array.from(gridContainer.children);
    const puzzleContainer = document.getElementById('puzzleContainer');
    
    const grid = circles.map(circle => circle.style.backgroundColor || '');

    const remainingShapes = [];
    Array.from(puzzleContainer.children).forEach(shapeElement => {
        const shapeData = shapes.find(shape => shape.id === shapeElement.id);
        if (shapeData) {
            remainingShapes.push({
                ...shapeData,
                pattern: getTransformedPattern(shapeData)
            });
        }
    });

    try {
        const response = await fetch('/solve_puzzle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grid: grid,
                remaining_shapes: remainingShapes
            })
        });

        streamSolutions();
    } catch (error) {
        console.error('Error solving puzzle:', error);
        alert('Error solving puzzle. Please try again.');
    }
}

function updateCSS(){
    totalSolutions.style.display = 'flex';
    solutionControls.style.display = 'flex';
    const solveButton = document.getElementById('solveButton');
    solveButton.disabled = true;
    solveButton.textContent = 'Solving...';
    solveButton.style.cursor = 'not-allowed'; 
}

function stopPuzzle(){
    console.log("Stopping puzzle solving...");
    stopRequested = true;

    fetch('/stop_puzzle', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            console.log('Backend stopped:', data);
            SolutionCompletedCSS();
        })
        .catch(error => {
            console.error('Error stopping puzzle:', error);
        });
}

function SolutionCompletedCSS(){
    solveButton.disabled = false;
    solveButton.textContent = 'Solve';
    solveButton.style.cursor = 'pointer';
    stopButton.style.display = 'none';
}