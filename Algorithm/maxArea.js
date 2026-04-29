function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let res = 0;

  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    res = Math.max(res, area);

    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return res;
}
