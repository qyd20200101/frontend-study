<script setup lang="ts">

/*
处理从后端获取的列表数据使用ref,优势：
1.重新赋值的灵活性,reactive定义的响应式对象不能直接被重新赋值，会丢失响应性
后端返回全新数组，必须用splice或push修改原数组，ref只需要rawdata.value = newArray
2.心智模型统一，统一使用ref减少编写.value的成本，让代码风格一致
3.类型追踪,ref在ts的类型推导清晰，结合接口定义，完美规避异步赋值地类型错误
*/
import { ref, computed, onMounted, onUnmounted } from "vue";
import { mySum } from '../utils/engine';
import BaseModal from "./BaseModal.vue";
import TreeItem, { type TreeNode } from "./TreeItem.vue";
import request from "../utils/request";
import AssetChart from "./AssetChart.vue";
import ProSelect from "./ProSelect.vue";


/*
提升点：
1.方法名一致性：通过Hooks导出的openForm，让模板意图明确，
避免之前onEdit函数名混用
2.响应式闭环联络：将搜索框绑定到useTable内部的searchParms上
将搜索逻辑，防抖策略完全封装在hooj内部，组件只要声明绑定就行
3.TS类型契约：project属性缺少，警告不要用不完整的数据去初始化表单
让整个流程的数据都是强类型
4.防御性编程：修正isLoadingTree的初始化，和BaseModal插槽位置,维持UI复用
*/
//引入Hooks
import { useTable } from "../hooks/useTable";
import { useForm } from "../hooks/useForm";
//引入API
import { getProjectsApi, updateProjectApi } from "../api/project";
import AuthButton from "./AuthButton.vue";

// 数据定义(模拟项目数据)
interface Project {
    id: number | number;
    name: string;
    budget: number; //预算
    status: 'active' | 'archived';
    category: string;
}
interface DashboardStatus {
    totalProjects: number;
    activeBudget: number;
}
interface AssetStatistics {
    totalBudget: number;
    activeCount: number;
    categoryMap: Record<string, number>;
}
// 表格逻辑：处理加载、搜索、列表展示
const {
    list: displayData,
    loading: isLoading,
    searchParams,
    handleSearch,
    loadData: refreshtable
} = useTable(getProjectsApi, { defaultParams: { name: '' } });

// 表单逻辑：处理编辑、深拷贝回滚、异步加载
const {
    formData: editingItem,
    isSaving,
    openForm,
    submitForm,
    closeForm
} = useForm<Project>(updateProjectApi);

//辅助业务数据（如统计和树形）
const stats = ref<DashboardStatus | null>(null);
const treeData = ref<TreeNode[]>([]);
const isLoadingTree = ref(false);
const errorMessages = ref('');
const initExtraData = async () => {
    try {
        const [statsRes, deptRes] = await Promise.all([
            request<DashboardStatus>({ url: '/status' }),
            request<TreeNode[]>({ url: '/departments' })
        ]);
        stats.value = statsRes;
        treeData.value = arrToTree(deptRes);
    } catch (e) {
        errorMessages.value = '额外数据加载失败，请检查后端服务';
        console.error('额外数据加载失败');
    }
};

//业务计算
const assetStats = computed<AssetStatistics>(() => {
    //初始化对象，并显式断言类型
    const initialValue: AssetStatistics = {
        totalBudget: 0,
        activeCount: 0,
        categoryMap: {}
    };

    return (displayData.value || []).reduce((acc, item) => {
        //累加总预算（资产价值）
        acc.totalBudget += (item.budget || 0);

        //统计状态
        if (item.status === 'active') {
            acc.activeCount++;
        }
        //统计分类频率；解决动态索引问题
        const cat = item.category || '未分类';
        acc.categoryMap[cat] = (acc.categoryMap[cat] || 0) + 1;

        return acc;
    }, initialValue);
})
//绑定搜索框
const searchKeyword = ref('')

const filteredTableData = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase();
    if (!keyword) return displayData.value || [];

    return (displayData.value || []).filter(item => {
        return (
            item.name.toLowerCase().includes(keyword) ||
            (item.category && item.category.toLowerCase().includes(keyword))
        );
    });
});
/*.核心算法:扁平转树形
为什么要前端自己转化数据：
1.数据库友好:数据库存储白牛皮数据,如果再后端查询无限层级的树，
需要复杂的递归查询或存储过程，对数据库性能消耗很大
2.数据灵活性：前端拿到扁平数据，可以根据需求灵活处理，不同场景展现
3.计算下移：vue3配合优化客户端性能，处理几千条数据的树形转化只需要几毫秒，
将计算压力从服务器下移到客户端，是高并发架构中场景的优化策略
4.封装的arrToTree使用map映射，时间复杂度o(n)
*/
//树转化算法
const arrToTree = (items: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];
    const itemMap: Record<number, TreeNode> = {};

    for (const item of items) {
        itemMap[item.id] = { ...item, children: [] };
    }

    for (const item of items) {
        const id = item.id;
        const pid = item.pid;
        const treeItem = itemMap[id];

        if (pid === 0) {
            result.push(treeItem);
        } else {
            if (itemMap[pid]) {
                itemMap[pid].children?.push(treeItem);
            }
        }
    }
    return result;
}
//将原始数据转化为图标需要的格式
const chartData = computed(() => {
    return (displayData.value || []).map(item => ({
        name: item.name,
        value: item.budget
    }));
});

