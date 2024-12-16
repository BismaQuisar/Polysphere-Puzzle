from flask import Flask, render_template, Response, jsonify, request
import json
from itertools import product

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

@app.route('/pyramid5')
def pyramid5():
    return render_template('pyramid5.html')

@app.route('/pyramid9')
def pyramid9():
    return render_template('pyramid9.html')

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

# Pyramid (Level 5) Solving Functions 

PIECES  = { 1: [(0, 0, 0), (0, 2, 0), (0, 4, 0), (2, 0, 0), (2, 4, 0)],
            2: [(0, 0, 0), (0, 2, 0), (2, 2, 0), (2, 4, 0), (2, 6, 0)],
            3: [(0, 0, 0), (0, 2, 0), (2, 2, 0), (2, 4, 0), (4, 2, 0)],
            4: [(0, 0, 0), (0, 2, 0), (0, 4, 0), (2, 2, 0)],
            5: [(0, 0, 0), (0, 2, 0), (0, 4, 0), (0, 6, 0), (2, 2, 0)],
            6: [(0, 0, 0), (0, 2, 0), (0, 4, 0), (2, 0, 0), (2, 2, 0)],
            7: [(0, 0, 0), (2, 0, 0), (2, 2, 0), (4, 2, 0)],
            8: [(0, 0, 0), (0, 2, 0), (0, 4, 0), (2, 0, 0)],
            9: [(0, 0, 0), (0, 2, 0), (0, 4, 0), (2, 0, 0), (4, 0, 0)],
            10: [(0, 0, 0), (0, 2, 0), (0, 4, 0), (0, 6, 0), (2, 0, 0)],
            11: [(0, 0, 0), (0, 2, 0), (2, 0, 0)],
            12: [(0, 0, 0), (0, 2, 0), (2, 2, 0), (2, 4, 0), (4, 4, 0)]}


class Node:
    def __init__(self, col=None, value=0):
        self.up = self.down = self.left = self.right = self
        self.col = col
        self.value = value

class Column:
    def __init__(self, id):
        self.left = self.right = self
        self.head = Node(self)
        self.length = 0
        self.id = id

class Matrix:
    def __init__(self, primary, secondary):
        num_cols = primary + secondary
        self.columns = [Column(i) for i in range(num_cols + 1)]
        self.num_cols = num_cols
        self.num_rows = 0
        self.sol = []

        # Setup root and column links (same as original implementation)
        self.columns[0].head.down = self.columns[0].head
        self.columns[0].head.up = self.columns[0].head
        self.columns[0].right = self.columns[1]
        self.columns[0].left = self.columns[primary]

        # Initialize primary and secondary columns
        for i in range(1, primary + 1):
            self.columns[i].left = self.columns[i - 1]
            self.columns[i].right = self.columns[(i + 1) % (primary + 1)]
            self.columns[i].head.down = self.columns[i].head
            self.columns[i].head.up = self.columns[i].head

        for i in range(primary + 1, num_cols + 1):
            self.columns[i].left = self.columns[i]
            self.columns[i].right = self.columns[i]
            self.columns[i].head.down = self.columns[i].head
            self.columns[i].head.up = self.columns[i].head

