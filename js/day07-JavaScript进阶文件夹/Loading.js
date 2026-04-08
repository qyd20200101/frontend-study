/*
1.定义通用组件基类BasePlugin
作用：封装所有组件都需要的通用能力
*/
class BasePlugin {
    // 私有属性：外部+子类 均无法直接访问/修改
    #options; //组件配置（只读）
    #element = null; //组件根DOM元素
    #isInitialized  = false; //初始化状态
    #eventHandlers = new Map(); //事件处理器映射（自动清理内存）
    // 构造函数:接受配置，初始化默认值
    constructor(options = {}) {
        // 合并默认配置和用户配置（原型链上的默认值会被实例配置覆盖）
        this.#options = {
            ...this.getDefaultOptions(),//子类可以重写这个方法提供的默认配置
            ...options
        };
    }
    // 提供一个受包含的getter来让子类访问options
    get options() {
        return this.#options;
    }
    // 同样为element提供getter
    get element() {
        return this.#element;
    }
    get isInitialized(){
        return this.#isInitialized;
    }
    //获取默认配置（留空，让子类去实现）
    getDefaultOptions() {
        return {};
    }
    render() {
        throw new Error("子类必须实现render()方法");
    }
    //绑定事件（钩子方法：子类可以选择是否拓展）
    bindEvents() {
        // 基类可以留空，或者绑定一些通用事件
    }
    //初始化入口（模板方法模式：定义执行流程）
    init() {
        if (this.#isInitialized) return;//防止重复初始化
        this.#render();//渲染DOM事件
        this.#bindEvents();//绑定事件
        this.#isInitialized = true;
        return this; //支持链式调用
    }
    //将render和bindEvents变成私有，因为它们不应该被外部直接调用
    #render() {
        const el = this.render();
        // 子类实现的render返回DOM元素
        if (!(el instanceof HTMLElement)) {
            throw new Error("render()方法必须返回一个HTMLElement实例");
        }
        this.#element = el;
        const container = this.options.container || document.body;
        container.appendChild(this.#element);
    }
    #bindEvents() {
        // 调用了子类可能拓展的bindEvents
        this.bindEvents();
    }
    // 统一事件绑定方法，自动记录处理器
    _addEventListener(element, event, handler) {
        const boundHandler = handler.bind(this);
        element.addEventListener(event, boundHandler);
        if (!this.#eventHandlers.has(element)) {
            this.#eventHandlers.set(element, new Map());
        }
        const eventMap = this.#eventHandlers.get(element);
        let handlers = eventMap.get(event);
        if (!Array.isArray(handlers)) {
            handlers = [];
            eventMap.set(event,handlers);
        }
        handlers.push(boundHandler);
        return boundHandler;
    }
    _removeEventListener(element,event,handler){
        if (!this.#eventHandlers.has(element)) return;
        const eventMap = this.#eventHandlers.get(element);
        if (!eventMap.has(event)) return;
        const handlers = eventMap.get(event);
        const index = handlers.indexOf(handler);
        if (index > -1) {
            element.removeEventListener(event,handlers[index]);
            handlers.splice(index,1);
            if (handlers.length === 0) {
                eventMap.delete(event);
            }
            if (eventMap.size === 0) {
                this.#eventHandlers.delete(element);
            }
        }
    }
    // ---以下是公共API---
    //显示组件
    show() {
        if (!this.#isInitialized) this.init();
        if (this.#element) this.#element.style.display = 'flex';
        return this; //支持链式调用
    }
    // 隐藏组件
    hide() {
        if (this.#element) this.#element.style.display = 'none';
        return this;
    }
    //销毁组件（重要：清理DOM和事件，防止内存泄露）
    destroy() {
        if (this.#element) {
            // 先解绑所有事件
            this.#eventHandlers.forEach((eventMap, element) => {
                eventMap.forEach((handlers, event) => {
                    handlers.forEach((handler) =>{
                        element.removeEventListener(event,handler);
                    })
                })
            });
            this.#eventHandlers.clear();
            this.#element.remove();
            this.#element = null;
        }
        this.#isInitialized = false;
        // 清除单例引用（如果时单例模型）
        if (this.constructor.instance === this) {
            this.constructor.instance = null;
        }
    }
}

/*
Loading加载组件
全局全屏加载
Loading.show('加载中...')
setTimeout(() =>Loading.hide(),2000)

// 局部加载
const loading = Loading.show({target: '#app',text:'数据加载中'});
setTimeout(() =>loading.hide(),2000);
*/ 
class Loading extends BasePlugin{
    // 全局单例（全屏加载唯一实例）
    static #globalInstance = null;

    //默认配置
    getDefaultOptions() {
        return {
            text: '加载中', //加载文字
            showSpinner: true, //是否显示旋转图标
            mask: true, //是否显示半透明遮罩
            target: null,//挂载目标（null表示全屏）
            zIndex: 9998 //层级
        };
    }

    //渲染DOM
    render() {
        const el = document.createElement('div');
        el.className = `loading${this.options.mask? 'loading-mask': ''}`;
        el.style.zIndex = this.options.zIndex;

        //局部加载使用绝对定位
        if (this.options.target) {
            el.style.position = 'absolute';
        }

        el.innerHTML = `
        <div class="loading-content">
            ${this.options.showSpinner ? `<div class="loading-spinner"></div>`: ''}
            <span class="loading-text">${this.options.text}</span>
            </div>`;
        return el;
    }

    // 重写show方法，处理局部加载的定位
    show(){
        super.show();

        // 局部加载：设置父元素为相对定位
        if (this.options.target) {
            const targetEl = document.querySelector('this.options.target');
            if (targetEl) {
                targetEl.style.position = 'relative';
                targetEl.appendChild(this.element);
            }
        }
         return this;
    }

    // 重写destroy方法，恢复父元素定位
    destroy() {
        if (this.options.target) {
            const targetEl = document.querySelector(this.options.target);
            if (targetEl && targetEl.style.position === 'relative') {
                targetEl.style.position = '';
            }
        }

        super.destroy();
    }

    // 核心静态方法：显示加载
    static show(options ={}){
        if (typeof options === 'string') {
            options= {text: options};
        }

        // 全局加载使用单例
        if (!options.target) {
            if (!this.#globalInstance) {
                this.#globalInstance = new Loading();
            }else{
                // 更新配置
                Object.assign(this.#globalInstance.options,options);
                this.#globalInstance.element.querySelector('.loading-text').textContent = options.text;
            }

            this.#globalInstance.show();
            return this.#globalInstance;
        }

        // 局部加载创建新实例
        const loading = new Loading(options);
        loading.show();
        return loading;
    }

    // 静态方法：隐藏全局加载
    static hide(){
        if (this.#globalInstance) {
            this.#globalInstance.hide();
            this.#globalInstance.destroy();
            this.#globalInstance = null;
        }
    }
}


// 显示默认加载
Loading.show();

//显示自定义数字
Loading.show('正在提交数据...');

//3秒后隐藏
setTimeout(() =>{
    Loading.hide();
},3000);