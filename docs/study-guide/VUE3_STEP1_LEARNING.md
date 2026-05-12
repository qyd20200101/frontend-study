# 🎯 Vue 3 实战学习 — 结合 my-sass-project 项目

> 基于你的三步走学习框架，用你的实际代码作为教学案例。
> 每一步都包含：**知识点 → 你的代码实例 → 深度解析 → 动手练习**

---

## 📖 Day 0：学习索引 + 知识图谱（导航页）

> 本页是整份学习计划的"地图"：帮你快速定位**哪天学了什么**、**哪些知识互相依赖**、**下一轮复习从哪里开始**。
> 每次学完一天后回来更新"掌握度"列，持续积累。

### 🗺️ 一、知识依赖图谱

Vue 3 的知识点不是并列关系，而是**分层依赖**。下面是真实依赖顺序（箭头 = 前置依赖）：

```text
L0 基础底座
  ┌──────────────────────────────────────────────────────────┐
  │  TypeScript 泛型 / 工具类型 (Partial/Pick/extends 约束)   │
  │  JS 异步模型 (微任务队列 / Promise)                       │
  └──────────────────────────────────────────────────────────┘
                              │
                              ▼
L1 响应式内核  ← 所有上层特性的地基
  ┌──────────────────────────────────────────────────────────┐
  │  ref / reactive (Day1)                                    │
  │  ├─ RefImpl: getter 收集 dep, setter 遍历 dep.forEach    │
  │  ├─ activeEffect: 当前正在执行的 effect                  │
  │  └─ track / trigger / scheduler 三件套                   │
  └──────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
L2 派生 & 副作用         L2 组件通信           L2 全局状态
  ┌─────────────────┐   ┌──────────────┐   ┌──────────────┐
  │ computed (Day2)  │   │ props/emit    │   │ Pinia (Day5)  │
  │  = ref + _dirty  │   │ (Day3)        │   │ defineStore   │
  │  懒执行 + 缓存   │   │ 递归组件       │   │ = setup单例   │
  │                 │   │ 事件冒泡透传    │   │               │
  │ watch (Day2)     │   │              │   │ getters=computed│
  │  = 手动声明 dep  │   │ provide/inject│   │ actions=fn    │
  │  + newVal/oldVal│   │ (跨层级)      │   │               │
  │                 │   │              │   │ persist 插件   │
  │ watchEffect     │   │ v-model (Day4)│   │               │
  │  = 自动收集 dep  │   │ = :mv+@upd:mv │   │               │
  └─────────────────┘   └──────────────┘   └──────────────┘
                              │
                              ▼
L3 渲染与缓存层
  ┌──────────────────────────────────────────────────────────┐
  │  挂载链路 (Day7)                                          │
  │    createVNode → mount → patch(null) →                   │
  │    setupComponent → setupRenderEffect(effect)             │
  │                                                           │
  │  更新链路 (Day7)                                          │
  │    数据变 → trigger → scheduler 去重入队 →                │
  │    effect.run → render → patch → DOM                      │
  │                                                           │
  │  KeepAlive (Day8)                                         │
  │    :include=cacheViews → addView/delView 动态维护 →       │
  │    onActivated / onDeactivated 替代 mounted/unmounted    │
  └──────────────────────────────────────────────────────────┘
                              │
                              ▼
L4 编译层优化（理解"为什么 Vue3 比 Vue2 快"）
  ┌──────────────────────────────────────────────────────────┐
  │  编译三件套 (Day9)                                        │
  │    ① 静态提升：不变 VNode 提到 render 外层只创建一次      │
  │    ② PatchFlag：给动态节点打标记, diff 时跳过静态         │
  │    ③ 事件缓存：_cache[n] 复用闭包, 避免重复创建函数       │
  │                                                           │
  │  模板编译规则                                              │
  │    v-if/else → 三元表达式 (a ? b : c ? d : e)              │
  │    v-for → .map()                                         │
  └──────────────────────────────────────────────────────────┘
```

**读图方式**：想学 Day4 的 v-model？先确认 Day1 响应式 + Day3 props/emit 已会——因为 v-model 本质是"props 下传 modelValue + emit 上抛 update:modelValue"的语法糖。

---

### 📅 二、学习日期 ↔ 章节 ↔ 代码 三方索引

> 用于回头复盘时快速定位："我 5/9 那天学的 computed 源码，配套代码在哪？"
> 原始日报在 [2026/](../2026/) 目录；手写源码在 [js/day30-js底层/Vue3从项目学源码/](../js/day30-js底层/Vue3从项目学源码/)；项目真实代码在 [apps/vue-app/](apps/vue-app/)。

| 日期 | 日报 | 本计划章节 | 手写 Mini 源码 | 项目真实代码 |
|---|---|---|---|---|
| 2026-05-09 (Day10) | [05_09](../2026/05_09学习日报.md) | Day1 ref/reactive | [Mini_ref.ts](../js/day30-js底层/Vue3从项目学源码/Mini_ref.ts) | [useForm.ts](apps/vue-app/src/hooks/useForm.ts), [user.ts](apps/vue-app/src/store/user.ts) |
| 2026-05-09 (Day10) | [05_09](../2026/05_09学习日报.md) | Day2 computed/watch | [Mini_computed.ts](../js/day30-js底层/Vue3从项目学源码/Mini_computed.ts), [Mini_watch.ts](../js/day30-js底层/Vue3从项目学源码/Mini_watch.ts) | [useForm.ts](apps/vue-app/src/hooks/useForm.ts) (isDirty) |
| 2026-05-09 (Day10) | [05_09](../2026/05_09学习日报.md) | Day3 递归组件通信 | — | [BuilderNode.vue](apps/vue-app/src/components/BuilderNode.vue) |
| 2026-05-10 (Day11) | [05_10](../2026/05_10学习日报.md) | Day4 v-model 7 步链路 | *待补* | [FormNode.vue](apps/vue-app/src/components/FormNode.vue) |
| 2026-05-10 (Day11) | [05_10](../2026/05_10学习日报.md) | Day5 Pinia Setup Store | — | [user.ts](apps/vue-app/src/store/user.ts) |
| 2026-05-10 (Day11) | [05_10](../2026/05_10学习日报.md) | Day8 KeepAlive 闭环 | — | 路由 tabs 缓存相关文件 |
| 2026-05-10 (Day11) | [05_10](../2026/05_10学习日报.md) | Day9 编译三件套 | *待补* | 看编译产物 |
| 2026-05-10 (Day11) | [05_10](../2026/05_10学习日报.md) | Day7 响应式/挂载链路 | *待补* | — |

> 📝 每学完一天就在这张表追加一行；"待补"表示计划里已提到、但代码或章节还没写完。

---

### ✅ 三、知识点掌握度清单

> 按 Day 11 日报的 8/12 自检结果初始化。遇到新盲区就在"状态"列降档。
> 图例：🟢 熟练（能讲给别人听）/ 🟡 理解（能看懂但讲不流畅）/ 🔴 盲区（需要回头复习）

#### L1 响应式内核

| 知识点 | 状态 | 证据 / 盲区来源 |
|---|---|---|
| ref getter/setter 收集 & 派发 | 🟢 | 已手写 [Mini_ref.ts](../js/day30-js底层/Vue3从项目学源码/Mini_ref.ts) |
| reactive vs ref 的选择场景 | 🟢 | 日报 Day10 对比表 |
| activeEffect 单例思想 | 🟢 | Mini_ref.ts 中的闭包变量 |
| track / trigger / scheduler 时序 | 🟡 | Day 11 日报"错误点"第 5 条：scheduler 去重机制需巩固 |
| effect.run 与渲染的关联 | 🟡 | 日报提到但未手写 |

#### L2 派生 & 副作用 / 组件通信

| 知识点 | 状态 | 证据 / 盲区来源 |
|---|---|---|
| computed = ref + _dirty 懒求值 | 🟢 | [Mini_computed.ts](../js/day30-js底层/Vue3从项目学源码/Mini_computed.ts) |
| watch = 手动声明 dep 的 effect | 🟢 | [Mini_watch.ts](../js/day30-js底层/Vue3从项目学源码/Mini_watch.ts) |
| watch 的 deep 为何需要 | 🟢 | 计划文档 Day2 自答 Q1 |
| watchEffect 自动收集 vs watch 手动 | 🟢 | 计划文档 Day2 对比表 |
| props 向下 + emit 向上单向流 | 🟢 | 计划文档 Day3 |
| 递归组件终止条件 / key 选 id | 🟢 | 计划文档 Day3 六步 |
| 事件冒泡 (.stop) vs emit 链 | 🟢 | Day 11 日报明确区分 |
| provide/inject 跨层级通信 | 🔴 | 计划中未展开，Day 11 日报未出现 |
| v-model 的 modelValue + update:mv | 🟢 | Day 11 日报 7 步链路 |
| v-model 多绑定 (v-model:title) | 🟡 | 计划文档 Day4 练习题未做 |

#### L3 渲染 & 缓存

| 知识点 | 状态 | 证据 / 盲区来源 |
|---|---|---|
| 挂载链路 createVNode→patch→setupRenderEffect | 🟡 | Day 11 日报总览级别，细节未深入 |
| 更新链路 trigger→scheduler→run→patch | 🟡 | 同上 |
| KeepAlive include 动态名单 | 🟢 | Day 11 日报 addView/delView 完整闭环 |
| onActivated / onDeactivated 生命周期 | 🟢 | 同上 |

#### L4 编译层

