<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
    Download,  Menu,
    Sort, 
} from "@element-plus/icons-vue";

// 1. 导入公共类型
import type { Project, AssetStatus } from "../types/asset";
import type { AssetLog } from "../types/asset";

// 2. 导入自定义 Hooks
import { useAssetBusiness } from "../hooks/useAssetBusiness";
import { useTable } from "../hooks/useTable";
import { useForm } from "../hooks/useForm";

// 3. 导入业务 API 与工具
import { getProjectsApi, updateProjectApi } from "../api/project";
import request from "../utils/request";
import { debounce } from "../utils/engine";

// 4. 导入 UI 组件
import BaseModal from "./BaseModal.vue";
import TreeItem, { type TreeNode } from "./TreeItem.vue";
import AssetChart from "./AssetChart.vue";
import VirtualTable from "./VirtualTable.vue";
import ProSelect from "./ProSelect.vue";

/**
 * 状态定义与初始化
 */
const { list: apiData, loading: isLoading, loadData: refreshtable } = useTable(getProjectsApi);
const { formData: editingItem, isDirty, openForm, submitForm, closeForm } = useForm<Project>(updateProjectApi);

// 核心原始数据源
const displayData = ref<Project[]>([]);
const isGenerating = ref(false);
const treeData = ref<TreeNode[]>([]);

// 【架构重构】：引入领域逻辑 Hook，接管所有计算任务
const {
    selectedCategory,
    selectedDeptId,
    searchQuery,
    sortConfig,
    finalData,
    summaryInfo,
    chartSummaryData,
    resetFilters
} = useAssetBusiness(displayData);

// 批量勾选状态 (Set 保证海量数据下的查找性能)
const selectedIds = ref(new Set<number>());
//定义一个用于UI绑定的临时变量
const searchInput = ref("");

/**
 * 业务逻辑方法
 */

// 1. 状态流转控制器 (State Machine)
const transitionStatus = (row: Project, nextStatus: AssetStatus) => {
    const actionMap: Record<AssetStatus, string> = {
        active: '恢复运行',
        repair: '发起报修',
        archived: '执行归档',
        pending: '入库',
        scrapped: '报废'
    };

    ElMessageBox.confirm(`确认对资产 [${row.name}] 执行 ${actionMap[nextStatus]} 吗？`, '业务确认')
        .then(() => {
            const oldStatus = row.status;
            row.status = nextStatus;
            // 补全：结构化日志记录
            const newLog: AssetLog = {
                time: new Date().toLocaleString(),
                operator: '系统管理员', // 实际应从 userStore 拿
                action: `状态变更: ${oldStatus} -> ${nextStatus}`,
                remark: '用户手动触发业务流转'
            };
            if (!row.history) row.history = [];
            row.history.unshift(newLog); // 最新的放在最前面

            ElMessage.success('业务流程已更新');
        });
};


//创建防抖处理函数
const debouncedSearch = debounce((val: string) => {
    searchQuery.value = val;
}, 300);

// 2. 5万条压测数据分批生成 (Time Slicing)
const generateMassiveData = () => {
    if (isGenerating.value) return;
    isGenerating.value = true;
    const total = 50000;
    const batchSize = 2500;
    let count = 0;
    const categories = ['IoT', 'Software', 'Visual', 'Hardware'];

    const render = () => {
        const batch: Project[] = [];
        for (let i = 0; i < batchSize && count < total; i++) {
            batch.push(Object.freeze({
                id: 30000 + count,
                name: `压测资产 ——编号${count}`,
                category: categories[count % 4],
                budget: Math.floor(Math.random() * 1000000),
                status: 'active',
                deptId: (count % 5) + 1,
                history: [{ time: '2024-01-01', operator: '系统', action: '初始化导入' }]
            }) as Project);
            count++;
        }
        displayData.value = [...displayData.value, ...batch];
        if (count < total) requestAnimationFrame(render);
        else {
            isGenerating.value = false;
            ElMessage.success('5万条压测数据已注入');
        }
    };
    render();
};

