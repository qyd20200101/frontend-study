/*
场景一：高频数据过滤与实时汇总（性能与算法）
涉及知识点：debounce(防抖)，computed,Arryay.reduce,proxy响应式
特点：
1.缓存与性能：使用computed而不是method来计算总预算，是因为computed依赖追踪和缓存机制,
能避免大数据列表的重复无效计算
2.函数式编程：使用reduce而不是for循环，体现对js开发范式的熟悉
*/ 
//手写复习：带立即执行的防抖
function debounce(fn,delay) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this,args), delay);
    }
}

//测试：模拟Vue内部的统计计算
const products = [
    {name: '西安肉夹馍', price: 15, count: 2},
    {name: '冰峰', price: 5, count: 10},
];

//模拟computed:利用reduce进行工业界求和
const totalAmount = products.reduce((acc,cur) => acc+(cur.price *cur.count),0);
console.log('总金额计算测试：',totalAmount === 80 ? '通过':'不通过');