| 知识点 | 状态 | 证据 / 盲区来源 |
|---|---|---|
| 静态提升（管 VNode 创建） | 🟡 | Day 11 日报错误点①：与 PatchFlag 混淆 |
| PatchFlag（管 VNode 比对） | 🟡 | 同上 |
| 事件缓存 _cache | 🟢 | Day 11 日报提到 |
| v-if/else → 三元表达式 | 🟡 | Day 11 日报错误点② |
| v-for → .map() | 🟢 | Day 11 日报 |

#### L0 基础底座（TS）

| 知识点 | 状态 | 证据 / 盲区来源 |
|---|---|---|
| `Partial<T>` 写法 | 🔴 | Day 11 日报错误点③：误写 `type<Partial extends T>` |
| `extends` 作为泛型约束 | 🔴 | Day 11 日报错误点④：与类型收缩混淆 |
| `Pick` / `Required` / `Omit` | 🟡 | 计划中 Day10 提到但未专项 |
| 泛型类 RefImpl\<T\> | 🟢 | [Mini_ref.ts](../js/day30-js底层/Vue3从项目学源码/Mini_ref.ts) |

---

### 🔁 四、三条复习路径（按目标挑一条走）

**路径 A：面试冲刺（2-3 小时快过）**
> 目的是能在面试时"说清楚"，不求手写。

1. L1 响应式内核 → 只看 Day1 的"深度解析"小节
2. L2 computed vs watch → Day2 对比表背熟
3. L4 编译三件套 → Day9 三件套职责边界一句话总结
4. 最后把 🔴 标记的 3 个盲区（provide/inject, Partial, extends 约束）各花 10 分钟搞定

**路径 B：源码理解（半天 4-6 小时深入）**
> 目的是能回答"Vue3 为什么这样设计"。

1. 重跑 [Mini_ref.ts](../js/day30-js底层/Vue3从项目学源码/Mini_ref.ts) / [Mini_computed.ts](../js/day30-js底层/Vue3从项目学源码/Mini_computed.ts) / [Mini_watch.ts](../js/day30-js底层/Vue3从项目学源码/Mini_watch.ts) 三个手写，不看答案
2. Day7 响应式更新链路逐步打断点（当前盲区）
3. Day9 看编译产物（Vue Template Explorer）验证三件套
4. 回答："为什么 Vue3 用 Proxy 不用 defineProperty？" "scheduler 去重怎么实现？"

**路径 C：项目落地（按任务走）**
> 目的是在 my-sass-project 里把知识用出来。

1. 改造 [useForm.ts](apps/vue-app/src/hooks/useForm.ts)：加草稿自动保存 watch（Day2 练习）
2. 新建 `store/formDesigner.ts`（Day5 练习）
3. [BuilderNode.vue](apps/vue-app/src/components/BuilderNode.vue) 改用 provide/inject 替代多层 emit（Day3 延伸，顺便补 🔴 盲区）
4. 给 TS 类型写一层 `Partial<FormComponent>` 的"草稿态"，补 L0 盲区

---

### 🧭 五、下一轮学习目标（给未来的自己）

1. **补齐 Day 4-9 的骨架正文**（当前 Day4/5 只是 stub，Day6-9 未建）
2. **修掉 🔴 三项**：provide/inject、Partial、extends 约束
3. **手写 Mini scheduler**（对齐 Day 11 日报"错误点第 5 条"）
4. **加一章 Day10 TS 专题**：Partial / Pick / Required / Omit + extends 约束 + 泛型类 + 条件类型
5. **补齐乱码段**：文档 Day 2 Mini computed 说明段被 mojibake 污染，需要按正常中文重写

---

### 📅 Day 1：响应式核心 — ref 与 reactive

#### 🔍 看你的真实代码

打开 `apps/vue-app/src/hooks/useForm.ts`：

```ts
const formData = ref<T | null>(null);    // ← ref 包裹整个表单对象
const isSaving = ref(false);             // ← ref 包裹布尔值
const originalSnapshot = ref<T | null>(null);
```

再看 `apps/vue-app/src/store/user.ts` 的 Pinia Store：

```ts
const token = ref(localStorage.getItem("token") || '');
const roles = ref<string[]>([]);
const userInfo = ref<any>(null);
const isLogin = computed(() => !!token.value);  // ← computed 派生值
```

#### 💡 深度解析

**1. 为什么这里全用 `ref` 而不用 `reactive`？**

`useForm.ts` 中 `formData` 是 `T | null`——当你需要**整体替换**一个对象时（比如 `formData.value = null` 关闭表单），`ref` 是正确选择。`reactive` 不能整体替换。

**你的代码已经在做的是对的**，但你不知道为什么——现在你知道了。

**2. `ref` 内部原理（一句话）**

`ref(0)` 实际上创建了一个 `{ value: 0 }` 对象，并对其做了响应式代理。

当你在 `<template>` 中写 `{{ isSaving }}`，编译器帮你自动解包成了 `isSaving.value`。

#### 🧪 动手练习

在项目的 `apps/vue-app/src/hooks/` 下新建 `useCounter.ts`：

```ts
import { ref, reactive, computed } from 'vue'

export function useCounter(initial = 0) {
  // 练习 1：用 ref 实现计数器
  const count = ref(initial)
  const doubled = computed(() => count.value * 2)

  // 练习 2：用 reactive 实现一个配置对象
  const config = reactive({ step: 1, max: 99, min: 0 })

  // 练习 3：toRefs 解构保持响应式
  function increment() {
    if (count.value < config.max) count.value += config.step
  }

  return { count, doubled, config, increment }
}
```

然后在一个 .vue 文件中使用它，观察：
- `count` 在模板中是否自动解包
- `config` 解构后是否还响应式（试试看）

---

### 📅 Day 2：computed 与 watch 的实战差异

#### 🔍 看你的真实代码

`useForm.ts` 中的 `isDirty`：

```ts
const isDirty = computed(() => {
  if (!formData.value || !originalSnapshot.value) return false
  return JSON.stringify(formData.value) !== JSON.stringify(originalSnapshot.value)
})
```

这里用 `computed` 是**正确的**——`isDirty` 是一个**派生值**，它依赖 `formData` 和 `originalSnapshot`，当它们变化时自动重新计算。

#### 💡 深度解析

| 场景 | 用 `computed` | 用 `watch` |
|---|---|---|
| 返回一个值给模板用 | ✅ | ❌ |
| 值改变后要做副作用（调 API、弹提示） | ❌ | ✅ |
| 需要新旧值对比 | ❌ | ✅ |
| 有缓存需求，不想重复计算 | ✅ | ❌ |

你的 `isDirty` 就是典型的 computed 场景：返回一个布尔值给 `submitForm` 判断用。

#### 🧪 动手练习

在 `useForm.ts` 中添加一个 watch（自己写）：

```ts
// 监听表单变化，自动保存草稿到 localStorage
watch(
  () => formData.value,
  (newVal) => {
    if (newVal) {
      localStorage.setItem('form_draft', JSON.stringify(newVal))
    }
  },
  { deep: true }  // ← 思考：为什么这里需要 deep？
)
```

**自问自答**：
- 如果我写 `watch(formData, ...)` 不传 deep，会怎样？（只会监听到 .value 的整体替换）
- 如果我用 `watchEffect` 替代这个 watch 怎么写？

---

### 📅 Day 3：组件通信全链路

#### 🔍 看你的真实代码

`BuilderNode.vue` 和 `FormNode.vue` 是你的项目中**最核心的通信模型**：

```vue
<!-- BuilderNode.vue -->
<BuilderNode
  v-for="(child, cIdx) in comp.list!"
  :key="child.id"
  :comp="child"                    <!-- ① props 向下传 -->
  :parent-list="comp.list!"        <!-- ① props 向下传 -->
  :index="cIdx"                    <!-- ① props 向下传 -->
  @select="handleSelect"           <!-- ② emit 向上传 -->
  @delete="handleDelete"           <!-- ② emit 向上传 -->
/>
```

这是一个**递归组件**——组件自己调用自己！

#### 💡 深度解析

**普通父子通信**：`props ↓` + `emits ↑` 构成单向数据流。

**递归组件的通信挑战**：
- 从上往下：props 传递 `comp`（当前节点数据）+ `parentList`（父级列表，用于拖拽插入）
- 从下往上：emit 事件 `select`、`delete`、`dragstart`、`drop` 冒泡到顶层
- **关键问题**：中间层不做处理，事件一直冒泡到最顶层处理——这叫"事件透传"

#### 🧪 动手练习

动手做一个分析练习——画出 `BuilderNode.vue` 的数据流图：

```
顶层 BuilderNode (root)
  │  props: comp={type:'group', list:[...]}
  │  emit: @select → handleSelect
  │
  ├─ BuilderNode (child 1)
  │    props: comp={type:'input', field:'name'}
  │    emit: @select → ...冒泡到顶层
  │
  └─ BuilderNode (child 2)
       props: comp={type:'group', list:[...]}  ← 嵌套 group！
       │
       └─ BuilderNode (grandchild)
            props: comp={type:'select', field:'city'}
```

**思考**：如果中间层想拦截 `@select` 事件，怎么做？

---

### 📅 Day 4：v-model 的真相 — 7 步完整链路

#### 🔍 看你的真实代码

