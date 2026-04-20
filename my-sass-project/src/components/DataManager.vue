<script lang="ts">
// 🚀 必须与路由配置的 name 绝对一致，才能使 KeepAlive 生效
export default { name: 'Dashboard' }
</script>

<script setup lang="ts">
import { ref, computed, watch, onActivated, onDeactivated ,onMounted} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

import type { Project, AssetStatus,  } from "../types/asset";
import { useAssetBusiness } from "../hooks/useAssetBusiness";
import { useTable } from "../hooks/useTable";
import { useForm } from "../hooks/useForm";
import { getProjectsApi, updateProjectApi, batchDeleteProjectApi } from "../api/project";
import request from "../utils/request";
import { debounce } from "../utils/engine";

import BaseModal from "./BaseModal.vue";
import TreeItem, { type TreeNode } from "./TreeItem.vue";
import AssetChart from "./AssetChart.vue";
import VirtualTable from "./VirtualTable.vue";
import ProSelect from "./ProSelect.vue";


const { list: apiData, loading: isLoading, total, pagination, loadData: refreshtable } = useTable(getProjectsApi);
const { formData: editingItem, isDirty, openForm, submitForm, closeForm } = useForm<Project>(updateProjectApi);
const handleCancel = () => {
    if (isDirty.value) {
        ElMessageBox.confirm('内容已修改，确定放弃吗？', '提示', { type: 'warning' })
            .then(closeForm)
            .catch(() => {}); // 用户点击取消，留在当前弹窗
    } else {
        closeForm();
    }
};
const displayData = ref<Project[]>([]);
const treeData = ref<TreeNode[]>([]);

const {
    selectedCategory,
    selectedDeptId,
    sortConfig,
    finalData,
    chartSummaryData,
    resetFilters
} = useAssetBusiness(displayData);

const selectedIds = ref(new Set<number>());
const searchInput = ref("");

// 报修状态
const isRepairDialogVisible = ref(false);
const repairForm = ref({ reason: '', targetId: -1 });

const fetchData = () => {
    refreshtable({
        keyword: searchInput.value,
        category: selectedCategory.value,
        deptId: selectedDeptId.value
    } as any);
};

// 监听条件变化，重置页码并重新请求
watch([searchInput, selectedCategory, selectedDeptId], () => {
    pagination.value.page = 1;
    fetchData();
});

watch(apiData, (newList) => { if (newList) displayData.value = newList; }, { immediate: true });


const isAllSelected = computed(() => {
    return finalData.value.length > 0 && selectedIds.value.size === finalData.value.length;
});

const isIndeterminate = computed(() => {
    return selectedIds.value.size > 0 && selectedIds.value.size < finalData.value.length;
});

const handleSelectAll = (val: string | number | boolean) => {
    if (val) {
        selectedIds.value = new Set(finalData.value.map(i => i.id));
    } else {
        selectedIds.value.clear();
    }
};

const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds.value);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    selectedIds.value = newSet;
};

const handleBatchDelete = () => {
    ElMessageBox.confirm(`确定要永久删除这 ${selectedIds.value.size} 项资产吗？`, '危险操作', { 
        type: 'error',
        confirmButtonText: '绝不手软',
        cancelButtonText: '我再想想'  
    }).then(async () => {
        const ids = Array.from(selectedIds.value);
        await batchDeleteProjectApi(ids); 
        selectedIds.value.clear();
        fetchData(); // 
        ElMessage.success('批量删除成功');
    }).catch(() => {});
};


const transitionStatus = (row: Project, nextStatus: AssetStatus) => {
    const actionMap: Record<AssetStatus, string> = {
        active: '恢复运行', repair: '发起报修', archived: '执行归档', pending: '入库', scrapped: '报废'
    };
    ElMessageBox.confirm(`确认对资产 [${row.name}] 执行 ${actionMap[nextStatus]} 吗？`, '业务确认')
        .then(() => {
            const oldStatus = row.status;
            row.status = nextStatus;
            if (!row.history) row.history = [];
            row.history.unshift({
                time: new Date().toLocaleString(), operator: '系统管理员', action: `状态变更: ${oldStatus} -> ${nextStatus}`, remark: '业务流转'
            });
            ElMessage.success('业务流程已更新');
        });
};

