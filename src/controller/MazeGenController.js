const Generator = require("../gen/Generator").Generator;
const { validationResult } = require("express-validator/check");


const getIndex = (request, response) => {
  const html = `
  <h1> Endpoints </h1>
  <ul>
    <li>GET /api/maze : List of endpoints</li>
    <li>GET /api/maze/active : Get active maze</li>
    <li>PUT /api/maze/complete : Complete active maze</li>
  </ul>
  `
  response.status(200)
    .send(html);
}

const showIterations = false;
let gen = new Generator(showIterations);
let active = null;
const getActive = (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400)
      .json({error: errors.array()});
  }
  if (!active) {
    active = gen.create(process.env.MAZE_ROWS, process.env.MAZE_COLS);
    console.log(active.toString());
    console.log(`start=${active.start} end=${active.end}`);
  }

  const row = request.query.row;
  const col = request.query.col;
  let result = active.check(row, col);
  return response.status(200)
    .json(result);
}

const getComplete = (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400)
      .json({error: errors.array()});
  }

  if (!active) {
    return response.status(200)
      .json({reason: "maze has been completed or there are no active maze", status: false});
  }

  const path = request.body.path;
  const start = path[0];
  if (start.length !== 2) {
    return response.status(200)
      .json({reason: "path contains malformed entry", status: false});
  } else if (start[0] !== active.start[0] || start[1] !== active.start[1]) {
    return response.status(200)
      .json({reason: "path does not begin at start of maze", status: false});
  }
  const rest = path.splice(1);
  let prev = start;
  let current;
  let rowDiff;
  let colDiff;
  for (let i = 0; i < rest.length; i++) {
    current = rest[i];
    // Valid coordinates?
    if (current.length !== 2) {
      return response.status(200)
        .json({reason: "path contains malformed entry", status: false});
    }

    // Is there teleportation?
    rowDiff = Math.abs(current[0] - prev[0]);
    colDiff = Math.abs(current[1] - prev[1]);
    if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
      return response.status(200)
        .json({reason: "movement transition exceeds 1", status: false});
    }
    
    // Is this even a path?
    if (!active.isValidPosition(...current)) {
      return response.status(200)
        .json({reason: "movement to invalid position", status: false});
    }

    prev = current;
  }

  current = (current) ? current : prev;
  if (current[0] !== active.end[0] || current[1] !== active.end[1]) {
    return response.status(200)
      .json({reason: "path did not end at maze end", status: false});
  } 

  active = null;
  return response.status(200)
    .json({reason: "maze complete", status: true});
}

module.exports = {getIndex, getActive, getComplete};