打开 [FormNode.vue](apps/vue-app/src/components/FormNode.vue#L27)：

```vue
<component :is="getElComponent(comp.type)"
  v-model="formData[comp.field]"
  v-bind="comp.props"
/>
```

看起来一行代码，实际上 Vue 在幕后做了一长串协作。Day 11 日报说你已经会"7 步链路"——这里把它写下来作为长期复习材料。

#### 💡 v-model 的编译展开

`v-model="formData[comp.field]"` 编译后等价于：

```vue
<component
  :model-value="formData[comp.field]"
  @update:model-value="(val) => formData[comp.field] = val"
/>
```

- `:model-value` = 父传子（props 下传）
- `@update:model-value` = 子传父（emit 上抛）

对于**自定义 v-model 名字**：
- `v-model:title="x"` = `:title="x"` + `@update:title="x = $event"`
- `v-model:visible="x"` = `:visible="x"` + `@update:visible="x = $event"`

**修饰符**：`v-model.trim="x"` 会让 Vue 在 update 时自动调用 `String.prototype.trim()`。

#### 🔁 7 步完整链路（从用户敲键盘到屏幕更新）

```text
用户在 <el-input> 里输入 "q"
    │
    ▼
① DOM input 事件触发
    └─ el-input 内部的 <input @input="...">
    │
    ▼
② el-input 内部调用 emit('update:modelValue', 'q')
    │
    ▼
③ 父组件监听到 update:modelValue
    └─ 执行编译产生的回调：formData[comp.field] = 'q'
    │
    ▼
④ 响应式系统 trigger 被触发
    └─ formData 是 reactive，Proxy 的 set 拦截器执行
    └─ 找到 dep.get(key=comp.field) 对应的 effect 集合
    │
    ▼
⑤ scheduler 去重调度
    └─ 每个 effect 推进微任务队列（Promise.resolve().then(...)）
    └─ 同一 effect 多次 trigger 只入队一次
    │
    ▼
⑥ 组件的 renderEffect 执行
    └─ 重新调用 render() 生成新 VNode 树
    └─ 调用 patch(oldVNode, newVNode)
    │
    ▼
⑦ patch 更新真实 DOM
    └─ 通过 PatchFlag 只更新动态节点（输入框的 value 属性）
    └─ 浏览器重新绘制画面
```

**把这 7 步记住，面试再问 v-model 的时候你就能从"用户输入"一路讲到"DOM 更新"**。

#### 🔬 项目应用：AST 生成器的意义

你做的低代码引擎：

```text
用户拖入 input 组件
    ↓
JSON 配置：{ type: 'input', field: 'username', label: '用户名' }
    ↓
AST 生成器读取 JSON
    ↓
输出：<el-input v-model="formData.username" />
```

v-model 本质"props + emit"的组合——这是 AST 生成器生成 Vue 代码的**核心模式**。如果你理解了 v-model 是两步操作的语法糖，就能反向生成任意 v-model 绑定的组件代码。

#### 🧪 动手练习

**练习 1**：`FormNode.vue:27` 中如果想加 `.trim` 修饰符（字符串自动去首尾空格），改成什么？

<details><summary>点开看答案</summary>

```vue
<component :is="getElComponent(comp.type)"
  v-model.trim="formData[comp.field]"
  v-bind="comp.props"
/>
```

编译后变成：`@update:model-value="(val) => formData[comp.field] = val.trim()"`
</details>

**练习 2**：自定义组件 `ProSelect.vue` 支持两个 v-model：

```vue
<!-- 父组件用法 -->
<ProSelect
  v-model:value="formData[comp.field]"
  v-model:options="formData[comp.field + '_options']"
/>
```

子组件 `ProSelect.vue` 需要怎么声明 props 和 emits？

<details><summary>点开看答案</summary>

```vue
<script setup lang="ts">
defineProps<{
  value: string
  options: Array<{ label: string; value: string }>
}>()

defineEmits<{
  (e: 'update:value', val: string): void
  (e: 'update:options', opts: Array<{ label: string; value: string }>): void
}>()
</script>
```

**关键点**：每个 `v-model:xxx` 对应一对 prop（`xxx`）+ emit（`update:xxx`）。
</details>

**练习 3**：v-model 的修饰符能自己定义吗？

<details><summary>点开看答案</summary>

能。Vue 3 把修饰符放进 `xxxModifiers` prop 传给子组件：

```vue
<!-- 父 -->
<MyInput v-model.capitalize="text" />

<!-- 子 -->
<script setup>
const props = defineProps(['modelValue', 'modelValueModifiers'])
const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  let val = e.target.value
  if (props.modelValueModifiers?.capitalize) {
    val = val.charAt(0).toUpperCase() + val.slice(1)
  }
  emit('update:modelValue', val)
}
</script>
```
</details>

#### 🎯 今日自检题

1. `v-model="x"` 和 `:modelValue="x" + @update:modelValue="x = $event"` 有区别吗？
2. `v-model:title="x"` 中 `title` 这个名字如何传给子组件？（答：作为 prop 名）
3. 为什么 v-model 要拆成 prop + emit 两步？（答：Vue 的单向数据流原则，props 不能在子组件里直接修改）
4. Element Plus 的 `<el-input>` 内部怎么触发 update:modelValue？（答：监听原生 input 事件，从 e.target.value 取值后 emit）

---


### 📅 Day 5：Pinia 状态管理实战 — defineStore 是"全局单例的 setup 函数"

#### 🔍 看你的真实代码

完整看 [user.ts](apps/vue-app/src/store/user.ts)：

```ts
export const useUserStore = defineStore(
  "user",
  () => {
    // 1. state — ref 定义的响应式状态
    const token = ref(localStorage.getItem("token") || '')
    const roles = ref<string[]>([])
    const userInfo = ref<any>(null)
    const menuRoutes = ref<RouteRecordRaw[]>([])

    // 2. getters — computed 定义的派生值
    const isLogin = computed(() => !!token.value)

    // 3. actions — 普通函数（可异步）
    const login = async (loginForm: any) => {
      const data = await loginApi(loginForm)
      setToken(data.token)
    }
    const getUserInfo = async () => {
      const data = await getUserInfoApi()
      userInfo.value = data
      roles.value = data.roles
      return data
    }
    const logout = () => { /* ... */ }

    return { token, roles, userInfo, isLogin, login, getUserInfo, logout }
  },
  {
    persist: { key: 'user-storage', pick: ['token'] }
  }
)
```

#### 💡 Day 11 日报的核心洞察：defineStore 是"全局单例的 setup 函数"

**这一点是 Day 11 日报反复强调的，也是 Pinia 真正的本质**。

```text
defineStore('user', setupFn)  ← 只是"注册"，没有执行 setupFn
        │
        ▼
useUserStore()                ← 组件里第一次调用时才执行 setupFn
        │
        ├─ 第 1 次调用：运行 setupFn，创建 ref/computed，缓存返回值
        │
        └─ 第 2..N 次调用：直接返回上次缓存，不再重新运行
```

**这就是"全局单例"**：不管你在多少个组件里 `useUserStore()`，拿到的 `token` / `roles` 永远是**同一个 ref 实例**，任何组件修改都会广播到所有订阅它的组件。

**和你 Day 1 手写的 Mini_ref 的关系**：

- 全局一个 `token = ref('')` → 谁 `useUserStore().token.value` 就会访问这个 ref 的 getter
- getter 把当前组件的 renderEffect 加入 `dep`
- `logout()` 里 `token.value = ''` → setter 触发 dep.forEach，所有订阅组件重新渲染

**Pinia 不是发明了新魔法**——它只是让"全局 ref + computed"有个固定的组织方式。

#### 🔬 Setup Store vs Options Store 对比

| | Setup Store（你用的） | Options Store |
|---|---|---|
| 写法 | Composition API 风格 | Vuex 风格 |
| state | `ref()` / `reactive()` | `state: () => ({})` |
| getters | `computed()` | `getters: { doubled: state => state.count * 2 }` |
| actions | 普通函数（this 指向 store） | `actions: { increment() { this.count++ } }` |
| TS 推导 | ✅ 自动 | 需要手动声明类型 |
| 能否用 composable | ✅ 能调 `useRouter()` 等 | ❌ |
| 持久化插件 | ✅ 都支持 | ✅ 都支持 |

**何时用 Options Store？** 迁移 Vuex 项目时过渡期用——新项目直接 Setup。

#### 🔧 持久化插件的细节

```ts
persist: {
  key: 'user-storage',
  pick: ['token']  // 只持久化 token
}
```

**为什么只持久化 token？**

- `token` 是用户身份证——刷新页面后不想重新登录
- `roles` / `userInfo` 每次打开应用由 `getUserInfo()` 重新拉取——保证权限变更实时生效
- `menuRoutes` 依赖 roles，所以也跟着重新生成

**如果你把 roles 也持久化了会怎样？** 管理员降级为普通用户后，用户刷新页面还显示原来的菜单——直到 token 过期被踢下线。这是典型的权限漏洞。

#### 🧪 动手练习

**练习 1**：新建 `store/formDesigner.ts`，管理表单设计器的状态：

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FormComponent } from '@/types/lowcode'

