<script setup lang="ts">
import UserInfoCard from './components/UserInfoCard.vue'
import OrderDashboard from './components/OrderDashboard.vue';
import   DataManager  from "./components/DataManager.vue";
import SmartSearch  from "./components/SmartSearch.vue";
import TreeItem from "./components/TreeItem.vue";
import { ref } from 'vue';
import { id } from 'element-plus/es/locale/index.mjs';
const treeData = ref([
  {id: 1,name: '西安'}
]);

const handleNodeClick = (node: any) =>{
  console.log('当前选中的部门是:',node.name);
};
</script>

<template>
  <main>
    <!-- <UserInfoCard></UserInfoCard> -->
    <!-- <OrderDashboard></OrderDashboard> -->
     <!-- <SmartSearch></SmartSearch> -->
     <DataManager></DataManager >
      <div class="tree-container">
        <h3>企业部门架构（无线层级）</h3>
        <TreeItem 
        v-for="root in treeData"
        :key="root.id"
        :node="root"
        @node-click="handleNodeClick">

        </TreeItem>
      </div>
        
  </main>
</template>
<style scoped>
  /* main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
} */
</style>
