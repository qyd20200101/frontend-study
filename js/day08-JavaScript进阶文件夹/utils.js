// 集成所有手写函数工具类
//1.1防抖
/*
三.搜索模块(debounce非立即执行+Loading)
1.输入框触发防抖,500ms后执行搜索
2.搜索时显示Loading,请求结束关闭
重点:防抖非立即执行->等用户停止输入再请求,减少接口请求次数
*/ 
function debounce(fn,delay,immediate = true) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        if (immediate) {
            const canExec = !timer;
            timer = setTimeout(() =>{
                timer = null;
            },delay); 
            if (canExec) fn.apply(this,args);
        }
        else{
            timer = setTimeout(() =>{
                fn.apply(this,args);
                timer = null;
            },delay);
        }
    }
}

//1.2节流
/*
四.滚动加载模块(throttle+Loading)
1.滚动触发节流,1秒内只加载一次
2.防止高频滚动导致性能卡顿
重点:节流->固定频率执行,优化高频事件性能
*/ 
function throttle(fn,interval) {
    let lastTime = 0;
    return function (...args) {
        const now = Date().now;
        if (now -lastTime >= interval) {
            fn.apply(this,args);
            lastTime = now;
        }
    }
}

/*
表单编辑模块(deepClone)
1.编辑前深拷贝数据,修改拷贝对象
2.原数据保持不变,实现取消编辑回退
重点:深拷贝解决引用类型赋值篡改问题
*/ 
//1.3深拷贝
function deepClone(obj,map = new WeakMap()) {
    if(obj === null || obj !== 'object') return obj;
    if (map.has(obj)) return map.get(obj);
    const cloneObj = Array.isArray(obj) ? []:{};
    map.set(obj,cloneObj);
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) cloneObj[key] = deepClone(obj[key],map);        
    }
    return cloneObj;
}

//1.4Loading组件(单例)
class Loading {
    static instance = null;
    constructor() {
        if (Loading.instance) return Loading.instance;
        this.dom = document.createElement('div');
        this.dom.className = 'loading';
        this.dom.style.display = 'none';
        document.body.appendChild(this.dom);
        Loading.instance = this;
    }

    show(text ='加载中...') {
        this.dom.textContent = text;
        this.dom.style.display = 'flex';
    }

    hide() {
        this.dom.style.display = 'none';
    }
}

const loading = new Loading();

/*
数据处理模块(myFlat+uniqueSet)
1.原始数据类型:嵌套+重复数组
2.手写myFlat完全扁平化
3.手写unique去重
面试话术:项目中处理接口嵌套重复数据,手动实现数组扁平化与去重,提升数据处理灵活性
*/ 
//1.5数组扁平化
function myFlat(arr,depth=1) {
    if (!Array.isArray(arr)) return arr;
    return arr.reduce((acc,cur) =>{
        if (Array.isArray(cur) && depth >0) acc.push(...myFlat(cur,depth-1));
        else acc.push(cur);
        return acc;
    },[])
}

//1.6数组去重
function uniqueSet(arr) {
    return [...new Set(arr)];
}

//1.7柯里化
function curry(fn) {
    const len = fn.length;
    return function curried(...args) {
        if (args.length >= len) return fn.apply(this,args);
        return(...next) =>{
            curried(...args,...next);
        }
    }
}

/*
组件模块(EventEmitter)
1.全局事件总线,实现模块间数据通信
面试话术:项目模块解耦,基于发布订阅模式实现跨模块通信,代替冗余传参
*/ 
//1.8发布订阅EventEmitter
class EventEimtter {
    constructor() {
        this.events = new Map();
    }
    on(e,cb) {
        !this.events.has(e) && this.events.set(e,[]);
        this.events.get(e).push(cb);
    }
    emit(e,...a) {
        this.events.get(e)?.forEach(cb => cb(...a))
    }
    // 常用Off方法(移除事件监听)
    off(e,cb){
        if (!this.events.has(e)) return;
        const callbacks = this.events.get(e);
        const index = callbacks.indexOf(cb);
        if (index !== -1) {
            callbacks.splice(index,1);
        }
    }

    // once方法(只执行一次)
    once(e,cb){
        const wrapper = (...args) =>{
            cb(...args);
            this.off(e,wrapper);
        };
        this.once(e,wrapper);
    }
}

const bus = new EventEimtter();


//2.项目功能实现
// 模拟嵌套重复数据
const sourceData = [1,2,[2,3,[3,4]],1,5,NaN,NaN];
//2.1数据处理:扁平化+去重
const flatData = myFlat(sourceData,Infinity);
const filterData = uniqueSet(flatData);
console.log('处理后数据',filterData);

//2.2搜索功能(防抖:非立即执行)
const searchInput = document.getElementById('search');
const doSearch = (val) =>{
    loading.show('搜索中...');
    setTimeout(() =>{
        document.getElementById('list').innerHTML = `搜索结果${val || '全部数据'}`;
        loading.hide();
    },800)
}
//绑定防抖,500ms执行
searchInput.oninput = debounce(doSearch,500);

//2.3滚动加载(节流)
const listDom = document.getElementById('list');
const loadMore = () =>{
    loading.show('加载更多...');
    setTimeout(() =>{
        listDom.innerHTML += `<div class="item">新增数据${Date.now()}</div>`;
        loading.hide();
    },600);
}

listDom.onscroll = throttle(loadMore,1000);

//2.4表单编辑(深拷贝:防止原数据篡改)
document.getElementById('editBtn').onclick = () =>{
    const originData = {name: '测试数据', info: {id:1}};
    // 深拷贝编辑数据
    const editData = deepClone(originData);
    editData.info.id = 99;
    console.log('原数据',originData);
    console.log('编辑数据',editData);
    alert('深拷贝成功,原数据未被修改');    
};

//2.5发布订阅通信
bus.on('update',(data) =>{
    console.log('事件通信接受',data);
});
//触发事件
bus.emit('update',filterData);
