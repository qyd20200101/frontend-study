function isValid(s) {
  //如果长度是奇数不可能闭合，直接返回false
  if (s.length % 2 !== 0) return 0;

  const stack = [];
  //建立匹配字典，左括号为key,右括号为value
  const map = {
    ")": "(",
    "}": "{",
    "]": "[",
  };

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    //如果是左括号，在字典的值里面，或者不是字典的键，推入栈中
    if (!map[char]) {
      stack.push(char);
      //如果是右括号
    } else {
      //拿出栈顶元素，看能否与字典要求的值匹配
      const topElement = stack.pop();
      if (topElement !== map[char]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}
