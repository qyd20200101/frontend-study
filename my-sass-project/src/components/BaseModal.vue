<script setup lang="ts">
/*
1.显示定义Props和emit
2.遵循单向数据流
3.考虑组件的动画效果(transition)
区别：
1.DOM操作解耦：原生js需要手动处理document.createElement和样式赋值
Vue版只需要通过v-if和数据状态isModalVisible声明状态,
Vue会自动处理底层DOM更新
2.通信协议规范化:Vue使用props数据下发和emit导致上传,
通过v-model的标准协议modelValue，让父子组件耦合性降低，代码维护性变高
3.生命周期集成：Vue内置transition组件，
原生js需要手动监听transitioned事件控制显隐性逻辑，
vue中被抽象成进入和离开的hook
4.插槽slot:原生js弹窗内容只能通过innerHTML传递字符串，非常僵硬，
vue插槽运行父组件传递复杂的模板和其他组件，实现高度复用ui组件库
*/

//定义接口：父传子
//js逻辑里面访问属性，需要通过props.title获取
//在template里面直接写{{title}}

//defineProps是编译器宏,不需要从vue中import
import { ref } from "vue";
import  request  from "../utils/request";
const props = defineProps < {
    //控制弹窗显示与隐藏
    modelValue: boolean;
    title?: string;
    width?: string;
} > ();

//新增用户相关状态
const showUserModal = ref(false);
const userForm = ref({
    username: '',
    password: '',
    role: '',
    roles: [] as string[]
});

//用于存储校验错误信息
const userFormError = ref('');
// 定义事件：子传父
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

//关闭方法
const handleClose = () => {
    emit('update:modelValue', false);//通知父组件修改visible状态
    emit('cancel');
};

const handleConfirm = () => {
    emit('confirm');
}
//用户保存逻辑
const handleUsersSave = async () =>{
    //前端校验
    if (userForm.value.username.length <3) {
        userFormError.value = '用户名至少需要3位';
        return;
    }
    if (userForm.value.password.length < 6) {
        userFormError.value= '请至少分配一个角色';
        return;
    }

    try {
        const res: any = await request({
            url: '/users',
            method: 'post',
            data: userForm.value
        });

        if (res.code ===200) {
            alert('用户创建成功');
            showUserModal.value  = false;
            //重置表单
            userForm.value = {username: '', password: '',role: '',roles: []};
            userFormError.value = '';
        }
    } catch (error: any) {
        userFormError.value = error.response?.data?.message || '创建失败';
    }
}
</script>
<template>
    <!-- 使用Vue内置的Transition增加高级感 -->
    <Transition name="fade">
        <div v-if="modelValue" class="modal-mask" @click.self="handleClose">
            <div class="modal-container" :style="{ width: width || '450px' }">
                <!-- 头部 -->
                <div class="modal-header">
                    <h3>{{ title || '系统提示' }}</h3>
                    <button class="close-btn" @click="handleClose">x</button>
                </div>
                <!-- 内容区（使用插槽slot增加复用性）-->
                <div class="modal-body">
                    <slot>默认弹窗内容</slot>
                </div>
                <!-- 底部按钮 -->
                <div class="modal-footer">
                    <div class="btn-cancel" @click="handleClose">取消</div>
                    <div class="btn-confirm" @click="handleConfirm">确认</div>
                </div>
            </div>
        </div>
    </Transition>
</template>
<style scoped>
/* 蒙层:固定定位、全屏、居中 */
.modal-mask{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.modal-container{
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.modal-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
}
.modal-footer{
    padding-top: 15px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid #eee;
}
.btn-confirm{
    padding: 6px 16px;
    background: #1890ff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
.btn-cancel,.btn-confirm{
    padding: 6px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: .2s;
}
/* 动画效果 */
.fade-enter-active, .fade-leave-active {
    transition: opacity .3s ease;
}
.fade-enter-from,.fade-leave-to{
    opacity: 0;
}
</style>