<script setup lang="ts">
import { ref,onMounted,onUnmounted,watch } from "vue";
import * as echarts from "echarts";

const props = defineProps<{
    title: string;
    data: any[];
}>();

const chartRef = ref<HTMLElement | null>(null);
let myChart: echarts.ECharts | null = null;

const initChart = () =>{
    if (!chartRef.value) return;
    myChart = echarts.init(chartRef.value);

    const option = {
        title: {text: props.title},
        tooltip: {},
        xAxis: {data:props.data.map(i => i.name)},
        yAxis: {},
        series: [{
            name: '预算',
            type: 'bar',
            data: props.data.map(i => i.budget),
            itemStyle: {color: '#1890ff'}
        }]
    };
    myChart.setOption(option);
};

//处理窗口缩放
const handleResize = () =>{
    myChart?.resize();

    onMounted(() =>{
        initChart();
        window.addEventListener('resize',handleResize);
    });

    //防止内存泄露
    onUnmounted(( ) =>{
        window.removeEventListener('resize',handleResize);
        myChart?.dispose();
    });

    //监听数据变化刷新图表
    watch(() => props.data,() =>{
        myChart?.setOption({
            xAxis: {data: props.data.map(i => i.name)},
            series: [{data: props.data.map(i => i.budget)}]
        });
    },{deep:true});
}
</script>
<template>
    <div ref="chartRef" class="chart-container"></div>
</template>
<style scoped>
.chart-container{
    width: 100%;
    height: 300px;
    padding: 15px;
    border-radius: 8px;
    background: #fff;

}
</style>