export const useFormDesignerStore = defineStore('formDesigner', () => {
  // state
  const components = ref<FormComponent[]>([])
  const activeId = ref<string | null>(null)
  const history = ref<FormComponent[][]>([])  // 撤销栈

  // getters
  const activeComponent = computed(() =>
    components.value.find(c => c.id === activeId.value) ?? null
  )
  const canUndo = computed(() => history.value.length > 0)

  // actions
  const addComponent = (comp: FormComponent) => {
    history.value.push(JSON.parse(JSON.stringify(components.value)))
    components.value.push(comp)
  }
  const removeComponent = (id: string) => {
    history.value.push(JSON.parse(JSON.stringify(components.value)))
    components.value = components.value.filter(c => c.id !== id)
    if (activeId.value === id) activeId.value = null
  }
  const undo = () => {
    if (history.value.length === 0) return
    components.value = history.value.pop()!
  }

  return {
    components, activeId, history,
    activeComponent, canUndo,
    addComponent, removeComponent, undo
  }
})
```

**练习 2**：在两个不同组件里都 `useFormDesignerStore()`，修改 activeId 后观察是否同步。

**练习 3**：加上持久化——只持久化 `components`，不持久化 `history`（撤销栈刷新后应该清空）。

<details><summary>答案</summary>

```ts
export const useFormDesignerStore = defineStore('formDesigner', () => {
  /* ... */
}, {
  persist: {
    key: 'form-designer',
    pick: ['components']  // history 不持久化
  }
})
```

</details>

#### 🎯 今日自检题

1. 为什么在组件外（比如路由守卫里）直接 `import { useUserStore }` 然后调用会报错？（答：Pinia 实例必须先通过 `app.use(pinia)` 注册，且 useXxxStore 必须在 setup 时机或之后调用）
2. Setup Store 的 `return { ... }` 可以省略吗？（答：不能，Pinia 靠 return 值注册 state/getters/actions）
3. 如果需要在 store 里用 `useRouter()` 跳转，Setup Store 可以吗？（答：可以，直接 `const router = useRouter()`，Options Store 做不到）
4. Pinia 和组件的 renderEffect 是如何关联的？（答：state 是 ref，访问 `.value` 时当前组件的 renderEffect 作为 activeEffect 被 dep 收集）
5. `logout()` 里为什么要手动 `localStorage.clear()`？（答：persist 插件只管写入，不管登出时的清理——除非你另配 `afterHydrate` / `beforeHydrate`）

---


### 📅 Day 6：响应式完整链路 — track / trigger / scheduler / effect.run

> Day 11 日报错误点第 5 条："需要继续巩固 track/trigger/scheduler 的完整调用时序，尤其 scheduler 的去重机制"。本日专攻这个盲区。

#### 🔍 上下文：你已经会的部分

- Day 1：`RefImpl` 的 getter 收集 `activeEffect`、setter 遍历 `dep.forEach` 执行
- Day 2：computed 用 `_dirty` 做懒执行，watch 是"手动 getter 的 effect"

**本日要补的两块**：
1. 真实 Vue 源码里 `track` / `trigger` 比你手写的 `dep.add` / `dep.forEach` 多了什么
2. `scheduler` 为什么存在、怎么做去重、和 `effect.run()` 是什么关系

#### 💡 第一层：track / trigger 的真实形态

你手写 Mini_ref 里只有**一个 `dep`**。但 Vue 源码里每个 `reactive` 对象有**多个 dep**——每个属性一个：

```text
reactive({ name: 'a', age: 18 })
    │
    ▼
全局 targetMap: WeakMap<对象, Map<key, Set<effect>>>
    │
    ├── obj1 → Map
    │          ├── 'name' → Set { effect1, effect2 }
    │          └── 'age'  → Set { effect1, effect3 }
    │
    └── obj2 → Map
               └── ...
```

**track(target, key)**：

```ts
function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, depsMap = new Map())
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, dep = new Set())
  dep.add(activeEffect)
}
```

**trigger(target, key)**：

```ts
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  if (!dep) return
  dep.forEach(effect => {
    if (effect.scheduler) effect.scheduler()  // ← 有调度器走调度器
    else effect.run()                          // ← 没有就直接执行
  })
}
```

**和 Mini_ref 的区别**：
- Mini_ref 只有一个 ref 一个 dep（因为 ref 只有一个 value）
- reactive 是对象，每个 key 独立 dep，互不干扰

#### 💡 第二层：effect 不只是函数，是一个"Effect 类实例"

你 Day 1 写的：`effect(fn) { activeEffect = fn; fn(); activeEffect = null }`。

Vue 源码真正的 effect：

```ts
class ReactiveEffect {
  active = true
  deps: Dep[] = []        // 记录收集了自己的所有 dep（用于清理）
  scheduler?: () => void  // 调度器（可选）

  constructor(public fn: () => void, scheduler?) {
    this.scheduler = scheduler
  }

  run() {
    if (!this.active) return this.fn()
    activeEffect = this
    cleanupEffect(this)  // 清除旧依赖，防止"分支切换"后的脏依赖
    const res = this.fn()
    activeEffect = null
    return res
  }

  stop() {
    cleanupEffect(this)
    this.active = false
  }
}
```

**关键字段解释**：
- `deps`：记录"我被哪些 dep 收集了"——stop 时能反向清理
- `scheduler`：**关键**，决定"trigger 时要立即执行还是放进队列"
- `run()`：真正执行 fn，并重设 activeEffect

#### 💡 第三层：scheduler 到底解决什么问题

**问题场景**：没有 scheduler 会怎样？

```ts
const count = ref(0)
effect(() => {
  console.log('render with', count.value)
})

count.value++   // 第 1 次触发：打印 render with 1
count.value++   // 第 2 次触发：打印 render with 2
count.value++   // 第 3 次触发：打印 render with 3
```

上面连续 3 次 ++，同步执行时 effect 会跑 **3 次**——但中间的渲染都是白费的，**我只关心最终结果**。

**scheduler 的解法**：trigger 不直接 `effect.run()`，而是调用 `scheduler()` 把 effect 推进"微任务队列"：

```ts
const queue = new Set<ReactiveEffect>()   // Set 自带去重
let flushing = false

function queueJob(effect) {
  queue.add(effect)
  if (!flushing) {
    flushing = true
    Promise.resolve().then(flushJobs)   // 下一个微任务才真正执行
  }
}

function flushJobs() {
  queue.forEach(effect => effect.run())
  queue.clear()
  flushing = false
}
```

**回放刚才的场景**（有 scheduler）：

```text
同步任务：
  count.value++  → trigger → queue.add(effect)   // 入队
  count.value++  → trigger → queue.add(effect)   // 已存在，Set 去重
  count.value++  → trigger → queue.add(effect)   // 已存在，Set 去重

微任务（下一个 tick）：
  flushJobs → effect.run()  // 只执行 1 次！读到 count.value=3
```

**3 次同步赋值 → 1 次渲染**。这就是 Day 11 日报提到的"scheduler 去重机制"。

#### 💡 第四层：完整 7 步时序

```text
① 用户操作或代码触发 data.x = y
    │
    ▼
② Proxy.set 拦截 → 调用 trigger(target, 'x')
    │
    ▼
③ trigger 查 targetMap → 拿到 dep（Set<effect>）
    │
    ▼
④ 遍历 dep：有 scheduler 调 scheduler()，没有直接 effect.run()
    │   ↓
    │   scheduler 把 effect 推进 queue（Set 去重）
    │   │
    │   └── 首次入队 → Promise.resolve().then(flushJobs)
    │
    ▼
⑤ 当前同步任务执行完毕，JS 引擎进入微任务阶段
    │
    ▼
⑥ flushJobs 遍历 queue → 逐个 effect.run()
    │
    ▼
⑦ effect.run() 执行 render → patch → 真实 DOM 更新
```

#### 🔬 和 Vue 2 的差异

| | Vue 2 | Vue 3 |
|---|---|---|
| 依赖收集 | Object.defineProperty 递归遍历 | Proxy 懒代理（访问到才代理） |
| 新增属性 | 需要 Vue.set() | 自动拦截，天然支持 |
| 数组方法 | 重写 7 个原型方法 | Proxy 原生拦截 |
| 调度器 | watcher 实例带 scheduler，逻辑相似 | ReactiveEffect + queueJob，更清晰 |
| 微任务 | nextTick 使用 MicroTask（微任务） | 同样使用微任务 |

#### 🧪 动手练习：手写 Mini scheduler

在 [js/day30-js底层/Vue3从项目学源码/](../js/day30-js底层/Vue3从项目学源码/) 下新建 `Mini_scheduler.ts`：

```ts
// 目标：同步连续触发 3 次，只执行 1 次 effect
import { ref, effect } from './Mini_ref'  // 复用 Day 1 手写

const queue = new Set<Function>()
let flushing = false

function queueJob(fn: Function) {
  queue.add(fn)
  if (!flushing) {
    flushing = true
    Promise.resolve().then(() => {
      queue.forEach(f => f())
      queue.clear()
      flushing = false
    })
  }
}

// 改造 Mini_ref 的 RefImpl.setter：
// 把 this.dep.forEach(effect => effect())
// 改成 this.dep.forEach(effect => queueJob(effect))

// 测试
const count = ref(0)
effect(() => console.log('render with', count.value))
count.value = 1
count.value = 2
count.value = 3
// 期望输出：只打印一次 "render with 3"
```

#### 🎯 今日自检题

1. `targetMap` / `depsMap` / `dep` 三者是什么关系？
2. 为什么 `dep` 用 `Set` 而不是 `Array`？（答：自动去重同一个 effect，O(1) 添加）
3. scheduler 的"微任务队列"和 Promise.then 是什么关系？（答：scheduler 把任务推进 Promise.resolve().then，利用 JS 事件循环的微任务阶段批量执行）
4. 为什么 `cleanupEffect(this)` 要在每次 run 之前做？（答：分支切换时旧的依赖可能不再被读取，防止旧 dep 还把它加在自己 Set 里）
5. 同一个 effect 被触发 100 次，最终执行几次？（答：1 次，因为 Set 去重 + 单次 flush）

---


### 📅 Day 7：挂载与更新渲染链路 — createVNode → patch → setupRenderEffect

> Day 11 日报："挂载渲染链路 createVNode → mount → patch(null) → setupComponent → setupRenderEffect(effect)"。本日把每一步展开。

#### 🔍 宏观视角：从 main.ts 到屏幕上的第一个像素

```text
createApp(App)              // 创建 App 实例
  .use(router)
  .use(pinia)
  .mount('#app')            // ← 这里开始
        │
        ▼
