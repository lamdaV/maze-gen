const cg = require("./CellGrid");
const CellGrid = cg.CellGrid;
const EvaluationType = cg.EvaluationType;


class Generator {  
  constructor(showIterations) {
    this.showIterations = showIterations;
  }
  create(rows, cols) {
    const grid = new CellGrid(rows, cols);

    let positionCount = grid.getNumberOfPositions();
    let positionIndex = this._getRandomInteger(0, positionCount);
    let start = grid.getPosition(positionIndex);
    let [row, col] = start;
    grid.createTarget(row, col);
    grid.removePosition(positionIndex);

    positionCount = grid.getNumberOfPositions();
    let evaluation;
    let path;
    while (positionCount > 0) {
      positionIndex = this._getRandomInteger(0, positionCount);
      [row, col] = grid.getPosition(positionIndex);
      
      evaluation = grid.evaluateGrid(row, col);
      if (evaluation === EvaluationType.MUTABLE) {
        path = this._loopErasedRandomWalk(row, col, grid);
        path.forEach((p) => grid.createTarget(...p));
      }

      grid.removePosition(positionIndex);
      positionCount = grid.getNumberOfPositions();
    }

    return grid;
  }

  _getRandomInteger(low, high) {
    const min = Math.ceil(low);
    const max = Math.floor(high);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  _loopErasedRandomWalk(startRow, startCol, grid) {
    let gridPath = grid.generateGridPath();
    let path = new Array();

    let neighbors;
    let direction;
    let validDirections; 
    let randomDirection;
    let [row, col] = [startRow, startCol];
    // Basically bogo create a Path to a target.
    gridPath.createPath(row, col); 
    path.push([row, col]);
    let attempts = 0;
    while (!gridPath.isConnectedToTarget(row, col)) { // has added row, col connected to the target(s)
      // Find neighbors that have been evaluated. If empty, restart.
      // Neighbors are DirectionEnum -> [row, col]. 0 = UP, 1 = DOWN, 2 = LEFT, 3 = RIGHT
      neighbors = gridPath.getEvaluatedNeighbors(row, col);
      if (Object.keys(neighbors).length === 0) {
        // Try a new place. RNG hates this start or there is no possible path without violating no 2x2 cubes rule.
        attempts++;
        if (attempts >= 5) {
          return [];
        }
        gridPath = grid.generateGridPath();
        path = new Array();
        row = startRow;
        col = startCol;
        continue;
      }

      // Exclude where we just came from to avoid going backwards.
      // If empty, restart.
      validDirections = this._getValidDirections(Object.keys(neighbors), direction);
      if (validDirections.length === 0) {
        attempts++;
        if (attempts >= 5) {
          return [];
        }
        gridPath = grid.generateGridPath();
        path = new Array();
        row = startRow;
        col = startCol;
        continue;
      }
      
      // Of the allowed directions, pick one and add it to the grid.
      randomDirection = this._getRandomInteger(0, validDirections.length);
      [row, col] = neighbors[validDirections[randomDirection]];
      gridPath.createPath(row, col);
      
      // If a loop is created. The only validDirection will led to an old row, col that has already a PATH.
      // Check if there is a loop.
      for (let p = 0; p < path.length; p++) {
        if (path[p][0] === row && path[p][1] === col) {
          path = path.slice(0, p + 1); // get path up to looped point
          gridPath = grid.generateGridPath(); // start a new grid
          path.forEach((p) => gridPath.createPath(...p)); // recreate path up to the loop
          direction = this._getDirectionTransition(path[path.length - 2], path[path.length - 1]); 
          direction = this._getOppositeDirection(direction);
          continue; 
        }
      }
      path.push([row, col])

      // Avoid going back next time.
      direction = this._getOppositeDirection(validDirections[randomDirection]);

      // Useful to track progress/debugging iteration by iteration
      if (this.showIterations) {
        console.log(gridPath.toString());
      }
    }

    return path;
  }

  _getValidDirections(directions, exclude) {
    return directions.filter((d) => d !== exclude);
  }

  _getOppositeDirection(direction) {
    if (!direction) {
      return `${this._getRandomInteger(0, 4)}`;
    } else if (direction === "0") {
      return "1";
    } else if (direction === "1") {
      return "0";
    } else if (direction === "2") {
      return "3";
    } else {
      return "2";
    }
  }

  _getDirectionTransition(before, after) {
    if (!before || !after) {
      return undefined;
    } else if (before[0] === after[0]) {
      return (before[1] > after[1]) ? 3 : 2; // is before's col "right" of after's
    } else {
      return (before[0] > after[0]) ? 1 : 0 // is before's row "below" after's
    }
  }
}

module.exports = {Generator};