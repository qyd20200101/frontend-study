<script setup lang="ts">
</script>

<template>
  <!-- router-view是路由的出口，匹配到的组件（Login,DataManager）都会渲染 -->
  <router-view/>
</template>
<style>
html,body, #app{
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: Arial, Helvetica, sans-serif;
  background: #f0f2f5;
}
#nprogress .bar{
  background: #1890ff;
}
</style>
