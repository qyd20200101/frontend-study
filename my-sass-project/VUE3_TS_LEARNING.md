# 🎯 TypeScript 串讲 — 用你的项目代码学 TS

> 每一节都是：**你的真实代码 → 拆解语法 → 底层原理 → 动手改写**

---

## TS 串讲 1：基础类型 + 泛型入门

### 教材：useForm.ts 中的 `<T>`

```ts
// apps/vue-app/src/hooks/useForm.ts
export function useForm<T>(submitApi: (data: T) => Promise<any>) {
  const formData = ref<T | null>(null)
  const originalSnapshot = ref<T | null>(null)
}
```

#### 🔍 逐行拆解

| 语法 | 含义 | 你的代码实例 |
|---|---|---|
| `<T>` | **泛型参数** — "我不关心具体是什么类型，谁调我谁告诉我" | `useForm<UserInfo>` → T = UserInfo |
| `T \| null` | **联合类型** — "可以是 T，也可以是 null" | `ref<T \| null>(null)` |
| `(data: T) => Promise<any>` | **函数类型签名** — 参数是 T，返回一个 Promise | `submitApi` 的类型 |

#### 💡 泛型为什么出现在这里？

你的表单 hook 不知道未来会被什么页面调用：

```ts
// 用户管理页面调用
const { formData } = useForm<UserInfo>(updateUserApi)
// formData.value.username ← 有智能提示！

// 项目管理页面调用
const { formData } = useForm<ProjectInfo>(updateProjectApi)
// formData.value.projectName ← 也有智能提示！
```

泛型 `<T>` 就像一个**类型占位符**——调用时填什么，里面的 ref、computed 就自动推导出什么类型。

#### 🧪 动手练习

打开 `apps/vue-app/src/hooks/useForm.ts`，找出所有用到 `T` 的地方，用不同颜色标注，然后回答：

1. `formData` 的类型是什么？（答：`Ref<T | null>`）
2. `submitApi` 的参数类型是什么？（答：`T`）
3. 如果不用泛型，写成 `useForm(submitApi: (data: any) => Promise<any>)`，会失去什么？（答：失去所有类型提示，`formData.value` 变成 `any`）

---

## TS 串讲 2：泛型约束 `extends`

### 教材：useTable.ts 中的 `<T, P extends BasePageParams>`

```ts
// apps/vue-app/src/hooks/useTable.ts
interface BasePageParams {
  page: number
  pageSize: number
}

export function useTable<T, P extends BasePageParams>(
  apiFunc: (params: P) => Promise<{ list: T[]; total: number }>
) {
  // ...
  const params = {
    page: pagination.value.page,    // ✅ P 一定有 page
    pageSize: pagination.value.pageSize, // ✅ P 一定有 pageSize
    ...queryParams                  // 把扩展的查询条件合并进来
  } as P
}
```

#### 🔍 逐行拆解

| 语法 | 含义 |
|---|---|
| `P extends BasePageParams` | **泛型约束** — "P 必须至少包含 page 和 pageSize，可以更多但不准少" |
| `{ list: T[]; total: number }` | 返回值类型 — "后端必须返回 list 数组和 total 总数" |
| `...queryParams` | 展开运算符 — 把额外查询条件（如 keyword、status）合并进去 |

#### 💡 为什么要约束 P？

如果写成 `<T, P>` 不约束：
```ts
const params = { page: 1, pageSize: 50 } as P  // ❌ 编译器不知道 P 有没有 page
```

加了 `extends BasePageParams`：
```ts
const params = { page: 1, pageSize: 50 } as P  // ✅ 编译器知道 P 一定有 page 和 pageSize
```

这是你项目里**最有价值的 TS 模式**——用泛型约束保证"最小必需的字段一定有，额外字段全接收"。

#### 🧪 动手练习

在 `useTable.ts` 中，试着把 `P extends BasePageParams` 改成 `P`（去掉约束），看哪里报错。然后恢复。

