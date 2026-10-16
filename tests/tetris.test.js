const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const TetrisEngine = require('../js/tetris.js');

describe('TetrisEngine', () => {
  it('creates an empty grid of correct dimensions', () => {
    const grid = TetrisEngine.createEmptyGrid();
    assert.equal(grid.length, TetrisEngine.ROWS);
    assert.equal(grid[0].length, TetrisEngine.COLS);
    assert.ok(grid.every((row) => row.every((cell) => cell === null)));
  });

  it('defines 7 tetromino pieces with fairy attributes', () => {
    assert.equal(TetrisEngine.TETROMINOES.length, 7);
    const types = new Set(TetrisEngine.TETROMINOES.map((t) => t.type));
    ['O', 'I', 'T', 'S', 'Z', 'L', 'J'].forEach((type) => {
      assert.ok(types.has(type), `Missing tetromino type ${type}`);
    });

    TetrisEngine.TETROMINOES.forEach((piece) => {
      assert.ok(piece.fairyName, 'Must have fairyName');
      assert.ok(piece.symbol, 'Must have fairy symbol');
      assert.ok(piece.color, 'Must have fairy color');
      assert.ok(Array.isArray(piece.shapes) && piece.shapes.length > 0, 'Must have rotation shapes');
    });
  });

  it('canPlace correctly checks boundaries and cell collisions', () => {
    const grid = TetrisEngine.createEmptyGrid(6, 6);
    const oShape = [[1, 1], [1, 1]];

    // Valid placement inside grid
    assert.equal(TetrisEngine.canPlace(grid, oShape, 0, 0), true);
    assert.equal(TetrisEngine.canPlace(grid, oShape, 4, 4), true);

    // Out of bounds: right
    assert.equal(TetrisEngine.canPlace(grid, oShape, 0, 5), false);
    // Out of bounds: bottom
    assert.equal(TetrisEngine.canPlace(grid, oShape, 5, 0), false);
    // Out of bounds: negative
    assert.equal(TetrisEngine.canPlace(grid, oShape, -1, 0), false);

    // Collision with existing block
    grid[2][2] = { type: 'X' };
    assert.equal(TetrisEngine.canPlace(grid, oShape, 1, 1), false); // hits [2][2]
    assert.equal(TetrisEngine.canPlace(grid, oShape, 0, 0), true); // clear
  });

  it('findDropRow calculates the lowest resting row', () => {
    const grid = TetrisEngine.createEmptyGrid(6, 6);
    const oShape = [[1, 1], [1, 1]];

    // On empty grid (height 6, shape height 2), resting row is 4 (rows 4 and 5)
    assert.equal(TetrisEngine.findDropRow(grid, oShape, 2), 4);

    // Place obstacle at bottom row
    grid[5][2] = { type: 'block' };
    // Now resting row is row 3 (rows 3 and 4)
    assert.equal(TetrisEngine.findDropRow(grid, oShape, 2), 3);
  });

  it('clearCompletedLines accurately clears full rows and drops above rows', () => {
    const grid = TetrisEngine.createEmptyGrid(5, 4);

    // Fill row 4 completely
    for (let c = 0; c < 4; c++) {
      grid[4][c] = { color: 'red' };
    }
    // Partial fill row 3
    grid[3][0] = { color: 'blue' };

    const { grid: newGrid, linesCleared, clearedIndices } = TetrisEngine.clearCompletedLines(grid);

    assert.equal(linesCleared, 1);
    assert.deepEqual(clearedIndices, [4]);
    // The previous row 3 should now be at row 4
    assert.ok(newGrid[4][0]);
    assert.equal(newGrid[4][0].color, 'blue');
    assert.equal(newGrid[4][1], null);
    // Top row (row 0) should be empty
    assert.ok(newGrid[0].every((cell) => cell === null));
  });

  it('findBestPlacement finds placement that completes lines', () => {
    const grid = TetrisEngine.createEmptyGrid(6, 4);
    // Fill bottom row except for column 0 and 1
    grid[5][2] = { color: 'yellow' };
    grid[5][3] = { color: 'yellow' };

    // With an O-piece (2x2), dropping at column 0 should complete row 5!
    const oPiece = TetrisEngine.TETROMINOES.find((p) => p.type === 'O');
    const bestMove = TetrisEngine.findBestPlacement(grid, oPiece);

    assert.ok(bestMove !== null);
    assert.equal(bestMove.col, 0);
    assert.equal(bestMove.row, 4);
    assert.equal(bestMove.linesCleared, 1);
  });

  it('findSuboptimalPlacement provides fallback placement for incorrect answers', () => {
    const grid = TetrisEngine.createEmptyGrid(6, 4);
    const oPiece = TetrisEngine.TETROMINOES.find((p) => p.type === 'O');

    const clumsyMove = TetrisEngine.findSuboptimalPlacement(grid, oPiece);
    assert.ok(clumsyMove !== null);
    assert.equal(clumsyMove.rotIndex, 0);
    assert.ok(clumsyMove.col >= 0 && clumsyMove.col <= 2);
  });

  it('evaluates top out and rescue clear functionality', () => {
    const grid = TetrisEngine.createEmptyGrid(6, 4);
    assert.equal(TetrisEngine.isTopOut(grid), false);

    // Block in top row triggers top out
    grid[0][1] = { color: 'pink' };
    assert.equal(TetrisEngine.isTopOut(grid), true);

    const rescued = TetrisEngine.rescueClear(grid);
    assert.equal(TetrisEngine.isTopOut(rescued), false);
    assert.equal(rescued[0][1], null);
  });

  it('calculates progressive score bonuses', () => {
    assert.equal(TetrisEngine.calculateScore(1), 100);
    assert.equal(TetrisEngine.calculateScore(2), 300);
    assert.equal(TetrisEngine.calculateScore(3), 600);
    assert.equal(TetrisEngine.calculateScore(4), 1200);
  });

  it('supports active falling piece movement, rotation wall kicks, ghost landing cells, and drop trails', () => {
    const grid = TetrisEngine.createEmptyGrid(14, 10);
    const tPiece = TetrisEngine.TETROMINOES.find((p) => p.type === 'T');
    let active = TetrisEngine.createActivePiece(tPiece, 10);

    assert.equal(active.row, 0);
    assert.equal(active.col, 3);

    // Move right and down
    const rightStep = TetrisEngine.moveActivePiece(grid, active, 0, 1);
    assert.equal(rightStep.moved, true);
    active = rightStep.active;
    assert.equal(active.col, 4);

    const downStep = TetrisEngine.moveActivePiece(grid, active, 1, 0);
    assert.equal(downStep.moved, true);
    active = downStep.active;
    assert.equal(active.row, 1);

    // Rotate piece
    const rotStep = TetrisEngine.rotateActivePiece(grid, active);
    assert.equal(rotStep.rotated, true);
    active = rotStep.active;
    assert.equal(active.rotIndex, 1);

    // Ghost cells should rest at the bottom of the 14-row grid
    const ghost = TetrisEngine.getGhostCells(grid, active);
    assert.equal(ghost.cells.length, 4);
    const maxGhostRow = Math.max(...ghost.cells.map(([r]) => r));
    assert.equal(maxGhostRow, 13);

    // Drop trail should include cells above the final resting row
    const trail = TetrisEngine.getDropTrailCells(active.shapeMatrix, 1, 11, active.col);
    assert.ok(trail.length > 0);
  });
});