class Piece:
    def __init__(self, piece_id, custom_shape=None):
        self.id = piece_id
        if custom_shape is None:
            if PIECES.get(piece_id) is None:
                raise KeyError("Piece id not found")
            self.transformations = self._build_transformations(PIECES.get(piece_id))
        else:
            self.transformations = self._build_transformations(custom_shape)

    def _build_transformations(self, cells):
        transformations = []
        initial = [cells]
        initial += self._rotate_z(self._normalize_transformation(cells))

        for next_cells in initial:
            next_cells = sorted(self._normalize_transformation(next_cells))

            while next_cells not in transformations:
                while next_cells not in transformations:
                    transformations.append(next_cells)
                    next_cells = sorted(self._normalize_transformation([(self._rotate_xy(cell)) for cell in next_cells]))

                next_cells = sorted(self._normalize_transformation([self._reflect(cell) for cell in next_cells]))

        unique_symmetries = [list(x) for x in set(tuple(s) for s in transformations)]
        return unique_symmetries

    def _rotate_z(self, cells):
        transformations = [
            [(int((c[0] - c[1]) / 2), int((c[0] - c[1]) / 2), int((c[0] + c[1]) / 2)) for c in cells],
            [(int((c[0] - c[1]) / 2), int((c[0] - c[1]) / 2), int((-c[0] - c[1]) / 2)) for c in cells],
            [(int((c[0] + c[1]) / 2), int((c[0] + c[1]) / 2), int((-c[0] + c[1]) / 2)) for c in cells],
            [(int((c[0] + c[1]) / 2), int((c[0] + c[1]) / 2), int((c[0] - c[1]) / 2)) for c in cells]
        ]
        return transformations

    def _rotate_xy(self, cell):
        vec = list(cell)
        vec[0], vec[1] = vec[1], -vec[0]
        return tuple(vec)

    def _reflect(self, cell):
        vec = list(cell)
        vec[0] = -vec[0]
        return tuple(vec)

    def _normalize_transformation(self, cells):
        min_x = min(cell[0] for cell in cells)
        min_y = min(cell[1] for cell in cells)
        min_z = min(cell[2] for cell in cells)

        normalized_cells = [(cell[0] - min_x, cell[1] - min_y, cell[2] - min_z) for cell in cells]
        return normalized_cells

class PyramidBoard:
    def __init__(self, layers):
        self.layers = layers
        board_spaces = [(x + z, y + z, z) for z in range(layers) for x in range(0, ((2*layers)-1) - (2 * z), 2) for y in range(0, ((2*layers)-1) - (2 * z), 2)]
        self.cells = {space: 0 for space in board_spaces}

    def count_cells(self):
        return len(self.cells.keys())

    def is_region_free(self, region):
        for cell in region:
            if cell not in self.cells:
                return False
            if self.cells[cell] != 0:
                return False
        return True

    def get_matching_empty_regions(self, region):
        matching_empty_regions = []
        for z in range(self.layers):
            layer_size = (self.layers - z) * 2
            for x in range(layer_size):
                for y in range(layer_size):
                    translated_region = []
                    for i,j,k in region:
                        translated_region.append((x+i,y+j,z+k))
                    if self.is_region_free(translated_region):
                        matching_empty_regions.append(translated_region)
        return matching_empty_regions

