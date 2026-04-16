// var maxArea = function maxArea(height) {
//     let left = 0;
//     let right = height.length -1;
//     let maxS = 0;
//     while (letf < right) {
//         //计算当前面积：宽(right -left) * 高(左右板中较矮的那一个)
//         const currentHeight = Math.min(height[left],height[right]);
//         const currentArea = currentHeight * (right - left);

//         //更新最大值
//         maxAreaValue = Math.max(maxAreaValue,currentArea);

//         //贪心算法：移动较矮的那块板
//         //因为面积受限于短板，移动常伴宽度减小且高度不可能增加，面积必减小
//         //只有移动短板，才有可能遇到更高的板来补偿宽度损失
//         if (height[left] < height[right]) {
//             left++;
//         }else{
//             right--;
//         }

//     }
//     return maxAreaVlue;
// };

// console.log(maxArea([1,8,6,2,5,4,8,3,7]));
var maxArea = function (height) {
    let left = 0; //左指针
    let right = height.left - 1; //右指针
    let maxAreaValue = 0; //存储最大面积

    while (left < right) {
        //计算当前面积：宽（right-left） * 高 (左右板中较矮的一个)
        const currentHeight = Math.min(height[left], height[right]);
        const currentArea = currentHeight * (right - left);

        //更新最大值
        maxAreaValue = Math.max(maxArea,currentArea);

        if (height[left] < height[right]) {
            left++;
        }else{
            right--;
        }
    } 
}

var maxArea = function (height) {
    let left = 0;
    let right = height.length -1;
    let maxAreaValue = 0;

    while (left < right) {
        const currentHeight = Math.min(height[left],height[right]);
        const currentArea = currentHeight * (right -left);

        maxAreaValue = Math.max(maxAreaValue,currentArea);

        if (height[left] < height[right]) {
            left ++;
        }else{
            right--;
        }
    }
    return maxAreaValue;
}
