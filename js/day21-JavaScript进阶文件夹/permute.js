//全排列
function permute(nums) {
    const result = [];
    const path = [];

    function backrack(used) {
        //终止条件: 路径长度等于数组长度，说明找齐了一组
        if (path.length === nums.length) {
            result.push([...path]); //必须浅拷贝，否则后续修改puth影响这
            return;
        }

        //遍历所有选择
        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;

            //做选择
            path.push(nums[i]);
            used[i] = true;

            //进入下一层递归
            backrack(used);

            //撤销选择
            path.pop();
            used[i] = false;
        }
    }

    backrack({});
    return result;
}