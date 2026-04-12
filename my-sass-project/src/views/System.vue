<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { getUsersApi,addUserApi,type SystemUser } from "../api/user";
import  BaseModal  from "../components/BaseModal.vue";

//响应式状态
const userLsit = ref<SystemUser[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const isModalOpen = ref(false);

//新增用户的表单数据
const newUserForm = reactive({
    username: '',
    role: '普通编辑'
});

//初始化加载
const ftechUsers = async() =>{
    isLoading.value = true;
    try {
        const data = await getUsersApi();
        userLsit.value = data;
    } catch (error) {
        console.error('获取用户列表失败');
    }finally{
        isLoading.value = false; 
    }
}

//执行新增保存
const handleAddUser =async () =>{
    if (!newUserForm.username) {
        return alert('请输入用户名');
    }
    isSaving.value = true;
    try {
        await addUserApi(newUserForm);
        //保存成功后：关闭弹窗——>清空表单——>重新刷新列表
        isModalOpen.value = false;
        newUserForm.username = '';
        ftechUsers();
        alert('新增成功!');
    } catch (error) {
        alert('保存失败');
    }finally{
        isSaving.value = false;
    }
}
onMounted(() =>ftechUsers());
</script>
<template>
    <div class="system-container">
        <div class="page-header">
            <h3>👥 用户权限管理</h3>
            <button class="btn-add" @click="isModalOpen = true">+ 新增用户</button>
        </div>

        <!-- 数据展示区 -->
         <div class="table-card">
            <div v-if="isLoading" class="loading-tip">数据加载中...</div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>用户名</th>
                        <th>角色</th>
                        <th>状态</th>
                        <th>最后登录</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in userLsit" :key="user.id">
                        <td>{{ user.id }}</td>
                        <td><strong>{{ user.username }}</strong></td>
                        <td><span class="role-tag">{{ user.role }}</span></td>
                        <td>
                            <span>{{ user.status === 'active'? '正常':'禁用' }}</span>
                        </td>
                        <td>{{ user.lastlogin }}</td>
                        <td>
                            <button class="action-link">配置权限</button>
                        </td>
                    </tr>
                </tbody>
            </table>
         </div>
         <!-- 新增用户弹窗 -->
        <BaseModal
        v-model="isModalOpen"
        title="新增系统用户"
        @confirm="handleAddUser">
        <div class="user-form">
            <div class="form-item">
                <label >用户名</label>
                <input type="text" v-model="newUserForm.username" placeholder="输入新账号">
            </div>
            <div class="form-item">
                <label >角色</label>
                <select  v-model="newUserForm.role">
                    <option value="普通编辑">普通编辑</option>
                    <option value="管理员">管理员</option>
                    <option value="只读访客">只读访客</option>
                </select>
            </div>
            <p v-if="isSaving" class="saving-txt">正在写入数据库</p>
        </div>
        </BaseModal>
    </div>
</template>
<style scoped>
/* 保持之前的样式，增加 loading 提示 */
.loading-tip { text-align: center; padding: 40px; color: #999; }
.saving-txt { color: #1890ff; font-size: 12px; margin-top: 10px; }
.user-form { padding: 10px 0; }
.form-item { margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
.form-item input, .form-item select { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
</style>