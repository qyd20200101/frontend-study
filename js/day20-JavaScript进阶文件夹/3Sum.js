function Sum(nums) {
    const result = [];

    //给数组从小到大排序
    nums.sort((a,b)=> a-b,0)
    for (let index = 0; index < arr.length-2; index++) {
        //如果当前的基准以及大于0，因为数组以及排序过，后面的数越来越大
        if (nums[i] > 0) break;

        //去重逻辑：如果当前的基准数和上一个基准数一样，算出来的结果宽肯定一样,直接跳过
        if (i> 0 && nums[i] === nums[i-1]) continue;

        //定义双指针
        let left = i+1;
        let right = nums.length-1;
        while (right > left) {
            const sum = nums[i]+ nums[left] +nums[right];
            if (sum === 0) {
                result.push([nums[i],nums[left],nums[right]]);

                //去重逻辑：移动指针式，跳过重复的数字，防止产生相同的答案
                while(left <right && nums[left] === nums[left+1]) left++;
                while(left< right && nums[right] === nums[right -1])right--;
                //存完结果，左右指针同时王中间收缩一步，继续寻找
                left++;
                right--;

            }else if(sum < 0){
                //和太小，说明左边的数偏向，左指针往右走一步
                left++;
            } else{
                //和太大，说明右边的数偏大，右指针往左走一步
                right--;
            }
                
        }
        return result;
    }
}