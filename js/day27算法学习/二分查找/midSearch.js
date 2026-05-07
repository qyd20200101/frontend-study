function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

//左边界
function leftBound(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[id] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return nums[left] === target ? left : -1;
}

//右边界
function rightBound(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right + 1) / 2);
    if (nums[mid] > target) {
      right = mid - 1;
    } else {
      left = mid;
    }
  }
  return nums[left] === target ? left : -1;
}
//搜索插入
function searchInsert(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] <= target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return left;
}

//找出目标值的起始终止位置
function searchRange(nums, target) {
  const left = leftBound(nums, target);
  const right = rightBound(nums, target);
  return [left, right];
}

function leftBound(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] >= target) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  if (left >= nums.length || nums[left] !== target) {
    return -1;
  }
  return left;
}

function rightBound(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right + 1) / 2);

    if (nums[mid] <= target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  if (right < 0 || nums[right] !== target) {
    return -1;
  }
  return right;
}

//旋转数组
function searchCool(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      return mid;
    }
    //左半边有序
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    //右半边有序
    else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  return -1;
}
function findMin(nums) {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] < nums[right]) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  return nums[left];
}
//寻找峰值
/*
核心：nums[mid] < nums[mid + 1]
→ 峰值在右边
nums[mid] > nums[mid + 1]
→ 峰值在左边或就是 mid
*/
function findPeakElement(nums) {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] < nums[mid + 1]) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}
//二维有序矩阵查找目标值
/*
从右上角开始，如果当前值比目标值大，就往左移动一列；
如果当前值比目标值小，就往下移动一行。
因为每次都能排除掉一整行或一整列
matrix[row][col] === target → 找到了，返回 true
matrix[row][col] > target → 当前列太大，col--
matrix[row][col] < target → 当前行太小，row++
*/
function searchMatrix(matrix, target) {
  if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
    return false;
  }

  let row = 0;
  let col = matrix[0].length - 1;

  while (row < matrix.length && col >= 0) {
    const cur = matrix[row][col];

    if (cur === target) {
      return true;
    } else if (cur > target) {
      col--;
    } else {
      row++;
    }
  }
  return false;
}
