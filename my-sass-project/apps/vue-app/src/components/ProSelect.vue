<!-- 字典组件 -->
<script setup lang="ts">
import { onMounted, ref ,computed} from "vue";
import { getDictByCodeApi } from "../api/dict";
import type { DictItem } from "../api/dict";

 type proxyValue =string | number | boolean | (string | number)[];

//定义组件特有的业务Props
const props = defineProps<{
  // 如果你把一个 boolean 传给了 status，TS 会直接在编译阶段报错
  modelValue: proxyValue;
  dictCode: string;
}>();
const emit = defineEmits<{
    'update:modelValue':[val:proxyValue]
}>();

//核心创建一个代理计算属性
const proxyValue = computed ({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue',val)
});


const options = ref<DictItem[]>([]);
const isLoading = ref(false);

//核心业务逻辑：组件挂载是自动请求字典数据
const  fetchDictData = async () =>{
    if (!props.dictCode) return
    isLoading.value = true;
    try {
        const res:any = await getDictByCodeApi(props.dictCode);
        options.value = res;
    } catch (error) {
        console.error(`获取字典[${props.dictCode}]失败：`,error);
    }finally{
        isLoading.value = false;
    }
}

onMounted( () =>{
    fetchDictData();
})
</script>
<template>
    <el-select
    :model-value="proxyValue"
    :loading="isLoading"
    placeholder="请选择"
    v-bind="$attrs"
    class="pro-select">
    <el-option
    v-for="item in options"
    :key="item.value"
    :label="item.label"
    :value="item.value">

    </el-option>
    </el-select>
</template>
<style scoped>
.pro-select {
    width: 70%; 
}
</style>