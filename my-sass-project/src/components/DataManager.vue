<script setup lang="ts">

/*
处理从后端获取的列表数据使用ref,优势：
1.重新赋值的灵活性,reactive定义的响应式对象不能直接被重新赋值，会丢失响应性
后端返回全新数组，必须用splice或push修改原数组，ref只需要rawdata.value = newArray
2.心智模型统一，统一使用ref减少编写.value的成本，让代码风格一致
3.类型追踪,ref在ts的类型推导清晰，结合接口定义，完美规避异步赋值地类型错误
*/ 
import { ref, reactive, computed, watch, onMounted } from "vue";
import { debounce, deepClone, mySum } from '../utils/engine';
import BaseModal from "./BaseModal.vue";
import TreeItem from "./TreeItem.vue";
import request from "../utils/request";

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
interface DeptNode{
    id:number;
    pid:number;
    name:string;
    children?: DeptNode[];
}
const rawData = ref<Project[]>([]);
const categories = ref<string[]>([]);
const stats = ref<DashboardStatus | null>(null);
const isLoading = ref(false);
const searchQuery = ref('');
const displayData = ref<Project[]>([]);
const editingItem = ref<Project | null>(null);
const errorMessages = ref(''); 
const isModalVisible = ref(false);

//响应式状态
const treeData = ref<DeptNode[]>([]);
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
    }, 500);
}, 400);
// 4.核心算法:扁平转树形
/*
为什么要前端自己转化数据：
1.数据库友好:数据库存储白牛皮数据,如果再后端查询无限层级的树，
需要复杂的递归查询或存储过程，对数据库性能消耗很大
2.数据灵活性：前端拿到扁平数据，可以根据需求灵活处理，不同场景展现
3.计算下移：vue3配合优化客户端性能，处理几千条数据的树形转化只需要几毫秒，
将计算压力从服务器下移到客户端，是高并发架构中场景的优化策略
4.封装的arrToTree使用map映射，时间复杂度o(n)
*/ 
const arrToTree = (items: DeptNode[]):DeptNode[] =>{
    const result : DeptNode[] = [];
    const itemMap: Record<number,DeptNode> = {};

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

// 编辑与深拷贝(数据安全)
const startEdit = (item: Project) => {
    // 关键点:使用深拷贝,编辑时不会影响原表格数据
    editingItem.value = deepClone(item);
};

const cancelEdit = () => {
    editingItem.value = null;//直接丢弃副本,原数据保持不变
};
//初始化加载数据
const initTreeData = async() =>{
    isLoadingTree.value = true;
    try {
        const res = await request<DeptNode[]>({url:'/departments'});
        //调用算法后转化后再赋值
        treeData.value = arrToTree(res);
    } catch (error) {
        console.error('加载组织架构失败',error);
    }finally{
        isLoadingTree.value = false;
    }
}
const saveEdit = () => {
    if (!editingItem.value) return;
    const index = rawData.value.findIndex(p => p.id === editingItem.value?.id);
    if (index !== -1) {
        rawData.value[index] = editingItem.value; //保存修改
        handleSearch();//刷新视图
    }
    editingItem.value = null;
};

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
    <div>
        <button @click="handleOpenModal">新增项目</button>
        <!-- 自定义使用弹窗组件 -->
         <!-- v-model="isModalVisible会自动对应modelValue属性和update:modelValue事件" -->
          <BaseModal v-model="isModalVisible"
          title="新增资产项目"
          @confirm="onModalConfirm">
        </BaseModal>
        <!-- 插槽内容：可以是复杂的表单 -->
         <div class="form-group">
            <input placeholder="请输入项目名称">
         </div>
    </div>
     <div class="tree-panel">
       <h3>XX集团组织架构（4级深度测试）</h3>
       <div v-if="isLoadingTree">加载架构中...</div>

       <!-- 渲染根列表 -->
        <div v-else class="tree-root">
            <TreeItem
            v-for="root in treeData"
            :key="root.id"
            :node="root"
            @node-click="(node) =>console.log('点击了：',node.name)"
            />
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
.tree-pamel{
    padding: 20px;
    margin-top: 20px;
    background: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,.1);
    border-radius: 8px;
}
.tree-root{
    padding-top: 10px;
    border-top: 1px solid #eee;
}
</style>