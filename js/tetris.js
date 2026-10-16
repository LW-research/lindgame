/* Teenieping Magic Blocks (Tetris Engine)
   Generates candy-gem tetrominoes, smart auto-placement solver,
   line-clearing logic, and curriculum question integration.
   Compatible with browser (window.TetrisEngine) and Node.js (module.exports). */
(function (root) {
  'use strict';

  const COLS = 10;
  const ROWS = 14;
  const TARGET_LINES_FOR_VICTORY = 10;

  // 7 Tetromino shapes with Teenieping fairy associations
  const TETROMINOES = [
    {
      type: 'O',
      fairyId: 'heartsping',
      fairyName: 'Heartsping',
      symbol: '💖',
      color: '#ff6b9d',
      glow: 'rgba(255, 107, 157, 0.6)',
      shapes: [
        [
          [1, 1],
          [1, 1],
        ],
      ],
    },
    {
      type: 'I',
      fairyId: 'gogoping',
      fairyName: 'Gogoping',
      symbol: '⚡',
      color: '#ff7b47',
      glow: 'rgba(255, 123, 71, 0.6)',
      shapes: [
        [
          [1, 1, 1, 1],
        ],
        [
          [1],
          [1],
          [1],
          [1],
        ],
      ],
    },
    {
      type: 'T',
      fairyId: 'lalaping',
      fairyName: 'Lalaping',
      symbol: '🎵',
      color: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.6)',
      shapes: [
        [
          [0, 1, 0],
          [1, 1, 1],
        ],
        [
          [1, 0],
          [1, 1],
          [1, 0],
        ],
        [
          [1, 1, 1],
          [0, 1, 0],
        ],
        [
          [0, 1],
          [1, 1],
          [0, 1],
        ],
      ],
    },
    {
      type: 'S',
      fairyId: 'chachaping',
      fairyName: 'Chachaping',
      symbol: '🍀',
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.6)',
      shapes: [
        [
          [0, 1, 1],
          [1, 1, 0],
        ],
        [
          [1, 0],
          [1, 1],
          [0, 1],
        ],
      ],
    },
    {
      type: 'Z',
      fairyId: 'happyping',
      fairyName: 'Happyping',
      symbol: '🎈',
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.6)',
      shapes: [
        [
          [1, 1, 0],
          [0, 1, 1],
        ],
        [
          [0, 1],
          [1, 1],
          [1, 0],
        ],
      ],
    },
    {
      type: 'L',
      fairyId: 'dadaping',
      fairyName: 'Dadaping',
      symbol: '📖',
      color: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.6)',
      shapes: [
        [
          [1, 0],
          [1, 0],
          [1, 1],
        ],
        [
          [1, 1, 1],
          [1, 0, 0],
        ],
        [
          [1, 1],
          [0, 1],
          [0, 1],
        ],
        [
          [0, 0, 1],
          [1, 1, 1],
        ],
      ],
    },
    {
      type: 'J',
      fairyId: 'heartsping',
      fairyName: 'Heartsping Star',
      symbol: '⭐',
      color: '#ec4899',
      glow: 'rgba(236, 72, 153, 0.6)',
      shapes: [
        [
          [0, 1],
          [0, 1],
          [1, 1],
        ],
        [
          [1, 0, 0],
          [1, 1, 1],
        ],
        [
          [1, 1],
          [1, 0],
          [1, 0],
        ],
        [
          [1, 1, 1],
          [0, 0, 1],
        ],
      ],
    },
  ];

  function createEmptyGrid(rows = ROWS, cols = COLS) {
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(null);
      }
      grid.push(row);
    }
    return grid;
  }

  function cloneGrid(grid) {
    return grid.map((r) => r.slice());
  }

  function canPlace(grid, shapeMatrix, row, col) {
    const numRows = grid.length;
    const numCols = grid[0].length;
    const sRows = shapeMatrix.length;
    const sCols = shapeMatrix[0].length;

    for (let r = 0; r < sRows; r++) {
      for (let c = 0; c < sCols; c++) {
        if (shapeMatrix[r][c]) {
          const gr = row + r;
          const gc = col + c;
          if (gr < 0 || gr >= numRows || gc < 0 || gc >= numCols) {
            return false;
          }
          if (grid[gr][gc] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function findDropRow(grid, shapeMatrix, col) {
    let bestRow = -1;
    for (let r = 0; r <= grid.length - shapeMatrix.length; r++) {
      if (canPlace(grid, shapeMatrix, r, col)) {
        bestRow = r;
      } else {
        break;
      }
    }
    return bestRow;
  }

  function placePiece(grid, shapeMatrix, row, col, blockData) {
    const next = cloneGrid(grid);
    for (let r = 0; r < shapeMatrix.length; r++) {
      for (let c = 0; c < shapeMatrix[0].length; c++) {
        if (shapeMatrix[r][c]) {
          next[row + r][col + c] = { ...blockData };
        }
      }
    }
    return next;
  }

  function clearCompletedLines(grid) {
    const numCols = grid[0].length;
    const clearedIndices = [];
    const remainingRows = [];

    for (let r = 0; r < grid.length; r++) {
      const isComplete = grid[r].every((cell) => cell !== null);
      if (isComplete) {
        clearedIndices.push(r);
      } else {
        remainingRows.push(grid[r]);
      }
    }

    if (clearedIndices.length === 0) {
      return { grid, linesCleared: 0, clearedIndices: [] };
    }

    const newGrid = [];
    for (let i = 0; i < clearedIndices.length; i++) {
      const emptyRow = [];
      for (let c = 0; c < numCols; c++) {
        emptyRow.push(null);
      }
      newGrid.push(emptyRow);
    }
    for (const row of remainingRows) {
      newGrid.push(row.slice());
    }

    return { grid: newGrid, linesCleared: clearedIndices.length, clearedIndices };
  }

  // Column heights and hole calculations for smart placement
  function evaluateGrid(grid) {
    const numRows = grid.length;
    const numCols = grid[0].length;
    const colHeights = new Array(numCols).fill(0);
    let holes = 0;
    let aggregateHeight = 0;

    for (let c = 0; c < numCols; c++) {
      let foundBlock = false;
      for (let r = 0; r < numRows; r++) {
        if (grid[r][c] !== null) {
          if (!foundBlock) {
            colHeights[c] = numRows - r;
            aggregateHeight += colHeights[c];
            foundBlock = true;
          }
        } else if (foundBlock) {
          holes++;
        }
      }
    }

    let bumpiness = 0;
    for (let c = 0; c < numCols - 1; c++) {
      bumpiness += Math.abs(colHeights[c] - colHeights[c + 1]);
    }

    const maxHeight = Math.max(...colHeights);
    return { aggregateHeight, holes, bumpiness, maxHeight };
  }

  // AI Smart Auto-Placement Solver
  // Evaluates all rotations and column positions to find the placement that
  // maximizes completed lines, minimizes height, holes, and bumpiness.
  function findBestPlacement(grid, piece) {
    const rotations = piece.shapes;
    let bestScore = -Infinity;
    let bestMove = null;

    rotations.forEach((shapeMatrix, rotIndex) => {
      const sCols = shapeMatrix[0].length;
      const maxCol = grid[0].length - sCols;

      for (let col = 0; col <= maxCol; col++) {
        const dropRow = findDropRow(grid, shapeMatrix, col);
        if (dropRow === -1) continue;

        // Simulate placing piece
        const simGrid = placePiece(grid, shapeMatrix, dropRow, col, piece);
        const { grid: afterClear, linesCleared } = clearCompletedLines(simGrid);
        const metrics = evaluateGrid(afterClear);

        // Scoring heuristic:
        // Huge bonus for clearing lines, penalty for aggregate height, holes, and bumpiness
        const score =
          (linesCleared * 800) -
          (metrics.aggregateHeight * 8) -
          (metrics.holes * 60) -
          (metrics.bumpiness * 4) -
          (metrics.maxHeight * 12);

        if (score > bestScore || bestMove === null) {
          bestScore = score;
          bestMove = {
            rotIndex,
            shapeMatrix,
            col,
            row: dropRow,
            linesCleared,
          };
        }
      }
    });

    return bestMove;
  }

  // Non-optimal placement for incorrect answers: drops in a column with no rotation
  function findSuboptimalPlacement(grid, piece) {
    const shapeMatrix = piece.shapes[0];
    const maxCol = grid[0].length - shapeMatrix[0].length;
    const validCols = [];

    for (let col = 0; col <= maxCol; col++) {
      const dropRow = findDropRow(grid, shapeMatrix, col);
      if (dropRow !== -1) {
        validCols.push({ col, row: dropRow });
      }
    }

    if (validCols.length === 0) return null;

    // Pick column that doesn't clear lines (or highest column)
    const sortedByHeight = validCols.slice().sort((a, b) => a.row - b.row);
    // Return highest row (closer to top) for clumsy drop
    const chosen = sortedByHeight[0] || validCols[0];
    return {
      rotIndex: 0,
      shapeMatrix,
      col: chosen.col,
      row: chosen.row,
      linesCleared: 0,
    };
  }

  function pickRandomPiece(rosterLeaderId) {
    // If a specific leader is passed, slightly favor their piece
    if (rosterLeaderId && Math.random() < 0.25) {
      const match = TETROMINOES.find((t) => t.fairyId === rosterLeaderId);
      if (match) return { ...match };
    }
    const idx = Math.floor(Math.random() * TETROMINOES.length);
    return { ...TETROMINOES[idx] };
  }

  function isTopOut(grid) {
    // Top row (row 0) contains any blocks
    return grid[0].some((c) => c !== null);
  }

  // Rescue spell: Clears top 3 occupied rows to keep the child playing
  function rescueClear(grid) {
    const numRows = grid.length;
    const numCols = grid[0].length;
    const newGrid = createEmptyGrid(numRows, numCols);

    // Keep lower rows, clear top occupied rows
    for (let r = 4; r < numRows; r++) {
      newGrid[r] = grid[r].map((c) => (c ? { ...c } : null));
    }
    return newGrid;
  }

  function calculateScore(linesCleared) {
    const table = [0, 100, 300, 600, 1200];
    return table[Math.min(4, Math.max(0, linesCleared))] || (linesCleared * 300);
  }

  // ---------- Real-Time Active Falling Piece & Ghost Projection ----------

  function createActivePiece(piece, cols = COLS) {
    if (!piece || !piece.shapes || !piece.shapes.length) return null;
    const shapeMatrix = piece.shapes[0];
    const startCol = Math.max(0, Math.floor((cols - shapeMatrix[0].length) / 2));
    return {
      piece,
      rotIndex: 0,
      shapeMatrix,
      row: 0,
      col: startCol,
    };
  }

  function moveActivePiece(grid, active, dRow, dCol) {
    if (!active || !grid) return { moved: false, active };
    const nextRow = active.row + dRow;
    const nextCol = active.col + dCol;
    if (canPlace(grid, active.shapeMatrix, nextRow, nextCol)) {
      return {
        moved: true,
        active: {
          ...active,
          row: nextRow,
          col: nextCol,
        },
      };
    }
    return { moved: false, active };
  }

  // Rotate with authentic wall-kick offsets
  function rotateActivePiece(grid, active) {
    if (!active || !grid || !active.piece?.shapes) return { rotated: false, active };
    const shapes = active.piece.shapes;
    if (shapes.length <= 1) return { rotated: true, active };

    const nextRot = (active.rotIndex + 1) % shapes.length;
    const nextShape = shapes[nextRot];
    const kicks = [0, -1, 1, -2, 2];

    for (const dx of kicks) {
      const candCol = active.col + dx;
      if (canPlace(grid, nextShape, active.row, candCol)) {
        return {
          rotated: true,
          active: {
            ...active,
            rotIndex: nextRot,
            shapeMatrix: nextShape,
            col: candCol,
          },
        };
      }
    }
    return { rotated: false, active };
  }

  function getActiveCells(active) {
    if (!active || !active.shapeMatrix) return [];
    const cells = [];
    for (let r = 0; r < active.shapeMatrix.length; r++) {
      for (let c = 0; c < active.shapeMatrix[0].length; c++) {
        if (active.shapeMatrix[r][c]) {
          cells.push([active.row + r, active.col + c]);
        }
      }
    }
    return cells;
  }

  function getGhostCells(grid, active) {
    if (!grid || !active || !active.shapeMatrix) return { dropRow: -1, cells: [] };
    let dropRow = active.row;
    while (canPlace(grid, active.shapeMatrix, dropRow + 1, active.col)) {
      dropRow++;
    }
    const cells = [];
    for (let r = 0; r < active.shapeMatrix.length; r++) {
      for (let c = 0; c < active.shapeMatrix[0].length; c++) {
        if (active.shapeMatrix[r][c]) {
          cells.push([dropRow + r, active.col + c]);
        }
      }
    }
    return { dropRow, cells };
  }

  function getDropTrailCells(shapeMatrix, startRow, endRow, col) {
    if (!shapeMatrix || endRow <= startRow) return [];
    const trail = [];
    for (let r = Math.max(0, startRow); r < endRow; r++) {
      for (let c = 0; c < shapeMatrix[0].length; c++) {
        const hasBlockInCol = shapeMatrix.some((rowArr) => rowArr[c]);
        if (hasBlockInCol) {
          trail.push([r, col + c]);
        }
      }
    }
    return trail;
  }

  const api = {
    COLS,
    ROWS,
    TARGET_LINES_FOR_VICTORY,
    TETROMINOES,
    createEmptyGrid,
    cloneGrid,
    canPlace,
    findDropRow,
    placePiece,
    clearCompletedLines,
    evaluateGrid,
    findBestPlacement,
    findSuboptimalPlacement,
    pickRandomPiece,
    isTopOut,
    rescueClear,
    calculateScore,
    createActivePiece,
    moveActivePiece,
    rotateActivePiece,
    getActiveCells,
    getGhostCells,
    getDropTrailCells,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.TetrisEngine = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
