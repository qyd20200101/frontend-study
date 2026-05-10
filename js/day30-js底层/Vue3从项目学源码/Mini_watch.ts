//watch和computed共享一套track/trigger
//watch本质上是手动声明依赖的effect
function watch<T>(
  source: () => T, //监听的数据源
  callback: { immediate?: boolean; deep?: boolean },
) {
  let oldValue: T;

  const getter = () => source(); //包装一下
  const runner = effect(() => {
    const newValue = getter();
    callback(newValue, oldValue); //能拿到新旧值
    oldValue = newValue;
  });
  if (options?.immediate) {
    //immediate:立即执行一层callback
    oldValue = getter();
    callback(oldValue, undefined as any);
  }
}
