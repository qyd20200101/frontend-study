// 手写map:理解回调和新数组生成
Array.prototype.myMap = function (callback) {
    const result = [];
    for (let i = 0; i < this.length; i++) {
        result.push(callback(this[i],i,this));
    }
    return result;
};

//手写reduce:理解累加器和初始值
Array.prototype.myRduce =function (callback,initialValue) {
    let accumulator = initialValue !==undefined ? initialValue : this[0];
    let startIndex = initialValue !== undefined ? 0 : 1;

    for (let i = startIndex; i < this.length; i++) {
        accumulator = callback(accumulator,this[i],i,this);
        
    }
    return accumulator;
}
// 测试数据
const rowOrders = [
    {id: 1,name: '西安肉夹馍套餐', price: 25, count: 2,status: 'paid'},
    {id: 2,name: '冰峰汽水', price: 5, count: 5,status: 'paid'},
    {id: 3,name: '羊肉泡馍', price: 40, count: 1,status: 'unpaid'}
];

// 任务A:提取所有已支付商品的名称(使用myMap)
//预期结果:['西安肉夹馍套餐','冰峰汽水']
const paidName = rowOrders
.filter(item =>item.status === 'paid')
.myMap(item =>item.name);

// 任务B:计算已支付订单的总价格(使用myReduce)
// 预期结果:25*2+ 5*5 = 75
const totalPaidAmount = rowOrders
.filter(item => item.status === 'paid')
.myRduce((sum,item) =>sum+ (item.price * item.count),0);

console.log('已支付商品:',paidName);
console.log('应付金额:',totalPaidAmount);
