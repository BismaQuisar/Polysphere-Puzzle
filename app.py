from flask import Flask, render_template, Response, jsonify, request
import json
import itertools
from itertools import product
import pprint

# Set custom template and static folder paths
app = Flask(__name__, template_folder="templates", static_folder="static")

# stop_solving = False

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/polysphere')
def polysphere():
    return render_template('polysphere.html')

@app.route('/nqueen')
def nqueen():
    return render_template('nqueen.html')

@app.route('/pyramid5')
def pyramid5():
    return render_template('pyramid5.html')

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

def reshape_to_2d(flattened_grid, rows, cols):
    if len(flattened_grid) != rows * cols:
        raise ValueError("Grid size does not match the specified dimensions.") # 1D to 2D
    
    return [flattened_grid[i * cols:(i + 1) * cols] for i in range(rows)]

def flatten_grid(grid):
    return [cell for row in grid for cell in row] # 2D to 1D

def generate_orientations(pattern):
    orientations = set()
    for _ in range(4):
        pattern = rotate_pattern(pattern)
        orientations.add(tuple(map(tuple, pattern)))
        orientations.add(tuple(map(tuple, flip_pattern_horizontal(pattern))))
        orientations.add(tuple(map(tuple, flip_pattern_vertical(pattern))))
    return [list(map(list, orientation)) for orientation in orientations]

def rotate_pattern(pattern):
    return [[pattern[len(pattern) - 1 - r][c] for r in range(len(pattern))] for c in range(len(pattern[0]))] #90 degree clockwise

def flip_pattern_horizontal(pattern):
    return [row[::-1] for row in pattern] #Horizontally

def flip_pattern_vertical(pattern):
    return pattern[::-1] #Vertically

def preprocess_shape_positions(grid_state, shapes_state):
    precomputed_positions = []
    for shape in shapes_state:
        valid_positions = []
        for orientation in shape['orientations']:
            valid_positions_for_orientation = []
            for row in range(len(grid_state) - len(orientation) + 1):
                for col in range(len(grid_state[0]) - len(orientation[0]) + 1):
                    if is_valid_placement(grid_state, orientation, row, col):
                        valid_positions_for_orientation.append((row, col))
            valid_positions.append({'orientation': orientation, 'positions': valid_positions_for_orientation})
        precomputed_positions.append(valid_positions)
    return precomputed_positions

def is_valid_placement(grid, pattern, row, col):
    grid_rows, grid_cols = len(grid), len(grid[0])
    pattern_rows, pattern_cols = len(pattern), len(pattern[0])

    if row + pattern_rows > grid_rows or col + pattern_cols > grid_cols:
        return False

    for r in range(pattern_rows):
        for c in range(pattern_cols):
            if pattern[r][c] == 1 and grid[row + r][col + c] != '':
                return False

    return True

def place_pattern(grid, pattern, row, col, color):
    for r, c in product(range(len(pattern)), range(len(pattern[0]))):
        if pattern[r][c] == 1:
            grid[row + r][col + c] = color

def remove_pattern(grid, pattern, row, col):
    for r, c in product(range(len(pattern)), range(len(pattern[0]))):
        if pattern[r][c] == 1:
            grid[row + r][col + c] = ''

def solve_polysphere(grid, precomputed_positions, shape_index=0, filled_cells=0, total_cells=0):
    global stop_solving
    if stop_solving:
        return
    
    if filled_cells == total_cells:  # If all cells are filled, yield the first solution immediately
        yield flatten_grid(grid)
        return

    if shape_index >= len(precomputed_positions):  # If no more shapes left to place, stop recursion
        return

    current_shape_positions = precomputed_positions[shape_index]

    for position_data in current_shape_positions:
        orientation = position_data['orientation']
        for row, col in position_data['positions']:
            if is_valid_placement(grid, orientation, row, col):
                place_pattern(grid, orientation, row, col, color=f"S{shape_index}")
                new_filled_cells = filled_cells + sum(row.count(1) for row in orientation)
                yield from solve_polysphere(grid, precomputed_positions, shape_index + 1, new_filled_cells, total_cells)
                remove_pattern(grid, orientation, row, col)

def fitability_metric(grid, shape):
    """Calculate the number of valid placements for a shape in the current grid state."""
    valid_count = 0
    for orientation in shape['orientations']:
        pattern_rows, pattern_cols = len(orientation), len(orientation[0])
        for row in range(len(grid) - pattern_rows + 1):
            for col in range(len(grid[0]) - pattern_cols + 1):
                if is_valid_placement(grid, orientation, row, col):
                    valid_count += 1
    return valid_count

@app.route('/solve_puzzle', methods=['POST'])
def solve_puzzle():
    global grid_state, shapes_state, precomputed_positions, stop_solving
    stop_solving = False 
    data = request.json
    flattened_grid = data['grid']
    rows, cols = data.get('rows', 5), data.get('cols', 11)

    try:
        grid_state = reshape_to_2d(flattened_grid, rows, cols)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    shapes_state = data['remaining_shapes']
    for shape in shapes_state:
        shape['orientations'] = generate_orientations(shape['pattern'])

    if all(cell == '' for row in grid_state for cell in row):
       shapes_state.sort(key=lambda shape: sum(row.count(1) for row in shape['pattern']), reverse=True)
    else:
        shapes_state.sort(key=lambda shape: fitability_metric(grid_state, shape))

    precomputed_positions = preprocess_shape_positions(grid_state, shapes_state)
    return jsonify({'message': 'Puzzle solving started. Solutions will be streamed.'})

@app.route('/stream_solutions', methods=['GET'])
def stream_solutions():
    unique_solutions = set()
    total_cells = sum(1 for row in grid_state for cell in row if cell == '')
    shape_color_map = {f"S{i}": shape['color'] for i, shape in enumerate(shapes_state)}

    def generate_solutions():
        # Generate solutions
        for solution in solve_polysphere(grid_state, precomputed_positions, 0, 0, total_cells):
            solution_tuple = tuple(solution)
            if stop_solving:
                break 

            if solution_tuple not in unique_solutions:
                unique_solutions.add(solution_tuple)
                color_solution = [
                    shape_color_map[cell] if cell in shape_color_map else cell
                    for cell in solution
                ]

                yield f"data: {json.dumps(color_solution)}\n\n"

        yield "data: {\"done\": true}\n\n"
    return Response(generate_solutions(), content_type='text/event-stream')

@app.route('/stop_puzzle', methods=['POST'])
def stop_puzzle():
    global stop_solving
    stop_solving = True
    return jsonify({'message': 'Puzzle solving stopped.'})

@app.route('/solve_pyramid', methods=['POST'])
def solve_pyramid():
    global grid_state, shapes_state, precomputed_positions, stop_solving
    stop_solving = False 
    data = request.json
    flattened_grid = data['grid']
    rows, cols = data.get('rows', 5), data.get('cols', 11)

    try:
        grid_state = reshape_to_2d(flattened_grid, rows, cols)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    shapes_state = data['remaining_shapes']
    for shape in shapes_state:
        shape['orientations'] = generate_orientations(shape['pattern'])

    if all(cell == '' for row in grid_state for cell in row):
       shapes_state.sort(key=lambda shape: sum(row.count(1) for row in shape['pattern']), reverse=True)
    else:
        shapes_state.sort(key=lambda shape: fitability_metric(grid_state, shape))

    precomputed_positions = preprocess_shape_positions(grid_state, shapes_state)
    return jsonify({'message': 'Puzzle solving started. Solutions will be streamed.'})

if __name__ == '__main__':
    app.run(debug=True)