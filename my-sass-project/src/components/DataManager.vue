<script setup lang="ts">

/*
处理从后端获取的列表数据使用ref,优势：
1.重新赋值的灵活性,reactive定义的响应式对象不能直接被重新赋值，会丢失响应性
后端返回全新数组，必须用splice或push修改原数组，ref只需要rawdata.value = newArray
2.心智模型统一，统一使用ref减少编写.value的成本，让代码风格一致
3.类型追踪,ref在ts的类型推导清晰，结合接口定义，完美规避异步赋值地类型错误
*/ 
import { ref, computed, watch, onMounted } from "vue";
import { debounce, deepClone, mySum } from '../utils/engine';
import BaseModal from "./BaseModal.vue";
import TreeItem, {type TreeNode} from "./TreeItem.vue";
import request from "../utils/request";
import { getProjectsApi, updateProjectApi } from "../api/project";


// 1.数据定义(模拟项目数据)
interface Project {
    id: number;
    name: string;
    budget: number; //预算
    status: 'active' | 'archived';
    category: string;
}
interface DashboardStatus{
    totalProjects: number;
    activeBudget:number;
}
//原始数据
const rawData = ref<Project[]>([]);
const categories = ref<string[]>([]);
const stats = ref<DashboardStatus | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);
const searchQuery = ref('');
const errorMessages = ref(''); 
//搜索过滤后的展示数据
const displayData = ref<Project[]>([]);
//模拟正在编辑的项目
//核心：状态回滚相关的变量
const editingItem = ref<Project | null>(null);
const originalItem = ref<any>(null);//保存原始数据的快照

const isModalVisible = ref(false);


//树形组织架构状态
const treeData = ref<TreeNode[]>([]);
const isLoadingTree = ref(false);

// 1.核心重构：页面初始化逻辑
const initPageData =async () =>{
    isLoading.value = true;
    errorMessages.value = '';

    try {
        // 场景：我们需要同时获取项目列表，分类字典和概括数据
        // 使用promise.all并发请求，耗时取决于最慢的那个，而不是累加
        const [projectRes,categoriesRes,statsRes] = await Promise.all([
            ( request<Project[]>({url: '/projects'})).catch(() =>[]),
            ( request<string[]>({url: '/categories'})).catch(() =>[]),
            ( request<DashboardStatus>({url: '/status'}))
        ]);

        rawData.value = projectRes;
        categories.value = categoriesRes;
        stats.value = statsRes; 

        // 初始化显示数据
        displayData.value = [...rawData.value];
    } catch (error) {
        // 核心接口失败的处理逻辑
        errorMessages.value = '系统核心数据加载失败,请类型管理员或刷新重试';
        console.error('Init Error',error);
    }finally{
        isLoading.value = false;
    }
}
// 2.核心业务逻辑(computed)
//使用我们手写的mySum逻辑计算总预算
const totalBudget = computed(() => mySum(displayData.value, 'budget'));

// 3.搜索功能(防抖+模拟API)
const handleSearch = debounce(() => {
    isLoading.value = true;
    // 模拟API请求延迟
    setTimeout(() => {
        displayData.value = rawData.value.filter(p =>
            p.name.includes(searchQuery.value) || p.category.includes(searchQuery.value)
        );
        isLoading.value = false;
    }, 400);
}, 300);

/*4.核心算法:扁平转树形
为什么要前端自己转化数据：
1.数据库友好:数据库存储白牛皮数据,如果再后端查询无限层级的树，
需要复杂的递归查询或存储过程，对数据库性能消耗很大
2.数据灵活性：前端拿到扁平数据，可以根据需求灵活处理，不同场景展现
3.计算下移：vue3配合优化客户端性能，处理几千条数据的树形转化只需要几毫秒，
将计算压力从服务器下移到客户端，是高并发架构中场景的优化策略
4.封装的arrToTree使用map映射，时间复杂度o(n)
*/ 
const arrToTree = (items: TreeNode[]):TreeNode[] =>{
    const result : TreeNode[] = [];
    const itemMap: Record<number,TreeNode> = {};

    for (const item of items) {
        itemMap[item.id] = {...item,children: []};
    }

    for (const item of items) {
        const id = item.id;
        const pid = item.pid;
        const treeItem = itemMap[id];

        if (pid === 0) {
            result.push(treeItem);
        }else{
            if (itemMap[pid]) {
                itemMap[pid].children?.push(treeItem);
            }
        }
    }
    return result;
}
// 监听搜索词变化
watch(searchQuery, () => handleSearch());

