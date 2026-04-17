/*
核心一：算法进阶——动态滑动窗口我们在第5天学习了“固定窗口”（如找异位词），窗口大小是不变的。
今天挑战的力扣3.无重复角色的尽头子串属于“动态窗口”：右光标主动探索扩大窗口，
一旦遇到不条件满足的元素，左指针光标收缩缩小窗口。
1. 业务场景
映射前端日志防/抖去重：在监控系统中，分析用户连续无重复点击操作的渠道终止。
WebSocket WebSocket WebSocket WebSocket WebSocket
2.地图的降维打击）传统的双指针如果用Set，遇到重复的字符时，左指针只能一步一步往右挪，把移出的字符从Set删掉，时间复杂度最差的是$O(2n)$。
优化思路：使用Map记录每个字符最后一次出现的索引。当遇到重复字符时，首页$O(n)$。
*/ 

var lengthOfLongestSubstring = function (s) {
    let map = new Map();//记录字符最后一次出现的索引
    let maxLen = 0;
    let left = 0;//窗口左边界

    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        
        //如果遇到触发字符，且该字符在当前窗口
        if (map.has(char) && map.get(char) >= left) {
            //左指针直接跳跃到重复字符上次出现位置的下一位
            left = map.get(char) +1;
        }

        //更新字符最新索引
        map.set(char,right);

        //计算当前窗口长度，更新最大值
        maxLen = Math.max(maxLen,right-left +1);
    }
    return maxLen;
}

var lengthOfLongestSubstring = function (s) {
    let map = new Map();
    let maxLen = 0;
    let left = 0;

    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        
        if (map.has(char) && map.get(char) >= left) {
            left = map.get(char) +1;
        }

        map.set(char,right);

        maxLen = Math.max(maxLen, right - left +1);
    }

    return maxLen;
}

var lengthOfLongestSubstring = function (s) {
    let map = new Map();
    let maxLen = 0;
    let left = 0;
    
    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        
        if (map.has(char) && map.get(char) >=left) {
            left  = map.get(char)+1;
        }
        map.set(char,right);
        maxLen = Math.max(maxLen, right-left +1);
    }
    return maxLen;
}

var lengthOfLongestSubstring = function (s) {
    let map = new Map();
    let left =0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
        const char = s[right];

        if (map.has(char) && map.get(char) >= left) {
            let  = map.get(char)+1;
        }
        map.set(char,right);
        maxLen = Math.max(maxLen,right-left)+1;
    }
    return maxLen;
}