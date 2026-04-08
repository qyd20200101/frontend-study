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
全局消息提示组件
@example
Message.success('操作成功')
Message.error('操作成功')
Message.warning('操作成功')
Message.info('操作成功')
Message.show({type:'success',content:'自定义消息',duration:50000})
*/ 
class Message extends BasePlugin {
    // 静态属性：全局唯一容器+消息队列
    static #container = null;
    static #messageQueue = [];
    static #defaultOptions = {
        type: 'info', //info/success/warning/error
        content: '',
        duration: 3000, //显示时长（ms）,0表示不自动关闭
        showClose: true, //是否显示关闭
        offset: 20, //距离顶部的初始距离
        gap: 16, //消息之间的间隔
        onClose: () =>{} //关闭回调
    };

    // 实例私有属性
    #timer = null;
    #offsetTop = 0;

    constructor(options){
        super({
            ...Message.#defaultOptions,
            ...options
        });
    }

    // 重写：消息DOM渲染
    render(){
        const el = document.createElement('div');
        el.className = `message message-${this.options.type}`;
        el.innerHTML = `
            <span class="message-icon"></span>
            <span class="message-content">${this.options.content}</span>
            ${this.options.showClose ? `<span class="message-close">X</span>`:''}
            `;
            return el;
    }

    // 重写：绑定消息持有事件
    bindEvents(){
        if (this.options.showClose) {
            const closeBtn = this.element.querySelector('.message-close');
            this._addEventListener(closeBtn,'click',this.close);
        }

        // 鼠标悬停暂停自动关闭
        this._addEventListener(this.element,'mouseenter',this.#clearTimer);
        this._addEventListener(this.element,'mouseleave',this.#startTimer);
    }

    // 重写初始化：添加到全局容器并启动定时器
    init(){
        if (this.isInitialized) return;
        super.init();
        this.#startTimer();
        return this;
    }

    // 启动自动关闭定时器
    #startTimer = () =>{
        if (this.options.duration >0) {
            this.#timer = setTimeout(() =>{
                this.close();
            },this.options.duration);
        }
    };

    // 清除定时器
    #clearTimer = () =>{
        if (this.#timer) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
    };

    //设置消息垂直位置
    setOffset(top) {
        this.#offsetTop = top;
        this.element.style.top = `${top}px`;
    }

    // 关闭消息
    close = () =>{
        this.#clearTimer();
        this.element.classList.add('message-leave');

        // 等待动画结束后销毁
        setTimeout(() =>{
            this.destroy();
            this.options.onClose();
            // 从队列中移除并更新其他消息位置
            const index = Message.#messageQueue.indexOf(this);
            if (index >-1) {
                Message.#messageQueue.splice(index,1);
                Message.#updatePositions();
            }
        },300);
    };

    // 静态方法：获取全局容器
    static #getContainer() {
        if (!Message.#container) {
            Message.#container = document.createElement('div');
            Message.#container.className = 'message-container';
            document.body.appendChild(Message.#container);
        }
        return Message.#container;
    }

    // 静态方法：更新所有消息的位置
    static #updatePositions() {
        let currentTop = Message.#defaultOptions.offset;
        Message.#messageQueue.forEach((msg) =>{
            msg.setOffset(currentTop);
            currentTop += msg.element.offsetHeight + Message.#defaultOptions.gap;
        });
    };

    // 核心静态方法：显示消息
    static show(options = {}) {
        if (typeof options === 'string') {
            options = {content: options};
        }

        const container = Message.#getContainer();
        const message = new Message({
            ...options,
            container: container //指定消息添加到全局容器
        });

        message.init();
        Message.#messageQueue.push(message);
        Message.#updatePositions();

        return message;
    }

    // 快捷静态方法
    static success(content, options ={}) {
        return Message.show({...options,type: 'success', content});
    }
    static error(content, options ={}) {
        return Message.show({...options,type: 'error', content});
    }
    static warning(content, options ={}) {
        return Message.show({...options,type: 'warning', content});
    }
    static info(content, options ={}) {
        return Message.show({...options,type: 'info', content});
    }

    //静态方法：关闭所有消息
    static closeAll() {
        // 倒序关系，避免数组索引问题
        for (let i = Message.#messageQueue.length - 1; i >=0; i--) {
            Message.#messageQueue[i].close();
        }
    }
}

// 基础用法
Message.success('表单提交成功！');
Message.error('网络请求失败，请稍后重试');
Message.warning('您的密码将在3天后过期');
Message.info('系统将于今晚22：00进行维护');

//自定义配置

Message.show({
    type: 'success',
    content: '自定义时长5秒，不显示关闭按钮',
    duration: 5000,
    showClose: false,
    onClose: () =>{
        console.log('消息已关闭');
        
    }
})