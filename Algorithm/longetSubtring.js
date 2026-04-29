function longestSubstring(s) {
  const map = new Map();
  let left = 0;
  let right = 0;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (map.has(ch)) {
      left = Math.max(left, map.get(ch) + 1);
    }

    map.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}
