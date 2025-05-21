const fs = require("fs");

function readMatrixFile(filePath) {
  const rawData = fs.readFileSync(filePath, "utf-8");
  const lines = rawData
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines;
}

function parseMatrixLines(lines) {
  const numRows = parseInt(lines[0].split("=")[1]);
  const numCols = parseInt(lines[1].split("=")[1]);

  const entries = [];

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];

    if (!line.startsWith("(") || !line.endsWith(")")) {
      throw new Error(`Invalid format at line ${i + 1}: ${line}`);
    }

    const content = line.slice(1, -1); // remove parentheses
    const [rowStr, colStr, valStr] = content.split(",").map((s) => s.trim());

    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    const val = parseInt(valStr);

    if (isNaN(row) || isNaN(col) || isNaN(val)) {
      throw new Error(`Invalid number format at line ${i + 1}: ${line}`);
    }

    entries.push({ row, col, value: val });
  }

  return { numRows, numCols, entries };
}

// console.log(parseMatrixLines([
//   'rows=3',
//   'cols=3',
//   '(0, 1, 5)',
//   '(2, 0, -2)'
// ]))

class SparseMatrix {
  constructor(numRows, numCols, entries = []) {
    this.numRows = numRows;
    this.numCols = numCols;
    this.data = new Map(); // key: 'row,col', value: number

    for (const { row, col, value } of entries) {
      this.setElement(row, col, value);
    }
  }

  _key(row, col) {
    return `${row},${col}`;
  }

  setElement(row, col, value) {
    const key = this._key(row, col);
    if (value === 0) {
      this.data.delete(key); // keep it sparse
    } else {
      this.data.set(key, value);
    }
  }

  getElement(row, col) {
    const key = this._key(row, col);
    return this.data.get(key) || 0;
  }

  add(otherMatrix) {
    if (
      this.numRows !== otherMatrix.numRows ||
      this.numCols !== otherMatrix.numCols
    ) {
      throw new Error("Matrix dimensions do not match for addition.");
    }

    const result = new SparseMatrix(this.numRows, this.numCols);

    // Add all elements from this matrix
    for (const [key, value] of this.data) {
      result.data.set(key, value);
    }

    // Add all elements from the other matrix
    for (const [key, value] of otherMatrix.data) {
      const existing = result.data.get(key) || 0;
      const sum = existing + value;

      if (sum !== 0) {
        result.data.set(key, sum);
      } else {
        result.data.delete(key); // Keep sparse
      }
    }

    return result;
  }

  subtract(otherMatrix) {
    if (
      this.numRows !== otherMatrix.numRows ||
      this.numCols !== otherMatrix.numCols
    ) {
      throw new Error("Matrix dimensions do not match for subtraction.");
    }

    const result = new SparseMatrix(this.numRows, this.numCols);

    // Add all elements from this matrix
    for (const [key, value] of this.data) {
      result.data.set(key, value);
    }

    // Subtract all elements from the other matrix
    for (const [key, value] of otherMatrix.data) {
      const existing = result.data.get(key) || 0;
      const diff = existing - value;

      if (diff !== 0) {
        result.data.set(key, diff);
      } else {
        result.data.delete(key);
      }
    }

    return result;
  }

  multiply(otherMatrix) {
    if (this.numCols !== otherMatrix.numRows) {
      throw new Error("Matrix dimensions do not match for multiplication.");
    }

    const result = new SparseMatrix(this.numRows, otherMatrix.numCols);

    // Convert otherMatrix into a fast-access map: col by row
    const otherByCol = new Map();

    for (const [key, value] of otherMatrix.data) {
      const [row, col] = key.split(",").map(Number);

      if (!otherByCol.has(row)) {
        otherByCol.set(row, []);
      }

      otherByCol.get(row).push({ col, value });
    }

    // Multiply
    for (const [keyA, valueA] of this.data) {
      const [rowA, colA] = keyA.split(",").map(Number);

      const matchingEntries = otherByCol.get(colA);
      if (!matchingEntries) continue;

      for (const { col: colB, value: valueB } of matchingEntries) {
        const resultKey = `${rowA},${colB}`;
        const existing = result.data.get(resultKey) || 0;
        const product = valueA * valueB;
        const newValue = existing + product;

        if (newValue !== 0) {
          result.data.set(resultKey, newValue);
        } else {
          result.data.delete(resultKey);
        }
      }
    }

    return result;
  }
}

const readline = require("readline");
const path = require("path");

// === Assuming previous functions and class are already defined above ===

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Choose operation (add, subtract, multiply): ", (operation) => {
    rl.question("Enter path to first matrix file: ", (file1) => {
      rl.question("Enter path to second matrix file: ", (file2) => {
        try {
          const lines1 = readMatrixFile(file1);
          const lines2 = readMatrixFile(file2);

          const matrix1Data = parseMatrixLines(lines1);
          const matrix2Data = parseMatrixLines(lines2);

          const matrix1 = new SparseMatrix(
            matrix1Data.numRows,
            matrix1Data.numCols,
            matrix1Data.entries
          );
          const matrix2 = new SparseMatrix(
            matrix2Data.numRows,
            matrix2Data.numCols,
            matrix2Data.entries
          );

          let result;

          switch (operation.toLowerCase()) {
            case "add":
              result = matrix1.add(matrix2);
              break;
            case "subtract":
              result = matrix1.subtract(matrix2);
              break;
            case "multiply":
              result = matrix1.multiply(matrix2);
              break;
            default:
              throw new Error(
                "Invalid operation. Choose add, subtract, or multiply."
              );
          }

          console.log(`Result matrix (${result.numRows} x ${result.numCols}):`);
          for (const [key, value] of result.data) {
            const [row, col] = key.split(",").map(Number);
            console.log(`(${row}, ${col}, ${value})`);
          }
        } catch (err) {
          console.error("Error:", err.message);
        } finally {
          rl.close();
        }
      });
    });
  });
}

main();

// const matrix = new SparseMatrix(3, 3, [
//   { row: 0, col: 1, value: 5 },
//   { row: 2, col: 0, value: -2 }
// ]);

// console.log(matrix.getElement(0, 1)); // 5
// console.log(matrix.getElement(2, 0)); // 0 (default)