mount('#app')
  → 找到 DOM 容器 #app
  → render(vnode, container)  // 真正的渲染入口
        │
        ▼
render(vnode, container)
  → patch(null, vnode, container)
    （null 表示"没有旧 vnode"，等价于"首次挂载"）
```

**`patch` 是 Vue 渲染的唯一入口**——挂载和更新都调它。区别只在第一个参数：

- `patch(null, newVNode)` → 挂载
- `patch(oldVNode, newVNode)` → 更新
- `patch(oldVNode, null)` → 卸载

#### 💡 patch 内部的分发逻辑

```ts
function patch(n1, n2, container) {
  const { type, shapeFlag } = n2
  switch (type) {
    case Text:          processText(n1, n2, container); break
    case Fragment:      processFragment(n1, n2, container); break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(n1, n2, container)      // 处理普通 DOM 元素
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        processComponent(n1, n2, container)    // 处理组件
      }
  }
}
```

**shapeFlag** 是 VNode 上的位运算标志——用位运算比字符串判断快得多。

#### 💡 组件挂载完整链路

```text
processComponent(null, newVNode, container)
        │
        ▼
mountComponent(newVNode, container)
        │
        ├─ ① 创建组件实例 instance = { props, slots, ctx, ... }
        │
        ├─ ② setupComponent(instance)
        │    ├─ initProps()
        │    ├─ initSlots()
        │    └─ setupStatefulComponent()
        │         │
        │         └─ 调用用户写的 setup(props, ctx)
        │             → 返回 setupResult（响应式状态和方法）
        │             → 把 setupResult 代理到 instance.proxy
        │
        └─ ③ setupRenderEffect(instance, container)
             │
             ▼
             new ReactiveEffect(componentUpdateFn, scheduler)
             │
             ▼
             componentUpdateFn：
               if (首次挂载) {
                 const subTree = instance.render()   // 调用 render 函数
                 patch(null, subTree, container)     // 递归挂载子节点
                 instance.isMounted = true
               } else {
                 const newTree = instance.render()
                 patch(oldTree, newTree, container)  // 更新 diff
               }
```

**关键洞察**：每个组件实例都有**自己独立的一个 ReactiveEffect**（叫 renderEffect）——这个 effect 的 `fn` 就是"重新 render + patch"。

#### 💡 更新链路：和 Day 6 的链路对接

```text
① 组件用到的 reactive 数据变了（比如 Pinia 里 token.value = ''）
    │
    ▼
② Proxy.set → trigger(target, key)
    │
    ▼
③ trigger 拿到 dep（Set<effect>）
    │
    ▼
④ 里面有组件的 renderEffect
    │
    ▼
⑤ renderEffect.scheduler() → queueJob(renderEffect)
    │
    ▼
⑥ 微任务阶段 flushJobs → renderEffect.run()
    │
    ▼
⑦ componentUpdateFn 重新跑
    → instance.render() 生成新 subTree
    → patch(oldSubTree, newSubTree) 最小化更新 DOM
```

**这就是 Day 6 的 scheduler 和 Day 7 的 renderEffect 的对接点**——scheduler 负责"去重批量"，renderEffect 负责"生成新树 + diff 旧树"。

#### 🔬 patch 的 diff 算法（简化理解）

对于**相同位置的相同类型节点**（`sameVNodeType`），Vue 做 `patchElement`：
- 对比 props，只改变化的属性
- 对比 children，递归 patch

对于**不同类型**：直接卸载旧的、挂载新的。

对于**列表子节点**：最快路径是"同序比对"——如果 key 相同，直接复用；key 变了，走最长公共子序列算法最小化移动次数。**这就是你 Day 3 学的"key 必须用业务 id"的源码原因**。

#### 🧪 动手练习

1. 在 [BuilderNode.vue](apps/vue-app/src/components/BuilderNode.vue) 里随便加一个 `console.log('render')`，然后触发拖拽排序，观察 render 次数——理解"只有用到的响应式变了才会 render"。
2. 把 `:key="child.id"` 改成 `:key="cIdx"`，拖拽几次，打开 Vue DevTools 看组件实例是否被复用（答：用 index 作 key 会导致实例重建）。
3. 写一个组件用 `setTimeout` 连续 `count.value++ * 10`，用 `console.count('render')` 验证——微任务队列应该只 render 一次。

#### 🎯 今日自检题

1. `patch` 函数的三种调用形态分别对应什么？（挂载/更新/卸载）
2. `setupComponent` 和 `setupRenderEffect` 的职责区别？（前者初始化 props/setup 调用；后者建立响应式 render 关系）
3. 组件的 `renderEffect` 什么时候被创建？（mountComponent 里，每个组件实例一份）
4. 为什么首次挂载调 `patch(null, vnode)`？（`null` 代表没有旧 vnode，走 mount 分支）
5. 父组件 re-render 时，子组件一定 re-render 吗？（答：不一定，props 未变化时子组件的 renderEffect 不会重跑——Vue 会比对 props 决定是否更新）

---


### 📅 Day 8：KeepAlive 闭环 — include + addView/delView + onActivated/onDeactivated

> Day 11 日报："KeepAlive 闭环：:include=cacheViews 动态控制缓存名单"。本日把动态缓存的完整闭环串起来。

#### 🔍 使用场景（你的项目）

多标签页后台系统的典型需求：

- 用户打开 `/user/list`（用户列表）
- 切到 `/role/list`（角色列表）
- 再切回 `/user/list` → **希望保留原来的搜索条件和分页状态**
- 关闭 `/user/list` 标签 → **清空缓存**

**用 KeepAlive 的动态 include 名单实现**。

#### 💡 KeepAlive 本质

```vue
<router-view v-slot="{ Component }">
  <keep-alive :include="cacheViews">
    <component :is="Component" />
  </keep-alive>
</router-view>
```

**KeepAlive 做了什么？**

- 首次挂载某组件时，**记下它的实例**存在 `cache: Map<key, VNode>` 里
- 当路由切走时，**不销毁组件**，只是把 DOM 从页面 remove（相当于"藏起来"）
- 切回时，从 cache 里取出实例，**不重新挂载**，直接把 DOM 放回页面

**关键差异**：
- 普通 `<router-view>`：切走触发 `onUnmounted`，切回触发 `onMounted`（从零开始）
- `<keep-alive>` 包裹：切走触发 `onDeactivated`，切回触发 `onActivated`（实例保留）

#### 💡 include 的动态控制

```text
用户在 tabs store 里开/关 tab
        │
        ▼
addView(routeName)  → cacheViews.value.push(routeName)
delView(routeName)  → cacheViews.value = filter(v => v !== routeName)
        │
        ▼
KeepAlive 的 :include 绑定的是 cacheViews
        │
        ├─ routeName 在 include 里 → 进入 cache
        │
        └─ routeName 不在 include 里 → 切走时销毁（不缓存）
```

**核心设计**：`cacheViews` 是一个 **reactive 数组**，用户行为实时增删。KeepAlive 内部检测到 `include` 变了，自动清理不在名单里的缓存。

#### 💡 生命周期区别

| 生命周期 | 普通组件 | KeepAlive 包裹的组件 |
|---|---|---|
| 首次挂载 | `onMounted` | `onMounted` + `onActivated` |
| 切走 | `onUnmounted` | `onDeactivated`（不销毁） |
| 切回 | 不存在（已销毁） | `onActivated`（不重挂载） |
| 真正销毁 | `onUnmounted` | 从 include 移除后 `onUnmounted` |

**典型应用**：

```ts
// 用户列表页
onActivated(() => {
  // 每次回来都刷新数据（即使组件没销毁）
  refreshList()
})
```

```ts
// 视频播放页
onDeactivated(() => {
  // 切走时暂停播放，避免后台继续消耗资源
  video.pause()
})
```

#### 🔬 KeepAlive 内部原理（伪代码）

```ts
// keep-alive 组件的简化实现
const KeepAlive = {
  props: ['include', 'exclude', 'max'],
  setup(props, { slots }) {
    const cache = new Map()    // key → VNode
    const keys = new Set()     // LRU 顺序

    return () => {
      const vnode = slots.default()[0]
      const key = vnode.type.name  // 组件 name
      if (!props.include.includes(key)) {
        return vnode  // 不在名单，走普通渲染
      }
      const cached = cache.get(key)
      if (cached) {
        vnode.component = cached.component  // 复用实例
        vnode.shapeFlag |= COMPONENT_KEPT_ALIVE
      } else {
        cache.set(key, vnode)
        keys.add(key)
        if (props.max && keys.size > props.max) {
          // LRU 淘汰最久未使用
          const firstKey = keys.values().next().value
          cache.delete(firstKey)
          keys.delete(firstKey)
        }
      }
      vnode.shapeFlag |= COMPONENT_SHOULD_KEEP_ALIVE
      return vnode
    }
  }
}
```

**patch 看到 `COMPONENT_KEPT_ALIVE` 标志时**：不走 mountComponent，直接把缓存的 DOM 插回；触发 `onActivated` 钩子。

#### 🧪 动手练习

1. 在你的项目里找 `tabsStore`（或类似名字），看 `addView` / `delView` 的实现
2. 写一个测试页面，里面用 `<input>` 输入点内容，然后切走、切回——验证输入值是否保留
3. 加一个 `onActivated` 钩子 `console.log('activated')`，反复切，确认每次切回都会触发
4. 把这个组件从 include 里移除（比如关闭 tab），再打开——确认是**全新组件**（onActivated 之前还会触发 onMounted）

#### 🎯 今日自检题

1. KeepAlive 和 `v-show` 有什么区别？（v-show 只是 CSS 隐藏，DOM 还在；KeepAlive 连 DOM 都从文档 remove，但实例保留）
2. KeepAlive 会缓存什么？（组件实例 + 响应式状态 + DOM 节点）
3. `include` 的匹配依据是什么？（组件的 `name` 选项，没 name 不生效——这也是为什么 [BuilderNode.vue](apps/vue-app/src/components/BuilderNode.vue) 要加 `export default { name: 'BuilderNode' }`）
4. `onActivated` 和 `onMounted` 的执行顺序？（首次挂载：onMounted → onActivated；后续切回：只有 onActivated）
5. 为什么不全部缓存所有路由？（内存占用、过期数据、权限变更等问题）

---


### 📅 Day 9：编译优化三件套 — 静态提升 / PatchFlag / 事件缓存

> Day 11 日报错误点①："静态提升和 PatchFlag 的职责边界搞混"。本日用"创建 vs 比对"两阶段视角重建认知。

#### 🔍 核心断言：三件套解决三个独立问题

| 问题 | 解决方案 | 作用阶段 |
|---|---|---|
| 每次 render 都重新创建静态 VNode | **静态提升** | 创建阶段 |
| diff 时逐属性对比浪费 | **PatchFlag** | 比对阶段 |
| 每次 render 都创建新的事件处理函数 | **事件缓存** | 创建阶段 |

**Day 11 错点就在于把这三个混为一谈——其实它们作用在完全不同的阶段**。

#### 💡 一、静态提升（hoistStatic）

**问题**：

```vue
<template>
  <div>
    <h1>Hello</h1>              <!-- 静态 -->
    <p>User: {{ name }}</p>      <!-- 动态 -->
  </div>
