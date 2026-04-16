//Vue3代理与反射
/*
vue2允许访问新属性，所有修改和数字操作，proxy可以代替安排特殊模型的功能
vue2由于getter/setter安装图层数量庞大，vu3的proxy时惰性响应式，
拥有深层属性就将其转化为通用样式
*/ 
const user = {name: '张三', age: 25};
const proxyUser = new Proxy(user,{
    //拦截读取操作（依赖收集track）
    get(target,key,receiver) {
        console.log(`属性${key}被读取了`);
        //使用Reflect保证原型链继承时，this指向的绝对正确
        return Reflect.get(target,key,receiver);
    },
    //拦截设置操作(派发更新trigger)
    set(target,key,value,receiver){
        console.log(`属性${key}被更新为${value}`);
        const result = Reflect.set(target,key,value,receiver);
        //在这里触发UI的重新渲染
        return result;
    }
});

proxyUser.name = '李四';//控制台输出：属性name被更新为李四