const CellType = Object.freeze({WALL: 0, PATH: 1, TARGET: 2});
const EvaluationType = Object.freeze({MUTABLE: 0, IMMUTABLE: 1});

class CellGrid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    
    this.paths = new Array();
    this.positions = new Array();
    this.grid = this._populateGrid(this.rows, this.cols);
  }

  _populateGrid(rows, cols) {
    if (this.grid) {
      return this.grid;
    }

    const grid = new Array(rows);
    for (let row = 0; row < rows; row++) {
      grid[row] = new Array(cols);
      for (let col = 0; col < cols; col++) {
        grid[row][col] = CellType.WALL;
        this.positions.push([row, col]);
      }
    }

    return grid;
  }

  getNumberOfPositions() {
    return this.positions.length;
  }

  getPosition(index) {
    return this.positions[index];
  }

  removePosition(index) {
    const last = this.positions.length - 1;
    [this.positions[index], this.positions[last]] = [this.positions[last], this.positions[index]];
    return this.positions.pop();
  }

  evaluateGrid(row, col) {
    return this.evaluate(row, col, this.grid);
  }

  evaluate(row, col, gridObj) {
    if (this._isPath(this.grid[row][col])) {
      return EvaluationType.MUTABLE;
    } else if (this._isTarget(this.grid[row][col])) {
      return EvaluationType.IMMUTABLE;
    }
    
    let upRow = gridObj[row - 1];
    let downRow = gridObj[row + 1];

    let up = (upRow) ? upRow[col] : undefined;
    let down = (downRow) ? downRow[col] : undefined;
    let left = gridObj[row][col - 1];
    let right = gridObj[row][col + 1];

    let upLeft = (upRow) ? upRow[col - 1] : undefined;
    let upRight = (upRow) ? upRow[col + 1] : undefined;
    let downLeft = (downRow) ? downRow[col - 1] : undefined;
    let downRight = (downRow) ? downRow[col + 1] : undefined;
    
    // Avoid creating 2x2 cubes
    if (this._isPathOrTarget(up) && this._isPathOrTarget(upLeft) && this._isPathOrTarget(left)) {
      return EvaluationType.IMMUTABLE;
    } else if (this._isPathOrTarget(up) && this._isPathOrTarget(upRight) && this._isPathOrTarget(right)) {
      return EvaluationType.IMMUTABLE;
    } else if (this._isPathOrTarget(down) && this._isPathOrTarget(downLeft) && this._isPathOrTarget(left)) {
      return EvaluationType.IMMUTABLE;
    } else if (this._isPathOrTarget(down) && this._isPathOrTarget(downRight) && this._isPathOrTarget(right)) {
      return EvaluationType.IMMUTABLE;
    }
    return EvaluationType.MUTABLE;
  }

  getEvaluatedNeighbors(row, col) {
    let neighbors = {};

    if (row > 0 && this.evaluateGrid(row - 1, col) === EvaluationType.MUTABLE) {
      neighbors = Object.assign(neighbors, {0: [row - 1, col]});
    }
    if (row < this.rows - 1 && this.evaluateGrid(row + 1, col) === EvaluationType.MUTABLE) {
      neighbors = Object.assign(neighbors, {1: [row + 1, col]});
    }
    if (col > 0 && this.evaluateGrid(row, col - 1) === EvaluationType.MUTABLE) {
      neighbors = Object.assign(neighbors, {2: [row, col - 1]});
    }
    if (col < this.cols - 1 && this.evaluateGrid(row, col + 1) === EvaluationType.MUTABLE) {
      neighbors = Object.assign(neighbors, {3: [row, col + 1]});
    }

    return neighbors;
  }

  generateGridPath() {
    const gridPath = new CellGrid(this.rows, this.cols);
    gridPath._overlayGridPath(this.grid);
    gridPath._convertPathToTarget();
    return gridPath;
  }

  _overlayGridPath(path) {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = path[row][col];
      }
    }
  }

  _convertPathToTarget() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        // Convert any existing paths to target.
        if (this.grid[row][col] === CellType.PATH) {
          this.grid[row][col] = CellType.TARGET;
        }
      }
    }
  }

  createPath(row, col) {
    this.grid[row][col] = CellType.PATH;
  }

  createTarget(row, col) {
    this.paths = [row, col];
    this.grid[row][col] = CellType.TARGET;
  }

  isConnectedToTarget(row, col) {
    return this._isConnectedTo(row, col, CellType.TARGET);
  }

  isConnectedToPath(row, col) {
    return this._isConnectedTo(row, col, CellType.PATH);
  }

  _isConnectedTo(row, col, type) {
    let upRow = this.grid[row - 1];
    let downRow = this.grid[row + 1];

    let up = (upRow) ? upRow[col] : undefined;
    let down = (downRow) ? downRow[col] : undefined;
    let left = this.grid[row][col - 1];
    let right = this.grid[row][col + 1];

    return (up && up === type)
      || (down && down === type)
      || (left && left === type) 
      || (right && right === type);
  }

  toString() {
    let repr = "";
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col] === CellType.PATH) {
          repr += " * ";
        } else if (this.grid[row][col] === CellType.TARGET) {
          repr += " x ";
        } else {
          repr += " - ";
        }
      } 
      repr += "\n";
    }
    return repr;
  }

  _isPathOrTarget(value) {
    return value && (this._isPath(value) || this._isTarget(value));
  }

  _isPath(value) {
    return value === CellType.PATH;
  }

  _isTarget(value) {
    return value === CellType.TARGET;
  }
}

module.exports = {CellGrid, EvaluationType}