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
        class="tags=view-item"
        :class="{active: isActive(tag.path)}">
            {{ tag.title || tag.meta?.title }}
            <span
            v-if="tagsViewStore.visitedViews.length> 1"
            class="icon-close"
            @click.prevent.stop="closeSelectedTag(tag)">
                X
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
    height: 26px;
    border: 1px solid #d8dce5;
    color: #495060;
    background: #fff;
    padding: 0 10px;
    font-size: 12px;
    text-decoration: none;
    border-radius: 4px;
    transition: all 0.3s;
}
.tags-view-item.active {
    background-color: #409eff;
    color: #fff;
    border-color: #409eff;
}
.icon-close {
    margin-left: 6px;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    line-height: 12px;
    text-align: center;
    font-size: 14px;
    transition: all 0.3s;
}
.icon-close:hover {
    background-color: rgba(0,0,0,0.2);
    color: #fff;
}
</style>