</template>
```

**没有静态提升的编译产物**：

```ts
function render() {
  return h('div', null, [
    h('h1', null, 'Hello'),        // 每次 render 都创建！
    h('p', null, 'User: ' + name)  // 动态，必须每次重新算
  ])
}
```

**开启静态提升后**：

```ts
// 提升到 render 函数外部，只创建一次
const _hoisted_1 = h('h1', null, 'Hello')

function render() {
  return h('div', null, [
    _hoisted_1,                    // ✅ 复用，不重新创建
    h('p', null, 'User: ' + name)
  ])
}
```

**职责**：**管 VNode 的"创建"**——不变的 VNode 只在 render 函数外创建一次。

#### 💡 二、PatchFlag（补丁标记）

**问题**：diff 时如何知道一个 VNode 的哪个属性是动态的？

没有 PatchFlag 的话，每次 diff 都要把新旧 VNode 所有属性都对比一遍——哪怕你知道 90% 的属性是静态的。

**开启 PatchFlag 后**：

```ts
// 编译产物
h('p', { class: 'user' }, 'User: ' + name, 1 /* TEXT */)
//                                         ^ PatchFlag=1
```

**数字是位掩码**：

```text
TEXT        = 1   // 文本内容动态
CLASS       = 2   // class 动态
STYLE       = 4   // style 动态
PROPS       = 8   // 其他 props 动态
FULL_PROPS  = 16  // 有动态 key（必须全量对比）
NEED_PATCH  = 512 // 需要 patch 但不属于上面任何一种
HOISTED     = -1  // 静态（跳过）
```

**diff 阶段的 patchElement**：

```ts
function patchElement(n1, n2) {
  const { patchFlag } = n2
  if (patchFlag > 0) {
    if (patchFlag & TEXT) {
      // 只更新文本，不动其他属性
      if (n1.children !== n2.children) hostSetElementText(el, n2.children)
    }
    if (patchFlag & CLASS) {
      if (n1.props.class !== n2.props.class) hostPatchProp(el, 'class', ...)
    }
    // ... 其他位
  } else if (patchFlag === -1) {
    return  // 静态节点，跳过
  } else {
    patchProps(el, n1.props, n2.props)  // 全量对比兜底
  }
}
```

**职责**：**管 VNode 的"比对"**——告诉 diff "只对比动态的那部分，其他都跳过"。

#### 💡 三、事件缓存（cacheHandlers）

**问题**：

```vue
<button @click="handleClick">Click</button>
```

**没有缓存的编译产物**：

```ts
function render() {
  return h('button', {
    onClick: (...args) => handleClick(...args)  // 每次 render 创建新函数！
  })
}
```

每次 render 都是新函数引用 → diff 认为事件变了 → 重新绑定 → 浪费。

**开启事件缓存后**：

```ts
function render(_ctx, _cache) {
  return h('button', {
    onClick: _cache[0] || (_cache[0] = (...args) => _ctx.handleClick(...args))
    //       ^^^^^^^^^ 第一次创建后放入缓存，后续 render 直接复用
  })
}
```

**效果**：同一个函数引用 → diff 认为事件没变 → 跳过。

**职责**：**管闭包的"创建"**——事件处理函数只创建一次。

#### 🔬 三者职责边界卡（必背）

| 优化 | 什么时候起作用 | 解决的成本 | 产物位置 |
|---|---|---|---|
| 静态提升 | 编译阶段 + render 阶段 | VNode 重复创建 | render 函数**外部** |
| PatchFlag | 编译阶段 + diff 阶段 | 全量属性对比 | VNode 参数末位 |
| 事件缓存 | 编译阶段 + render 阶段 | 闭包重复创建 | `_cache[n]` 数组 |

**一句话串联**：**静态提升**和**事件缓存**都是"不重复创建"（创建阶段优化）；**PatchFlag** 是"不重复比对"（diff 阶段优化）。

#### 🔬 模板编译规则补充

**v-if / v-else-if / v-else 编译成三元表达式**：

```vue
<div v-if="a">A</div>
<div v-else-if="b">B</div>
<div v-else>C</div>
```

编译后：

```ts
render() {
  return a
    ? h('div', null, 'A')
    : b
      ? h('div', null, 'B')
      : h('div', null, 'C')
}
```

**为什么不用 if-else 语句？** 因为 render 函数**必须返回 VNode**——表达式有返回值，语句没有。

**v-for 编译成 .map()**：

```vue
<li v-for="item in list" :key="item.id">{{ item.name }}</li>
```

```ts
h(Fragment, null,
  renderList(list, (item) =>
    h('li', { key: item.id }, item.name)
  )
)
```

#### 🧪 动手练习

1. 打开 [Vue Template Explorer](https://template-explorer.vuejs.org/)，把 [FormNode.vue](apps/vue-app/src/components/FormNode.vue) 的 template 贴进去，看编译产物
2. 找出产物里的 `_hoisted_1` / `_hoisted_2`——哪些 VNode 被提升了？
3. 找出产物里的 PatchFlag 数字——哪些地方有 `1 /* TEXT */` 或 `8 /* PROPS */`？
4. 把 `<el-input v-model="formData[comp.field]">` 的编译产物和 `<input type="text">` 对比，理解组件 vs 普通元素的 shapeFlag 差异

#### 🎯 今日自检题

1. 静态提升 vs PatchFlag 的职责边界一句话讲清楚？（答：静态提升管**创建**，PatchFlag 管**比对**）
2. `<div>静态文本</div>` 经过编译会被提升吗？（答：会，完全静态的 VNode 提到 render 外）
3. `<div>{{ name }}</div>` 有 PatchFlag 吗？（答：有，TEXT=1）
4. `<button @click="onClick">` 不加事件缓存会导致什么问题？（答：每次 render 新建函数，子组件认为事件变了会重新绑定）
5. v-if 为什么编译成三元而不是 if-else？（答：render 必须返回 VNode，表达式有返回值）

---


### 📅 Day 10：TypeScript 盲区专项 — Partial / extends / 工具类型闭环

> Day 11 日报错误点③④："`Partial<SystemUser>` 误写为 `type<Partial extends T>`；extends 在泛型中的作用混淆"。本日一次性打掉这两个 🔴 盲区。

#### 🔍 盲区 1：`Partial<T>` 到底是什么语法

**错误写法（Day 11 日报中写的）**：

```ts
type<Partial extends SystemUser>  // ❌ 完全不存在的语法
```

**正确写法**：

```ts
// Partial 是一个"类型函数"，接收 T，返回 T 所有字段变可选后的新类型
type CreateUserParams = Partial<SystemUser>
```

**推导过程——你脑子里要想的是这个流程图**：

```text
"我要一个类型，像 SystemUser 但所有字段可选"
        │
        ▼
Partial<T> = { [K in keyof T]?: T[K] }   ← TS 内置
        │
        ▼
Partial<SystemUser>
= { [K in keyof SystemUser]?: SystemUser[K] }
= {
    id?: string | number
    username?: string
    role?: 'admin' | 'editor' | 'viewer'
    roles?: string[]
    status?: string
  }
```

**关键识别**：`Partial<T>` 里 `T` **作为类型参数传入**，用的是 `<>` 而不是 `extends`——它不是约束，就是赋值。

#### 🔍 盲区 2：`extends` 在不同位置的三种含义

**同一个关键字，三种用途，看"站的位置"区分**。

| 位置 | 用途 | 示例 |
|---|---|---|
| 泛型参数声明里 | **约束** | `function useTable<P extends BasePageParams>` |
| 条件类型里 | **判断 + 类型收缩** | `type IsString<T> = T extends string ? 'y' : 'n'` |
| interface/class 后 | **继承** | `interface Admin extends User { permissions: string[] }` |

**识别规则**：
- 左边是 `<T>` 里的参数 → 约束
- 左边是类型名 `interface X extends Y` → 继承
- 左边是值或泛型 `T extends U ? ... : ...` → 条件类型

#### 💡 深度解析（一）：extends 作为约束的真实作用

[useTable.ts:11](apps/vue-app/src/hooks/useTable.ts#L11)：

```ts
interface BasePageParams {
  page: number
  pageSize: number
}

