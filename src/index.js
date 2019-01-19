const Generator = require("./Generator").Generator;

const showIterations = true;
const gen = new Generator(showIterations);

console.log(gen.create(10, 10).toString());
