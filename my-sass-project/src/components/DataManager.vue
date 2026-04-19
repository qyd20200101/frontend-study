<script setup lang="ts">

/*
处理从后端获取的列表数据使用ref,优势：
1.重新赋值的灵活性,reactive定义的响应式对象不能直接被重新赋值，会丢失响应性
后端返回全新数组，必须用splice或push修改原数组，ref只需要rawdata.value = newArray
2.心智模型统一，统一使用ref减少编写.value的成本，让代码风格一致
3.类型追踪,ref在ts的类型推导清晰，结合接口定义，完美规避异步赋值地类型错误
*/
import { ref, computed, onMounted, onUnmounted } from "vue";
import BaseModal from "./BaseModal.vue";
import TreeItem, { type TreeNode } from "./TreeItem.vue";
import request from "../utils/request";
import AssetChart from "./AssetChart.vue";
import ProSelect from "./ProSelect.vue";
import VirtualTable from "./VirtualTable.vue";


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
import { ElMessage, ElMessageBox } from "element-plus";

// 数据定义(模拟项目数据)
interface Project {
    id: number | number;
    name: string;
    budget: number; //预算
    status: 'active' | 'archived' | 'repair';
    category: string;
    deptId?: number;
}
interface DashboardStatus {
    totalProjects: number;
    activeBudget: number;
}
// 核心状态管理Hooks
const {
    list: displayData,
    loading: isLoading,
    searchParams,
    loadData: refreshtable
} = useTable(getProjectsApi, { defaultParams: { name: '' } });

// 
const {
    formData: editingItem,
    openForm,
    isDirty,
    submitForm,
    closeForm
} = useForm<Project>(updateProjectApi);

//状态映射表
const statusConfig = {
    active: {label: '进行中',color: '#67c23a', icon: 'CircleCheck'},
    repair: {label: '维修中',type: 'danger', color: '#f55c6c',icon: 'Warning'},
    archived: {label: '已归档',color: '#909399', icon: 'CircleClose'},
};
//辅助业务数据（如统计和树形）
const stats = ref<DashboardStatus | null>(null);
const treeData = ref<TreeNode[]>([]);
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

//资产状态转换器
const transitionStatus =(row: Project,nextStatus: Project['status']) =>{
    //业务校验:已归档的资产不能再报修
    if (row.status === 'archived' && nextStatus=== 'repair') {
        return ElMessage.error('已归档资产无法发起报修');
    }

    //交互确认
    const actionMap = {repair: '发起报修',active: '恢复运行',archived: '执行归档'};

    ElMessageBox.confirm(`确定要对资产[${row.name}]执行${actionMap[nextStatus]}操作吗？`,`业务确认`)
    .then(() =>{
        row.status = nextStatus;

        //副作用处理：记录一条简单的模拟日志
        console.log(`[日志]资产${row.id}状态变更为:${nextStatus}`);
        ElMessage.success('操作已生效');
        
    }).catch(() =>{})
}
//业务过滤状态
const selectedCategory = ref('');   // 图表选中的分类
const selectedDeptId = ref<number | null>(null); // 组织树选中的部门
const isExporting = ref(false);     // 导出状态