//保存操作的回调
const handleSave = () => {
    submitForm(() => {
        alert('保存成功');
        refreshtable();
    })
}
const handleAdd = () => {
    openForm({
        name: '',
        budget: 0,
        status: 'active',
        category: 'IoT'
    } as Project);
}
//模拟实时数据轮询
let timer: number;
onMounted(() => {
    initExtraData();
    timer = window.setInterval(() => {
        //模拟数据微笑波动，观察图标动画
        if (!displayData.value) return;
        displayData.value = displayData.value.map(item => ({
            ...item,
            budget: item.budget + (Math.random() > .5 ? 1000 : -1000),
        }));
    }, 5000);
});
onUnmounted(() => clearInterval(timer)); 
</script>
<template>
    <div class="manager-container">
        <!-- 错误提示 -->
        <!-- <div v-if="errorMessages" class="error-banner">{{ errorMessages }}</div> -->
        <div class="header">
            <h2>资产管理面板</h2>
            <div class="header-actions">
                <div class="search-wrapper">
                    <el-input v-model="searchKeyword" placeholder="输入名称或分类即时过滤" class="compact-search" clearable />
                    <div v-if="isLoading" class="loading-tag">同步中...</div>
                </div>
                <AuthButton role="admin" type="success" icon="Plus" @click="handleAdd">
                    新增资产
                </AuthButton>
                <div class="status">
                    <span class="status-item">进行中：<strong>{{ assetStats.activeCount }}</strong></span>
                    <span class="status-divider">|</span>
                    <span class="status-item">
                        总预算
                        <span class="price">
                            ￥{{ assetStats.totalBudget.toLocaleString() }}元
                        </span>
                    </span>
                </div>
            </div>
        </div>
        <!-- 数据表格 -->
        <AssetChart title="实时资产预算分布" :data="chartData"></AssetChart>
        <el-table :data="filteredTableData" class="data-table" v-loading="isLoading" style="width: 100%;">
            <el-table-column prop="name" label="项目名称" min-width="180" />
            <el-table-column prop="category" label="分类" width="120">
                <template #default="{ row }">
                    <el-tag>{{ row.category }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="budget" label="预算（元）" width="150">
                <template #default="{ row }">
                    {{ row.budget.toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
                <template #default="{ row }">
                    <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                        {{ row.status === 'active' ? '进行中' : '已归档' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                    <el-button link type="primary" @click="openForm(row)">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 编辑模态框(展示深拷贝应用) -->
        <BaseModal :model-value="!!editingItem" title="修改项目信息" @confirm="handleSave" @update:model-value="closeForm">
            <div v-if="editingItem" class="edit-form">
                <div class="form-item">
                    <label>项目名称：</label>
                    <input v-model="editingItem.name" />
                </div>
                <div class="form-item">
                    <label>项目分类</label>
                    <ProSelect v-model="editingItem.category" dictCode="project_category" />
                </div>
                <div class="form-item">
                    <label>预算(元)：</label>
                    <input v-model.number="editingItem.budget" type="number">
                </div>
                <div class="form-item">
                    <label>项目状态</label>
                    <ProSelect v-model="editingItem.status" dictCode="project_status" />
                </div>
                <p v-if="isSaving" class="saving-tip">正在同步到后端</p>
            </div>
        </BaseModal>
        <!-- 组织架构面板 -->
        <div class="tree-panel">
            <h3>集团组织架构</h3>
            <div v-if="isLoadingTree">加载架构中...</div>
            <div v-else class="tree-root">
                <TreeItem v-for="root in treeData" :key="root.id" :node="root"
                    @node-click="(node) => console.log('点击了：', node.name)" />
            </div>
        </div>
    </div>

</template>
<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    margin-bottom: 10px; /* 紧凑布局，减少与下方图表的间距 */
    border-bottom: 1px solid #f0f2f5;
}

/* 右侧动作组：所有元素一行排开 */
.header-actions {
    display: flex;
    align-items: center;
    gap: 16px; /* 统一所有元素间的间距 */
}

/* 紧凑型搜索框样式 */
.search-wrapper {
    width: 220px; /* 固定宽度，不再挤压其他元素 */
}

/* 深度修改 Element 输入框样式，让它更精致 */
:deep(.compact-search .el-input__wrapper) {
    border-radius: 20px;
    background-color: #f5f7fa;
    box-shadow: none !important;
    border: 1px solid #dcdfe6;
}

:deep(.compact-search .el-input__wrapper.is-focus) {
    border-color: #409eff;
    background-color: #fff;
}

/* 统计数据微调 */
.status {
    font-size: 13px;
    color: #666;
    display: flex;
    align-items: center;
    white-space: nowrap; /* 防止统计数据换行 */
}

.status .price {
    color: #f56c6c;
    font-weight: 600;
    margin-left: 4px;
}

.status-divider {
    margin: 0 10px;
    color: #e8e8e8;
}
.error-banner {
    background: #fff2f0;
    color: #ff4d4f;
    padding: 10px;
    border: 1px solid #ffccc7;
    margin-bottom: 10px;
    border-radius: 4px;
}

.edit-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.form-item input {
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 70%;
}

.saving-tip {
    font-size: 12px;
    color: #1890ff;
    text-align: right;
}

.tree-panel {
    margin-top: 30px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* src/components/DataManager.vue 的 style 部分 */

.tree-panel {
    margin-top: 30px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);


    max-height: 500px;
    /* 设置最大高度，防止无限拉长 */
    overflow-y: auto;
    /* 纵向超出时显示滚动条 */
    overflow-x: hidden;
    /* 隐藏横向滚动，除非名字真的特别长 */
}


.tree-panel::-webkit-scrollbar {
    width: 6px;
}

.tree-panel::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
}

.btn-edit {
    color: #1890ff;
    border: none;
    background: none;
    cursor: pointer;
}
</style>