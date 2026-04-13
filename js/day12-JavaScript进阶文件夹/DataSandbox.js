/*
场景二：复杂表单的事务化编辑（数据安全）
涉及知识点：deepClone(深拷贝),WeakMap,v-model通信
特点：
1.副作用隔离：利用deepclone实现数据副本，切断引用
只有在api成功后合并数据，保证单向数据流的纯粹性
2.内存管理：使用WeakMap防止大型对象拷贝时的内存泄露
*/ 
//手写复习：解决循环引用的工业级深拷贝

function deepClone(target,map = new WeakMap()) {
    if (target !== 'object' || target === null) {
        return target;
    }
    if (map.has(target)) {
        return map.get(target);
    }
    const cloneTarget = Array.isArray(target)? []: {};
    map.set(target,cloneTarget);
    Reflect.ownKeys(target).forEach(key =>{
        cloneTarget[key] = deepClone(target[key],map);
    })
    return cloneTarget;
}

//测试场景：编辑回滚测试
const original = {id: 1, info: {title: '原始项目'}};
const copy = deepClone(original);
copy.info.title = '恶意修改';

console.log('快照对比测试：',original.info.title === '原始项目'? '回滚成功': '数据污染');
