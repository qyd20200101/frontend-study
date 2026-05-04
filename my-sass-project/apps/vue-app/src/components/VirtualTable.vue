<script setup lang="ts" generic="T extends { id: number | string }">
import { ref, computed } from 'vue';

const props = withDefaults(defineProps<{
  data: T[];
  itemHeight: number;
  viewHeight: number;
}>(), {
  data: () => [],
  itemHeight: 50
})

const emit = defineEmits(['row-click']);
const scrollTop = ref(0);

const phantomHeight = computed(() => props.data.length * props.itemHeight);
const visibleCount = computed(() => Math.ceil(props.viewHeight / props.itemHeight) + 2);
const startIndex = computed(() => Math.floor(scrollTop.value / props.itemHeight));
const endIndex = computed(() => startIndex.value + visibleCount.value);
const visibleData = computed(() => props.data.slice(startIndex.value, endIndex.value));
const offsetY = computed(() => startIndex.value * props.itemHeight);

const handleScroll = (e: Event) => {
  scrollTop.value = (e.target as HTMLElement).scrollTop;
};
</script>

<template>
  <div class="v-table-container" :style="{ height: viewHeight + 'px' }" @scroll="handleScroll">
    <div class="v-table-phantom" :style="{ height: phantomHeight + 'px' }"></div>
    <div class="v-table-content" :style="{ transform: `translateY(${offsetY}px)` }">
      <div v-for="item in visibleData" :key="item.id" class="v-row-box" :style="{ height: itemHeight + 'px' }"
        @click="emit('row-click', item)">
        <slot :row="item"></slot>
      </div>
      <div v-if="data.length === 0" class="no-data">暂无匹配数据</div>
    </div>
  </div>
</template>

<style scoped>
.v-table-container {
  overflow-y: auto;
  position: relative;
  background: #fff;
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

.v-row-box {
  width: 100%;
  box-sizing: border-box;
}

/* 🚀 纯净容器 */
.no-data {
  text-align: center;
  color: #909399;
  padding: 40px;
}
</style>