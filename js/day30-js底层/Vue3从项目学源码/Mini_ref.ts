//手写 ref实现
class RefImpl<T> {
  private _value: T;
  public dep: Set<Function> = new Set();

  constructor(value: T) {
    this._value = value;
  }

  get value() {
    //收集依赖:谁在读取.value,就把谁加入到dep
    if (activeEffect) {
      this.dep.add(activeEffect);
    }
    return this._value;
  }
  set value(newVal: T) {
    if (newVal === this._value) {
      return; //值没变就不触发
    }
    this._value = newVal;
    //派发更新：通知所有依赖重写执行
    // this.dep.forEach((effect) => effect());
    const jobQueue = new Set<Function>();

    function queueJob(fn: Function) {
      jobQueue.add(fn);
      Promise.resolve().then(() => {
        //执行队列里所有的effect
        //清空队列
        jobQueue.forEach((job) => job());
        jobQueue.clear();
      });
    }
    this.dep.forEach((effect) => queueJob(effect));
  }
}

function ref<T>(value: T) {
  return new RefImpl(value);
}

//辅助:当前正在执行的effect
let activeEffect: Function | null = null;

function effect(fn: Function) {
  activeEffect = fn;
  fn(); //执行时触发.value的getter,完成依赖收集
  activeEffect = null;
}
