<script setup lang="ts">
import { useUserStore } from "../store/user";
import { useForm } from "../hooks/useForm";
import { ElMessage } from "element-plus";
import request from "../utils/request";
import { onMounted } from "vue";

const userStore = useUserStore();

interface UserProfile {
    id: number;
    username: string;
    avatar: string;
}
//集成useForm处理个人资料修改
const { formData, isSaving, submitForm, openForm } = useForm < UserProfile > (async (data) => {
    await request({
        url: '/user/update',
        method: 'post',
        data
    })
});

//初始化数据
openForm({
    ...userStore.userInfo
});
onMounted(async () => {
    if (!userStore.userInfo) {
        try {
            await userStore.getUserInfo();
        } catch (error) {
            ElMessage.error('获取用户信息失败');
        }
    }

    if (userStore.userInfo) {
        openForm({ ...userStore.userInfo }); 
    }
    
})
//头像上传逻辑
const handleFileChange = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    //校验图片
    if (file.size > 2 * 1024 * 1024) {
        return ElMessage.error('图片不能超过2MB');
    }
    //构建二进制表单数据
    const fd = new FormData();
    fd.append('file', file);

    try {
        const res = await request({
            url: '/user/upload',
            method: 'post',
            data: fd,
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (formData.value) {
            formData.value.avatar = res.url;
            ElMessage.success('预览头像已更新');
        }
    } catch (error) {
        ElMessage.error('头像上传失败');
    }
}

//保存成功的回调：同步全局状态
const handleSaveSuccess = () => {
    //非常关键：更新pinia中的数据，这样Header、Sidebar的头像会自动变
    userStore.userInfo = { ...userStore.userInfo, ...formData.value };
    ElMessage.success('个人资料已全站同步更新');
}

</script>
<template>
    <div class="profile-container" v-if="formData">
        <h3>⚙️个人资料设置</h3>
        <div class="avatar-section">
            <div class="avatar-wrapper">
                <img :src="formData.avatar" class="avatar-lg" />
                <!-- 隐藏原始input，通过按钮触发 -->
                <input type="file" id="avatarInput" hidden @change="handleFileChange" />
                <label for="avatarInput" class="upload-btn">
                    <el-button type="primary" piain size="small">更换头像</el-button>
                </label>
            </div>
            <p class="tip"> 支持JPG、PNG格式，大小不超过2MB</p>
        </div>

        <el-form label-width="100px" class="info-form">
            <el-form-item label="用户名">
                <el-input v-model="formData.username" placeholder="请输入新的用户名" />
            </el-form-item>
            <el-form-item label="当前角色">
                <el-tag v-for="role in userStore.roles">{{ role }}</el-tag>
            </el-form-item>
            <el-divider />
            <div class="footer-actions">
                <el-button type="primary" :loading="isSaving" @click="submitForm(handleSaveSuccess)">
                    保存全局设置
                </el-button>
            </div>

        </el-form>
    </div>
</template>

<style scoped>
.profile-container {
    max-width: 600px;
    margin: 20px auto;
}
.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
}
.avatar-wrapper {
    position: relative;
    margin-bottom: 15px;
}
.avatar-lg {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #f0f2f5;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.tip {
    font-size: 12px;
    color: #999;
}
.info-form {
    background: #fff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}
.role-tag {
    margin-right: 8px;
}
.footer-actions {
    display: flex;
    justify-content: flex-end;
}
</style>