//开启编辑模式
const onEdit = (row:Project) =>{
    //1.保存一份快照，用于对比和回滚
    originalItem.value = row;

    //2.通过深拷贝创建一个全新的副本给表单使用
    //这样用户在表单里随便改，都不会影响原始的row对象
    editingItem.value = deepClone(row);

};
const onCancel = () => {
    editingItem.value = null;//直接丢弃副本,原数据保持不变
};
// 确定保存
const onSave = async () =>{
    if (!editingItem.value) return;
    isSaving.value = true;
    try {
        // 1.调用接口提交editingItem.value
        await updateProjectApi(editingItem.value);
        // 2.后端成功后，更新本地原始库rawData
        const index = rawData.value.findIndex(p => p.id === editingItem.value?.id);
        if (index !== -1) {
            rawData.value[index] = deepClone(editingItem.value);
        }

        //3.刷新视图并关闭
        handleSearch();
        onCancel();
        alert('保存成功');

    } catch (error) {
        alert('保存失败，请检查网络');
    }finally{
        isSaving.value = false;
    }
}
// 取消编辑

//初始化加载数据
const initTreeData = async() =>{
    isLoadingTree.value = true;
    try {
        const res = await request<TreeNode[]>({url:'/departments'});
        //调用算法后转化后再赋值
        treeData.value = arrToTree(res);
    } catch (error) {
        console.error('加载组织架构失败',error);
    }finally{
        isLoadingTree.value = false;
    }
}

const handleOpenModal = () =>{
    isModalVisible.value = true;
};

const onModalConfirm = () =>{
    console.log('用户在子组件点了确认,父组件执行保存逻辑');
    isModalVisible.value = false;
}
onMounted(() => {
    initPageData();
    initTreeData();
});
</script>
<template>
    <div class="manager-container">
        <!-- 错误提示 -->
         <div v-if="errorMessages" class="error-banner">{{ errorMessages }}</div>
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
                        <button @click="onEdit(item)">编辑</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- 编辑模态框(展示深拷贝应用) -->
        <BaseModal
        :model-value="!!editingItem"
        title="修改项目信息"
        @confirm="onSave"
        @update:model-value="onCancel">
        <div v-if="editingItem" class="edit-from">
            <div class="form-item">
                <label >项目名称：</label>
                <input v-model="editingItem.name"/>
            </div>
            <div class="form-item">
                <label >预算(元)：</label>
                <input v-model.number="editingItem.budget" type="number">
            </div>
            <p v-if="isSaving" class="saving-tip">正在同步到后端</p>
        </div>
        </BaseModal>
        <!-- 组织架构面板 -->
         <div class="tree-panel">
            <h3>集团组织架构</h3>
            <div v-if="isLoadingTree">加载架构中...</div>
            <div v-else class="tree-root">
                <TreeItem
                v-for="root in treeData"
                :key="root.id"
                :node="root"
                @node-click ="(node) =>console.log('点击了：',node.name)"/>
            </div>
         </div>
    </div>
    
</template>
<style scoped>
/* 保持原有样式并增加 */
.error-banner { background: #fff2f0; color: #ff4d4f; padding: 10px; border: 1px solid #ffccc7; margin-bottom: 10px; border-radius: 4px; }
.edit-form { display: flex; flex-direction: column; gap: 15px; }
.form-item { display: flex; align-items: center; justify-content: space-between; }
.form-item input { padding: 5px; border: 1px solid #ddd; border-radius: 4px; width: 70%; }
.saving-tip { font-size: 12px; color: #1890ff; text-align: right; }
.tree-panel { margin-top: 30px; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
.btn-edit { color: #1890ff; border: none; background: none; cursor: pointer; }
</style>