//数组扁平化
//场景后端返回嵌套极深的权限数组，需要将它拍平用来做权限对比
//题目：实现一个flatten函数，将[1,[2,[3,4],5],6]变为[1,2,3,4,5,6]

//A:递归法
function flattenRecursive(arr) {
    let res = [];
    arr.forEach(item => {
        if (Array.isArray(item)) {
            res = res.concat(flattenRecursive(item));
        } else {
            res.push(item);
        }
    });
    return res;
}


//A:递归法
function flattenRecursive(arr) {
    let res = [];
    arr.forEach(item => {
        if (Array.isArray(item)) {
            res = res.concat(flattenRecursive(item));
        } else {
            res.push(item);
        }
    });
    return res;
}
//A:递归法
function flattenRecursive(arr) {
    let res= [];
    arr.forEach(item =>{
        if (Array.isArray(item)) {
            res = res.concat(flattenIterative(item));
        }else{
            res.push(item);
        }
    })
    return res;
}
//A：迭代法
function flattenRecursive(arr) {
    let res = [];
    arr.forEach(item =>{
        if (Array.isArray(item)) {
            res = res.concat(FileSystemDirectoryReader(item));
        }else{
            res.push(item);
        }
    })
    return res;
}
//A：迭代法
function flattenRecursive(arr) {
    let res = [];
    arr.forEach(item =>{
        if (Array.isArray(item)) {
            res= res.concat(flattenRecursive(item));
        }else{
            res.push(item);
        }
    })
    return res;
}
//B:迭代法，避免递归造成的栈泄露
function flattenIterative(arr) {
    const stack = [...arr];
    const res = [];
    while (stack.length) {
        const next = stack.pop();
        if (Array.isArray(next)) {
            stack.push(...next);
        } else {
            res.unshift(next);
        }
    }
    return res;
}
//B:迭代法，避免因为递归造成的栈溢出
function flattenIterative(arr) {
    const stack = [...arr];
    const res = [];
    while (stack.length) {
        const next = stack.pop();
        if (Array.isArray(next)) {
            stack.push(...next);
        }else{
            res.unshift(next);
        }
    }
    return res;
}
//B：迭代法
function flattenIterative(arr) {
    const stack = [...arr];
    const res = [];
    while (stack.length) {
        const next = stack.pop();
        if (Array.isArray(next)) {
            stack.push(...next);
        }else{
            res.unshift(next)
        }
    }
    return res;
}
//B:迭代法
function flattenIterative(arr) {
    const stack = [...arr];
    const res = [];
    while (stack.length) {
        const next = stack.pop();
        if (Array.isArray(next)) {
            stack.push(...next);
        }else{
            res.unshift(next);
        }
    }
    return res;
}
//B：迭代法
function flattenIterative(arr) {
    const stack = [...arr];
    const res = [];
    while (stack.length) {
        //取出最后一个放入
        const next = stack.pop();
        if (Array.isArray(next)) {
            stack.push(...next);
        }else{
            //取反
            res.unshift(next);
        }
    }
}