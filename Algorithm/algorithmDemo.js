// 思路：1.初始化一个空的数组
// 2.遍历数组中的每一个元素
// 对每一个元素检测是否存在空数组中，如果存在，说明存在重复元素
// 不存在，则将元素添加到数组中
// 3.遍历整个数组都没发现重复的元素返回false
// function containsDuplicate(nums){
//     // Set集合中的元素只会出现一次，唯一
//     // 插入方法Set.add()
//     // 调用add()方法时集合中不存在相同的元素
//     // has()方法检测某个值是否存在集合中
//     // 性能方面：比Array.prototype.includes平均速度快
//     const seen = new Set();
//     for (const num of nums) {
//         if(seen.has(num)){
//             return true;
//         }
//         seen.add(num);
//     }
//     return false;
// }
// console.log(containsDuplicate([1,2,2,3,4,5]));
/*
哈希表实现功能
*/
// function contaionsDuplicate(nums) {
//     // Map的键只能出现一次
//     /*
//     通过for...of迭代后，每次会形成[key,value]的数组，迭代按顺序插入，通过set()方法插入到集合中
//     */
//     const hashTable = new Map();
//     for (const num of nums) {
//         if (hashTable.has(num)) {
//             return true;
//         }
//         hashTable.set(num, true);
//     }
//     return false
// }
// console.log(contaionsDuplicate([1, 2, 3, 4, 5, 6]));
/*
初始化两个哈希映射:分别存储字符串s和t每个字符出现的次数
遍历字符串:遍历字符串s和t,在哈希映射中记录每个字符出现的次数
比较哈希映射:比较两个哈希映射是否完全相同
*/

// function isAnagram(s, t) {
//     if (s.length !== t.length) {
//         return false;
//     }

//     const mapS = {}, mapT = {};
//     // 同时创建两个哈希映射
//     for (let i = 0; i < s.length; i++) {
//         mapS[s[i]] = (mapS[s[i]] || 0) + 1;
//         mapT[t[i]] = (mapT[t[i]] || 0) + 1;

//     }

//     // 直接比较两个映射
//     for (let key in mapS) {
//         if (mapS[key] !== mapT[key]) {
//             return false;
//         }
//     }
//     // 确保t中的每个字符也在s中出现相同的次数
//     for (let key in mapT) {
//         if (mapS[key] === undefined) {
//             return false;
//         }
//     }

//     return true;
// }

// const s1 = "asddsaas",t1="dsadsads";
// console.log(isAnagram(s1,t1));
/*
    双重for循环暴力查找
*/ 
function sunObject(target,arr){
   for(let i = 0;i<=arr.length;i++){
        for(let j =1;j<arr.length;j++){
            if(arr[i]+arr[j] === target){
                return [i,j];
            }
        }
   }
   return null;
}

console.log(sunObject(4,[1,2,3,4,2]));
/*
哈希表搜索
1.可以提供快速查找删除方法
平均时间复杂度为o(n)
2.减少冗余计算，通过预先存储以访问的的元素和索引，避免重复比较
3.定位快速,先计算目标值与当前值的差值，直接查询差值是否存在，存在就说明找到了值，效率非常高
4.利用空间换时间，引入哈希表会增加额外的空间消耗
5.面对，配对，计数，去重等问题，使用哈希表体现空间换时间的经典计算机思想

*/ 

function twoSum(target,arr){
    // 创建一个空对象作为哈希表
    const hashTable = {};
    for (let i = 0; i < arr.length; i++) {
        // 计算当前元素与目标值的插值
        const conplement = target - arr[i] ;
        // 如果差值以及在哈希表中
        if(conplement in hashTable){
            // 返回查找对应的索引和当前值
            return [hashTable[conplement],i];
        }
        // 将当前元素及其索引存入哈希表
        hashTable[arr[i]] = i;
        
    }
    // 如果没有这样两个数，返回null;
    return null;
}

console.log(twoSum(4,[1,2,3,4,2]));
/*
字母异位词

*/ 

function groupAnagrams(strs){
    const anagramMap = new Map();
    // 遍历数组
    for (const str of strs) {
        const sortedStr = str.split().sort().join('');
        console.log(sortedStr);
        

        // 如果排序后的字符串已经在哈希表中，则将当前字符串添加到对应数组中
        if(anagramMap.has(sortedStr)){
            anagramMap.get(sortedStr).push(str);
        }else{
            // 创建一个新数组，并将当前字符串作为第一个元素
            anagramMap.set(sortedStr,[str]);
        }
    }

    return Array.from(anagramMap.values());
}

console.log(groupAnagrams(["eat","ate","btn","ntb","bat"]));


/*
前k个高频元素

*/ 

function topKrequent(nums,k) {
    // 利用map统计每个元素的频率
    //创建一个对象存储每个数字出现的次数

    const frequencyMap = {};
    nums.forEach(num => {
            // 如果数字出现在频率图里面增加其次数，否则就将其添加到其中初始化为1
            frequencyMap[num] = (frequencyMap[num] || 0) + 1;
    });

    // 将频率图转化为[element，frequentcy]的数组
    //使用object.entries将对象转化为键值对数组，然后映射为包含数字和频率的数组

    const freArray = Object.entries(frequencyMap).map(([num,freq])=>[parseInt(num),freq]);

    //使用sor函数,并提供一个比较函数来按频率进行排序
    freArray.sort((a,b)=>b[1]-a[1]);

    // 根据频率提取前k个元素
    //切片数组以获取前K个元素，然后映射仅包含元素的数组
    const topK = freArray.slice(0,k).map(item =>item[0]);

    //返回包含前k个最高频率元素的数组
    return topK;

}

//测试

const numExample = [1,2,1,3,3,2,3];
const kExample = 2;

console.log(topKrequent(numExample,kExample));

// 最长连续序列
/*
1.数组去重和排序
2.遍历排序后的数组:逐个检查每个数字是否可以延申出更长的连续序列，
关键在于，如果和前一个值的差值为1，说明可以加入到序列中，否则就重置序列
3.记录最长序列长度
*/ 

function longestConsecutive(nums) {
    // 当输入数组为空时，返回0
    if(nums.length === 0){
        return 0;
    }

    // 数组去重
    const uniqueNums = Array.from(new Set(nums)).sort((a,b)=>a-b);

    let maxLength = 0;
    // 初始化最长序列为一，因为至少有一个数字
    let currentLength = 1;

    for (let i = 0; i < uniqueNums.length; i++) {
        //如果后一个与前一个相差为1,将最长序列加1
        if(uniqueNums[i] === uniqueNums[i-1] + 1 ){
            currentLength++;
        }
        else{
            // 当前数字不能延长序列时，更新最长序列重置当前长度

            maxLength = Math.max(maxLength,currentLength);
            currentLength = 1;
        }
    }

    //最后检查一下，看最后的序列是否为最长

    maxLength = Math.max(maxLength,currentLength);

    return maxLength;
}

//测试

console.log(longestConsecutive([100,4,200,1,3,2,5]));

