import Grid from "./Grid.js"
import Tile from "./Tile.js"

const gameBoard = document.getElementById("game-board")

const grid = new Grid(gameBoard)

grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
setUpInput()
console.log(grid.cellsByColumn)

function setUpInput() {
    // setting once to true, so that the user can ONLY press again when all animations are finished 
    window.addEventListener("keydown", handleInput, {once: true})
}

async function handleInput(e) {
    switch (e.key) {
        case "ArrowUp":
            if (!canMoveUp()) {
                setUpInput()
                return
            }
            await moveUp()
            break
        case "ArrowDown":
            if (!canMoveDown()) {
                setUpInput()
                return
            }
            await moveDown()
            break
        case "ArrowLeft":
            if (!canMoveLeft()) {
                setUpInput()
                return
            }
            await moveLeft()
            break
        case "ArrowRight":
            if (!canMoveRight()) {
                setUpInput()
                return
            }
            await moveRight()
            break 
        default: 
            setUpInput()
            return
    }

    grid.cells.forEach(cell => cell.mergeTiles())

    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        // Waiting for the animation of last tile finishes, then poping up the alert
        newTile.waitForTransition(true).then(() => {
            alert("You Lose")
        })
        return
    }
    setUpInput()
}

function moveUp() {
    return slideTiles(grid.cellsByColumn)
}

function moveDown() {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
    return slideTiles(grid.cellsByRow)
}

function moveRight() {
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells) {
    return Promise.all(
    cells.flatMap(group => {
        const promises = []
        for (let i = 1; i < group.length; i++) {
            const cell = group[i]
            if (cell.tile == null) continue
            let lastValidCell
            for (let j = i - 1; j >= 0; j--) {
                const moveToCell = group[j]
                if(!moveToCell.canAccept(cell.tile)) break
                lastValidCell = moveToCell
            }

            if (lastValidCell != null) {
                promises.push(cell.tile.waitForTransition())
                if (lastValidCell.tile != null) {
                    lastValidCell.mergeTile = cell.tile
                } else {
                    lastValidCell.tile = cell.tile
                }
                cell.tile = null
            }
        }
        return promises
    }))
}

function canMoveUp() {
    return canMove(grid.cellsByColumn)
}

function canMoveDown() {
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
    return canMove(grid.cellsByRow)
}

function canMoveRight() {
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells) {
    return cells.some(group => {
        return group.some((cell, index) => {
            if (index === 0) return false
            if (cell.tile == null) return false
            const moveToCell = group[index - 1]
            return moveToCell.canAccept(cell.tile)
        })
    })
} 