class PuzzleSolver:
    def __init__(self):
        self.cell_to_index = {}
        self.index_to_cell = {}
        self.id_conversions = {}
        self.matrix = None

    def solve(self, pieces, board=None, layers=5):
        if board is None:
            board = PyramidBoard(layers)

        # Initialize matrix and solve
        self._initialize_matrix(board, pieces)
        
        solution_generator = self._generate_solutions()  # Get the generator from _generate_solutions
        solutions_found = False  # Flag to track if any solutions are found

        for solution in solution_generator:
            solutions_found = True
            yield self._convert_solution_to_board(solution, board)  # Yield each solution as it's found

        if not solutions_found:
            print("No solution found.")


    def _initialize_matrix(self, board, pieces):
        self.cell_to_index = {}
        self.index_to_cell = {}
        self.id_conversions = {}

        # Generate cell indexes
        for i, cell in enumerate(board.cells, start=1):
            self.cell_to_index[cell] = i
            self.index_to_cell[i] = cell

        board_size = board.count_cells()
        self.matrix = Matrix(board_size + len(pieces), 0)

        # Enumerate pieces
        for i, p in enumerate(pieces):
            self.id_conversions[i+1] = p.id
            p.id = i + 1

        for p in pieces:
            for t in p.transformations:
                for option in board.get_matching_empty_regions(t):
                    row = []
                    for cell in option:
                        row.append(self.cell_to_index[cell])
                    row.sort()
                    row.append(p.id + board_size)
                    self._add_matrix_row(row)

    def _add_matrix_row(self, row):
        last = -1
        for element in row:
            if element <= 0 or element > self.matrix.num_cols:
                raise ValueError("Index out of range.")
            if element <= last:
                raise ValueError("Indices not ordered")
            last = element

        self.matrix.num_rows += 1

        for e in row:
            current = Node(col=self.matrix.columns[e], value=self.matrix.num_rows)
            current.down = self.matrix.columns[e].head
            current.up = self.matrix.columns[e].head.up
            self.matrix.columns[e].head.up.down = current
            self.matrix.columns[e].head.up = current
            self.matrix.columns[e].length += 1

        for i, e in enumerate(row):
            self.matrix.columns[e].head.up.right = self.matrix.columns[row[(i + 1) % len(row)]].head.up
            self.matrix.columns[row[(i + 1) % len(row)]].head.up.left = self.matrix.columns[e].head.up

    def _generate_solutions(self):
        def solve(matrix, first=False):
            global stop_solving
            if stop_solving:
                return
            if matrix.columns[0].left == matrix.columns[0]:
                # Base case: no columns left, we've found a solution
                rows = [[False] * matrix.num_cols for _ in range(len(matrix.sol))]
                for i, e in enumerate(matrix.sol):
                    rows[i][e.col.id - 1] = True
                    n = e.right
                    while n != e:
                        rows[i][n.col.id - 1] = True
                        n = n.right
                yield rows  # Yield the current solution instead of returning it
                return

            col = self._mrv(matrix)
            if col.length == 0:
                return

            # Cover the column
            cover(col)
            r = col.head.down
            while r != col.head:
                matrix.sol.append(r)
                n = r.right
                while n != r:
                    cover(n.col)
                    n = n.right

                # Recursively yield solutions from this configuration
                yield from solve(matrix, first)

                # Backtrack: Undo the solution
                undo = matrix.sol.pop()
                col = undo.col
                n = undo.left
                while n != undo:
                    uncover(n.col)
                    n = n.left
                r = r.down

            uncover(col)

        def cover(c):
            p = c.head.down
            while p != c.head:
                hide(p)
                p = p.down
            c.left.right = c.right
            c.right.left = c.left

        def hide(p):
            q = p.right
            while q != p:
                q.up.down = q.down
                q.down.up = q.up
                q.col.length -= 1
                q = q.right

        def uncover(c):
            c.left.right = c
            c.right.left = c
            p = c.head.up
            while p != c.head:
                unhide(p)
                p = p.up

        def unhide(p):
            q = p.left
            while q != p:
                q.up.down = q
                q.down.up = q
                q.col.length += 1
                q = q.left

        def mrv(matrix):
            min_len = -1
            min_col = None
            c = matrix.columns[0].right
            while c != matrix.columns[0]:
                if c.length < min_len or min_len == -1:
                    min_len = c.length
                    min_col = c
                c = c.right
            return min_col

        self._mrv = mrv  # Store method for use in solve
        # Now, yield solutions one by one from solve
        return solve(self.matrix)


    def _convert_solution_to_board(self, rows, board):
        solution_array = [
            [[0 for x in range(z + 1)] for y in range(z + 1)]
            for z in range(board.layers - 1, -1, -1)
        ]

        board_cells_count = board.count_cells()

        for i, row in enumerate(rows):
            poly_id = -1
            for j in range(len(row) - 1, -1, -1):
                if row[j]:
                    poly_id = j - board_cells_count + 1
                    break

            for j in range(len(row)):
                if row[j] and j+1 != (poly_id + board_cells_count):
                    x, y, z = self.index_to_cell[j+1]
                    solution_array[z][int((y-z)/2)][int((x-z)/2)] = self.id_conversions[poly_id]

        return solution_array

@app.route('/solve_pyramid', methods=['POST'])
def solve_pyramid():
    global stop_solving
    data = request.json
    stop_solving = False
    layers = data['layers']
    
   
    # Return a response indicating the puzzle is being solved
    return jsonify({'message': 'Puzzle solving started. Solutions will be streamed.'})

@app.route('/stream_pyramid_solutions', methods=['GET'])
def stream_pyramid_solutions():
    def generate_solutions():
        pieces = [Piece(i) for i in range(1, 13)]  # Example piece creation
        solver = PuzzleSolver()
        
        # Generate solutions and stream them one by one
        solution_generator = solver.solve(pieces)  # Get the generator
        
        try:
            for solution in solution_generator:
                solution_array = solution  # Modify this as needed for proper format
                yield f"data: {json.dumps(solution_array)}\n\n"
        except StopIteration:
            # When the generator is exhausted, send a "done" message
            yield "data: {\"done\": true}\n\n"

    return Response(generate_solutions(), content_type='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True)