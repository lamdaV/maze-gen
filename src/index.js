const Generator = require("./gen/Generator").Generator;

const showIterations = true;
const gen = new Generator(showIterations);

const grid = gen.create(10, 10);

console.log(grid.toString());
console.log(`start=${grid.start} end=${grid.end}`);
