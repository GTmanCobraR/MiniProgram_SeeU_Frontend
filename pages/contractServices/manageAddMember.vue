<template>
    <view class="container">

        <!-- 过滤栏 -->
        <view class="filter-tabs">

            <view :class="[
                'filter-tab', 
                { 'active': currentFilter === 0 }
                ]" 
            @tap="selectFilter(0)">
                <text>未操作</text>
            </view>

            <view :class="[
                'filter-tab', 
                { 'active': currentFilter === 1 }
                ]" 
            @tap="selectFilter(1)">
                <text>已添加</text>
            </view>

            <view :class="[
                'filter-tab', 
                { 'active': currentFilter === 2 }
                ]" 
            @tap="selectFilter(2)">
                <text>未添加</text>
            </view>
        </view>

        <!-- 成员列表 -->
        <view v-if="filteredMemberList.length > 0" class="member-list">
            <card3 v-for="member in filteredMemberList" 
                :key="member.memberId"
                :item="member" 
                :title="member.wechatName"
                :subtitle1="getIsAddedStatusText(member.isAdded)"
                :subtitle2="'ID: ' + member.memberId" 
                :currentIsAddedStatus="member.isAdded"
                @mark-not-added="handleMarkNotAdded(member)"
                @mark-added="handleMarkAdded(member)" 
                @revoke="handleRevoke(member)"
                />
        </view>
        <view v-else class="empty-state">
            <text>暂无成员</text>
        </view>
    </view>
</template>

