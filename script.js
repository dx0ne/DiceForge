const rollButton = document.getElementById('roll-button');
const addRollButton = document.getElementById('add-roll-button');
const dropToShelfButton = document.getElementById('drop-to-shelf');
const rerollAllButton = document.getElementById('reroll-all');
const clearShelfButton = document.getElementById('clear-shelf');
const formulaInput = document.getElementById('formula-input');
const resultDisplay = document.getElementById('result-display');
const shelf = document.getElementById('shelf');
const grid = document.getElementById('grid');

let customDice = []; // Global array to store custom dice

const forgeForm = document.getElementById('forge-form');


document.addEventListener('DOMContentLoaded', () => {

    forgeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const pattern = document.getElementById('dice-pattern').value.trim();
        const customDie = parseCustomDicePattern(pattern);

        if (customDie) {
            customDice.push(customDie);
            alert(`Custom die ${customDie.name} added successfully!`);
            updateCustomDiceDisplay();
        } else {
            alert('Invalid dice pattern. Please use the format: dName:[face1,face2,...]');
        }
    });


    rollButton.addEventListener('click', () => rollDice(false));
    addRollButton.addEventListener('click', () => rollDice(true));
    dropToShelfButton.addEventListener('click', dropAllToShelf);
    rerollAllButton.addEventListener('click', rerollAllDice);
    clearShelfButton.addEventListener('click', clearShelf);
    const saveDiceButton = document.getElementById('save-dice-button');
    const loadDiceButton = document.getElementById('load-dice-button');
    saveDiceButton.addEventListener('click', saveCustomDice);
    loadDiceButton.addEventListener('click', loadCustomDice);
});

function parseCustomDicePattern(pattern) {
    const match = pattern.match(/^d(\w+):\[(.+)\]$/);
    if (match) {
        const name = match[1];
        const faces = match[2].split(',').map(face => face.trim());
        return { name, faces };
    }
    return null;
}
function rollDice(addToCurrent) {
    let formula = formulaInput.value.trim();
    if (!formula) {
        formula = "red 2d6, blue 3d4";
    }
    const dice = parseDiceFormula(formula);
    const results = dice.map(rollSingleDie);

    if (!addToCurrent) {
        resultDisplay.innerHTML = ''; // Clear current results if not adding to current roll
    }

    results.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type.localeCompare(b.type);
        } else {
            return a.resultIndex - b.resultIndex;
        }
    });
    displayResults(results);
}

function parseDiceFormula(formula) {
    const dice = [];
    const parts = formula.split(',');
    parts.forEach(part => {
        const match = part.trim().match(/(#(?:[0-9a-fA-F]{3}){1,2}|\b\w+\b)?\s*(\d*)d(\w+)/);
        if (match) {
            const color = match[1] ? match[1].trim() : 'white'; // Default color to 'white'
            const count = parseInt(match[2], 10) || 1;
            const type = match[3];
            for (let i = 0; i < count; i++) {
                dice.push({ color, type });
            }
        }
    });
    return dice;
}

function rollSingleDie(die) {
    const { type, color } = die;
    let faces;

    // Check if the die type is a custom die
    const customDie = customDice.find(d => d.name === type);
    if (customDie) {
        faces = customDie.faces;
    } else if (/^\d+$/.test(type)) { // Check if type is a number
        const max = parseInt(type, 10);
        faces = Array.from({ length: max }, (_, i) => i + 1);
    } else {
        switch (type) {
            case 'Z':
                faces = ['🧠','🧠','🧠','💥','🏃','🏃'];
                break;
            // Add more cases for other non-numeric dice types
            default:
                faces = [1, 2, 3, 4, 5, 6]; // Default to d6 if type is unknown
        }
    }
    const resultIndex = Math.floor(Math.random() * faces.length);
    const result = faces[resultIndex];
    return { ...die, result, resultIndex };
}

function displayResults(results) {
    results.forEach(die => {
        const dieElement = document.createElement('div');
        dieElement.className = 'die';
        dieElement.style.backgroundColor = die.color;
        dieElement.textContent = die.result;
        dieElement.draggable = true;
        dieElement.dataset.type = die.type; // Add this line to store the type in the dataset
        dieElement.dataset.color = die.color; // Add this line to store the color in the dataset
        dieElement.addEventListener('dragstart', handleDragStart);
        resultDisplay.appendChild(dieElement);
    });
}

function dropAllToShelf() {
    const dice = Array.from(resultDisplay.children);
    dice.forEach(die => {
        shelf.appendChild(die);
    });
}

function rerollAllDice() {
    const dice = Array.from(resultDisplay.children);
    const results = dice.map(die => {
        const newResult = rollSingleDie({ type: die.dataset.type, color: die.dataset.color });
        die.textContent = newResult.result;
        return { ...newResult, element: die };
    });

    results.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type.localeCompare(b.type);
        } else {
            return a.resultIndex - b.resultIndex;
        }
    });

    resultDisplay.innerHTML = ''; // Clear current results
    results.forEach(result => {
        resultDisplay.appendChild(result.element);
    });
}