const handleOpenRepair = (row: Project) => {
    repairForm.value.targetId = row.id;
    repairForm.value.reason = '';
    isRepairDialogVisible.value = true;
};

const confirmRepairAction = () => {
    if (!repairForm.value.reason.trim()) return ElMessage.warning('请输入报修原因');
    const item = displayData.value.find(i => i.id === repairForm.value.targetId);
    if (item) {
        item.status = 'repair';
        if (!item.history) item.history = [];
        item.history.unshift({
            time: new Date().toLocaleString(), operator: 'Admin', action: '发起报修', remark: repairForm.value.reason
        });
        ElMessage.success(`资产[${item.name}]报修流程已开启`);
    }
    isRepairDialogVisible.value = false;
};

const handleSort = (key: keyof Project) => {
    if (sortConfig.value.key === key) {
        sortConfig.value.order = sortConfig.value.order === 'asc' ? 'desc' : sortConfig.value.order === 'desc' ? null : 'asc';
    } else {
        sortConfig.value.key = key;
        sortConfig.value.order = 'asc';
    }
};

const handleExport = () => {
    if (!finalData.value.length) return ElMessage.warning('暂无数据');
    let csv = "\ufeffID,名称,分类,预算,状态\n";
    finalData.value.forEach(i => csv += `${i.id},${i.name},${i.category},${i.budget},${i.status}\n`);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement("a"); link.href = url; link.download = `资产清单_${Date.now()}.csv`; link.click();
    URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
};

const arrToTree = (items: TreeNode[]) => {
    const res: TreeNode[] = []; const map: any = {};
    items.forEach(i => map[i.id] = { ...i, children: [] });
    items.forEach(i => {
        if (i.pid === 0) res.push(map[i.id]);
        else if (map[i.pid]) map[i.pid].children.push(map[i.id]);
    });
    return res;
};

const tableHeight = ref(450);
const updateTableHeight = () => {
    const calculated = window.innerHeight - 84 - 180 - 60 - 50 - 60;
    tableHeight.value = calculated > 300 ? calculated : 300;
};
// 加入防抖处理，防止 resize 触发过于频繁导致页面卡顿
const debouncedUpdateHeight = debounce(updateTableHeight, 150); 

// 改用 onActivated，完美适配 KeepAlive 缓存机制
onActivated(async () => {
    updateTableHeight();
    window.addEventListener('resize', debouncedUpdateHeight);
    
    // 只在首次加载时拉取部门树
    if (treeData.value.length === 0) {
        const [deptRes] = await Promise.all([
            request<TreeNode[]>({ url: '/departments' }).catch(()=>[]),
            fetchData()
        ]);
        treeData.value = arrToTree((deptRes as any) || []);
    }
});

//  核心修复：增加 onMounted 保证首次加载
onMounted(() => {
    fetchData();
});
onActivated(() =>{
    updateTableHeight();
    window.addEventListener('resize',debouncedUpdateHeight);
});

// 切走页签时主动销毁监听，防止内存泄漏
onDeactivated(() => {
    window.removeEventListener('resize', debouncedUpdateHeight);
});
</script>

