<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

//模拟后端数据
interface Order {
    id: number;
    name: string;
    price: number;
    count: number;
    status: 'paid' | 'unpaid';
}

const orders = reactive < Order[] > ([
    { id: 1, name: '华为手机 (西安高新店)', price: 5999, count: 1, status: 'paid' },
    { id: 2, name: '立项说明书打印', price: 10, count: 50, status: 'paid' },
    { id: 3, name: '办公耗材', price: 200, count: 2, status: 'unpaid' }
]);

const filterStatus = ref < 'all' | 'paid' | 'unpaid' > ('all');

// 核心知识点:Computed+Array Methods
// 1.过滤后的列表
const filterOrders = computed(() => {
    if (filterStatus.value === 'all') return orders;
    return orders.filter(item => item.status === filterStatus.value);
})

//2.统计已付金额(利用手写myReduce的逻辑)
const totalAmount = computed(() => {
    return filterOrders.value.reduce((acc, cur) => acc + (cur.price * cur.count), 0);

});

//操作方法
const toggleStatus = (id: number) => {
    const order = orders.find(o => o.id === id);
    if (order) {
        order.status = order.status === 'paid' ? 'unpaid' : 'paid';
    }
};
</script>
<template>
    <div class="dashboard">
        <h3>企业订单看板</h3>
        <!-- 筛选器 -->
        <div class="filter">
            <button @click="filterStatus = 'all'">全部</button>
            <button @click="filterStatus = 'paid'">已支付</button>
            <button @click="filterStatus = 'unpaid'">未支付</button>
        </div>

        <!-- 列表展示 -->
        <table>
            <thead>
                <tr>
                    <th>项目</th>
                    <th>单价</th>
                    <th>数量</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <th v-for="order in filterOrders" :key="order.id">
                    <td>{{ order.name }}</td>
                    <td>{{ order.price }}</td>
                    <td>{{ order.count }}</td>
                    <td>
                        <span :class="order.status">{{ order.status === 'paid'? '已入账':'待处理' }}</span>
                    </td>
                    <td>
                        <button @click="toggleStatus(order.id)">切换状态</button>
                    </td>
                </th>
            </tbody>
        </table>

        <!-- 汇总统计 -->
         <div class="summary">
            <h4>当前筛选汇总
                <span class="highlight">{{ totalAmount }}元</span>
            </h4>
         </div>
    </div>
</template>
<style scoped>
.dashboard{
    padding: 20px;
    background: #fff;
    border-radius: 8px;
}
.filter{
    margin-bottom: 15px;
}
.paid{
    color: green;
}
.unoaid{
    color: red;
}
.highlight{
    color: #2ecc71;
    font-size: 1.2em;
}
table{
    margin-top: 10px;
    width: 100%;
    border-collapse: collapse;
}
th,td{
    padding: 10px;
    border: 1px solid #eee;
    text-align: left;
}
</style>
