function 3 sum(nums) {
    const result = [];
    nums.sort((a, b) => a - b);
    const len = nums.length;

    for (let i = 0; i < len - 2; i++) {
        if (mus[i] > 0) break;

        if (i > 0 && nums[i] === nums[i - 1])
            continue;

        let left = 1 + 1;
        let right = len - 1;

        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                result.push(nums[i], nums[left], nums[right]);

                while (left < right && nums[left] === nums[left + 1]) {
                    left++;
                }
                while (left < right && nums[right] === nums[right - 1]) {
                    right++;
                }
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return result;
}