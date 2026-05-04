<script setup lang="ts">
import { watch, onMounted } from "vue";
import { useRoute,useRouter } from "vue-router";
import { useTagViewStore } from "../store/tagsView";

const route = useRoute();
const router = useRouter();
const tagsViewStore = useTagViewStore();

//自动将当前路由添加到页签栏
const addTags = () =>{
    if (route.name) {
        tagsViewStore.addView(route);
    }
};

//检查是否是当前激活的页签
const isActive = (tagPath: string) =>{
    return tagPath === route.path;
};

//关闭页签逻辑
const closeSelectedTag = async (view: any) =>{
    const { visitedViews} = await tagsViewStore.delView(view);

    //如果关闭的是当前正在看的页签，需要自动跳转到前一个页签
    if (isActive(view.path)) {
        const  latestView = visitedViews.slice(-1)[0];
        if (latestView) {
            router.push(latestView.fullPath);
        }else{
            router.push('/');//如果全关了，跳回首页
        }
    }
};

//监听路由变化，一旦路由改变，立刻存入Pinia
watch(route,() =>{
    addTags();
});

onMounted(() =>{
    addTags();
})
</script>
<template>
    <div class="tags-view-container">
        <router-link
        v-for="tag in tagsViewStore.visitedViews"
        :key="tag.path"
        :to="tag.path"
        class="tags-view-item"
        :class="{active: isActive(tag.path)}">
            <span class="tag-title">{{ tag.title || tag.meta?.title }}</span>
            <span
            v-if="tagsViewStore.visitedViews.length> 1"
            class="icon-close"
            @click.prevent.stop="closeSelectedTag(tag)">
                <el-icon><i-ep-close /></el-icon>
            </span>
        </router-link>
    </div>
</template>
<style scoped>
.tags-view-container {
    height: 34px;
    width: 100%;
    background: #fff;
    border-bottom: 1px solid #d8dce5;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
    display: flex;
    align-items: center;
    padding: 0 15px;
    gap: 8px;
    overflow-x: auto;
    flex-shrink: 0;
}
.tags-view-container::-webkit-scrollbar {
    display: none;
}
.tags-view-item {
    display: inline-flex;
    align-items: center;
    position: relative;
    cursor: pointer;
    height: 28px;
    border: 1px solid #e4e7ed;
    color: #606266;
    background: #fff;
    padding: 0 12px;
    font-size: 13px;
    text-decoration: none;
    border-radius: 4px;
    transition: all 0.3s cubic-bezier(.645,.045,.355,1);
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}
.tags-view-item:hover {
    color: #409eff;
    border-color: #c6e2ff;
    background-color: #ecf5ff;
}
.tags-view-item.active {
    background-color: #409eff;
    color: #fff;
    border-color: #409eff;
    box-shadow: 0 2px 4px rgba(64,158,255,0.2);
}
.tags-view-item.active::before {
    content: '';
    background: #fff;
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
}
.icon-close {
    margin-left: 8px;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.3s;
}
.icon-close:hover {
    background-color: #f56c6c;
    color: #fff;
}
.tags-view-item.active .icon-close:hover {
    background-color: rgba(255,255,255,0.3);
}
</style>