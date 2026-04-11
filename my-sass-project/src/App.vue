<script setup lang="ts">
import UserInfoCard from './components/UserInfoCard.vue'
import OrderDashboard from './components/OrderDashboard.vue';
import   DataManager  from "./components/DataManager.vue";
import SmartSearch  from "./components/SmartSearch.vue";
import { id } from 'element-plus/es/locale/index.mjs';
</script>

<template>
  <main>
    <!-- <UserInfoCard></UserInfoCard> -->
    <!-- <OrderDashboard></OrderDashboard> -->
     <!-- <SmartSearch></SmartSearch> -->
     <DataManager></DataManager >  
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
