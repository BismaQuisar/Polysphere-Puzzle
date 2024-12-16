let solutions = [];
let pyramidData = [];
let currentSolutionIndex = -1;
let sphereObjects = [];
let sphereObjectsViews = [];
let scene, camera, renderer, controls;
let baseSizeGlobal = 0;
let stopRequested = false;

function createPyramid(baseSize) {
  baseSizeGlobal = baseSize;
  const container = document.getElementById("pyramid-container");

  // Clear the existing container
  container.innerHTML = "";

  // Get the dynamic dimensions of the container
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;

  // Create a Three.js scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0); // Set fully transparent background
  renderer.setSize(containerWidth, containerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Smooth shadows
  container.appendChild(renderer.domElement);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light
  const pointLight = new THREE.PointLight(0xffffff, 1.5);
  pointLight.position.set(10, 15, 10);
  scene.add(ambientLight, pointLight);

  // Create pyramid with spheres and store their positions
  pyramidData = []; // Store the pyramid structure
  sphereObjects = [];
  sphereObjectsViews = [];
  const sphereRadius = 0.8; // Radius of each sphere
  const spacing = 1.38; // Space between spheres
  for (let layer = 0; layer < baseSize; layer++) {
    const spheresPerRow = baseSize - layer;
    const yOffset = layer * spacing;

    const layerData = []; // Store positions for this layer
    const sphereLayer = [];
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

        if (!sphereLayer[row]) sphereLayer[row] = [];
        sphereLayer[row][col] = sphere;

        // Add sphere position and color to layer data
        layerData.push({ 
          x: layer, 
          y: row, 
          z: col, 
          color: 0xffffff // Include the color code for white
        });

        // Add the sphere to the scene
        scene.add(sphere);
        sphereObjectsViews.push({ object: sphere, originalPos: sphere.position.clone(), layer });
      }
    }
    sphereObjects.push(sphereLayer); 
    pyramidData.push(layerData); // Add this layer's data to the pyramid
  }

  // Add orbit controls for 360-degree movement
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Smooth rotation
  controls.dampingFactor = 0.05;

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
}

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

  shapeDiv.innerHTML = '';
  shape_pattern = shape.pattern;

  shape_pattern.forEach(row => {
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

  return shapeDiv;
}

function streamSolutions() {
  const eventSource = new EventSource('/stream_pyramid_solutions');

  eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.done || stopRequested) {
          console.log('All solutions have been received.');
          eventSource.close();
          return;
      }

      solutions.push(data);
      console.log('New unique solution received:', data);

      showSolutions();
      
  };

  eventSource.onerror = () => {
      console.error('Error receiving solutions.');
      eventSource.close();
  };
}

async function solvePyramid() {
  console.log("Puzzle solving started...");
  solutions = [];
  currentSolutionIndex = -1;
  stopRequested = false;

  try {
      const response = await fetch('/solve_pyramid', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              layers: 5
          })
      });

      streamSolutions();
  } catch (error) {
      console.error('Error solving puzzle:', error);
      alert('Error solving puzzle. Please try again.');
  }
}

function stopPuzzle(){
  console.log("Stopping puzzle solving...");
  stopRequested = true;
  stopButton.style.display = 'none';

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

function showSolutions() {
  const solutionControls = document.getElementById('solutionControls');
  const gridContainer = document.getElementById('circleGrid');
  const circles = Array.from(gridContainer.children);

  if (!solutionControls.style.display || solutionControls.style.display === 'none') {
      solutionControls.style.display = 'flex';
  }

  function updateDisplay(index) {
      const currentSolution = solutions[index];
      for (let layer = 0; layer < baseSizeGlobal; layer++) {
        const spheresPerRow = baseSizeGlobal - layer;
        for (let row = 0; row < spheresPerRow; row++) {
            for (let col = 0; col < spheresPerRow; col++) { 
              const pieceId = currentSolution[layer][row][col];
              const color = pieceColorMapping[pieceId] || 0xffffff;
              const sphere = sphereObjects[layer][row][col];

              if (sphere) { 
                sphere.material.color.set(color);
              }
            }
        }
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

function resetGame() {
  currentSolutionIndex = -1;
  solutionControls.style.display = 'none';
  solutionCount.textContent = '0 / 0';
  stopButton.style.display = 'flex';
  setPyramidView("normal");

  for (let layer = 0; layer < baseSizeGlobal; layer++) {
    const spheresPerRow = baseSizeGlobal - layer;
    for (let row = 0; row < spheresPerRow; row++) {
        for (let col = 0; col < spheresPerRow; col++) {
          const sphere = sphereObjects[layer][row][col];

          if (sphere) { 
            sphere.material.color.set(0xffffff);
          }
        }
    }
  }

  if (solveButton.textContent.trim() === 'Solving...') {
    stopPuzzle();
    solveButton.disabled = false;
    solveButton.textContent = 'Solve';
    solveButton.style.cursor = 'pointer';
  }
}

const pieceColorMapping = {
  1: 0xef4444,
  2: 0xec4899,
  3: 0xf9a8d4,
  4: 0x60a5fa,
  5: 0xfacc15,
  6: 0xa855f7,
  7: 0x6b21a8,
  8: 0x6CC24A,
  9: 0xf97316,
  10: 0x22c55e,
  11: 0xeab308,
  12: 0x7EC8E3
}

function setPyramidView(view) {
  const spacing = 3;
  const sphereRadius = 0.8;  
  let pyramidHeight = (baseSizeGlobal * (baseSizeGlobal - 1) * 2) / 4;
  sphereObjectsViews.forEach(({ object, originalPos, layer }) => {
    object.position.copy(originalPos);
    const { x, y, z } = object.position;
    if (view === "normal") {
      object.position.copy(originalPos);
    } else if (view === "top") {
      const adjustedYOffset = -pyramidHeight + (originalPos.y + layer * spacing )+ sphereRadius;
      object.position.set(originalPos.x, adjustedYOffset, originalPos.z);
    } else if (view === "side") {
      const diagonalLayer = Math.floor((x + z));
      object.position.set(
          x / 2 + diagonalLayer * 2,
          y ,
          z + diagonalLayer);
    }
  });
}

function updateCSS(){
  solutionControls.style.display = 'flex';
  stopButton.style.display = 'flex';
  const solveButton = document.getElementById('solveButton');
  solveButton.disabled = true;
  solveButton.textContent = 'Solving...';
  solveButton.style.cursor = 'not-allowed'; 
}

function SolutionCompletedCSS(){
  solveButton.disabled = false;
  solveButton.textContent = 'Solve';
  solveButton.style.cursor = 'pointer';
  stopButton.style.display = 'none';
}