<template>
    <div class="dm-layout">
        <aside class="dm-sidebar">
            <div class="sidebar-title"><el-icon><i-ep-menu /></el-icon> 组织架构</div>
            <div class="tree-container">
                <TreeItem v-for="t in treeData" :key="t.id" :node="t" @node-click="(n: any) => selectedDeptId = n.id" />
            </div>
        </aside>

        <main class="dm-main" style="position: relative;">
            <section class="dm-chart-card">
                <AssetChart title="资产分布统计" :data="chartSummaryData" @bar-click="(n: string) => selectedCategory = n" />
            </section>

            <section class="dm-toolbar">
                <div class="bar-left">
                    <el-input v-model="searchInput" placeholder="搜索资产名称..." prefix-icon="Search" clearable class="search-input" />
                    <div class="filter-tags-area">
                        <transition-group name="el-fade-in">
                            <el-tag v-if="selectedCategory" key="cat" closable @close="selectedCategory = ''" effect="light">分类: {{ selectedCategory }}</el-tag>
                            <el-tag v-if="selectedDeptId" key="dept" type="success" closable @close="selectedDeptId = null" effect="light">部门: {{ selectedDeptId }}</el-tag>
                            <el-button v-if="selectedCategory || selectedDeptId || searchInput" key="reset" link @click="resetFilters" type="primary">重置</el-button>
                        </transition-group>
                    </div>
                </div>
                <div class="bar-right">
                    <el-button-group>
                        <el-button v-if="selectedIds.size > 0" type="danger" @click="handleBatchDelete">
                            <el-icon><i-ep-delete /></el-icon> 批量删除 ({{ selectedIds.size }})
                        </el-button>
                        <el-button type="success" @click="handleExport"><el-icon><i-ep-download /></el-icon> 导出</el-button>
                    </el-button-group>
                </div>
            </section>

            <section class="dm-table-wrapper">
                <el-skeleton v-if="isLoading" :rows="12" animated />
                <template v-else>
                    <div class="v-table-header">
                        <div class="col-check">
                            <el-checkbox 
                                :model-value="isAllSelected"
                                :indeterminate="isIndeterminate"
                                @change="handleSelectAll" 
                            />
                        </div>
                        <div class="col-name clickable" @click="handleSort('name')">资产名称 <el-icon v-if="sortConfig.key === 'name'"><i-ep-sort /></el-icon></div>
                        <div class="col-cate">分类</div>
                        <div class="col-budget clickable" @click="handleSort('budget')">预算金额 <el-icon v-if="sortConfig.key === 'budget'"><i-ep-sort /></el-icon></div>
                        <div class="col-status">状态</div>
                        <div class="col-ops">操作</div>
                    </div>
                    <VirtualTable :data="finalData" :itemHeight="60" :viewHeight="tableHeight" @row-click="openForm">
                        <template #default="{ row }">
                            <div class="table-row" :class="{ 'is-selected': selectedIds.has(row.id) }">
                                <div class="col-check"><el-checkbox :model-value="selectedIds.has(row.id)" @change="toggleSelection(row.id)" @click.stop /></div>
                                <div class="col-name">{{ row.name }}</div>
                                <div class="col-cate"><el-tag size="small" effect="plain">{{ row.category }}</el-tag></div>
                                <div class="col-budget">￥{{ row.budget.toLocaleString() }}</div>
                                <div class="col-status">
                                    <span :style="{ color: '#67c23a' }" v-if="row.status === 'active'">● 进行中</span>
                                    <span :style="{ color: '#f56c6c' }" v-else-if="row.status === 'repair'">● 维修中</span>
                                    <span :style="{ color: '#909399' }" v-else>● 已归档</span>
                                </div>
                                <div class="col-ops">
                                    <el-button link type="primary" @click.stop="openForm(row)">详情</el-button>
                                    <el-button v-if="row.status === 'active'" link type="warning" @click.stop="handleOpenRepair(row)">报修</el-button>
                                    <el-button v-if="row.status === 'repair'" link type="success" @click.stop="transitionStatus(row, 'active')">修复</el-button>
                                </div>
                            </div>
                        </template>
                    </VirtualTable>
                </template>
            </section>

            <footer class="dm-footer">
                <div class="summary">
                    总计 <b>{{ total }}</b> 项 | 
                    <span class="selection" v-if="selectedIds.size > 0">
                        已选中 <b class="price">{{ selectedIds.size }}</b> 项 
                        <el-button link type="danger" @click="selectedIds.clear()">取消</el-button>
                    </span>
                </div>
                <el-pagination
                    v-model:current-page="pagination.page"
                    v-model:page-size="pagination.pageSize"
                    :page-sizes="[50, 100, 500]"
                    layout="sizes, prev, pager, next, jumper"
                    :total="total"
                    @size-change="fetchData"
                    @current-change="fetchData"
                />
            </footer>

            <BaseModal :model-value="!!editingItem" is-local :title="editingItem?.id ? '资产详情' : '新增资产'"
                @confirm="submitForm(fetchData)" @cancel="handleCancel" @update:model-value="closeForm">
                <el-form v-if="editingItem" label-width="80px">
                    <el-tabs type="border-card">
                        <el-tab-pane label="基本信息">
                            <el-form-item label="名称"><el-input v-model="editingItem.name" /></el-form-item>
                            <el-form-item label="预算"><el-input-number v-model="editingItem.budget" style="width:100%" /></el-form-item>
                            <el-form-item label="分类"><ProSelect v-model="editingItem.category" dictCode="asset_type" /></el-form-item>
                        </el-tab-pane>
                        <el-tab-pane label="操作履历">
                            <el-timeline style="padding: 10px">
                                <el-timeline-item v-for="(log, idx) in editingItem.history" :key="idx" :timestamp="log.time">
                                    {{ log.operator }} {{ log.action }}
                                    <p v-if="log.remark" style="color: #999; font-size: 12px">{{ log.remark }}</p>
                                </el-timeline-item>
                            </el-timeline>
                        </el-tab-pane>
                    </el-tabs>
                </el-form>
            </BaseModal>

            <BaseModal :model-value="isRepairDialogVisible" is-local title="资产报修申请" width="450px"
                @update:model-value="isRepairDialogVisible = false" @confirm="confirmRepairAction">
                <div class="repair-form">
                    <el-alert title="您正在对该资产发起报修流程，请填写具体故障原因。" type="warning" :closable="false" show-icon style="margin-bottom: 15px" />
                    <el-form label-width="80px">
                        <el-form-item label="故障原因">
                            <el-input v-model="repairForm.reason" type="textarea" :rows="3" placeholder="例如：设备无法开机、屏幕损坏等" />
                        </el-form-item>
                    </el-form>
                </div>
            </BaseModal>
        </main>
    </div>