<script>
import card3 from "../../components/card3.vue";
import { requestWithToken } from '../../modules/requestUtils';
import { addPoints } from '../../modules/pointsUtils';
import seeuappBaseUrl from '../../modules/testUtils';
export default {
    components: { card3 },
    data() {
        return {
            allMemberList: [],
            currentFilter: 0 // 默认在‘未操作’页
        }
    },
    computed: {
        filteredMemberList() {
            return this.allMemberList.filter(member => member.isAdded === this.currentFilter); // isAdded = 0/1/2
        }
    },
    onLoad(options) {
        this.requestMemberList();
    },
    methods: {
        getIsAddedStatusText(status) {
            switch (status) {
                case 0: return '状态: 未操作';
                case 1: return '状态: 已添加';
                case 2: return '状态: 未添加';
                default: return '状态: 未知';
            }
        },
        selectFilter(status) {
            this.currentFilter = status;
        },
        async getToken() {
            const res = await this.getStorage("token");
            return `Bearer ${res}`;
        },
        async requestMemberList() {
            try {
                const url = `${seeuappBaseUrl}/activity/getAssistantCodeScanMemberList`; // local port
                const token = await this.getToken();
                const res = await requestWithToken(url, 'GET', {}, token);
                // console.log(res);
                if (res.code !== 200) {
                    uni.showToast({
                        title: 'api error',
                        icon: 'none'
                    });
                    console.log("无法获取列表：" + res.code + " " + res.error);
                }
                this.allMemberList = res.data || [];
            } catch (error) {
                console.error("Failed to fetch member list:", error);
                uni.showToast({
                    title: '获取列表失败',
                    icon: 'none'
                });
            }
        },
        async handleMarkAdded(item) {
            uni.showModal({
                title: '操作无法撤销',
                content: `确定要将 "${item.wechatName}" 标记为已添加吗？`,
                success: async (res) => {
                    if (res.confirm) {
                        // Status '1' for "Added"
                        await this.updateMemberStatus(item, 'setMemberStatus', 1);
                    } else if (res.cancel) {
                        uni.showToast({
                            title: '已取消操作',
                            icon: 'none',
                            duration: 1000
                        });
                    }
                }
            });
        },
        async handleMarkNotAdded(item) {
            // Status '2' for "Not Added"
            await this.updateMemberStatus(item, 'setMemberStatus', 2);
        },
        async handleRevoke(item) {
            // Status '0' for "Revoke" to '未操作'
            await this.updateMemberStatus(item, 'revokeOperation', 0);
        },
        async updateMemberStatus(item, endpoint, newIsAddedStatus) {
            //console.log("item: "+item.isAdded+ "////" + item.memberId);
            if (item.isAdded === 1) {
                console.log("无法撤销已添加：无法扣除积分"); // pointsUtils目前无扣除功能
                return;
            }
            uni.showLoading({ title: '处理中...', mask: true });
            if (newIsAddedStatus === 1) {
                const resStatus = await this.addPoints(item);

                if (resStatus === false) {
                    uni.hideLoading();
                    uni.showToast({
                        title: `操作失败: 积分添加错误`,
                        icon: 'none',
                        duration: 1500
                    });
                    return;
                }
            }
            const baseUrl = `${seeuappBaseUrl}/activity`;
            try {
                let url = `${baseUrl}/${endpoint}?id=${item.memberId}`;
                if(endpoint === 'setMemberStatus') {
                    url += `&status=${newIsAddedStatus}`;
                }
                const token = await this.getToken();
                const res = await requestWithToken(url, 'PUT', {}, token);
                // console.log(res);
                if (res.code !== 200) {
                    uni.showToast({
                        title: '操作失败',
                        icon: 'none'
                    });
                    console.log("fail: " + res.code + " " + res.error);
                }


                // 成功后，更新 allMemberList 中对应成员的 isAdded 状态
                const index = this.allMemberList.findIndex(member => member.memberId === item.memberId);
                if (index !== -1) {
                    //响应式更新
                    this.$set(this.allMemberList, index, { ...this.allMemberList[index], isAdded: newIsAddedStatus });
                }
                uni.hideLoading();
                uni.showToast({
                    title: `操作成功`,
                    icon: 'success',
                    duration: 1500
                });
            } catch (error) {
                uni.hideLoading();
                console.error(`Failed to update member status:`, error);
                uni.showToast({
                    title: '操作失败，请稍后重试',
                    icon: 'none',
                    duration: 2000
                });
            }
        },
        async addPoints(item) {
            const memberId = item.memberId;
            const token = await this.getStorage('token');
            const op = 'contractServices';
            const adminId = await this.getStorage('memberId');
            const subject = "PointsTo:" + memberId + ",ByAdm:" + adminId + ",at:" + Date.now();
            // call function from pointsUtils.
            // TODO: op和subject 怎么用
            const pointRes = await addPoints(op, subject, memberId, '这个地方好像非空就行'); 
            if (pointRes === 0) {
                console.log("Fail to add points");
                uni.showToast({
                    title: '添加积分失败',
                    icon: 'none'
                });
                return false;
            }
            return true;
        },
        async getStorage(options) {
            try {
                const res = uni.getStorageSync(options);
                return res;
            } catch (e) {
                uni.showToast({
                    title: "认证失败，请重新登录",
                    icon: "none",
                    duration: 2000,
                    complete() {
                        wx.navigateTo({
                            url: "/pages/index/index",
                        });
                    },
                });
                console.log(e);
            }
        }
    }
}
</script>

<style>
.container {
    padding-bottom: 1px;
    /* Prevents margin collapse */
}

.filter-tabs {
    display: flex;
    justify-content: space-around;
    width: 100%;
    padding: 10px 0;
    background-color: #f8f8f8;
    border-bottom: 1px solid #eee;
    margin-bottom: 10px;
}

.filter-tab {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    font-size: 15px;
    color: #666;
    border-radius: 5px;
    margin: 0 5px;
    transition: all 0.2s ease;
}

.filter-tab.active {
    background-color: #007aff; /* Uni-app blue */
    color: #fff;
    font-weight: bold;
}

.empty-state {
    text-align: center;
    margin-top: 50px;
    color: #888888;
    font-size: 14px;
}
</style>