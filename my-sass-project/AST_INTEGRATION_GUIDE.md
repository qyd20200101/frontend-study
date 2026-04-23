# 低代码表单 AST 生成器集成指南

## 快速开始

### Step 1: 使用新的生成器替换旧代码

在 `src/views/lowcode/FormConsumer.vue` 中，找到 `generateTemplateCode` 函数并替换：

**之前（字符串拼接方式）：**
```typescript
const generateTemplateCode = () => {
    if (!schema.value) return;

    const { labelWidth, components } = schema.value;

    // 生成完整的 Vue 组件代码
    let code = `<template>
  <div class="form-wrapper">
    <el-form 
      ref="formRef" 
      ...
    >
    ...
    </el-form>
  </div>
</template>
...`;

    generatedCode.value = code;
    showCodeDialog.value = true;
};
```

**之后（AST 方式）：**
```typescript
import { SimpleASTGenerator } from '@/utils/simpleAstGenerator';

const generateTemplateCode = () => {
    if (!schema.value) return;

    try {
        // 使用 AST 生成器生成代码
        const generatedCode = SimpleASTGenerator.generateComponent(schema.value.components);
        
        // 验证生成的代码
        const validation = SimpleASTGenerator.validateGeneratedCode(generatedCode);
        
        if (validation.valid) {
            generatedCode.value = generatedCode;
            showCodeDialog.value = true;
            ElMessage.success('代码生成成功');
        } else {
            ElMessage.error(`代码生成失败: ${validation.errors.join(', ')}`);
        }
    } catch (error) {
        ElMessage.error('代码生成出错: ' + (error as Error).message);
    }
};
```

### Step 2: 验证集成效果

1. **启动开发服务器**
```bash
npm run dev
```

2. **访问表单消费端**
```
http://localhost:5173/form-consumer
```

3. **点击"生成模板代码"按钮**
   - 应该看到生成的代码弹窗
   - 代码格式应该更清晰
   - 如果有错误，会显示错误消息

### Step 3: 测试用例

#### 用例 1: 基础表单
```typescript
const components = [
  {
    id: '1',
    type: 'input',
    label: '用户名',
    field: 'username',
    required: true,
    props: { placeholder: '请输入用户名' }
  }
];
```

预期结果：生成的代码应该包含 `v-model="formData.username"` 和相应的验证规则。

#### 用例 2: 复杂表单
```typescript
const components = [
  { id: '1', type: 'input', label: '姓名', field: 'name', required: true, props: {} },
  { id: '2', type: 'select', label: '部门', field: 'dept', required: true, props: {} },
  { id: '3', type: 'date', label: '入职日期', field: 'joinDate', required: false, props: {} },
  { id: '4', type: 'checkbox', label: '技能', field: 'skills', required: false, props: {} }
];
```

预期结果：
- 生成的代码应该包含所有字段
- `select/radio/checkbox` 应该包含 `:options` 属性
- 日期字段应该有 `type="date"` 属性

## 核心特性对比

### 旧方案 vs 新方案

| 特性 | 旧方案 | 新方案 |
|------|-------|-------|
| **实现方式** | 字符串拼接 | AST 生成 |
| **代码验证** | ❌ 无 | ✅ 有基础验证 |
| **代码格式化** | ❌ 手动处理 | ✅ 自动格式化 |
| **扩展性** | ❌ 差 | ✅ 好 |
| **维护难度** | ❌ 高 | ✅ 低 |
| **首屏加载** | ✅ 快 | ⚠️ 稍慢（因为多了验证） |
| **生成代码质量** | ⚠️ 一般 | ✅ 高 |

## 性能优化建议

### 1. 缓存生成结果

```typescript
const generatedCodeCache = new Map<string, string>();

const generateTemplateCode = () => {
    if (!schema.value) return;
    
    // 生成缓存 key
    const cacheKey = JSON.stringify(schema.value.components);
    
    // 检查缓存
    if (generatedCodeCache.has(cacheKey)) {
        generatedCode.value = generatedCodeCache.get(cacheKey)!;
        showCodeDialog.value = true;
        return;
    }
    
    // 生成新代码
    const newCode = SimpleASTGenerator.generateComponent(schema.value.components);
    generatedCodeCache.set(cacheKey, newCode);
    
    generatedCode.value = newCode;
    showCodeDialog.value = true;
};
```

### 2. 异步生成

对于大规模表单，可以使用异步生成以避免阻塞 UI：

```typescript
const generateTemplateCode = async () => {
    if (!schema.value) return;
    
    try {
        loading.value = true;
        
        // 在下一个事件循环中生成代码，避免阻塞 UI
        const code = await new Promise<string>((resolve) => {
            setTimeout(() => {
                const result = SimpleASTGenerator.generateComponent(schema.value!.components);
                resolve(result);
            }, 0);
        });
        
        generatedCode.value = code;
        showCodeDialog.value = true;
    } finally {
        loading.value = false;
    }
};
```

## 故障排查

### 问题 1: 代码生成报错

**症状**: 点击生成按钮后显示错误消息

**解决方案**:
1. 检查浏览器控制台错误
2. 查看 FormComponent 数据是否完整
3. 确保所有必需字段都已填写

### 问题 2: 生成代码格式不对

**症状**: 代码缩进或格式不正确

**解决方案**:
1. 确保已安装 `prettier` 包
2. 调整 `SimpleASTGenerator.generateComponent()` 中的缩进逻辑
3. 检查是否有特殊字符导致格式错误

### 问题 3: 生成代码中的特殊字符显示错误

**症状**: 中文或特殊字符显示为乱码

**解决方案**:
- 代码中已经有 `escapeString()` 函数处理转义
- 确保文件编码为 UTF-8

## 扩展方案

### 添加自定义验证规则生成

```typescript
// 在 SimpleASTGenerator 中添加
static generateCustomValidation(components: FormComponent[]): string {
    let validationCode = 'const customRules = {\n';
    
    components.forEach(comp => {
        if (comp.props?.customValidator) {
            validationCode += `  ${comp.field}: (rule, value, callback) => {
    // 自定义验证逻辑
    if (someCondition) {
      callback(new Error('验证失败'));
    } else {
      callback();
    }
  },\n`;
        }
    });
    
    validationCode += '};\n';
    return validationCode;
}
```

### 添加字段联动支持

```typescript
// 生成字段监听代码
static generateFieldWatchers(relationships: FieldRelationship[]): string {
    let watchers = '';
    
    relationships.forEach(rel => {
        watchers += `
watch(() => formData.${rel.source}, (newVal) => {
  // 当 ${rel.source} 变化时执行的逻辑
  formData.${rel.target} = computeValue(newVal);
});`;
    });
    
    return watchers;
}
```

## 版本迁移检查清单

- [ ] 新建 `simpleAstGenerator.ts` 文件
- [ ] 在 `FormConsumer.vue` 中导入新生成器
- [ ] 替换 `generateTemplateCode` 函数
- [ ] 测试基础表单生成
- [ ] 测试复杂表单生成
- [ ] 测试代码验证功能
- [ ] 性能测试（生成速度）
- [ ] 用户反馈和迭代

## 下一步工作

1. **收集反馈** - 让用户使用新生成器，收集意见
2. **性能优化** - 如果有性能问题，实施缓存和异步方案
3. **完全迁移** - 删除旧的字符串拼接代码
4. **增强功能** - 实现自定义验证、字段联动等高级功能
5. **文档更新** - 更新用户文档和开发指南

---

**预计改进**: 代码质量 +50%，维护成本 -40%  
**适配周期**: 1-2 天（开发和测试）
