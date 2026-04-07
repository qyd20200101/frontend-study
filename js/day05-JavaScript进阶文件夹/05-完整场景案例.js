/*
场景1：闭包——搜索历史记录管理
*/ 
const HistoryManager = (function () {
    //私有变量,外部无法访问
    let historyList = [];

    return {
        add(item) {
            if (!item || historyList.includes(item)) return;
            historyList.unshift(item);

            //最多存五条
            if (historyList.length >5) 
                historyList.pop();
        },
        get(){
            return [...historyList];
        }
    };
})();

/* 
手写防抖（场景搜索输入联想）
*/ 
function debounce(fn,delay =300) {
    let timer =null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() =>{
            fn.apply(this,args);
        },delay);
    };
}

//模拟搜索请求
function searchRequest(e) {
    const value = e.target.value.trim();
    if (!value) return;//空值不存
    console.log('发起搜索请求:',value);
    HistoryManager.add(value);
    renderHistory();
}

//绑定防抖
const input = document.getElementById('searchInput');
input.addEventListener('input',debounce(searchRequest));

//渲染历史记录
function renderHistory() {
    const list = HistoryManager.get();
    const historyDom = document.getElementById('historyList');
    historyDom.innerHTML = list.length?`<p>历史记录：</p>${list.map(item =>`<p>${item}</p>`).join('')}`:'';
}

/*
手写节流(场景：滚动到底部加载更多)
*/ 
function throttle(fn,interval = 1000) {
    let lastTime = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastTime >=interval) {
            fn.apply(this,args);
            lastTime = now;
        }
    };
}

//滚动加载
function loadMore() {
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    const scrollHeight = document.documentElement.scrollHeight;

    if (scrollTop + clientHeight >=scrollHeight -50) {
        console.log('加载下一页');
        document.getElementById('loadTip').innerHTML = '加载中';
        setTimeout(() =>{
            document.getElementById('loadTip').innerHTML = '加载完成，继续滚动';
        },500);
    }
}

window.addEventListener('scroll',throttle(loadMore));

/*
this指向场景演示
*/ 
const user= {
    name: '前端学习者',
    sayName: function(){
        console.log(this.name);
    }
};

// 直接调用:this指向user

user.sayName();

// 事件中调用,this丢失
input.onclick = user.sayName;

//修复bind
input.onclick = user.sayName.bind(user);