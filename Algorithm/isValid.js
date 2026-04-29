function isValid(s) {
  const stack = [];
  const map = {
    ")": "(",
    "}": "{",
    "]": "[",
  };

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (ch === "(" || ch === "{" || ch === "[") {
      stack.push(ch);
    } else {
      if (!stack.length || stack[stack.length - 1] !== map[ch]) {
        return false;
      }
      stack.pop();
    }
  }

  return stack.length === 0;
}
