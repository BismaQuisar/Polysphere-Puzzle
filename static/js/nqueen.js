let board = [];
let n = 8;

function generateBoard() {
    n = parseInt(document.getElementById('board-size').value);
    const container = document.getElementById('board-container');
    container.innerHTML = '';  // Clear previous board if any
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
}

function solveBoard() {
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
    .then(solutions => displaySolutions(solutions));
}

function displaySolutions(solutions) {
    const container = document.getElementById('solutions');
    container.innerHTML = '';

    if (solutions.length === 0) {
        container.innerHTML = '<p>No solutions found.</p>';
        return;
    }
    solutions.forEach((solution, index) => {
        const solutionBoard = document.createElement('div');
        const squaresRow = document.createElement('div');
        solutionBoard.innerHTML = `<h3>Solution ${index + 1}:</h3>`;
        squaresRow.style.display = 'grid';
        squaresRow.style.gridTemplateColumns = `repeat(${n}, 50px)`;
        solutionBoard.style.marginBottom = '20px';

        solution.forEach((row, rowIndex)=> {
            row.split('').forEach((cell, colIndex) => {
                const square = document.createElement('div');
                square.classList.add('square');
                square.textContent = cell === 'Q' ? '♕' : '';
                if ((rowIndex + colIndex) % 2 === 0) {
                    square.style.backgroundColor = '#f0d9b5'; // Light
                } else {
                    square.style.backgroundColor = '#b58863'; // Dark
                } 
                squaresRow.appendChild(square);
            });
        });
         
        solutionBoard.appendChild(squaresRow);
        container.appendChild(solutionBoard);
    });
}

window.onload = function() {
    generateBoard();
};
