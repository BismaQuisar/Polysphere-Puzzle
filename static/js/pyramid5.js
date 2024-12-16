document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('stopButton').addEventListener('click', stopPuzzle);
  document.getElementById('solveButton').addEventListener('click', updateCSS);
  // Initialize the pyramid with 5 layers
  createPyramid(5);

  // Initialize the shapes
  initializeShapes();
});

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
          [0, 1, 0],
          [1, 1, 0],
          [0, 1, 1]
      ]
  },
  {
      id: 'shape-4',
      color: '#60a5fa',
      pattern: [ 
          [0, 1, 0],
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
          [1, 1, 0]
      ]
  },
  {
      id: 'shape-8',
      color: '#6CC24A',
      pattern: [
          [1, 1],
          [1, 0],
          [1, 0]
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
      angle: 0,
      pattern: [
          [1, 0],
          [1, 1]
      ]
  },
  {
      id: 'shape-12',
      color: '#7EC8E3',
      pattern: [
          [1, 1, 0],
          [0, 1, 1],
          [0, 0, 1]
      ]
  }
];