// 3. 勾选逻辑
const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds.value);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    selectedIds.value = newSet;
};

// 4. 排序逻辑
const handleSort = (key: keyof Project) => {
    if (sortConfig.value.key === key) {
        sortConfig.value.order = sortConfig.value.order === 'asc' ? 'desc' : sortConfig.value.order === 'desc' ? null : 'asc';
    } else {
        sortConfig.value.key = key;
        sortConfig.value.order = 'asc';
    }
};

// 5. 导出逻辑 (Blob 方案)
const handleExport = () => {
    const list = finalData.value;
    if (!list.length) return ElMessage.warning('暂无数据');
    let csv = "\ufeffID,名称,分类,预算,状态\n";
    list.forEach(i => csv += `${i.id},${i.name},${i.category},${i.budget},${i.status}\n`);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `资产清单_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
};
const tableHeight = ref(450);
const updateTableHeight = () => {
    // 动态计算：窗口高度 - 顶部Header - 图表 - 工具栏 - 汇总条 - 边距
    const calculated = window.innerHeight - 84 - 180 - 60 - 50 - 60;
    tableHeight.value = calculated > 300 ? calculated : 300; // 最低保留300
};
// 6. 弹窗取消拦截
const handleCancel = () => {
    if (isDirty.value) {
        ElMessageBox.confirm('内容已修改，确定放弃吗？', '提示').then(closeForm);
    } else closeForm();
};

// 7. 树形转换与初始加载
const arrToTree = (items: TreeNode[]) => {
    const res: TreeNode[] = [];
    const map: any = {};
    items.forEach(i => map[i.id] = { ...i, children: [] });
    items.forEach(i => {
        if (i.pid === 0) res.push(map[i.id]);
        else if (map[i.pid]) map[i.pid].children.push(map[i.id]);
    });
    return res;
};
//监听UI输入，触发防抖
watch(searchInput, (newVal) => {
    debouncedSearch(newVal);
})
//监听API原始数据变化，自动更新业务逻辑Hook
watch(apiData, (newList) => {
    if (newList) {
        displayData.value = newList;
    }
}, { immediate: true });
onMounted(async () => {
    updateTableHeight();
    window.addEventListener('resize', updateTableHeight)
    //同时请求部门和项目数据
    const [deptRes] = await Promise.all([
        request<TreeNode[]>({ url: '/departments' }),
        refreshtable()
    ]);

    treeData.value = arrToTree(deptRes);
});
onUnmounted(() => {
    window.removeEventListener('resize', updateTableHeight);
})
</script>

<template>
    <div class="dm-layout">
        <!-- 1. 左侧组织架构 -->
        <aside class="dm-sidebar">
            <div class="sidebar-title"><el-icon>
                    <Menu />
                </el-icon> 组织架构</div>
            <div class="tree-container">
                <TreeItem v-for="t in treeData" :key="t.id" :node="t" @node-click="(n: any) => selectedDeptId = n.id" />
            </div>
        </aside>

        <!-- 2. 右侧主体 -->
        <main class="dm-main">
            <!-- 统计图表区 -->
            <section class="dm-chart-card">
                <AssetChart title="资产分布统计" :data="chartSummaryData" @bar-click="(n: string) => selectedCategory = n" />
            </section>

            <!-- 操作工具栏 -->
            <section class="dm-toolbar">
                <div class="bar-left">
                    <!-- 搜索框：锁定宽度 -->
                    <el-input v-model="searchInput" placeholder="搜索资产名称..." prefix-icon="Search" clearable
                        class="search-input" />
                    <!-- 标签区：允许水平溢出而不挤压整体 -->
                    <div class="filter-tags-area">
                        <transition-group name="el-fade-in">
                            <el-tag v-if="selectedCategory" key="cat" closable @close="selectedCategory = ''"
                                effect="light">
                                分类: {{ selectedCategory }}
                            </el-tag>
                            <el-tag v-if="selectedDeptId" key="dept" type="success" closable
                                @close="selectedDeptId = null" effect="light">
                                部门: {{ selectedDeptId }}
                            </el-tag>
                            <el-button v-if="selectedCategory || selectedDeptId || searchInput" key="reset" link
                                @click="resetFilters" type="primary">重置</el-button>
                        </transition-group>
                    </div>
                </div>
                <div class="bar-right">
                    <el-button-group>
                        <el-button type="success" @click="handleExport">
                            <el-icon>
                                <Download />
                            </el-icon> 导出
                        </el-button>
                        <el-button type="primary" :loading="isGenerating" @click="generateMassiveData">
                            压测5w
                        </el-button>
                    </el-button-group>
                </div>
            </section>

            <!-- 数据明细区 -->
            <section class="dm-table-wrapper">
                <el-skeleton v-if="isLoading" :rows="12" animated />
                <template v-else>
                    <!-- 自定义表头 -->
                    <div class="v-table-header">
                        <div class="col-check">
                            <el-checkbox :model-value="selectedIds.size === finalData.length && finalData.length > 0"
                                @change="selectedIds = selectedIds.size > 0 ? new Set() : new Set(finalData.map(i => i.id))" />
                        </div>
                        <div class="col-name clickable" @click="handleSort('name')">资产名称 <el-icon
                                v-if="sortConfig.key === 'name'">
                                <Sort />
                            </el-icon></div>
                        <div class="col-cate">分类</div>
                        <div class="col-budget clickable" @click="handleSort('budget')">预算金额 <el-icon
                                v-if="sortConfig.key === 'budget'">
                                <Sort />
                            </el-icon></div>
                        <div class="col-status">状态</div>
                        <div class="col-ops">操作</div>
                    </div>
                    <!-- 虚拟列表主体 -->
                    <VirtualTable :data="finalData" :itemHeight="60" :viewHeight="tableHeight" @row-click="openForm">
                        <template #default="{ row }">
                            <div class="table-row" :class="{ 'is-selected': selectedIds.has(row.id) }">
                                <div class="col-check"><el-checkbox :model-value="selectedIds.has(row.id)"
                                        @change="toggleSelection(row.id)" /></div>
                                <div class="col-name">{{ row.name }}</div>
                                <div class="col-cate"><el-tag size="small" effect="plain">{{ row.category }}</el-tag>
                                </div>
                                <div class="col-budget">￥{{ row.budget.toLocaleString() }}</div>
                                <div class="col-status">
                                    <span :style="{ color: '#67c23a' }" v-if="row.status === 'active'">● 进行中</span>
                                    <span :style="{ color: '#f56c6c' }" v-else-if="row.status === 'repair'">● 维修中</span>
                                    <span :style="{ color: '#909399' }" v-else>● 已归档</span>
                                </div>
                                <div class="col-ops">
                                    <el-button link type="primary" @click.stop="openForm(row)">详情</el-button>
                                    <el-button v-if="row.status === 'active'" link type="warning"
                                        @click.stop="transitionStatus(row, 'repair')">报修</el-button>
                                    <el-button v-if="row.status === 'repair'" link type="success"
                                        @click.stop="transitionStatus(row, 'active')">修复</el-button>
                                </div>
                            </div>
                        </template>
                    </VirtualTable>
                </template>
            </section>

            <!-- 统计页脚 -->
            <footer class="dm-footer">
                <div class="summary">当前展示: <b>{{ summaryInfo.count }}</b> 项 | 总预算: <span class="price">￥{{
                    summaryInfo.totalBudget.toLocaleString() }}</span> | 平均: ￥{{ summaryInfo.average }}</div>
                <div class="selection" v-if="selectedIds.size > 0">已选中 <b>{{ selectedIds.size }}</b> 项 <el-button link
                        type="danger" @click="selectedIds.clear()">取消</el-button></div>
            </footer>
        </main>

        <!-- 弹窗 -->
        <BaseModal :model-value="!!editingItem" :title="editingItem?.id ? '资产详情' : '新增资产'"
            @confirm="submitForm(refreshtable)" @cancel="handleCancel" @update:model-value="closeForm">
            <el-form v-if="editingItem" label-width="80px">
                <el-tabs type="border-card">
                    <el-tab-pane label="基本信息">
                        <el-form-item label="名称"><el-input v-model="editingItem.name" /></el-form-item>
                        <el-form-item label="预算"><el-input-number v-model="editingItem.budget"
                                style="width:100%" /></el-form-item>
                        <el-form-item label="分类">
                            <ProSelect v-model="editingItem.category" dictCode="asset_type" />
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="操作履历">
                        <el-timeline style="padding: 10px">
                            <el-timeline-item v-for="(log, idx) in editingItem.history" :key="idx"
                                :timestamp="log.time">
                                {{ log.operator }} {{ log.action }}
                                <p v-if="log.remark" style="color: #999; font-size: 12px">{{ log.remark }}</p>
                            </el-timeline-item>
                        </el-timeline>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </BaseModal>
    </div>
</template>

<style scoped>
/* 1. 主容器：锁定视口高度 */
.dm-layout {
    display: flex;
    height: calc(100vh - 84px);
    gap: 15px;
    padding: 15px;
    background: #f0f2f5;
    overflow: hidden;
    /* 禁用外层滚动 */
    box-sizing: border-box;
}

.dm-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
}

/* 2. 图表区：高度从 260 降至 210，释放空间 */
.dm-chart-card {
    background: #fff;
    border-radius: 12px; /* 圆角增加 */
    padding: 10px 20px;
    height: 180px; /* 从 210px 降至 180px */
    flex-shrink: 0;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); /* 增加投影提升层次 */
    margin-bottom: 4px;
}
/* 2. 调整工具栏：增加上下间距 */
.dm-toolbar {
    background: #fff;
    padding: 80px 24px; /* 增加内边距 */
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #ebeef5;
    flex-shrink: 0;
    margin-bottom: 4px;
}

.bar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
}

.search-input {
    width: 260px !important;
    flex-shrink: 0;
}

.filter-tags-area {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    white-space: nowrap;
}

.filter-tags-area::-webkit-scrollbar {
    display: none;
}

.bar-right {
    flex-shrink: 0;
    /* 确保按钮组不缩水 */
    margin-left: 15px;
}

/* 4. 列表列宽：严格对齐公式 */
/* 将这些类名同时应用在 v-table-header 和 table-row 的对应子元素上 */
.col-check {
    width: 50px;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
}

.col-name {
    flex: 3;
    min-width: 200px;
    padding: 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.col-cate {
    width: 100px;
    flex-shrink: 0;
    text-align: center;
}

.col-budget {
    width: 140px;
    flex-shrink: 0;
    text-align: right;
    font-family: 'Courier New', Courier, monospace;
    padding-right: 20px;
    font-weight: bold;
}

.col-status {
    width: 110px;
    flex-shrink: 0;
    text-align: center;
}

.col-ops {
    width: 150px;
    flex-shrink: 0;
    text-align: right;
}


.dm-table-wrapper {
    background: #fff;
    border-radius: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.dm-sidebar {
    width: 260px;
    background: #fff;
    border-radius: 12px;
    margin-right: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}
.col-check  { width: 60px; }
.col-name   { flex: 3; font-size: 15px; color: #303133; }
.col-cate   { width: 100px; }
.col-budget { width: 160px; font-size: 16px; color: #606266; }
.col-status { width: 120px; }
.col-ops    { width: 140px; }
.v-table-header {
    display: flex;
    align-items: center;
    height: 45px;
    background: #fafafa;
    border-bottom: 1px solid #eee;
    color: #606266;
    font-weight: bold;
    font-size: 13px;
}

.table-row {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 24px; /* 增加左右内边距 */
    border-bottom: 1px solid #f2f6fc;
}

.table-row:hover {
    background: #f9f9f9;
}

.table-row.is-selected {
    background: #ecf5ff;
}

/* 6. 页脚统计 */
.dm-footer {
    background: #fff;
    padding: 8px 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #666;
    flex-shrink: 0;
    border: 1px solid #eee;
}

.price-highlight {
    color: #f56c6c;
    font-weight: bold;
}
</style>