---

## TS 串讲 3：interface vs type — 什么时候用哪个？

### 教材：types/lowcode.ts 中的接口设计

```ts
// apps/vue-app/src/types/lowcode.ts
export type ComponentType = 
  | 'input' | 'textarea' | 'number' | 'select' 
  | 'radio' | 'checkbox' | 'switch' | 'date' | 'time'
  | 'group' | 'grid'

export interface FormComponent {
  id: string
  type: ComponentType
  label: string
  field: string
  required: boolean
  props: Record<string, any>
  columns?: { span: number; list: FormComponent[] }[]  // ← 递归引用！
  list?: FormComponent[]                                // ← 自身引用！
}
```

#### 🔍 关键差异

| | `type` | `interface` |
|---|---|---|
| 联合类型 | ✅ `type A = 'a' \| 'b'` | ❌ |
| 自身引用 | ✅ `type Node = { children: Node[] }` | ✅ `interface Node { children: Node[] }` |
| 合并声明 | ❌ | ✅ 同名 interface 自动合并 |
| 扩展 | `&` 交叉类型 | `extends` |
| 使用场景 | 联合类型、映射类型、工具类型 | 对象结构定义 |

#### 💡 你的项目用对了吗？

- `ComponentType` 用 `type` ✅ — 这是联合类型，interface 做不到
- `FormComponent` 用 `interface` ✅ — 这是一个对象结构描述，而且需要递归引用自身
- 注意 `list?: FormComponent[]` — **这就是递归类型**，允许组件无限嵌套！

#### 🧪 动手练习

1. 在 `FormComponent` 中加一个 `children?: FormComponent[]` 字段（interface 可以引用自己）
2. 尝试用 `type` 写一个等价的（你会看到 type 也可以递归引用，两者在这里基本等价）
3. 思考：为什么 `columns` 的 `list` 也是 `FormComponent[]`？（答：栅格的每一列里也可以放任何组件，包括嵌套分组和栅格——无限布局）

---

## TS 串讲 4：工具类型 — 不写重复代码

### 教材：api/user.ts 中的 `Partial<SystemUser>`

```ts
// apps/vue-app/src/api/user.ts
export interface SystemUser {
  id?: string | number
  username: string
  role: "admin" | "editor" | "viewer"
  roles: string[]
  status: string
}

// 新增用户时，id 不传（后端自增），部分字段可选
export const addUserApi = (data: Partial<SystemUser>) =>
  request({ url: "/users", method: "post", data })
```

#### 🔍 原理解析

`Partial<SystemUser>` 等价于：

```ts
{
  id?: string | number
  username?: string
  role?: "admin" | "editor" | "viewer"
  roles?: string[]
  status?: string
}
// 所有字段都变成了可选
```

不需要重新声明一个 `CreateUserParams` 接口——`Partial` 自动帮你生成。

#### 💡 你的项目中还有哪里可以用工具类型？

```ts
// useTable.ts 中的 queryParams
const loadData = async (queryParams?: Partial<P>) => { ... }
// 查询参数通常不需要传完整的分页参数——Partial 让所有字段可选
```

#### 🔧 常用工具类型速查

| 工具类型 | 作用 | 你的项目实例 |
|---|---|---|
| `Partial<T>` | 全部变可选 | `Partial<SystemUser>`（新增用户） |
| `Required<T>` | 全部变必填 | 如果你想强制某些字段必须有 |
| `Pick<T, K>` | 只要某几个字段 | `Pick<SystemUser, 'id' \| 'status'>` |
| `Omit<T, K>` | 排除某几个字段 | `Omit<SystemUser, 'password'>` 返回给前端时排除敏感字段 |
| `Record<K, V>` | key→value 映射 | `Record<string, FormComponent>` |
| `ReturnType<F>` | 获取函数返回值类型 | `ReturnType<typeof useForm>` |

#### 🧪 动手练习

