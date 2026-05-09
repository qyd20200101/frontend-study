# 🎯 Vue 3 实战学习 — 结合 my-sass-project 项目

> 基于你的三步走学习框架，用你的实际代码作为教学案例。
> 每一步都包含：**知识点 → 你的代码实例 → 深度解析 → 动手练习**

---

## 第一步：语法与使用层（本周开始）

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

### 📅 Day 4：v-model 的真相

#### 🔍 看你的真实代码

`FormNode.vue` 中渲染普通组件：

```vue
<component :is="getElComponent(comp.type)"
  v-model="formData[comp.field]"
  v-bind="comp.props"
/>
```

这行代码非常精妙：`v-model="formData[comp.field]"` 等价于：

```vue
<component
  :model-value="formData[comp.field]"
  @update:model-value="val => formData[comp.field] = val"
/>
```

由于 `formData` 是 `reactive/ref`，所以 `formData[comp.field]` 是一个响应式绑定——输入框改了值，`formData` 自动更新。

#### 💡 深度解析

**v-model 的本质**：
- `v-model="x"` = `:modelValue="x"` + `@update:modelValue="x = $event"`
- `v-model:title="x"` = `:title="x"` + `@update:title="x = $event"`

**在你的项目中的体现**：
- 表单设计器中，用户拖入一个 input，配置其 field 为 `username`
- AST 生成器最终生成 `<el-input v-model="formData.username" />`
- 这就是你做的低代码引擎的核心价值——把 JSON 配置转成带 v-model 的 Vue 代码

#### 🧪 动手练习

在 `FormNode.vue` 中，想想如果要在同一个组件上绑定多个 v-model 怎么办？

比如你有一个自定义的 `ProSelect.vue` 组件，它需要两个双向绑定：
```vue
<ProSelect
  v-model:value="formData[comp.field]"
  v-model:options="formData[comp.field + '_options']"
/>
```

---

### 📅 Day 5：Pinia 状态管理实战

#### 🔍 看你的真实代码

`apps/vue-app/src/store/user.ts` 是一个标准的 **Setup Store**：

```ts
export const useUserStore = defineStore('user', () => {
  // 1. state — ref 定义的响应式状态
  const token = ref(localStorage.getItem('token') || '')
  const roles = ref<string[]>([])
  
  // 2. getters — computed 定义的派生值
  const isLogin = computed(() => !!token.value)
  
  // 3. actions — 普通函数（可以是异步）
  const login = async (loginForm: any) => { ... }
  const logout = () => { ... }
  
  return { token, roles, isLogin, login, logout }
})
```

#### 💡 深度解析

**为什么用 Setup Store 而非 Options Store？**

| | Setup Store | Options Store |
|---|---|---|
| 写法 | 像 Composition API | 像 Vuex |
| state | `ref()` / `reactive()` | `state: () => ({})` |
| getters | `computed()` | `getters: {}` |
| actions | 普通函数 | `actions: {}` |
| 组合 | ✅ 可以用其他 composable | ❌ |

**你的项目中还有一个关键细节**：

```ts
persist: {
  key: 'user-storage',
  pick: ['token']     // ← 只持久化 token，不持久化 roles/userInfo
}
```

这很好——敏感的 `roles` 和 `userInfo` 每次登录后重新获取，token 才需要持久化。

#### 🧪 动手练习

在 `store/` 下新建 `formDesigner.ts`，管理表单设计器的状态：

```ts
export const useFormDesignerStore = defineStore('formDesigner', () => {
  const components = ref<FormComponent[]>([])   // 画布上的组件列表
  const activeId = ref<string | null>(null)      // 当前选中组件ID
  
  // getter：选中组件的完整信息
  const activeComponent = computed(() =>
    components.value.find(c => c.id === activeId.value) ?? null
  )
  
  // action：添加组件
  const addComponent = (comp: FormComponent) => { ... }
  const removeComponent = (id: string) => { ... }
  
  return { components, activeId, activeComponent, addComponent, removeComponent }
})
```

---

## 📊 第一周学习进度表

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

## 馃搯 Day 2 杩涢樁锛歝omputed vs watch — 搴曞眰鍏变韩鍚屼竴濂梩rack/trigger

### 馃敡 鎵嬪啓 Mini computed

