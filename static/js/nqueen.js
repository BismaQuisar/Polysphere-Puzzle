let board = [];
let n = 8;
let currentSolutionIndex = -1;

function generateBoard() {
    n = parseInt(document.getElementById('board-size').value);
    const size = parseInt(n);

    const container = document.getElementById('board-container');
    container.innerHTML = '';  // Clear previous board if any
    resetSolutionControls();

    if (isNaN(size) || size < 4 || size > 20) {
        container.style.display = 'flex';
        container.innerHTML = '<p>Board size must be a number between 4 and 20.</p>';
        return;
    }
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${n}, 50px)`;  

    board = [];
    console.log("Generating grid with size:", n);  
    for (let i = 0; i < n; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
            const square = document.createElement('div');
            square.classList.add('square');
            if ((i + j) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            } 
            square.dataset.row = i;
            square.dataset.col = j;
            square.onclick = toggleQueen;
            container.appendChild(square);  
            console.log(`Appending square at [${i}, ${j}]`);  
            row.push('.');  
        }
        board.push(row);  
    }
}

function toggleQueen(event) {
    const square = event.target;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    if (board[row][col] === '.') {
        board[row][col] = 'Q';
        square.textContent = '♕';
    } else {
        board[row][col] = '.';
        square.textContent = '';
    }

    validateQueens();
}

function solveBoard() {
    getSquares().forEach(square => {
        square.onclick = null;
    });
    
    fetch('/solve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            n: n,
            board: board.map(row => row.join(''))
        })
    })
    .then(response => response.json())
    .then(solutions => displaySolutions(solutions, n));
}

function displaySolutions(solutions, n) {
    const solutionControls = document.getElementById('solutionControls');
    const square = getSquares();

    if (!solutionControls.style.display || solutionControls.style.display === 'none') {
        solutionControls.style.display = 'flex';
    }

    if (solutions.length === 0 ) {
        solutionControls.innerHTML = '<p>No solutions found.</p>';
        return;
    }

    function updateDisplay(index) {
        const currentSolution = solutions[index];

        currentSolution.forEach((row, rowIndex) => {
            row.split('').forEach((cell, colIndex) => {
                const squareIndex = rowIndex * n + colIndex;
                const currentSquare = square[squareIndex];

                currentSquare.textContent = cell === 'Q' ? '♕' : '';
                square.onclick = null;
            });
        });
        
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

function resetGame(){
    generateBoard();
    resetSolutionControls();
}

window.onload = function() {
    generateBoard();
};

function validateQueens() {
    const squares = getSquares();

    const conflicts = Array.from({ length: n }, () => Array(n).fill(false));

    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
            if (board[row][col] === 'Q') {
                checkConflicts(row, col, conflicts);
            }
        }
    }

    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
            const squareIndex = row * n + col;
            const currentSquare = squares[squareIndex];
            if (board[row][col] === 'Q') {
                currentSquare.style.color = conflicts[row][col] ? 'red' : 'white';
            }
        }
    }
}

function checkConflicts(row, col, conflicts) {
    let hasConflict = false;

    // Check row and column
    for (let i = 0; i < n; i++) {
        if (i !== col && board[row][i] === 'Q') {
            conflicts[row][col] = true;
            conflicts[row][i] = true;
            hasConflict = true;
        }
        if (i !== row && board[i][col] === 'Q') {
            conflicts[row][col] = true;
            conflicts[i][col] = true;
            hasConflict = true;
        }
    }

    // Check diagonals
    const directions = [
        [-1, -1], [-1, 1], [1, -1], [1, 1] // Top-left, Top-right, Bottom-left, Bottom-right
    ];

    for (const [dx, dy] of directions) {
        let x = row + dx;
        let y = col + dy;

        while (x >= 0 && x < n && y >= 0 && y < n) {
            if (board[x][y] === 'Q') {
                conflicts[row][col] = true;
                conflicts[x][y] = true;
                hasConflict = true;
            }
            x += dx;
            y += dy;
        }
    }

    return hasConflict;
}

function getSquares(){
    const boardContainer = document.getElementById('board-container');
    const squares = Array.from(boardContainer.children);
    return squares;
}

function resetSolutionControls(){
    currentSolutionIndex = -1;
    document.getElementById('solutionControls').style.display = 'none';
    document.getElementById('totalSolutions').style.display = 'none';
    document.getElementById('solutionCount').textContent = '0 / 0';
}