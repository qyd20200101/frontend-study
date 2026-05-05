function solveNQueens(n) {
  const res = [];
  const board = Array.from({ length: n }, () => Array(n).fill("."));
  const cols = new Set();
  const diag1 = new Set();
  const diag2 = new Set();

  function backtrack(row) {
    if (row === n) {
      res.push(board.map((r) => r.join("")));
      return;
    }
    for (let col = 0; col < n; col++) {
      const d1 = row - col;
      const d2 = row + col;

      if (cols.has(col) || diag1.has(d1) || diag2.has(d2)) {
        continue;
      }

      board[row][col] = "Q";
      cols.add(col);
      diag1.add(d1);
      diag1.add(d2);

      backtrack(row + 1);

      board[row][col] = ".";
      cols.delete(col);
      diag1.delete(d1);
      diag2.delete(d2);
    }
  }
  backtrack(0);
  return res;
}
