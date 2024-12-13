let solutions = [];
let pyramidData = [];
let currentSolutionIndex = -1;
let sphereObjects = [];
let pyramidDataCopy = [];
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the pyramid with 5 layers
  createPyramid(9);

  // Initialize the shapes
  initializeShapes();
});

function createPyramid(baseSize) {
  const container = document.getElementById("pyramid-container");

  // Clear the existing container
  container.innerHTML = "";

  // Get the dynamic dimensions of the container
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;

  // Create a Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0); // Set fully transparent background
  renderer.setSize(containerWidth, containerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Smooth shadows
  container.appendChild(renderer.domElement);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light
  const pointLight = new THREE.PointLight(0xffffff, 1.5);
  pointLight.position.set(10, 15, 10);
  // pointLight.castShadow = true;
  scene.add(ambientLight, pointLight);

  // Create pyramid with spheres and store their positions
  pyramidData = []; // Store the pyramid structure
  sphereObjects = [];
  pyramidDataCopy = [];
  const sphereRadius = 0.8; // Radius of each sphere
  const spacing = 1.38; // Space between spheres
  for (let layer = 0; layer < baseSize; layer++) {
    const spheresPerRow = baseSize - layer;
    const yOffset = layer * spacing;

    const layerData = []; // Store positions for this layer
    let layerDataCopy = new Array(spheresPerRow);
    for (let row = 0; row < spheresPerRow; row++) {
      layerDataCopy[row] = new Array(spheresPerRow);  // Preallocate each row in the layer
    }
    for (let row = 0; row < spheresPerRow; row++) {
      for (let col = 0; col < spheresPerRow; col++) {
        // Create a sphere
        const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.2 }); // White color for spheres
        const sphere = new THREE.Mesh(geometry, material);
        sphere.castShadow = true;
        sphere.receiveShadow = true;


        // Position spheres to form the pyramid
        const xOffset = -spheresPerRow * spacing / 2 + col * spacing + spacing / 2;
        const zOffset = -spheresPerRow * spacing / 2 + row * spacing + spacing / 2;
        sphere.position.set(xOffset, yOffset, zOffset);

        layerDataCopy[row][col] = ''; 

        // Add sphere position and color to layer data
        layerData.push({ 
          x: layer, 
          y: row, 
          z: col, 
          color: 0xffffff // Include the color code for white
        });

        // Add the sphere to the scene
        scene.add(sphere);
        sphereObjects.push(sphere); 
      }
    }
    pyramidData.push(layerData); // Add this layer's data to the pyramid
    pyramidDataCopy[layer] = layerDataCopy;
  }

  // Add orbit controls for 360-degree movement
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Smooth rotation
  controls.dampingFactor = 0.05;
  // controls.enablePan = false;
  // controls.screenSpacePanning = false;
  // controls.maxDistance = 300;

  // Position the camera
  camera.position.set(0, baseSize * 1.5, baseSize * 3); // Higher and farther from the pyramid
  controls.update();

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls
    renderer.render(scene, camera);
  }

  animate();

  // Adjust on window resize
  window.addEventListener("resize", () => {
    const newWidth = container.offsetWidth;
    const newHeight = container.offsetHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });

  // Log the pyramid data for debugging
  console.log(pyramidData);
  console.log(pyramidDataCopy);
}

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
function initializeShapes() {
  const puzzleContainer = document.getElementById('puzzleContainer');
  puzzleContainer.innerHTML = ''; 

  shapes.forEach(shape => {
      const shapeElement = createShape(shape);
      puzzleContainer.appendChild(shapeElement);
  });
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

function getTransformedPattern(shape) {
  let pattern = shape.pattern;

  for (let i = 0; i < shape.angle / 90; i++) {
      pattern = rotatePatternClockwise(pattern);
  }

  return pattern;
}



function resetGame() {
  currentSolutionIndex = -1;
  solutionControls.style.display = 'none';
  totalSolutions.style.display = 'none';
  solutionCount.textContent = '0 / 0';
  totalSolutions.textContent = 'Total Solutions: 0';
  stopButton.style.display = 'flex';

  sphereObjects.forEach(sphere => {
    sphere.material.color.set(0xffffff);
    i++;
  });
  
}