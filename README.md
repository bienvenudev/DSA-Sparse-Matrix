# Sparse Matrix Operations

This project implements sparse matrix operations (addition, subtraction, and multiplication) using an efficient Map data structure in JavaScript.

## Features

- Supports basic matrix operations: add, subtract, multiply
- Efficient memory usage by storing only non-zero elements
- File-based input/output for matrices
- Automatic dimension validation for operations

## Usage

1. Navigate to the input files directory:
```bash
cd sample_inputs
```

2. Run the program with the following format:
```bash
node ../src/sparse-matrix.js <operation> <matrix1_file> <matrix2_file> <output_file>
```

The project includes several sample input files in the `sample_inputs` directory (easy_sample_01_1.txt through easy_sample_04_1.txt) that you can use to test the operations.

Example operations:
```bash
# Addition
node ../src/sparse-matrix.js add easy_sample_02_1.txt easy_sample_02_2.txt result.txt

# Subtraction
node ../src/sparse-matrix.js subtract easy_sample_02_1.txt easy_sample_02_2.txt result.txt

# Multiplication
node ../src/sparse-matrix.js multiply easy_sample_02_1.txt easy_sample_02_2.txt result.txt
```

## Input File Format

The program expects matrix input files in the following format:
```
rows=<number_of_rows>
cols=<number_of_columns>
(row_index, column_index, value)
(row_index, column_index, value)
...
```

Example:
```
rows=3
cols=4
(0, 1, 5)
(1, 2, 3)
(2, 0, 7)
```

## Implementation Details

- Uses Node.js's `fs` module for file operations
- Implements sparse matrix using JavaScript's Map data structure for efficient storage
- Only stores non-zero elements to optimize memory usage
- Performs automatic dimension validation before operations
- Outputs the matrix dimensions during operations (e.g., "3x4 add 4x3")

## Error Handling

The program includes comprehensive error handling for:
- Invalid matrix dimensions
- File reading/writing errors
- Invalid operations
- Incorrect number of arguments