`computed` = `ref` + `dirty` 缂撳瓨鏍囪锛?
- 搴曞眰鏄竴涓?".value" 鐨?getter
- 澶氫簡 `_dirty` 娣峰瓨锛氳鍙?dirty 寰梩rue 鎵嶉噸鏂拌绠楋紝鍚﹀垯杩斿洖缂撳瓨
- getter 閲岃闂殑 ref 鍙樺寲鏃讹紝鍙槸鎶妉dirty 缃负 true锛屼笉绔嬪嵆璁＄畻

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

### 馃攳 椤圭洰楠岃瘉锛歴Dirty 涓轰粈涔堜笉浼氭棤闄愰噸鏂拌绠?

涓€鍏辫Е鍙?娆♀棊锛?
1. 绗?娆¤ .value 鈫?dirty=true 鈫?鎵ц getter 鈫?json.stringify 姣旇緝 鈫?dirty=false
2. formData 鍙樹簡 鈫?dirty=true锛堜粎鏍囪锛岃繕娌¤绠楋級
3. 鍐嶆璇?.value 鈫?dirty=true 鈫?閲嶆柊璁＄畻
4. formData 娌″彉 鈫?dirty=false 鈫?鐩存帴杩斿洖缂撳瓨锛屼笉鎵цjson.stringify锛?

**鍏抽敭娲炲療**锛歝omputed 鏄?
惉琛屸€?鐨勶紝鍙湪琚鍙栨椂鎵嶅彲鑳介噸鏂拌绠椼€?

### 馃敡 watch — 鎵嬪姩澹版槑渚濊禆鐨?effect

`watch` 鏈川涓婃槸涓€涓猠ffect锛屽彧涓嶈繃锛?
- 涓嶈繑鍥炲€硷紙鍋氬壇浣滅敤锛夛紝computed 杩斿洖鍊?
- 绔嬪嵆鎵ц锛宑omputed 鎳掓墽琛?
- 鎷垮埌鏂版棫鍊硷紝computed 娌℃湁

### 鉂?鑷棶鑷瓟

**Q: 涓轰粈涔坵seForm 涓璼atch 闇€瑕?`deep: true`锛?*

A: 鍥犱负 `() => formData.value` 杩斿洖鐨勬槸涓€涓璞″紩鐢ㄣ€傚彧鏈夊綋 `formData.value` 鏁翠綋鏇挎崲锛堝 `= null`锛夋椂锛岃繖涓?getter 鎵嶄細杩斿洖涓嶅悓鐨勫€笺€備綘鏀瑰彉 `formData.value.name` 涓嶄細瑙﹀彂 getter 鐨勫彉鍖栵紝`deep: true` 鍛婅瘔 watch 瑕侀€掑綊杩借釜瀵硅薄鍐呴儴鎵€鏈夊睘鎬с€?

**Q: 杩欓噷鑳界敤 watchEffect 鏇夸唬鍚楋紵**

A: 鑳姐€?watchEffect 鑷姩鏀堕泦渚濊禆锛屼笉闇€瑕乨eep锛?
```ts
watchEffect(() => {
  if (formData.value) {
    localStorage.setItem('form_draft', JSON.stringify(formData.value))
  }
})
```
浣嗕綘鎷夸笉鍒版棫鍊硷紝鑰屼笖鏃犳硶鎸囧畾 `immediate: false` 杩欑被鎺у埗銆?

### 馃敩 select 瀵规瘮鍗?

|  | computed | watch | watchEffect |
|---|---|---|---|
| 杩斿洖鍊?| 鉁?| 鉂?| 鉂?|
| 鏃у€?| 鉂?| 鉁?newVal, oldVal | 鉂?|
| 鎵ц鏃舵満 | 鎳掓墽琛?| 渚濊禆鍙樺氨鎵ц | 渚濊禆鍙樺氨鎵ц |
| 缂撳瓨 | 鉁?dirty | 鉂?| 鉂?|
| 渚濊禆澹版槑 | 鑷姩鏀堕泦 | 鎵嬪姩getter | 鑷姪鏀堕泦 |
| 鍓綔鐢?| 鉂?| 鉁?| 鉁?|
| 鍏稿瀷鍦烘櫙 | `isLogin`/`isDirty` | 鑽夌ǹ淇濆瓨/URL鍚屾 | 璋冭瘯鏃ュ織/DOM鎿嶄綔 |

---


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
