import { defineStore } from "pinia";
import { ref } from "vue";
import type{ RouteLocationNormalized } from "vue-router";


// 🚀 核心修复 1：定义一个继承官方路由对象，并包含可选 title 属性的新类型
export type TagView = RouteLocationNormalized & { title?: string };
export const useTagViewStore = defineStore('tagView',() =>{
    //VisitedViews用于渲染顶部页签UI
    const visitedViews = ref<TagView[]>([]);
    //cacheeViews用于keep-alive缓存
    const cacheViews = ref<string[]>([]);

    //添加视图（同时添加到UI列表和缓存列表）
    const addView = (view: TagView) =>{
        addVisitedView(view);
        addCacheView(view);
    };

    const addVisitedView = (view: TagView) =>{
        //如果已经存在，就不重复添加
        if (visitedViews.value.some(v => v.path === view.path)) return;
        //深拷贝一份，防止路由对象被意外修改
        visitedViews.value.push(Object.assign({},view,{title: view.meta?.title}));
    }

    const addCacheView = (view:TagView) =>{
        const viewName = view.name as string;
        if (!viewName || cacheViews.value.includes(viewName)) return;
        //只要meta中没有明确禁止缓存(noCache:ture)就加入缓存队列
        if (!view.meta?.noCache) {
            cacheViews.value.push(viewName);
        }
    };

    //删除视图
    const delView = (view: TagView) =>{
        return new Promise<{visitedViews: any[], cacheeViews:string[]}>((resolve) =>{
            const i = visitedViews.value.findIndex(v => v.path === view.path);
            if (i > -1) visitedViews.value.splice(i,1);

            const index = cacheViews.value.indexOf(view.name as string);
            if (index > -1) cacheViews.value.splice(index,1);

            resolve({
                visitedViews: [...visitedViews.value],
                cacheeViews: [...cacheViews.value]
            });
        });
    };

    return { visitedViews,cacheViews, addView, delView};
});