</template>

<style scoped>
/* 保持你原本的布局和样式设计不变 */
.dm-layout { display: flex; height: calc(100vh - 84px); gap: 15px; padding: 15px; background: #f0f2f5; box-sizing: border-box; overflow: hidden; }
.dm-sidebar { width: 220px; background: #fff; border-radius: 12px; display: flex; flex-direction: column; flex-shrink: 0; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); }
.tree-container { padding: 10px; overflow-y: auto; flex: 1; }
.sidebar-title { padding: 15px; font-weight: bold; font-size: 15px; border-bottom: 1px solid #ebeef5; color: #303133; }
.dm-main { flex: 1; display: flex; flex-direction: column; gap: 12px; min-width: 0; height: 100%; position: relative; }
.dm-chart-card { background: #fff; border-radius: 12px; padding: 10px; height: 180px; flex-shrink: 0; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); overflow: hidden; position: relative; z-index: 1; }
.dm-toolbar { background: #fff; padding: 0 20px; height: 60px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #ebeef5; flex-shrink: 0; }
.bar-left { display: flex; align-items: center; gap: 15px; }
.search-input { width: 260px; }
.filter-tags-area { display: flex; align-items: center; gap: 8px; }
.dm-table-wrapper { background: #fff; border-radius: 12px 12px 0 0; flex: 1; display: flex; flex-direction: column; overflow-x: auto; overflow-y: hidden; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05); border: 1px solid #ebeef5; border-bottom: none; }
.col-check { width: 45px; flex-shrink: 0; display: flex; justify-content: center; }
.col-name { flex: 3; min-width: 200px; padding: 0 10px; font-weight: 500; }
.col-cate { width: 100px; flex-shrink: 0; text-align: center; }
.col-budget { width: 140px; flex-shrink: 0; text-align: right; padding-right: 20px; font-weight: bold; font-family: monospace; }
.col-status { width: 120px; flex-shrink: 0; text-align: center; }
.col-ops { width: 160px; flex-shrink: 0; text-align: right; padding-right: 10px; }
.v-table-header { min-width: 950px; display: flex; align-items: center; height: 45px; background: #fafafa; border-bottom: 1px solid #f0f2f5; color: #909399; font-weight: bold; font-size: 13px; padding: 0 15px; box-sizing: border-box; }
.table-row { display: flex; align-items: center; width: 100%; height: 100%; padding: 0 15px; box-sizing: border-box; border-bottom: 1px solid #f2f6fc; min-width: 950px; }
.table-row.is-selected { background-color: #ecf5ff; }
.dm-footer { height: 50px; background: #fff; border-top: 1px solid #f0f2f5; border-radius: 0 0 12px 12px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -2px 10px rgba(0,0,0,0.02); }
.price { color: #f56c6c; font-weight: bold; }
</style>