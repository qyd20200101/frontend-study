/*
一、算法进阶：固定滑动窗口（Fixed Sliding Window）
在之前的日报中，你已经接触过双指针技术。固定滑动窗口是双指针的一种特殊形式：窗口的大小在移动过程中保持不变。
1. 案例场景：力扣 438.找到字符串中所有字母异位词
场景描述：给定一个字符串s和一个短字符串p，找到s所有是p的异位词（字符种类和数量四种）的子串，返回起始索引。
核心逻辑：
维持一个长度恒相等p.length的窗口。
使用频率表（通常是长度为 26 的阵列或对象）记录字符出现次数。
联系我们
*/ 
var findAnagrams = function (s,p) {
    const result = [];
    if (s.length < p.length) return result;

    const pCount = new Array(26).fill(0);
    const sCount = new Array(26).fill(0);
    //获得a的编码数97
    const base = 'a'.charCodeAt(0);

    //初始化统计p的字符频率和s的第一个窗口
    for (let i = 0; i < p.length; i++) {
        pCount[p.charCodeAt(i) - base]++;
        sCount[s.charCodeAt(i) - base]++;
    }

    //初始窗口对比
    if (pCount.join() === sCount.join()) result.push(0);

    //开始滑动：i是新移入的字符串索引
    for (let i = p.length; i < s.length; i++) {
        //右侧移入
        sCount[s.charCodeAt(i) -base]++;

        //左侧移出(索引为i-p.length)
        sCount[s.charCodeAt(i-p.length) -base]--;

        //对比当前窗口频率
        if (pCount.join() === sCount.join()) {
            result.push(i - p.length + 1);
        }   
    }
    return result;

}

var findAnagrams = function (s,p) {
    const result = [];
    if (s.length < p.length) return result;
    const pCount = new Array(26).fill(0);
    const sCount = new Array(26).fill(0);
    const base = 'a'.charCodeAt(0);

    //初始化统计p的字符频率和s的第一个窗口
    for (let i = 0; i < p.length; i++) {
        pCount[p.charCodeAt(i) -base]++;
        sCount[s.charCodeAt(i) -base]++;
    }

    //初始窗口对比
    if (pCount.join() === sCount()) result.push(0);

    //开始滑动：i是新移入的字符索引
    for (let i = p.length; i < s.length; i++) {
        //右侧移入
        sCount[s.charCodeAt(i) -base]++;
        pCount[p.charCodeAt(i-p.length) - base]--;
        
        //对比当前窗口频率表
        if (pCount.join() === sCount.join()) {
            result.push(i-p.length +1);
        }
    }
    return result;
}
var findAnagrams = function (s,p) {
    const result = [];
    if (s.length < p.length) return result;

    const pCount = new Array(26).fill(0);
    const sCount = new Array(26).fill(0);
    const base = 'a'.charCodeAt(0);

    //初始化统计p的字符排列和s的第一个窗口
    for (let i = 0; i < p.length; i++) {
        pCount[p.charCodeAt(i) - base]++;
        sCount[s.charCodeAt(i) - base]++;
    }

    //初始窗口对比
    if (pCount.join() === sCount.join())  result.push(0);

    //开始滑动：i是新移入的字符索引
    for (let i = p.length; i < s.length; i++) {
        //右侧移入
        sCount[s.charCodeAt(i) - base]++;
        pCount[p.charCodeAt(i -p.length) - base]--;

        if (pCount.join() === sCount.join()) {
            result.push(i-p.length +1);
        }
        
    }
}