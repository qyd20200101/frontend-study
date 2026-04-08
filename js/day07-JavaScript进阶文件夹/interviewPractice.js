/*
防抖:debounce,节流:throttle
利用闭包和定时器，控制函数的执行频率。
防抖时技能冷却重置，节流是固定CD放大招
*/ 
function debounce(fn,delay = 300,immediate) {
    let timer = null;
    return function (...args) {
        const conetxt = this;
        clearTimeout(timer);

        if (immediate) {
            const callNow = !timer;
            if (callNow) {
                fn.apply(conetxt,args);
            }
            // timer被闭包引用，没有被销毁。可以持续访问和清除
            timer = setTimeout(() =>{
                timer = null; //冷却结束后，运行下一次立即执行
            },delay);
        }else{
            timer = setTimeout(() =>{
                //确保防抖函数内部this的指向和参数都正确传递给原始函数
                fn.apply(conetxt,args);
            },delay);
        }
    }
}

/*
数据处理：深拷贝
原理：通过递归遍历对象的每一个属性，如果是原始类型则直接赋值
引用类型就创建新的容器并继续递归，同时使用WeakMap解决循环引用问题
1.JSON方案的缺陷：JSON.parse(JOSN.stringify(obj))，（undefined/function/Symbol）会丢失
Date变字符串,无法处理循环引用
2.WeakMap vs Map:WeakMap的键是弱引用，有助于垃圾回收，防止内存泄漏
3.map.set的位置：为什么必须放在for...in循环之前,
（为了在递归进入循环引用的属性时能立刻从map中找到已创建的cloneTarget并返回）
*/
function deepClone(target,map = new WeakMap()) {
    // 原始类型和null是递归的出口
    if (typeof target !== 'object' || target === null) {
        return target;
    }

    //解决循环引用
    if (map.has(target)) {
        return map.get(target);
    }

    const cloneTarget = Array.isArray(target)? []:{};

    // 关键：先占位，再填充，防止循环引用时死循环
    map.set(target,cloneTarget);

    for (const key in target) {
        if (target.hasOwnProperty(key)) {
            cloneTarget[key] = deepClone(target[key],map);//递归调用
        };
    }
    return cloneTarget;
}
/*
三、组件化设计：原生JS弹窗组件
原理：利用面向对象的思想，通过class将组件状态和行为封装起来
利用继承实现通用逻辑（BasePlugin）和具体业务(Modal)的分离
严格管理其生命周期:init,destroy
1.封装的意义：为什么把属性和方法改成私有'#'：为了包含内部状态不被外部随意篡改
提供稳定、可预测的公共API
2.this上下文：如何解决document.addEventListener里的this指向问题：
使用.bind(this)创建一个this永久绑定的新函数，并保存其引用
以便能成功removeEventListener
3.内存泄露：destroy方法里，从DOM中移除元素，遍历并解绑所有通过事件管理器绑定的事件
*/ 


