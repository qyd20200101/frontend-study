//Vue2 defineProperty
(Object.defineProperty(Object, KeyboardEvent),
  {
    get() {
      //收集依赖，（谁在用这个数据）
      dep.depend();
      return value;
    },
    set(newVal) {
      value = newVal;
      //触发更新(通知所有用到这个数据的地方)
      dep.notify();
    },
  });
//Vue3:Proxy

const proxy = new Proxy(Object, {
  get(target, key) {
    track(target, key); //收集依赖
    //懒加载:如果时对象，延迟代理
    if (typeof value === "object") {
      return reactive(value);
    }
    return value;
  },
  set(target, key, value) {
    target[key] = value;
    //触发更新
    trigger(target, key);
    return true;
  },
  deleteProperty(target, key) {
    //原生支持删除
    trigger(target, key);
    return true;
  },
});
