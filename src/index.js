const Generator = require("./Generator").Generator;

const gen = new Generator();

console.log(gen.create(25, 25).toString());

// const CellGrid = require("./CellGrid").CellGrid;
// const cg = new CellGrid(5, 5);
// cg.createPath(1, 0)
// cg.createPath(1, 1)
// cg.createPath(0, 1)
// cg.createPath(0, 2)

// const gp  = cg.generateGridPath()
// console.log(gp.toString());

// gp.getEvaluatedNeighbors(0, 2);