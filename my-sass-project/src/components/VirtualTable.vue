<!-- src/components/VirtualTable.vue -->
<script setup lang="ts" generic="T extends { id: number | string }">
import { ref, computed } from 'vue';

const props = withDefaults(defineProps<{
  data: T[];              // 后端返回的总数据
  itemHeight: number;     // 每一行固定的高度 (px)
  viewHeight: number;     // 容器可视高度 (px)
}>(), {
data: () =>[],
itemHeight: 50
})

const emit = defineEmits(['row-click']);
const scrollTop = ref(0);

// 1. 计算撑开滚动条的总高度
const phantomHeight = computed(() => props.data.length * props.itemHeight);

// 2. 计算可视区域显示的条数（预留 2 个缓冲区防止留白）
const visibleCount = computed(() => Math.ceil(props.viewHeight / props.itemHeight) + 2);

// 3. 计算当前滚动到了第几个（起始索引）
const startIndex = computed(() => Math.floor(scrollTop.value / props.itemHeight));

// 4. 计算结束索引
const endIndex = computed(() => startIndex.value + visibleCount.value);

// 5. 核心：截取当前要显示的数据段
const visibleData = computed(() => {
  return props.data.slice(startIndex.value, endIndex.value);
});

// 6. 核心：计算内容层的偏移量（让数据始终出现在视野内）
const offsetY = computed(() => startIndex.value * props.itemHeight);

// 监听滚动事件
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  scrollTop.value = target.scrollTop;
};

// 暴露点击行的方法
const handleRowClick = (row: T) => {
  emit('row-click', row);
};
</script>

<template>
  <div 
    class="v-table-container" 
    :style="{ height: viewHeight + 'px' }" 
    ref="containerRef"
    @scroll="handleScroll"
  >
    <!-- 幻象层：负责把滚动条撑开 -->
    <div class="v-table-phantom" :style="{ height: phantomHeight + 'px' }"></div>

    <!-- 内容层：实际渲染数据的容器 -->
    <div class="v-table-content" :style="{ transform: `translateY(${offsetY}px)` }">
      <!-- 列表行 -->
      <div 
        v-for="item in visibleData" 
        :key="item.id" 
        class="v-table-row"
        :style="{ height: itemHeight + 'px', lineHeight: itemHeight + 'px' }"
        @click="handleRowClick(item)"
      >
        <!-- 作用域插槽：方便外部自定义列内容 -->
        <slot :row="item"></slot>
      </div>
      
      <!-- 无数据提示 -->
      <div v-if="data.length === 0" class="no-data">暂无匹配数据</div>
    </div>
  </div>
</template>

<style scoped>
.v-table-container {
  overflow-y: auto;
  position: relative;
  background: #fff;
  border: 1px solid #ebeef5;
}

.v-table-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.v-table-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

.v-table-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  box-sizing: border-box;
  padding: 0 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.v-table-row:hover {
  background-color: #f5f7fa;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style>
