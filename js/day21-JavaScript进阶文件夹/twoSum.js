//哈希表map一次遍历
var twoSum = function(nums, target) {
    //初始化哈希表，存储数值，下表
    const numMap = new Map();
    //一次遍历数组
    for (let index = 0; index < nums.length; index++) {
        const currentNum = nums[index];
        //计算需要的补数
        const needNum = target - currentNum;
        //补数再哈希表，直接返回结果
        if (numMap.has(needNum)) {
            return [numMap.get(needNum), index];
        }
        //不存在则存入当前数值和下标
        numMap.set(currentNum);
    }
    return [];
};

//无重复字符的最长子串
//滑动窗口和哈希表

var lengthOfLongestSubstring = function(s) {
    //哈希表，存储字符最新出现的下标
    const charMap = new Map();
    //左指针:窗口左边界，初始值为0
    let left = 0;
    //记录全局最大无重复子串长度
    let maxLength = 0;

    //右指针遍历字符串，作为窗口右边界
    for (let right = 0; right < s.length; right++) {
        const currentChar = s[right];
        //遇到重复字符串，且重复字符串再当前窗口
        if (charMap.has(currentChar) && charMap.get(currentChar) >= left) {
            //左指针移动到重复字符串的下一位,收缩窗口
            left = charMap.get(currentChar) + 1;
        }
        //更新当前字符的最新下标
        charMap.set(currentChar, right);
        //计算当前窗口长度，更新最大长度
        const currentWindowLength = right - left + 1;
        maxLength = Math.max(maxLength, currentWindowLength);
    }
    return maxLength;
}