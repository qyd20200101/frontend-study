<script setup lang="ts">
import UserInfoCard from './components/UserInfoCard.vue';
</script>

<template>
  <main>
    <!-- 像使用HTML标签一样，使用组件 -->
    <UserInfoCard></UserInfoCard>
  </main>
</template>

<style scoped>
main{
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}
</style>