export function useTable<T, P extends BasePageParams>(...) {
  const params = {
    page: pagination.value.page,
    pageSize: pagination.value.pageSize,
    ...queryParams
  } as P   // ← 关键
}
```

**去掉 extends 会怎样？**

```ts
export function useTable<T, P>(...) {
  const params = {
    page: ...,
    pageSize: ...,
    ...queryParams
  } as P   // ❌ TS 不知道 P 里有没有 page 和 pageSize
           //    但 as P 是强转，编译时不报错，运行时可能埋雷
}
```

**加了 extends 后**：TS 知道 **P 至少有 page 和 pageSize**，这行代码在类型层面就是合法的。

**一句话理解**：`P extends BasePageParams` 读作 "**P 必须是 BasePageParams 的子类型**"——包括所有属性 + 可以更多。

#### 💡 深度解析（二）：extends 作为条件类型

```ts
type IsString<T> = T extends string ? 'yes' : 'no'

type A = IsString<'hello'>   // 'yes'
type B = IsString<123>        // 'no'
```

**这里的 extends 是"判断是否兼容"**——如果 T 兼容 string，走第一个分支，否则第二个。

**实战场景**：你项目里的 `ReturnType` 就是条件类型：

```ts
type ReturnType<F> = F extends (...args: any[]) => infer R ? R : never
//                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                   如果 F 是函数类型，返回它的返回值类型 R；否则 never

type UserInfo = ReturnType<typeof getUserInfoApi>
// 自动提取 getUserInfoApi 的返回值类型
```

#### 💡 深度解析（三）：工具类型全家桶

所有工具类型**都是用映射类型 + 条件类型 + keyof 组合**实现的。

```ts
// Partial：所有字段变可选
type Partial<T> = { [K in keyof T]?: T[K] }

// Required：所有字段变必填
type Required<T> = { [K in keyof T]-?: T[K] }

// Pick：只要某几个字段
type Pick<T, K extends keyof T> = { [P in K]: T[P] }
//               ^^^^^^^^^^^^^^
//               ← 这个 extends 又是约束！K 必须是 T 的键

// Omit：排除某几个字段
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

// Record：key → value 映射
type Record<K extends keyof any, V> = { [P in K]: V }

// ReturnType：提取函数返回值类型
type ReturnType<F> = F extends (...args: any[]) => infer R ? R : never
```

**你要理解的层次**：
1. **使用层**：`Partial<User>`、`Pick<User, 'id' | 'name'>` 直接用
2. **原理层**：看懂它的内部定义（映射类型 + keyof）
3. **创造层**：自己写一个工具类型（比如 `DeepPartial<T>` 递归可选）

#### 🔬 项目实战：你的代码里已经在用的

| 位置 | 写法 | 工具类型 |
|---|---|---|
| [useTable.ts:23](apps/vue-app/src/hooks/useTable.ts#L23) | `queryParams?: Partial<P>` | Partial |
| [api/user.ts](apps/vue-app/src/api/user.ts) | `data: Partial<SystemUser>` | Partial |
| [useDesignerStore.ts:10](apps/react-app/src/store/useDesignerStore.ts#L10) | `patch: Partial<BaseNode>` | Partial（React 项目里也用） |

#### 🧪 动手练习

**练习 1**：下面三段代码哪些能过编译？

```ts
// A
function foo<T extends { id: number }>(x: T) { return x.id }
foo({ id: 1, name: "a" })

// B
function foo<T extends { id: number }>(x: T) { return x.id }
foo({ name: "a" })

// C
function foo<T>(x: T) { return x.id }
foo({ id: 1 })
```

<details><summary>答案</summary>

- **A：过**。`{ id: 1, name: 'a' }` 是 `{ id: number }` 的子类型（多了字段允许）。
- **B：挂**。`{ name: 'a' }` 不满足约束（缺 id）。
- **C：挂**。`T` 没约束时，TS 不知道 `x` 上有 `id` 属性。

**规律**：extends 越严，传入越受限；但函数体内能用的就越多。

</details>

**练习 2**：手写 `DeepPartial<T>`——让嵌套对象的所有字段都可选。

<details><summary>答案</summary>

```ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

interface User {
  id: number
  profile: { name: string; age: number }
}

type T1 = DeepPartial<User>
// {
//   id?: number
//   profile?: { name?: string; age?: number }
// }
```

</details>

**练习 3**：给 [api/user.ts](apps/vue-app/src/api/user.ts) 新增一个 `updateUserStatusApi`，只需要传 `id` 和 `status`。

<details><summary>答案</summary>

```ts
export const updateUserStatusApi = (data: Pick<SystemUser, 'id' | 'status'>) =>
  request({ url: '/users/status', method: 'patch', data })
```

</details>

**练习 4**：什么时候用 `Pick` 什么时候用 `Omit`？

<details><summary>答案</summary>

- **Pick**：需要的字段少（白名单）→ 比如只要 `id` 和 `status`
- **Omit**：不要的字段少（黑名单）→ 比如排除 `password` 返回给前端

两者等价：`Pick<T, 'id'>` === `Omit<T, 除 id 外的所有键>`。
</details>

#### 🎯 今日自检题

1. `Partial<T>` 的内部实现是什么？（答：`{ [K in keyof T]?: T[K] }`，映射类型）
2. `<T extends U>` 和 `T extends U ? X : Y` 的 extends 是同一个东西吗？（答：关键字一样，语义不同——前者约束，后者条件判断）
3. `Pick<T, K extends keyof T>` 里为什么对 K 加约束？（答：确保传入的 K 是 T 的真实键，否则 `Pick<User, 'xxx'>` 这种错拼字段也过编译了）
4. 怎么提取函数的第一个参数类型？（答：用条件类型 + infer：`type FirstArg<F> = F extends (a: infer A, ...rest: any[]) => any ? A : never`）
5. `Record<string, FormComponent>` 等价于什么？（答：`{ [K in string]: FormComponent }`，也就是"任意字符串 key 映射到 FormComponent"的对象）

---




| 日期 | 主题 | 产出物 | 状态 |
|---|---|---|---|
| Day 1 | ref/reactive 深层原理 | 手写 `ref` 简化实现 + `useCounter` hook | ⬜ |
| Day 2 | computed vs watch | 添加 draft 自动保存 watch | ⬜ |
| Day 3 | 组件通信模式 | BuilderNode 数据流图 | ⬜ |
| Day 4 | v-model 本质 | 理解 `modelValue + update:modelValue` | ⬜ |
| Day 5 | Pinia Setup Store | 新建 formDesigner store | ⬜ |
| Day 6 | 综合练习 | 改造表单页面，整合所有知识点 | ⬜ |
| Day 7 | 复盘 + 口述 | 用费曼学习法自述一遍 | ⬜ |

---

## 🏁 现在开始 Day 1？

我可以带你一步步来。先从哪里开始？

- **A**：先跟我一起分析 `useForm.ts` 中每一个 ref/reactive 为什么这么选
- **B**：直接动手写 `useCounter.ts` 练习，边写边讲
- **C**：你想先看看 `ref` 的简化源码实现（手写一个 mini 版）
---
## 📌 Day 2 进阶：computed vs watch — 底层共享同一套 track/trigger

### 🔧 手写 Mini computed

`computed` = `ref` + `_dirty` 缓存标记：

- 底层是一个 `.value` 的 getter
- 多了一个 `_dirty` 标志：只有 `_dirty === true` 时才重新计算，否则返回缓存
- getter 内访问的 ref 变化时，**只是把 `_dirty` 置为 true，不立即计算**

```ts
class ComputedRefImpl<T> {
  private _value!: T
  private _dirty = true

  constructor(private getter: () => T) {
    effect(() => {
      this._value = this.getter()
      this._dirty = false
    })
  }

  get value() {
    if (this._dirty) {
      this._value = this.getter()
      this._dirty = false
    }
    if (activeEffect) this.dep.add(activeEffect)
    return this._value
  }
}
```

### 🔍 项目验证：_dirty 为什么不会无限重新计算

以 `useForm.ts` 中的 `isDirty` 为例，一共触发 4 步：

1. 第 1 次读 `.value` → `_dirty=true` → 执行 getter → `JSON.stringify` 比较 → `_dirty=false`
2. `formData` 变了 → `_dirty=true`（**仅标记，不重新计算**）
3. 再次读 `.value` → `_dirty=true` → 重新计算
4. `formData` 没变时再次读 → `_dirty=false` → 直接返回缓存（不执行 JSON.stringify）

**关键洞察**：computed 是"**懒执行**"的，只在被读取时才可能重新计算。

### 🔧 watch — 手动声明依赖的 effect

`watch` 本质上也是一个 effect，只不过：

- 不返回值（做副作用），computed 要返回值
- 立即执行，computed 懒执行
- 拿得到新旧值，computed 没有

### ❓ 自问自答

**Q: 为什么 useForm 中 `watch(() => formData.value, ...)` 要 `deep: true`？**

A: 因为 `() => formData.value` 返回的是一个对象引用。只有当 `formData.value` 整体替换（例如 `= null`）时这个 getter 才会返回不同的值。你改 `formData.value.name` 不会触发 getter 返回值变化，`deep: true` 告诉 watch 要递归追踪对象内部所有属性。

**Q: 这里能用 watchEffect 替代吗？**

A: 能。watchEffect 自动收集依赖，不需要 deep：

```ts
watchEffect(() => {
  if (formData.value) {
    localStorage.setItem('form_draft', JSON.stringify(formData.value))
  }
})
```

但你拿不到旧值，而且无法指定 `immediate: false` 这类控制。

### 🔬 三者对比卡

| | computed | watch | watchEffect |
|---|---|---|---|
| 返回值 | ✅ | ❌ | ❌ |
| 旧值 | ❌ | ✅ newVal, oldVal | ❌ |
| 执行时机 | 懒执行 | 依赖变就执行 | 依赖变就执行 |
| 缓存 | ✅ _dirty | ❌ | ❌ |
| 依赖声明 | 自动收集 | 手动 getter | 自动收集 |
| 副作用 | ❌ | ✅ | ✅ |
| 典型场景 | `isLogin` / `isDirty` | 草稿保存 / URL 同步 | 调试日志 / DOM 操作 |

---


## 📅 Day 3：组件通信全链路 — 从 BuilderNode.vue 递归组件说起

### 🔍 教学素材：apps/vue-app/src/components/BuilderNode.vue

在开始之前，先回答一个问题：**为什么叫"递归组件"？**

<!-- 打开 BuilderNode.vue 的第 18-23 行： -->

```vue
<template>
  <!-- ... -->
  <div v-if="comp.type === 'group'">
    <BuilderNode                          <!-- ← 自己调用自己！ -->
      v-for="(child, cIdx) in comp.list!"
      :key="child.id"
      :comp="child"
      :parent-list="comp.list!"
      :index="cIdx"
      @select="handleSelect"
      @delete="handleDelete"
    />
  </div>
