from flask import Flask, render_template, Response, jsonify, request
import copy
import json

# Set custom template and static folder paths
app = Flask(__name__, template_folder="templates", static_folder="static")

stop_solving = False

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/polysphere')
def polysphere():
    return render_template('polysphere.html')

@app.route('/nqueen')
def nqueen():
    return render_template('nqueen.html')

# N-Queen Solving Functions

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

# Puzzle Solving Functions

def is_valid_placement(grid, shape, row, col):
    rows, cols = 5, 11
    pattern = shape['pattern']
    shape_rows = len(pattern)
    shape_cols = len(pattern[0])
    
    if row + shape_rows > rows or col + shape_cols > cols:
        return False
        
    for r in range(shape_rows):
        for c in range(shape_cols):
            if pattern[r][c] == 1:
                grid_pos = (row + r) * cols + (col + c)
                if grid_pos >= len(grid) or grid[grid_pos] != '':
                    return False
    return True

def place_shape(grid, shape, row, col):
    cols = 11
    pattern = shape['pattern']
    for r in range(len(pattern)):
        for c in range(len(pattern[0])):
            if pattern[r][c] == 1:
                grid_pos = (row + r) * cols + (col + c)
                grid[grid_pos] = shape['color']

def remove_shape(grid, shape, row, col):
    cols = 11
    pattern = shape['pattern']
    for r in range(len(pattern)):
        for c in range(len(pattern[0])):
            if pattern[r][c] == 1:
                grid_pos = (row + r) * cols + (col + c)
                grid[grid_pos] = ''

def rotate_pattern(pattern):
    rows = len(pattern)
    cols = len(pattern[0])
    new_pattern = [[0 for _ in range(rows)] for _ in range(cols)]
    for r in range(rows):
        for c in range(cols):
            new_pattern[c][rows - 1 - r] = pattern[r][c]
    return new_pattern

def flip_pattern_horizontal(pattern):
    return [row[::-1] for row in pattern]

def flip_pattern_vertical(pattern):
    return pattern[::-1]

def solve_polysphere(grid, shapes):
    global stop_solving
    if stop_solving:
        return
    
    if not shapes:
        if all(cell != '' for cell in grid):
            solution_copy = grid[:]
            yield solution_copy
            
        return

    current_shape = shapes[0]
    original_pattern = copy.deepcopy(current_shape['pattern'])

    for flip_h in [False, True]:
        pattern = original_pattern
        if flip_h:
            pattern = flip_pattern_horizontal(pattern)

        for flip_v in [False, True]:
            if flip_v:
                pattern = flip_pattern_vertical(pattern)

            for _ in range(4):
                current_shape['pattern'] = pattern

                for row in range(5):
                    for col in range(11):
                        if is_valid_placement(grid, current_shape, row, col):
                            place_shape(grid, current_shape, row, col)

                            yield from solve_polysphere(grid, shapes[1:])

                            remove_shape(grid, current_shape, row, col)

                pattern = rotate_pattern(pattern)

            if flip_v:
                pattern = flip_pattern_vertical(pattern)

        if flip_h:
            pattern = flip_pattern_horizontal(pattern)

    current_shape['pattern'] = original_pattern

@app.route('/solve_puzzle', methods=['POST'])
def solve_puzzle():
    global stop_solving
    stop_solving = False 
    data = request.json
    grid = data['grid']
    remaining_shapes = data['remaining_shapes']

    global grid_state, shapes_state
    grid_state = grid
    shapes_state = remaining_shapes

    return jsonify({'message': 'Puzzle solving started. Solutions will be streamed.'})


@app.route('/stream_solutions', methods=['GET'])
def stream_solutions():
    unique_solutions = set()

    def generate_solutions():
        for solution in solve_polysphere(grid_state, shapes_state):
            solution_tuple = tuple(solution)
            if stop_solving:
                break 

            if solution_tuple not in unique_solutions:
                unique_solutions.add(solution_tuple)
                yield f"data: {json.dumps(solution)}\n\n"

        # Send done to show completion
        yield "data: {\"done\": true}\n\n"

    return Response(generate_solutions(), content_type='text/event-stream')

@app.route('/stop_puzzle', methods=['POST'])
def stop_puzzle():
    global stop_solving
    stop_solving = True  # Set flag to stop solving
    return jsonify({'message': 'Puzzle solving stopped.'})

if __name__ == '__main__':
    app.run(debug=True)
