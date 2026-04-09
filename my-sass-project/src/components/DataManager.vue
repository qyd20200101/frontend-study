<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import { debounce, deepClone, mySum } from '../utils/engine';

// 1.数据定义(模拟项目数据)
interface Project {
    id: number;
    name: string;
    budget: number; //预算
    status: 'active' | 'archived';
    category: string;
}

const rawData = reactive<Project[]>([
    { id: 1, name: '西安高新区智慧路灯项目', budget: 1200000, status: 'active', category: 'IoT' },
    { id: 2, name: '软新园区物业管理系统', budget: 450000, status: 'active', category: 'Software' },
    { id: 3, name: '秦岭生态监测大屏', budget: 800000, status: 'archived', category: 'Visual' },
]);

const isLoading = ref(false);
const searchQuery = ref('');
const displayData = ref<Project[]>([]);
const editingItem = ref<Project | null>(null);

// 2.核心业务逻辑(computed)
//使用我们手写的mySum逻辑计算总预算
const totalBudget = computed(() => mySum(displayData.value, 'budget'));

// 3.搜索功能(防抖+模拟API)
const handleSearch = debounce(() => {
    isLoading.value = true;
    // 模拟API请求延迟
    setTimeout(() => {
        displayData.value = rawData.filter(p =>
            p.name.includes(searchQuery.value) || p.category.includes(searchQuery.value)
        );
        isLoading.value = false;
    }, 500);
}, 400);

// 监听搜索词变化
watch(searchQuery, () => handleSearch());

// 4.编辑与深拷贝(数据安全)
const startEdit = (item: Project) => {
    // 关键点:使用深拷贝,编辑时不会影响原表格数据
    editingItem.value = deepClone(item);
};

const cancelEdit = () => {
    editingItem.value = null;//直接丢弃副本,原数据保持不变
};

const saveEdit = () => {
    if (!editingItem.value) return;
    const index = rawData.findIndex(p => p.id === editingItem.value?.id);
    if (index !== -1) {
        rawData[index] = editingItem.value; //保存修改
        handleSearch();//刷新视图
    }
    editingItem.value = null;
};

onMounted(() => handleSearch());
</script>
<template>
    <div class="manager-container">
        <div class="header">
            <h2>资产管理面板</h2>
            <div class="status">
                当前筛选项目总预算:
                <span class="price">
                    ￥{{ totalBudget.toLocaleString() }}元
                </span>
            </div>
        </div>

        <!-- 搜索栏 -->
        <div class="toolbar">
            <input v-model="searchQuery" placeholder="搜索项目名称或分类" class="search-input" />
            <div v-if="isLoading" class="loading-tag">同步中...</div>
        </div>

        <!-- 数据表格 -->
        <table class="data-table">
            <thead>
                <tr>
                    <th>项目名称</th>
                    <th>分类</th>
                    <th>预算(元)</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in displayData" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td><span class="tag">{{ item.category }}</span></td>
                    <td>{{ item.budget.toLocaleString() }}</td>
                    <td>
                        <span :class="['status-dot', item.status]"></span>
                        {{ item.status === 'active' ? '进行中' : '已归档' }}
                    </td>
                    <td>
                        <button @click="startEdit(item)">编辑</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- 编辑模态框(展示深拷贝应用) -->
        <div v-if="editingItem" class="modal">
            <div class="modal-content">
                <h3>修改项目信息</h3>
                <label>项目名称</label>
                <input v-model="editingItem.name" />
                <label>预算</label>
                <input v-model.number="editingItem.budget" type="number" />
                <div class="modal-btns">
                    <button @click="saveEdit" class="btn-save">保存</button>
                    <button @click="cancelEdit" class="btn-cancel">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.manager-container {
    padding: 24px;
    font-family: sans-serif;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.price {
    color: #f5222d;
    font-weight: bold;
    font-size: 1.4em;
}

.search-input {
    padding: 8px 12px;
    width: 300px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
}

.data-table th,
.data-table td {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px;
    text-align: left;
}

.tag {
    background: #e6f7ff;
    color: #1890ff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
}

.status-dot.active {
    background: #52c41a;
}

.status-dot.archived {
    background: #bfbfbf;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.btn-edit {
    color: #1890ff;
    border: none;
    background: none;
    cursor: pointer;
}

.btn-save {
    background: #1890ff;
    color: #fff;
    border: none;
    padding: 8px;
    border-radius: 4px;
}
</style>