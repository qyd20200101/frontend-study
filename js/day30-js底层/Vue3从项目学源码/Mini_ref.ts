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
  }
  set value(newVal: T) {
    if (newVal === this._value) {
      return; //值没变就不触发
    }
    this._value = newVal;
    //派发更新：通知所有依赖重写执行
    this.dep.forEach((effect) => effect());
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