在 `api/user.ts` 中，新增一个 `updateUserStatusApi`，只需要传 `id` 和 `status`：

```ts
// 用 Pick 只要 id 和 status
export const updateUserStatusApi = (data: Pick<SystemUser, 'id' | 'status'>) =>
  request({ url: "/users/status", method: "patch", data })
```

---

## TS 串讲 5：枚举与字面量联合类型

### 教材：api/user.ts 中的 role 字段

```ts
// 你的项目中这样写：
role: "string" | "editor" | "viewer"
```

注意：你写的是 `"string"` 而不是 `"admin"`——这很可能是个 bug！让我帮你修正：

<修正建议 ↓>

```ts
export interface SystemUser {
  id?: string | number
  username: string
  role: 'admin' | 'editor' | 'viewer'  // ← 改这里
  roles: string[]
  status: string
}
```

#### 💡 字面量联合 vs enum

```ts
// 方式一：字面量联合（推荐）
type Role = 'admin' | 'editor' | 'viewer'

// 方式二：const 断言（你的项目也适合）
const ROLES = ['admin', 'editor', 'viewer'] as const
type Role = (typeof ROLES)[number]  // 'admin' | 'editor' | 'viewer'
```

**为什么不用 enum？** TypeScript 的 enum 编译后会生成额外的 JS 代码，字面量联合类型编译后完全消失，零运行时开销。

---

## TS 串讲 6：实战 — 给你的 useForm 增强类型安全

### 当前代码的问题

```ts
export function useForm<T>(submitApi: (data: T) => Promise<any>) {
  const formData = ref<T | null>(null)
  // ...
  const submitForm = async (successCallback?: () => void) => {
    await submitApi(formData.value)  // ❌ formData.value 可能是 null！
  }
}
```

`submitForm` 中的 `if (!formData.value)` 检查虽然防止了运行时错误，但 TS 不知道你已经检查过了。

### 改进方案

```ts
const submitForm = async (successCallback?: () => void) => {
  if (!formData.value || isSaving.value) return
  // 从这里开始，TypeScript 知道 formData.value 一定是 T（非 null）
  // 这就是"类型收窄"（Type Narrowing）
  await submitApi(formData.value)
}
```

**这行代码已经做到了**——`if (!formData.value) return` 就是类型收窄，TS 自动推断后续代码中 `formData.value` 是 `T` 而不是 `T | null`。

#### 🧪 动手练习

在 `useForm.ts` 中，观察 VS Code 的类型提示：
1. 在 `submitForm` 的 `if (!formData.value)` 之前，悬停在 `formData.value` 上 → 显示 `T | null`
2. 在 return 之后，再悬停 → 显示 `T`（已收窄）

---

## 知识点串联：你的 TS 技能树

```
TS 基础（你已接触）
├── 基础类型: string, number, boolean, null
├── 联合类型: T | null, 'admin' | 'editor' | 'viewer'
├── 泛型: <T>, <T, P>
├── 泛型约束: P extends BasePageParams
├── 接口: interface FormComponent { ... }
├── 类型别名: type ComponentType = ...
├── 可选属性: id?: string
├── 递归类型: list?: FormComponent[]
│
TS 工具类型（你已接触）
├── Partial<T>
├── Pick<T, K>
│
TS 进阶（下一步）
├── 泛型工具类型: ReturnType<F>
├── 条件类型: T extends U ? X : Y
├── 映射类型: { [K in keyof T]: ... }
└── 模板字面量类型: `on${Capitalize<string>}`
```

---

## 荳?鏍稿績鎬荤粨

> **TS 学不好的人有一个共同特点：把 TS 当新语言学，背了一堆语法但是写项目时不会用。**
>
> **正确姿势：每学一个 TS 概念，一定在你的项目代码里找到对应实例。泛型 → useForm，联合类型 → FormComponent，工具类型 → Partial<SystemUser>。**
>
> **TS 不是负担，是你读完源码后不会一脸蒙蔽的保障。**