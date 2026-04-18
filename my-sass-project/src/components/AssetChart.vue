<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps<{
    title: string;
    data: { name: string; value: number; }[];
}>();

const chartRef = ref<HTMLElement | null>(null);
let myChart: echarts.ECharts | null = null;

const emit = defineEmits(['bar-click']);
const initChart = () => {
    if (!chartRef.value) return;
    myChart = echarts.init(chartRef.value);

    myChart.on('click',(params) =>{
        emit('bar-click',params.name);
    })
    //封装图标组件时，父子组件的数据结构不一样时
    /*
    /组件纯洁性:
    1.屏蔽业务细节：AssetChart是通用的ui组件，不知道业务层详细数据，
    所以i.budget不能出现，
    2.数据转换层：父组件使用computed作为转换器，将特定业务对象数组映射标准化
    {name：value}格式
    3.双向契约：父组件父子归一化，子组件通过TS泛型严格约束输入契约
    */
    const option = {
        title: { text: props.title, left: 'center', textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: props.data.map(i => i.name) },
        yAxis: { type: 'value' },
        series: [{
            //组件纯洁性
            data: props.data.map(i => i.value),
            type: 'bar',
            showBackground: true,
            backgroundStyle: { color: 'rgba(180, 180, 180, 0.2)' },
            itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] }
        }]
    };
    myChart.setOption(option);
};

//处理窗口缩放
const handleResize = () => {
    myChart?.resize();
}
//监听数据变化刷新图表
watch(() => props.data, (newData) => {
    if (newData.length > 100) {
        console.warn('数据量过大，图标进入限流模式');
    }
    myChart?.setOption({
        xAxis: { data: props.data.map(i => i.name) },
        //数据归一化：父组件负责将业务数据（budget）“翻译”成子组件认识的标准数据value
        series: [{ data: props.data.map(i => i.value) }]
    });
}, { deep: false });
onMounted(() => {
    initChart();
    window.addEventListener('resize', handleResize);
});


//防止内存泄露
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    myChart?.dispose();
});
</script>
<template>
    <div ref="chartRef" class="chart-container"></div>
</template>
<style scoped>
.chart-container {
    width: 100%;
    height: 300px;
    padding: 15px;
    border-radius: 8px;
    background: #fff;

}
</style>