</template>
```

**递归终止条件**：当 `comp.type !== 'group' && comp.type !== 'grid'` 时，走 `v-else` 分支渲染普通组件（input/select/date 等），不再继续嵌套 BuilderNode。

---

### 第一步：数据是如何"向下流"的

#### ① Props 声明（defineProps）

```ts
const props = defineProps<{
  comp: FormComponent          // 当前节点的完整数据
  parentList: FormComponent[]  // 父级列表（用于拖拽插入到正确位置）
  index: number                // 当前节点的位置序号
  activeComponentId: string | null  // 高亮当前选中项
  labelWidth: string           // 标签宽度（纯展示用）
}>()
```

**每个 `BuilderNode` 收到 5 个 props**，从上往下逐层传递。

#### ② 三个分支的 props 传递路径

```
顶层 Root
  comp = { type:'group', list:[compA, compB, compC] }  ← 3 个子组件
  │
  ├── BuilderNode (compA, index=0, parentList=root.list)
  │     comp = { type:'input', field:'name' }  ← 普通组件，递归终止
  │
  ├── BuilderNode (compB, index=1, parentList=root.list)
  │     comp = { type:'group', list:[compD, compE] }  ← 嵌套分组！
  │     │
  │     ├── BuilderNode (compD, index=0, parentList=compB.list)
  │     │     comp = { type:'select', field:'city' }  ← 递归终止
  │     │
  │     └── BuilderNode (compE, index=1, parentList=compB.list)
  │           comp = { type:'grid', columns:[...]}  ← 栅格，继续展开
  │           │ 遍历 columns，每列中又放 BuilderNode...
  │
  └── BuilderNode (compC, index=2, parentList=root.list)
        comp = { type:'date', field:'birthday' }  ← 递归终止
```

**关键细节**：`parentList` 不是源数据，而是引用——
- compA 的 parentList 指向 root.list
- compD 的 parentList 指向 compB.list
- 这样拖拽排序时才知道"应该把组件插入到哪个数组"

---

### 第二步：事件是如何"向上冒泡"的

#### ① Emits 声明（defineEmits）

```ts
const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'delete', id: string): void
  (e: 'dragstart', event: DragEvent, id: string): void
  (e: 'drop', event: DragEvent, targetList: FormComponent[], index: number): void
}>()
```

**三个关键区分**：
- `select` / `delete` → 只需要知道 id → 参数少
- `drop` → 需要知道**往哪插**（targetList）和**插哪**（index）→ 参数多

#### ② 事件透传（Event Bubbling）

```ts
const handleSelect = (id: string) => emit('select', id)
const handleDelete = (id: string) => emit('delete', id)
```

**中间层不做处理，直接 emit 出去**——这叫"事件透传"。

```
顶层 Root 监听 @select="handleRootSelect"
  │
  ├── BuilderNode (compA)  @select="handleSelect" → emit('select', id)
  │                         ↑ 中间层不做任何处理，直接往上抛
  │
  ├── BuilderNode (compB)  @select="handleSelect" → emit('select', id)
  │     │
  │     └── BuilderNode (compD)  用户点击了 compD
  │            → emit('select', compD.id)
  │            → 冒泡到 compB → compB 又 emit('select', compD.id)
  │            → 冒泡到 Root → handleRootSelect(compD.id)
```

**每一层都声明了 `@select` 监听子节点**，但监听函数只做转发。最终所有事件汇集到 Root 处理。

---

### 第三步：event.stop 的作用（容易忽视的细节）

```vue
<div @click.stop="handleSelect(comp.id)"
     @dragstart.stop="handleDragStart($event, comp.id)">
```

`.stop` 是 Vue 的事件修饰符，底层调用 `event.stopPropagation()`。

**为什么需要它？**

如果没有 `.stop`：
```
用户点击 compD（嵌套在 group B 中，group B 嵌套在 group A 中）
  → compD 的 click 触发 → emit('select', compD.id) ✅
  → 事件冒泡到 compB（group B）→ compB 的 click 也触发 → emit('select', compB.id) ❌ 不希望！
  → 事件冒泡到 compA（group A）→ compA 的 click 触发 → emit('select', compA.id) ❌
```

加了 `.stop` 后：只选中被点击的那个组件，不会连带选中它的父级容器。

---

### 第四步：v-for + key 在递归组件中的特殊问题

```vue
<transition-group name="list">
  <BuilderNode
    v-for="(child, cIdx) in comp.list!"
    :key="child.id"    <!-- ← 用的是业务 id，不是 cIdx！ -->
    :comp="child"
    :parent-list="comp.list!"
    :index="cIdx"
  />
</transition-group>
```

**为什么 key 用 child.id 而不是 index？**

1. 拖拽排序时，组件的 index 会变但 id 不变
2. Vue 通过 key 判断"是不是同一个组件"，用 index 会导致重新渲染（性能差），用 id 则能复用 DOM

**parentList 和 index 的关系**：
- `parentList` 是引用——告诉子节点"你属于哪个数组"
- `index` 是序号——拖拽时用来计算插入位置
- 两者一起用才能实现"拖入到正确位置"

---

### 第五步：代码执行流程（一口气跟到底）

```
1. 根组件渲染
   → BuilderNode(comp=rootSchema, index=0, parentList=undefined)
   
2. BuilderNode 收到 comp.type='group'
   → <div class="builder-group">
   → v-for="child in comp.list" 首次遍历
   → 创建 BuilderNode(child1, index=0, parentList=comp.list)
   → 创建 BuilderNode(child2, index=1, parentList=comp.list)
   
3. 如果 child2.type='group'
   → child2 的 template 再次进入 v-if="type==='group'" 分支
   → v-for="grandchild in child2.list" … 继续递归
   
4. 直到 component.type 不是 group/grid
   → 进入 v-else 分支
   → <component :is="getElComponent(type)" v-bind="props" />
   → 渲染出真正的 input/select/datepicker 等 Element Plus 组件
```

**回溯过程**：最深层的 BuilderNode 先渲染完成 → 返回父节点继续 → 一直到根节点 → 整个组件树渲染完毕。

---

### 第六步：script setup 编译幕后的工作

```ts
// 你写的（在 <script setup> 中）
const props = defineProps<{ comp: FormComponent }>()
const emit = defineEmits<{ (e: 'select', id: string): void }>()
```

编译器（@vue/compiler-sfc）把这些编译成：

```ts
// 编译产物（简化）
export default {
  props: { comp: { type: Object, required: true } },
  emits: ['select', 'delete', 'dragstart', 'drop'],
  setup(props, { emit }) {
    const handleSelect = (id) => emit('select', id)
    return { handleSelect }
  }
}
```

`defineProps` / `defineEmits` 是**编译宏**——只能在 `<script setup>` 中使用，编译后替换成 Options API 写法。

#### 🧪 动手练习

1. 用 Vue Template Explorer 把一个简单的 BuilderNode 模板贴进去，看编译产物中的 `defineProps` 对应什么
2. 在 BuilderNode.vue 中，思考：如果有一个深层嵌套的组件想和 Root 通信，除了逐层 emit 还有什么办法？（提示：provide/inject）
3. 尝试回答这个面试题：**"递归组件需要注意什么？"**
   - 必须有终止条件（非 group/grid 时走 v-else）
   - 需要 `name` 选项（第 46 行的 `<script lang="ts">export default { name: 'BuilderNode' }</script>`）
   - key 用业务唯一 id 而非 index
   - 注意事件冒泡，必要时用 `.stop`

---

## 🏆 阶段性回顾

现在你应该能回答这些问题了：

| 问题 | 答案关键词 |
|---|---|
| 什么是递归组件？ | 组件在 template 中调用自己 |
| 如何防止无限递归？ | 终止条件（type 不是 group/grid 时走 v-else） |
| parentList 的作用？ | 提供拖入目标数组的引用 |
| 为什么 key 用 id 而非 index？ | index 在排序时会变，导致 DOM 重建 |
| `@click.stop` 的作用？ | 阻止事件冒泡，只选中当前组件 |
| 事件如何冒泡到 Root？ | 每一层 emit 事件，中间层不做处理 |

---

## 📅 Day 4 展望

接下来要学习的是 v-model 的本质——你的 `FormNode.vue` 中 `v-model="formData[comp.field]"` 这行代码，编译器到底做了什么事？

是否继续？
