// 防抖函数实现
//频繁触发只执行最后一次
//场景：搜索框，窗口resize,按钮防重复提交
function debounce(fn, delay = 300, immediate = false) {
    // let timer = null;
    // return function (...args) {
        // //每次触发前先清空之前的定时器
        // if (timer) {
        //     clearTimeout(timer);
        // }
        // //立即执行模式
        // if (immediate) {
        //     let callBack = !timer;
        //     timer = setTimeout(() => {
        //         // 重新倒计时
        //         timer =null;
        //     },delay);
        //     //立即执行
        //     if(callBack)
        //     fn.apply(this, args);
        // }
        // //非立即执行
        // else{
        //     timer = setTimeout(() =>{
        //         fn.apply(this,args);
        //     },delay);
        // }
        
    // };
    let timer = null;
    return function (...args) {
        //每次触发先清空正确的定时器
        if (timer) {
            clearTimeout(timer);
        }

        //立即执行模式
        if (immediate) {
            let callBack = !timer;
            timer = setTimeout(() =>{
                // 重新计数
                timer = null;
                // fn.apply(this,args);
            },delay);
            //立即执行
            if (callBack) {
                fn.apply(this,args);
            }
        }
        //非立即执行
        else{
            timer = setTimeout(() =>{
                fn.apply(this,args);
            },delay);
        }
    };
}
//第二步测试用例
console.log("===防抖函数测试===");

//测试1：基础功能测试（非立即执行模式）
console.log("\n1.非立即执行模式:");
const test1 = debounce((msg) => {
    console.log(`执行:${msg}`);
}, 1000);

//模拟连续调用3次，预期：1秒后只输出最后一次“第三次调用”
test1("第一次调用");
test1("第二次调用");
test1("第三次调用");

//测试2：立即执行模式测试
setTimeout(() => {
    console.log("\n2.立即执行模式测试:");
    const test2 = debounce((msg) => {
        console.log(`执行:${msg}`);
    }, 1000, true);

    // 模拟连续调用3次，预期：立即输出"第一次调用"，后面流程不执行
    test2("第一次调用");
    test2("第二次调用");
    test2("第三次调用");

    //测试3：等待延迟后再次调用
    setTimeout(() => {
        console.log("\n3.等待延迟后再次调用:");
        // 预期：立即输出“第四次调用”
        test2("第四次调用");
    }, 1500);
}, 1500);

//测试4：实际业务场景 -按钮点击提交表单
setTimeout(() => {
    console.log("\n4.实际业务场景：按钮点击提交表单");
    const submitForm = debounce(() => {
        console.log("表单提交成功！(防止重复提交)");
    }, 2000, true);

    //模拟用户快速点击按钮5次
    submitForm();
    submitForm();
    submitForm();
    submitForm();
    submitForm();
    //预期：只输出一次“表单提交成功!”
}, 4000);

// 节流:固定时间只执行一次
//场景：滚动加载，鼠标移动，高频点击
//节流函数实现
// function throttle(fn,delay = 300) {
//     let timer = null;
//     return function (...args) {
//         if (!timer) {
//             timer = setTimeout(() =>{
//                 fn.apply(this,args);
//                 timer = null;
//             },delay);
//         }
//     };
// }

//节流函数实现
function throttle(fn,delay =300) {
    let timer = null;
    return function (...args) {
        if (!timer) {
            timer = setTimeout(() => {
                fn.apply(this,args);
                timer = null;
            },delay);
        }
    };
}

//节流测试用例
console.log("\n===节流函数测试===");
const testThrottle = throttle((msg) =>{
    console.log(`节流执行${msg}`);
},1000);

//连续触发，预期：每隔1秒执行一次
testThrottle("第一次");
testThrottle("第二次");
testThrottle("第三次");
setTimeout(() =>testThrottle("第四次"),1200);
