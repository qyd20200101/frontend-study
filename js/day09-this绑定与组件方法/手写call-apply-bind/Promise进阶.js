/*
如果其中一个请求失败了，all会发生什么
Promise.all会立刻进入reject状态,返回第一个失败的错误原因
剩下的请求虽然会继续执行（Promise无法被外部强行中断）
但它们的结果会被忽略
*/

Promise.myAll = function (promises) {
    return new Promise((resolve, reject) => {
        // 参数校验：必须是数组
        if (!Array.isArray(promises)) {
            return reject(new TypeError('arguments must be an array'));
        }
        let result = [];
        let count = 0;//记录成功的数量

        promises.forEach((p, index) => {
            // 兼容非promise对象，用promise.resolve包层
            Promise.resolve(p).then(
                (val) => {
                    result[index] = val; //按顺序存放结果
                    count++;
                    // 只有全部成功，才resolve
                    if (count === promises.length) {
                        resolve(result);
                    }
                },
                (err) => {
                    // 只要有一个失败，立刻reject(Fail-fast机制)
                    reject(err);
                }
            );
        });

        // 处理空数组
        if (promises.length === 0) resolve([]);
    })
}

/*
案例一：promise.all实现并行初始化
1.串行await是禁忌：如果每个接口500ms,串行要1500ms,并行只需要500ms
2.容错处理：如果某一个接口挂了，不能让整个页面白屏
总结：处理并行初始化，对数组中的非核心接口进行局部捕获.catch
防止一条失败导致页面崩溃
*/
const fetchProjectInfo = () => new Promise(resolve => {
    setTimeout(() =>
        resolve({ id: 1, name: '西安ERP' })
        , 500);
})
const fetchTeamMembers = () => new Promise(resolve => {
    setTimeout(() =>
        resolve(['张三', '李四'])
        , 300);
})
const fetchAuditLogs = () => new Promise((_ , reject) => {
    setTimeout(() =>
        reject('日志接口错误')
        , 400);
})

async function initDashboard() {
    console.time('并行耗时');
    try {
        // 高级技巧：给非核心接口挂个.catch(),确保Promise.all不会因为它失败
        const [info,members,logs] = await Promise.all([
            fetchProjectInfo(),
            fetchTeamMembers().catch(err =>{
                console.warn('成员加载失败',err);
                return [];//返回空数组作为兜底
            }),
            fetchAuditLogs().catch(err =>{
                console.warn('日志加载失败',err);
                return null;//返回null允许页面继续渲染
            })
        ]);
        
        console.log('渲染页面数据：',{info,members,logs});
    } catch (error) {
        // 只有核心接口fetchProjectInfo报错（因为它没写.catch）,才会进到这里面
        console.log('核心数据加载失败,引导用户重试');
    }
    console.timeEnd('并行消耗');//约500ms
}

initDashboard();

/*
案例二：Promise.race——网络波动的请求超时控制
1.用户体验：5秒没反应必须给反馈
2.局限性认知：promise.race胜出后，那个慢的请求其实还在后台运行
如果是写操作，要提醒用户不用重复提交
总结：用它处理请求超时逻辑，它只是忽略了慢的结果，不能真正取消http请求
通过配合AbortController来真正终止请求
*/ 
// 封装一个通用的超时promise
const timeout = (ms) =>{
    return new Promise((_,reject) =>{
        setTimeout(() =>reject(new Error("服务器响应超时")),ms);
    });
};

// 模拟一个很慢的请求
const slowRequest = () => new Promise(resolve => setTimeout(() =>resolve("提交成功"),8000));

async function submitWithTimeout() {
    try {
        // 让业务请求和5s闹钟赛跑
        const result = await Promise.race([
            slowRequest(),
            timeout(5000)
        ]);
        console.log(result);
    } catch (error) {
        if (error.message === "服务器响应超时") {
            // 特殊处理超时：提示用户检查，但不要轻易让其重新点击，
            // 防止后端重复提交
            console.error("响应过慢，请去列表页确认，勿重复点击");
        }else{
            console.error("其他错误",error);
        }
    }
}

submitWithTimeout();

/*
案例三：promise.allSettled——批量操作的战果统计
1.不要用promise.all：因为其中一个失败，all就会跳到catch,无法知道剩下的是否成功
2.状态反馈：你需要告诉用户，成功数量和失败数量
总结：处理批量任务，，帮助获得每个子任务的状态，提供精确的反馈
*/ 

const userIds = [101,102,103,104];
const disableApi = (id) => id === 103 ? Promise.reject('无权限'): Promise.resolve('ok');

async function batchOperation() {
    const promises = userIds.map(id => disableApi(id));

    //等待所有请求完成，无论成功还是失败
    const results = await Promise.allSettled(promises);

    const summary = {success: 0, fail: 0, failDetail: []};

    results.forEach((res,index) =>{
        if (res.status === 'fulfilled') {
            summary.success++;
        }else{
            summary.fail++;
            summary.failDetail.push({id: userIds[index], reason: res.reason});
        }
    });

    console.log(`操作完成！成功${summary.success}个,失败${summary.fail}个。`);
    if (summary.fail >0) {
        console.table(summary.failDetail);
    }
}

batchOperation();

