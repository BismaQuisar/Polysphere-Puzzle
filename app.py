# app.py
from flask import Flask, render_template

# Set custom template and static folder paths
app = Flask(__name__, template_folder="templates", static_folder="static")

@app.route('/')
def home():
    return render_template('index.html')  # Home page

@app.route('/polysphere')
def polysphere():
    return render_template('polysphere.html')  # Polysphere page

@app.route('/nqueen')
def nqueen():
    return render_template('nqueen.html')  # N-Queen page

def is_safe(board, row, col, n):
   
    for i in range(row):
        if board[i][col] == 'Q' or (col - (row - i) >= 0 and board[i][col - (row - i)] == 'Q') or (col + (row - i) < n and board[i][col + (row - i)] == 'Q'):
            return False
    return True


def solve_n_queens(board, row, n, solutions):
    if row == n:
        solutions.append([''.join(r) for r in board])
        return
    
    for col in range(n):
        if is_safe(board, row, col, n):
            board[row][col] = 'Q'
            solve_n_queens(board, row + 1, n, solutions)
            board[row][col] = '.'  # Backtrack

@app.route('/solve', methods=['POST'])
def solve():
    data = request.json
    n = int(data['n'])
    board = [list(row) for row in data['board']]

    solutions = []
    solve_n_queens(board, sum(1 for row in board if 'Q' in row), n, solutions)

    return jsonify(solutions)

if __name__ == '__main__':
    app.run(debug=True)
