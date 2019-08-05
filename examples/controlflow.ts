import lib = require('@aws-cdk/lib');

/**
 * This squares a value
 */
function squareNumber(x: number) {
  return x * x;
}

// This is where the magic happens
if (Math.random() % 2 == 0) {
  console.log(squareNumber(3));
} else {
  console.log(squareNumber(6));
}