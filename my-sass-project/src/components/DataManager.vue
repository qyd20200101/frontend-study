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
    status: 'active' | 'archived';
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
    submitForm,
    closeForm
} = useForm<Project>(updateProjectApi);

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

//弹窗保存
const handleSave = () => {
    submitForm(() => {
        alert('保存成功');
        refreshtable();
        closeForm();
    })
}
//模拟实时数据轮询
let timer: number;
onMounted(async () => {
    await initExtraData();

    generateMassiveData();
    timer = window.setInterval(() => {
        //模拟数据微小波动，观察图标动画
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
                    <el-tag v-if="selectedCategory" closable @close="selectedCategory = ''">{{ selectedCategory
                    }}</el-tag>
                </div>
                <div class="toolbar-right">
                    <el-button type="success" @click="handleExport">导出</el-button>
                    <AuthButton role="admin" type="warning" @click="handleBatchArchive">批量归档</AuthButton>
                    <el-button type="primary" plain @click="generateMassiveData">压测5w数据</el-button>
                </div>
            </section>
            <!-- 数据列表区 -->
            <section class="list-section">
                <VirtualTable :data="filteredData" :itemHeight="60" :viewHeight="450">
                    <!-- 插槽内容... -->
                    <template #default="{ row }">
                        <div class="v-col name" :title="row.name">{{ row.name }}</div>
                        <div class="v-col category">
                            <el-tag size="small">{{ row.category }}</el-tag>
                        </div>
                        <div class="v-col budget">
                            <span class="money-text">￥{{ row.budget.toLocaleString() }}</span>
                        </div>
                        <div class="v-col status">
                            <el-tag size="small" :type="row.status === 'active' ? 'success' : 'info'">
                                {{ row.status === 'active' ? '进行中' : '已归档' }}
                            </el-tag>
                        </div>
                        <div class="v-col actions">
                            <el-button link type="primary" @click.stop="openForm(row)">编辑</el-button>
                        </div>
                    </template>
                </VirtualTable>
            </section>
        </main>
    </div>
    <!-- 编辑模态框(展示深拷贝应用) -->
    <BaseModal :model-value="!!editingItem" title="editingItem?.id" @:updated:model-value="closeForm"
        @confirm="handleSave" @update:model-value="closeForm">
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
            <p class="tip">温馨提示：修改 5万条数据中的任意一项都会实时同步。</p>
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
</style>