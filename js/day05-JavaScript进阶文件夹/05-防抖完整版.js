/*
二、防抖完整版（立即执行+非立即执行+取消）
1.非立即执行：搜索框输入联想（停止输入后才发请求）
2.立即执行：按钮防重复点击（点击立刻执行，1秒内再点不执行）
*/ 
/*
防抖完整版
@param {Function} fn 要防抖的函数
@param {number} delay 延迟时间（毫秒）
@param {function} 防抖后的函数
@param {boolean} immediate 是否立即执行
*/ 
function debounce(fn,delay ,immediate = false) {
    //闭包保存定时器变量,外部无法访问
    let timer = null;

    //返回防抖后的函数
    const debounced = function (...args) {
        // 每次触发，先清除之前的定时器
        //这就是防抖的核心，只执行最后一次
        if (timer ) clearTimeout(timer);

        //分支1：立即执行模式（按钮防触发点击）
        if (immediate) {
            // callNow为true表示：现在可以执行
            //只有当timer为null时（第一次点击或者延迟结束后）才执行
            const callNow = !timer;

            //delay时间后，把tierm重置为Null，运行下次执行
            timer = setTimeout(() =>{
                timer = null;
            },delay);

            //如果可以立即执行，就调用原函数
            if (callNow) {
                // 用apply绑定this和参数,保证和原函数行为一致
                fn.apply(this,args);
            }
        }
        //分支2：非立即执行模式（搜索框类型）
        else{
            // 延迟delay毫秒后执行最后一次触发
            timer = setTimeout(() =>{
                fn.apply(this,args);
            },delay);
        }
    };

    // 取消功能（防止内存泄露）
    debounced.cancel = function () {
        clearTimeout(timer);
        timer = null;
    };
    return debounced;
}

// 你的搜索请求函数
function search(e) {
    console.log('发起请求',e.target.value);
}

// 防抖处理：停止输入500ms后执行

const debounceSearch = debounce(search,500);

// 绑定到输入框

document.getElementById('searchInput').addEventListener('input',debounceSearch);