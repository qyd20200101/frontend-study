const map = list.reduce(
    //...acc使用对象展开运算符，每次循环都会创建全新的对象把之前的所有属性都复制进去
    (acc, item) => ({ ...acc, [item.id]: item }), {}
);

//企业级
const mapDemo = list.reduce((acc,ietm) => (acc[item.id] = item,acc),{});
/*
reduce的场景用法：
问题：第二个参数不传会发生什么
reduce会把数组的第0项当初初始值开始，从第一项开始变量，如果空数组会报错报错
类型隐患：想把数组转成对象，但是忘记传入{},第一个元素会被当成累加器
*/ 
//reduce数组去重并统计频率
const list = [
    {name:'服务器', category: '硬件'},
    {name:'数据库', category: '软件'},
    {name:'交换机', category: '硬件'},
    {name:'管理系统', category: '软件'},
];

const status = list.reduce((acc,item) =>{
    //如果还没存过这个分类，初始化为0
    acc[item.category] = (acc[item.category] || 0)+1;
    return acc;
},{});

//数组按照特定属性分组
const projects = [
    {name: '项目A',status: 'active'},
    {name: '项目B',status: 'archived'},
    {name: '项目C',status: 'active'},
];
const grouped = projects.reduce((acc,project) =>{
    const key = project.status;
    if (!acc[key]) {
        acc[key] = [];   
    }
    acc[key].push(project);
    return acc;
},{});

//管道函数:函数式编程，将多个步骤链式调用

const addTax = (val)=> val *1.1;
const addShipping = (val) => val +10;
const format = (val) => `￥${val.toFixed(2)}`;

const pipeline = [addTax,addShipping,format];

const finalPrice = pipeline.ruduce((acc,fn) => fn(acc),100);

//数组扁平化
const nested = [1,[2,[3,4]]];

function flatten(arr) {
    return arr.reduce((acc,val) =>{
        //如果值还是数组，递归打平，否则直接拼入
        return acc.concat(Array.isArray(val)? flatten(val): val);
    },[]);
}

console.log(flatten(nested));
