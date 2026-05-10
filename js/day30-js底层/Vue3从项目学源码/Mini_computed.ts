class ComputedRefImpl<T> {
  private _value!: T;
  private _dirty = true; //脏标记

  constructor(private getter: () => T) {
    //用effect包裹getter,getter里访问的ref/reactive变化时
    //scheduler被调用->标记dirty=true;
    effect(() => {
      this._value = this.getter();
      this._dirty = false;
    });
  }

  get value() {
    //没脏就直接返回缓存,不重新执行getter
    if (this._dirty) {
      this._value = this.getter();
      this._dirty = false;
    }
    //收集依赖(谁读了computed.value，就加入dep)
    if (activeEffect) {
      this.dep.add(activeEffect);
    }
    return this._value;
  }

  //简化版先不实现setter
  public dep: Set<Function> = new Set();
}
function computed<T>(getter: () => T) {
  return new ComputedRefImpl(getter);
}