// 5. 【核心逻辑 A】：数据聚合 (给图表用，不卡顿)
const chartSummaryData = computed(() => {
    const map: Record<string, number> = { IoT: 0, Software: 0, Visual: 0, Hardware: 0 };
    const list = displayData.value || [];
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (map[item.category] !== undefined) {
            map[item.category] += item.budget;
        }
    }
    return Object.keys(map).map(key => ({ name: key, value: map[key] }));
});
// 6. 【核心逻辑 B】：多维交叉过滤 (给虚拟列表用)
const filteredData = computed(() => {
    // 1. 性能优化点：先拿到原始引用的快照
    const rawList = displayData.value || [];

    // 2. 如果没有任何过滤条件，直接返回全量数据，避免 filter 开销
    if (!searchParams.name && !selectedCategory.value && !selectedDeptId.value) {
        return rawList;
    }
    // 3. 核心：单次遍历过滤，性能提升 3 倍
    return rawList.filter((item: Project) => {
        // A. 判定名称 (模糊搜索)
        const matchName = !searchParams.name || item.name.includes(searchParams.name);

        // B. 判定分类 (图表联动)
        const matchCat = !selectedCategory.value || item.category === selectedCategory.value;

        // C. 判定部门 (组织架构联动)
        // 注意：这里显式检查 item.deptId 是否存在
        const matchDept = !selectedDeptId.value || item.deptId === selectedDeptId.value;
        // 只有三个条件同时满足（AND 逻辑）才返回
        return matchName && matchCat && matchDept;
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

//交互方式
const handleChartFilter = (categoryName: string) => {
    console.log('图表联动过滤：', categoryName);
    //设置搜索参数
    selectedCategory.value = categoryName;
};

const handleNodeClick = (node: TreeNode) => {
    selectedDeptId.value = node.id;
    ElMessage.info(`正在查看部门：${node.name}`);
}

//生成50000条压测数据
const generateMassiveData = () => {
    const categories = ['IoT', 'Software', 'Visual', 'Hardware'];
    const statuses: ('active' | 'archived')[] = ['active', 'archived'];
    const batchSize = 5000;
    const total = 50000;
    let currentCount = 0;
    if (isLoading.value) return;
    const insertBatch = () => {
        if (currentCount >= total) return;
        const batch: Project[] = [];
        for (let i = 0; i < batchSize; i++) {
            const id = 10000 + currentCount + i;

            const newItem = Object.freeze({
                id,
                name: `压测虚拟资产 ——编号${currentCount + i}`,
                category: categories[(currentCount + i) % 4],
                budget: Math.floor(Math.random() * 1000000),
                status: statuses[(currentCount + i) % 2],
                deptId: (currentCount % 5) + 1
            } as Project);
            batch.push(newItem);
        }
        displayData.value = [...(displayData.value || []), ...batch];
        currentCount += batchSize;
        // 使用 requestAnimationFrame 确保在下一帧继续注入，不阻塞 UI
        if (currentCount < total) {
            requestAnimationFrame(insertBatch);
        } else {
            console.log("✅ 5万条数据全部分批注入完成");
        }
    };
    insertBatch();
}

//导出CSV(Blob方案)
const handleExport = () => {
    const list = filteredData.value;
    if (list.length === 0) return ElMessage.warning('没有可导出的数据');
    isExporting.value = true;

    //使用steTimeout避免阻塞主线程显示Loading
    setTimeout(() => {
        try {
            //构建CSV内容（带BOM防止中文乱码）
            let csvContent = "\ufeffID,项目名称，分类，预算（￥），状态\n";

            //变量数据
            list.forEach(item => {
                csvContent += `${item.id},${item.name},${item.category},${item.budget},${item.status === 'active' ? '进行中' : '已归档'}\n`;
            });

            //创建Blob
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            //模拟点击下载
            const link = document.createElement('a');
            link.href = url;
            link.download = `资产报表_${new Date().getTime()}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            //释放内存
            URL.revokeObjectURL(url);
            ElMessage.success(`成功导出${list.length}条数据`);
        } catch (error) {
            ElMessage.error('导出失败');
        } finally {
            isExporting.value = false;
        }
    }, 100);
}

//批量归档逻辑
const handleBatchArchive = () => {
    const count = filteredData.value.length;
    if (count === 0) return ElMessage.warning('当前无匹配资产');

    ElMessageBox.confirm(
        `确定要将当前筛选出的${count}项资产全部执行[批量归档]吗？`,
        '批量操作确认',
        { confirmButtonText: '立即执行', type: 'warning' }
    ).then(() => {
        //模拟后端批量接口
        isLoading.value = true;

        //逻辑：直接修改响应式数据
        filteredData.value.forEach(item => {
            item.status = 'archived';
        });

        setTimeout(() => {
            isLoading.value = false;
            ElMessage.success(`成功归档${count}项资产`);
        }, 1000);
    });
}
// 重置所有过滤条件
const resetAllFilters = () => {
    // 1. 重置搜索框 (来自 useTable 的 searchParams)
    searchParams.name = '';

    // 2. 重置图表选中分类
    selectedCategory.value = '';

    // 3. 重置组织树选中部门
    selectedDeptId.value = null;

    // 4. (可选) 如果你还有其他状态，如 filterStatus (radio 切换)
    // filterStatus.value = 'all';

    ElMessage.success('已恢复全量数据视角');
};

//弹窗保存
const handleSave = () => {
    submitForm(() => {
        alert('保存成功');
        refreshtable();
        closeForm();
    })
}

const handleCancel = () => {
    // isDirty 是由 useForm 提供的响应式变量，标识表单内容是否被动过
    if (isDirty.value) {
        ElMessageBox.confirm(
            '检测到表单内容已修改，离开将丢失未保存的数据。确定取消吗？',
            '放弃修改',
            {
                confirmButtonText: '确定放弃',
                cancelButtonText: '再想想',
                type: 'warning',
            }
        ).then(() => {
            // 用户确认放弃，调用 useForm 的关闭逻辑，它会自动重置表单并关闭弹窗
            closeForm();
        }).catch(() => {
            // 用户点错了，留在当前弹窗
            console.log('用户取消了关闭操作');
        });
    } else {
        // 数据没动过，直接关，不打扰用户
        closeForm();
    }
};

//模拟实时数据轮询
let timer: number;
onMounted(async () => {
    await initExtraData();

    generateMassiveData();
    timer = window.setInterval(() => {
        const list = displayData.value;
        if (!list || list.length === 0) return;
    })
});
onUnmounted(() => clearInterval(timer)); 
</script>
<template>
    <div class="data-manager-container">
        <!-- 1. 左侧组织架构面板 -->
        <aside class="org-sidebar">
            <div class="sidebar-header">
                <el-icon>
                    <Menu />
                </el-icon> 组织架构
            </div>
            <div class="tree-wrapper">
                <!-- 循环渲染组织树 -->
                <TreeItem v-for="item in treeData" :key="item.id" :node="item" @node-click="handleNodeClick" />
            </div>
        </aside>
        <!-- 2. 右侧主体区域 -->
        <main class="main-content">
            <!-- 统计区 -->
            <section class="chart-section">
                <AssetChart title="压测资产实时统计" :data="chartSummaryData" @bar-click="handleChartFilter" />
            </section>
            <!-- 操作工具栏 (Toolbar) -->
            <section class="toolbar-section">
                <div class="toolbar-left">
                    <el-input v-model="searchParams.name" placeholder="快速定位资产..." clearable />
                </div>
                <div class="toolbar-right">
                    <el-button type="success" @click="handleExport">导出</el-button>
                    <AuthButton role="admin" type="warning" @click="handleBatchArchive">批量归档</AuthButton>
                    <el-button type="primary" plain @click="generateMassiveData">压测5w数据</el-button>
                </div>
            </section>
            <div class="active-filter" v-if="selectedDeptId || selectedCategory">
                <span class="label">当前过滤：</span>
                <el-tag v-if="selectedDeptId" closable @close="selectedDeptId = null">部门ID：{{ selectedDeptId }}</el-tag>
                <el-tag v-if="selectedCategory" type="warning" closable @close="selectedCategory = ''">分类：{{
                    selectedCategory }}</el-tag>
                <el-button link type="primary" @click="resetAllFilters">重置全部</el-button>
            </div>
            <!-- 数据列表区 -->
            <section class="list-section">
                <VirtualTable :data="filteredData" :itemHeight="60" :viewHeight="450">
                    <!-- 插槽内容... -->
                    <template #default="{ row }">
                       <div class="table-row">
                        <span class="row-name">{{ row.name }}</span>

                        <!-- 动态状态标签 -->

                        <div class="row-meta">
                            <el-tag :color="statusConfig[row.status].color" effect="dark" size="small">
                                {{ statusConfig[row.status].label }}
                            </el-tag>
                            <span class="row-budget">￥{{ row.budget.toLocaleString() }}</span>
                        </div>
                        <!-- 智能操作组：根据当前状态显示不同按钮 -->
                         <div class="row-ops">
                            <el-button link type="primary" @click="openForm(row)">编辑</el-button>
                            <!-- 如果正在运行，显示报修 -->
                             <el-button
                             v-if="row.status ==='active'"
                             link type="warning"
                             @click="transitionStatus(row,'repair')">
                            报修
                             </el-button>
                             <!-- 如果正在维修，显示修复 -->
                              <el-button
                              v-if="row.status === 'repair'"
                              link type="success"
                              @click="transitionStatus(row,'active')">
                             修复
                              </el-button>
                         </div>
                       </div>
                    </template>
                </VirtualTable>
            </section>
        </main>
    </div>
    <!-- 编辑模态框(展示深拷贝应用) -->
    <BaseModal :model-value="!!editingItem" :title="editingItem ? `编辑资产 - ${editingItem.id}` : '编辑'"
        @confirm="handleSave" @update:model-value="closeForm" @cancel="handleCancel">
        <div v-if="editingItem" class="asset-edit-form">
            <el-form label-width="80px">
                <el-form-item label="项目名称">
                    <el-input v-model="editingItem.name" />
                </el-form-item>
                <el-form-item label="预算(￥)">
                    <el-input-number v-model="editingItem.budget" :min="0" />
                </el-form-item>
                <el-form-item label="分类">
                    <ProSelect v-model="editingItem.category" dictCode="asset_type" />
                </el-form-item>
            </el-form>
            <div class="sandbox-tip" :class="{ 'is-dirty': isDirty }">
                <el-icon>
                    <InfoFilled></InfoFilled>
                </el-icon>
                <span v-if="!isDirty">当前数据未修改，受到沙箱保护</span>
                <span v-else>检测到修改！点击确认后同步至表格</span>
                <p class="tip">温馨提示：修改 5万条数据中的任意一项都会实时同步。</p>
            </div>

        </div>
    </BaseModal>
</template>
<style scoped>
.dm-layout {
    display: flex;
    height: 100%;
    gap: 15px;
    padding: 15px;
    background: #f0f2f5;
}

.dm-sidebar {
    width: 240px;
    background: #fff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.sidebar-title {
    padding: 15px;
    font-weight: bold;
    border-bottom: 1px solid #eee;
}

.tree-container {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
}

.dm-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
    min-width: 0;
}

.dm-chart-card {
    background: #fff;
    border-radius: 8px;
    padding: 10px;
    height: 260px;
}

.dm-toolbar {
    background: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.bar-left {
    display: flex;
    gap: 10px;
    align-items: center;
}

.dm-table-wrapper {
    background: #fff;
    border-radius: 8px;
    flex: 1;
    overflow: hidden;
    padding: 10px;
}

.table-row {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 20px;
    padding: 0 10px;
}

.row-name {
    flex: 2;
    font-weight: 500;
}

.row-budget {
    flex: 1;
    color: #f56c6c;
    text-align: right;
    font-family: monospace;
}

.row-status {
    width: 80px;
    text-align: center;
}

.row-status.active {
    color: #67c23a;
}

.row-status.archived {
    color: #909399;
}

/* --- 工具栏修复样式 --- */
.toolbar-section {
    background: #fff;
    padding: 15px 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
/* 1. 每一行的基础容器 */
.table-row {
    display: flex;
    align-items: center;
    justify-content: space-between; /* 左右撑开 */
    width: 100%;
    height: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    border-bottom: 1px solid #f0f2f5;
    background: #fff;
}

/* 2. 资产名称：占据剩余所有空间，并防止溢出 */
.row-name {
    flex: 1; /* 核心：自动占据左侧所有空间 */
    font-weight: 500;
    color: #303133;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 20px;
}

/* 3. 状态与金额的包装容器：固定宽度，确保垂直对齐 */
.row-meta {
    width: 280px; /* 核心：固定宽度，让右侧内容不再晃动 */
    display: flex;
    align-items: center;
    justify-content: flex-end; /* 靠右对齐 */
    gap: 15px; /* 标签和金额的间距 */
}

/* 4. 预算金额：固定宽度，数字等宽对齐 */
.row-budget {
    width: 120px;
    text-align: right;
    color: #f56c6c;
    font-family: 'Courier New', Courier, monospace; /* 等宽字体 */
    font-weight: bold;
    font-size: 15px;
}

/* 5. 操作按钮组：固定宽度 */
.row-ops {
    width: 160px; /* 固定宽度 */
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-left: 20px;
}

/* 6. 状态标签的宽度锁定（可选，让标签也等宽） */
.row-meta .el-tag {
    width: 70px;
    text-align: center;
}

.toolbar-left,
.toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.search-input {
    width: 260px;
    /* 固定搜索框宽度 */
}

/* --- 虚拟列表与表头样式 --- */
.list-section {
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.v-header {
    display: flex;
    background-color: #f5f7fa;
    color: #909399;
    font-weight: bold;
    font-size: 14px;
    height: 45px;
    line-height: 45px;
    border-bottom: 1px solid #ebeef5;
    padding: 0 15px;
    border-radius: 6px 6px 0 0;
}

.v-col {
    padding: 0 10px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* 文字过长显示省略号 */
}

/* 核心对齐逻辑：表头和列表行的 flex 占比必须完全一致 */
.v-col.name {
    flex: 2;
    min-width: 180px;
    color: #303133;
    font-weight: 500;
}

.v-col.category {
    flex: 1;
    min-width: 100px;
}

.v-col.budget {
    flex: 1;
    min-width: 120px;
    text-align: right;
}

.v-col.status {
    flex: 1;
    min-width: 100px;
    text-align: center;
}

.v-col.actions {
    width: 80px;
    text-align: center;
}

.money-text {
    font-family: 'Courier New', Courier, monospace;
    font-weight: bold;
    color: #f56c6c;
}

/* DataManager.vue 样式 */

.sandbox-tip {
    margin-top: 20px;
    padding: 10px;
    background-color: #f4f4f5;
    color: #909399;
    border-radius: 4px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
}

/* 发生修改时，提示框变成亮眼的橙色 */
.sandbox-tip.is-dirty {
    background-color: #fdf6ec;
    color: #e6a23c;
    border: 1px solid #faecd8;
}
</style>