function clearShelf() {
    shelf.innerHTML = '';
}

function handleDragStart(event) {
    const target = event.target;
    if (!target.id) {
        target.id = `draggable-${Date.now()}`; // Assign a unique id if it doesn't have one
    }
    event.dataTransfer.setData('text/plain', target.id);
    event.dataTransfer.effectAllowed = 'move';
}

function handleDrop(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    const draggableElement = document.getElementById(id);
    const dropzone = event.target;

    // Ensure the dropzone is the dice-grid
    if (dropzone.id === 'grid') {
        // Calculate the nearest grid position
        const gridSize = 34; // Define the size of each grid cell
        const rect = dropzone.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const snappedX = Math.floor(x / gridSize) * gridSize;
        const snappedY = Math.floor(y / gridSize) * gridSize;

        // Move the element to the snapped position
        draggableElement.style.position = 'absolute';
        draggableElement.style.left = `${snappedX}px`;
        draggableElement.style.top = `${snappedY}px`;

        dropzone.appendChild(draggableElement);
    } else {
        // Handle other dropzones if necessary
        dropzone.appendChild(draggableElement);

        // Clear the position styles when moved to a non-grid dropzone
        draggableElement.style.position = '';
        draggableElement.style.left = '';
        draggableElement.style.top = '';
    }

    // Remove the element from its original container
    const originalContainer = draggableElement.parentElement;
    if (originalContainer && originalContainer !== dropzone) {
        originalContainer.removeChild(draggableElement);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

[resultDisplay, shelf, grid].forEach(zone => {
    zone.classList.add('dropzone');
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('drop', handleDrop);
});

// Add event listeners for drag and drop
addDragAndDropHandlers(resultDisplay);
addDragAndDropHandlers(shelf);
addDragAndDropHandlers(grid);

function addDragAndDropHandlers(container) {
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
}

function updateCustomDiceDisplay() {
    const customDiceContainer = document.getElementById('custom-dice-container');
    customDiceContainer.innerHTML = ''; // Clear the current display

    customDice.forEach((die, index) => {
        const dieElement = document.createElement('div');
        dieElement.className = 'custom-die';
        dieElement.textContent = `d${die.name}: [${die.faces.join(', ')}]`;

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button'; // Add this line
        deleteButton.textContent = '❌';
        deleteButton.addEventListener('click', () => deleteCustomDie(index));

        dieElement.appendChild(deleteButton);
        customDiceContainer.appendChild(dieElement);
    });
}

function deleteCustomDie(index) {
    customDice.splice(index, 1); // Remove the custom die from the array
    updateCustomDiceDisplay(); // Update the display
    saveCustomDice(); // Save the updated custom dice to local storage
}

function saveCustomDice() {
    localStorage.setItem('customDice', JSON.stringify(customDice));
}
function loadCustomDice() {
    const savedDice = localStorage.getItem('customDice');
    if (savedDice) {
        customDice = JSON.parse(savedDice);
        updateCustomDiceDisplay();
    }
}