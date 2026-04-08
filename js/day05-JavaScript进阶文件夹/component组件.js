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
2.定义弹窗类Modal（继承BasePlugin）
作用：实现弹窗特有的默认配置
*/
class Modal extends BasePlugin {
    // 拖拽相关的内部状态，全部设为私有
    #dragStartX = 0;
    #dragStartY = 0;
    #modalStartX = 0;
    #modalStartY = 0;
    #moveHandler = null;
    #upHandler = null;
    #draggingContent = null;
    //单例模式：防止重复创建多个弹窗实例
    static instance = null;
    static getInstance(options = {}) {
        if (!Modal.instance) {
            Modal.instance = new Modal(options);
        }else{
            Object.assign(Modal.instance.options,options);
            Modal.instance.updateContent(options);
        }
        return Modal.instance;
    }
    // 重写：提供弹窗的默认配置
    getDefaultOptions() {
        return {
            title: "提示",
            content: "这是弹窗内容",
            zIndex: 999,
            closeOnEsc: true,//按esc关闭
            closeOnOverlay: true,//点击遮罩层关闭
            draggable: true,//允许拖拽
            onConfirm: () => { },//确认回调
            onCancel: () => { }, //取消回调
        };
    }
    //重写：实现弹窗的DOM渲染
    render() {
        const el = document.createElement('div');
        el.className = 'modal-overlay';
        el.style.display = 'none'; //默认隐藏
        el.style.zIndex = this.options.zIndex;
        //填充内容（使用模板字符串）
        el.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${this.options.title}</h3>
                            <button class="modal-close">×</button>
                        </div>
                        <div class="modal-body">
                            <p>${this.options.content}</p>
                        </div>
                        <div class="modal-buttons">
                            <button class="modal-cancel">取消</button>
                            <button class="modal-confirm">确认</button>
                        </div>
                    </div>`;
        // 返回创建的元素
        this.#setContent(el);
        return el;
    }
    // 安全设置
    #setContent(el){
        if(!el) return;
        const titleEl = el.querySelector('.modal-header h3');
        if(titleEl) titleEl.textContent = this.options.title;
        const contentEl = el.querySelector('.modal-body p');
        if(contentEl) contentEl.textContent = this.options.content;    
    }
    //更新内容方法
    updateContent(options = {}){
        Object.assign(this.options,options);
        if (this.element) {
            this.#setContent(this.element);
        }else if( this.isInitialized) {
            this.init();
        }
  
        return this;
    }
    // 拓展：绑定弹窗特有的事件
    bindEvents() {
        const header = this.element.querySelector('.modal-header');
        const closeBtn = this.element.querySelector('.modal-close');
        const confirmBtn = this.element.querySelector('.modal-confirm');
        const cancelBtn = this.element.querySelector('.modal-cancel');
        //关闭按钮事件
        this._addEventListener(closeBtn, 'click', this.#handleCancel);
        // 确认/取消按钮事件
        this._addEventListener(confirmBtn, 'click', this.#handleConfirm);
        this._addEventListener(cancelBtn, 'click', this.#handleCancel);
        //点击遮罩层关闭
        if (this.options.closeOnOverlay) {
            this._addEventListener(this.element, 'click', this.#handleOverlayClick);
        }
        //ESC关闭
        if (this.options.closeOnEsc) {
            this._addEventListener(document, 'keydown', this.#handleEscKey);
        }
        // 拖拽功能
        if (this.options.draggable) {
            this._addEventListener(header, 'mousedown', this.#onDragStart);
        }
    }
    // 私有事件处理函数
    #handleCancel() {
        this.options.onCancel();
        this.hide();
    }
    #handleConfirm() {
        this.options.onConfirm();
        this.hide();
    }
    #handleOverlayClick(e) {
        if (e.target === this.element) {
            this.hide();
        }
    }
    #handleEscKey(e) {
        if (e.key === 'Escape' && this.element.style.display !== 'none') {
            this.hide();
        }
    }
    // ✅ 修复后的拖拽功能实现
    #onDragStart(e) {
        e.preventDefault();
        // 记录鼠标初始位置和弹窗初始位置
        this.#draggingContent = this.element.querySelector('.modal-content');
        this.#dragStartX = e.clientX;
        this.#dragStartY = e.clientY;
        this.#modalStartX = this.#draggingContent.offsetLeft;
        this.#modalStartY = this.#draggingContent.offsetTop;
        // 提前绑定this，确保私有成员可访问
        this.#moveHandler = this.#onDragMove.bind(this);
        this.#upHandler = this.#onDragEnd.bind(this);
        // ✅ 修复：mouseup绑定正确的upHandler
        document.addEventListener('mousemove', this.#moveHandler);
        document.addEventListener('mouseup', this.#upHandler);
        // 鼠标移出窗口也能触发mouseup
        document.addEventListener('mouseleave', this.#upHandler);
    }
    #onDragMove(e) {
        if (!this.#draggingContent) return;
        e.preventDefault();
        // 计算偏移量
        const deltaX = e.clientX - this.#dragStartX;
        const deltaY = e.clientY - this.#dragStartY;
        // ✅ 修复：使用弹窗初始位置计算新坐标
        let newLeft = this.#modalStartX + deltaX;
        let newTop = this.#modalStartY + deltaY;
        // ✅ 修复：拼写错误，正确获取弹窗高度
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const modalWidth = this.#draggingContent.offsetWidth;
        const modalHeight = this.#draggingContent.offsetHeight;
        // 边界限制，防止拖出屏幕
        newLeft = Math.max(0, Math.min(newLeft, windowWidth - modalWidth));
        newTop = Math.max(0, Math.min(newTop, windowHeight - modalHeight));
        // 应用新位置
        this.#draggingContent.style.left = `${newLeft}px`;
        this.#draggingContent.style.top = `${newTop}px`;
    }
    #onDragEnd(e) {
        document.removeEventListener('mousemove', this.#moveHandler);
        document.removeEventListener('mouseup', this.#upHandler);
        document.removeEventListener('mouseleave', this.#upHandler);
        // 重置拖拽状态
        this.#draggingContent = null;
        this.#moveHandler = null;
        this.#upHandler = null;
    }
}
/*
3.使用示例
*/
document.addEventListener('DOMContentLoaded', () => {
    // 1.实例化弹窗（传入自定义配置）
    const myModal = new Modal({
        title: '业务提示',
        content: '您确定要提交这份表单吗？',
        onConfirm: () => {
            console.log('用户点击了确认');
            // 这里可以写表单的逻辑
        },
        onCancel: () => {
            console.log('用户点击了取消');
        }
    });
    // 2.点击按钮打开弹窗
    document.getElementById('openModal').addEventListener('click', () => {
        myModal.show();
    });
});