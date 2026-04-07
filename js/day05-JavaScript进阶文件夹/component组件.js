/*
1.定义通用组件基类BasePlugin
作用：封装所有组件都需要的通用能力
*/
class BasePlugin {
    // 构造函数:接受配置，初始化默认值
    constructor(options = {}) {
        // 合并默认配置和用户配置（原型链上的默认值会被实例配置覆盖）
        this.options = {
            ...this.getDefaultOptions(),//子类可以重写这个方法提供的默认配置
            ...options
        };
        this.element = null;//组件的DOM元素
        this.isIninitalized = false;//标记是否已初始化
        // 存储所有事件处理器，用于销毁时自动解绑（解决内存泄露）
        this._eventHandlers = new Map();
    }

    //获取默认配置（留空，让子类去实现）
    getDefaultOptions() {
        return {};
    }

    //初始化入口（模板方法模式：定义执行流程）
    init() {
        if (this.isIninitalized) return;//防止重复初始化
        this.render();//渲染DOM事件
        this.bindEvents();//绑定事件
        this.isIninitalized = true;
        return this; //支持链式调用
    }

    //渲染DOM（抽象方法：子类必须重写）
    render() {
        throw new Error("子类必须实现render()方法");
    }

    //绑定事件（钩子方法：子类可以选择是否拓展）
    bindEvents() {
        // 基类可以留空，或者绑定一些通用事件
    }

    // 统一事件绑定方法，自动记录处理器
    _addEventListener(element,event,handler){
        const boundHandler = handler.bind(this);
        element.addEventListener(event,boundHandler);

        if (!this._eventHandlers.has(element)) {
            this._eventHandlers.set(element,new Map());
        }
        this._eventHandlers.get(element).set(event,boundHandler);
    }
    _removeEventListener(element,event){
        if (!this._eventHandlers.has(element)) return;
        const eventMap = this._eventHandlers.get(element);
        if (!eventMap.has(event)) return;

        const handler = eventMap.get(event);
        element.removeEventListener(event,handler);
        // 从Map中删除记录
        eventMap.delete(event);
        // 清空空的元素条目
        if (eventMap.size === 0) {
            this._eventHandlers.delete(element);
        }
    }
    //显示组件
    show() {
        if (!this.isIninitalized) this.init();
        if (this.element) {
            this.element.style.display = 'flex';
        }
    }

    // 隐藏组件
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    //销毁组件（重要：清理DOM和事件，防止内存泄露）
    destroy() {
        if (this.element) {
            // 先解绑所有事件
            this._eventHandlers.forEach((eventMap, element) => {
                eventMap.forEach((handler, event) => {
                    element.removeEventListener(event, handler);
                })
            });
            this._eventHandlers.clear();

            // 移除DOM
            this.element.remove();
            this.element = null;
        }
        this.isIninitalized = false;
        // 清除单例引用（如果时单例模型）
        if (this.constructor.instance) {
            this.constructor.instance = null;
        }
        return this;
    }
}

/*
2.定义弹窗类MOdal（继承BasePlugin）
作用：实现弹窗特有的默认配置
*/
class Modal extends BasePlugin {
    //单例模式：防止重复创建多个弹窗实例
    static instance = null;

    static getInstance(options ={}) {
        if (!Modal.instance) {
            Modal.instance = new Modal(options);
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
            closeOnOverlay:true,//点击遮罩层关闭
            draggable: true,//允许拖拽
            onConfirm: () => { },//确认回调
            onCancel: () => { }, //取消回调
        };
    }

    //重写：实现弹窗的DOM渲染
    render() {

        //防止重复渲染
        if (this.element) return;

        // 创建弹窗的DOM结构
        this.element = document.createElement('div');
        this.element.className = 'modal-overlay';
        this.element.style.display = 'none'; //默认隐藏
        this.element.style.zIndex = this.options.zIndex;

        //填充内容（使用模板字符串）
        this.element.innerHTML = `
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

        //挂载到页面
        document.body.appendChild(this.element);
    }

    // 拓展：绑定弹窗特有的事件
    bindEvents() {
        // 先调用基类的bindEvents(如果基类有通用事件的话)
        super.bindEvents();
        const header = this.element.querySelector('.modal-header');
        const closeBtn = this.element.querySelector('.modal-close');
        const confirmBtn = this.element.querySelector('.modal-confirm');
        const cancelBtn = this.element.querySelector('.modal-cancel');

        //关闭按钮事件
        this._addEventListener(closeBtn,'click',this._handleCancel);

        // 确认/取消按钮事件
        this._addEventListener(confirmBtn,'click',this._handleConfirm);
        this._addEventListener(cancelBtn,'click',this._handleCancel);
        //点击遮罩层关闭
        if (this.options.closeOnOverlay) {
            this._addEventListener(this.element,'click',this._handleOverlayClick);  
        }
        
        //ESC关闭
        if (this.options.closeOnEsc) {
            this._addEventListener(document,'keydown',this._handleEscKey);
        }

        // 拖拽功能
        if (this.options.draggable) {
            this._addEventListener(header,'mousedown',this._onDragStart);
        }
    }
    _handleCancel(){
        this.options.onCancel();
        this.hide();
    }

    _handleConfirm(){
        this.options.onConfirm();
        this.hide();
    }

    _handleOverlayClick(e) {
        if (e.target ===this.element) {
            this.hide();
        }
    }

    _handleEscKey(e){
        if (e.key === 'Escape' && this.element.style.display !== 'none') {
            this.hide();
        }
    }

    // 拖拽功能实现
    _onDragStart(e){
        const content = this.element.querySelector('.modal-content');
        // 记录鼠标初始位置和弹窗参数位置
        this._dragStartX = e.clientX;
        this._dragStartY= e.clientY;
        this._modalStartX = content.offsetLeft;
        this._modalStartY = content.offsetTop;

        //保存content引用，避免重复查询
        this._draggingContent = content;
        //绑定移动和松开事件到document(防止鼠标移出弹窗后失效)
        // 先解绑之前可能存在的事件，防止重复绑定（关键）
        this._removeEventListener(document,'mousemove');
        this._removeEventListener(document,'mouseup');

        this._addEventListener(document,'mousemove',this._onDragMove);
        this._addEventListener(document,'mouseup',this._onDragEnd);

        //只设置一次position,避免次移动都重复设置
        content.style.position = 'absolute';
    }

    _onDragMove(e) {
        if (!this._draggingContent) return;

        const content = this._draggingContent;
        //  计算偏移量
        const deltaX = e.clientX - this._dragStartX;
        const deltaY = e.clientY - this._dragStartY;

        //更新弹窗位置
        content.style.position = 'absolute';
        content.style.left = `${this._modalStartX + deltaX}px`;
        content.style.top = `${this._modalStartY + deltaY}px`;
    }
    _onDragEnd() {
        //移除移动和思考事件
        //使用基类统一方法真正解绑事件
        this._removeEventListener(document,'mousemove');
        this._removeEventListener(document,'mouseup');
        delete this._draggingContent;
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