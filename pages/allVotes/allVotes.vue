<template>
  <view class="page-wrapper">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">所有投票</text>
      <text class="page-subtitle">查看所有历史投票</text>
    </view>

    <!-- 投票列表 -->
    <scroll-view 
      class="vote-list" 
      scroll-y 
      refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <block v-for="vote in votes" :key="vote.voteid">
        <view class="vote-card" @tap="goToVote(vote)">
          <!-- 删除按钮（与活动页一致的样式与行为） -->
          <view class="actions actions-right">
            <view class="delete-btn" @tap.stop="deleteVote(vote)">
              <text class="cross">✕</text>
            </view>
          </view>

          <!-- 投票信息 -->
          <view class="vote-info">
            <text class="title">{{ vote.title }}</text>
            <text class="description">{{ vote.description }}</text>
            <text class="date">截止日期: {{ formatDate(vote.date) }}</text>
          </view>
          
          <!-- 投票选项预览 -->
          <view class="options-preview">
            <text class="options-title">选项预览:</text>
            <view class="options-list">
              <text 
                v-for="(option, index) in getOptions(vote)" 
                :key="index" 
                class="option-item"
              >
                {{ index + 1 }}. {{ option }}
              </text>
            </view>
          </view>
        </view>
      </block>

      <!-- 空状态 -->
      <view v-if="votes.length === 0 && !loading" class="empty-state">
        <text class="empty-text">暂无投票数据</text>
      </view>
    </scroll-view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { requestWithToken } from '@/modules/requestUtils.js';

export default {
  name: 'AllVotes',
  data() {
    return {
      votes: [],
      loading: false,
      refreshing: false
    };
  },

  onLoad() {
    this.loadAllVotes();
  },

  methods: {
    async getToken() {
      try {
        const res = await uni.getStorageSync('token');
        return `Bearer ${res}`;
      } catch (e) {
        this.handleAuthError && this.handleAuthError();
        throw e;
      }
    },

    async loadAllVotes() {
      this.loading = true;
      try {
        const token = await this.getToken();
        
        // 获取所有投票
        const voteRes = await requestWithToken(
          `https://seeutest.duckdns.org/seeuapp/admin/signup/loadAll`,
          "GET",
          {},
          token
        );

        if (voteRes.code === 200) {
          this.votes = Array.isArray(voteRes.data) ? voteRes.data : [];
          console.log("所有投票数据:", this.votes);
        } else {
          console.error("获取投票数据失败:", voteRes);
          uni.showToast({
            title: '获取投票数据失败',
            icon: 'none'
          });
        }
      } catch (e) {
        console.error("请求失败:", e);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    goToVote(vote) {
      // 跳转到投票详情页面
      const jumpUrl = `../topicVote/topicVote?options=${vote.voteid}`;
      uni.navigateTo({ url: jumpUrl });
    },

    formatDate(dateString) {
      if (!dateString) return '未设置';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    getOptions(vote) {
      const options = [];
      for (let i = 1; i <= 10; i++) {
        const option = vote[`option${i}`];
        if (option && option.trim() !== '') {
          options.push(option);
        }
      }
      return options;
    },

    // 下拉刷新处理
    async onRefresh() {
      this.refreshing = true;
      try {
        await this.loadAllVotes();
        uni.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1000
        });
      } catch (error) {
        console.error('刷新失败:', error);
        uni.showToast({
          title: '刷新失败',
          icon: 'none',
          duration: 1000
        });
      } finally {
        this.refreshing = false;
      }
    },

    // 删除投票（带确认弹窗；成功后从列表移除）
    async deleteVote(vote) {
        const { confirm } = await new Promise(resolve => {
          uni.showModal({
            title: '确认删除',
            content: `确定要删除“${vote.title || '该投票'}”吗？此操作不可恢复。`,
            confirmText: '删除',
            cancelText: '取消',
            confirmColor: '#ff4d4f',
            success: resolve
          });
        });
        if (!confirm) return;

        try {
          const token = await this.getToken();
          console.log(vote.voteid);
          // 删除当前活动
          const voteRes = await requestWithToken(
            `https://seeutest.duckdns.org/seeuapp/vote/deleteInformation?id=${vote.voteid}`,
            "DELETE",
            {},
            token
          );
        
          if (voteRes.code === 200) {
        		  console.log("删除活动成功！",vote.voteid);
            await this.onRefresh()
          } else {
            console.error("删除活动失败:", voteRes);
            uni.showToast({
              title: '删除活动失败',
              icon: 'none'
            });
          }
        } catch (e) {
          console.error("请求失败:", e);
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        } 
    }
  }
};
</script>

<style scoped>
.page-wrapper {
  height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 40rpx 30rpx 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.page-subtitle {
  font-size: 28rpx;
  color: #666;
}

.vote-list {
  flex: 1;
  padding: 24rpx;
}

.vote-card {
  position: relative; /* 让右上角删除按钮定位生效 */
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.vote-info {
  margin-bottom: 20rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.description {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.date {
  font-size: 24rpx;
  color: #888;
  display: block;
}

.options-preview {
  border-top: 1rpx solid #eee;
  padding-top: 20rpx;
}

.options-title {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.option-item {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

/* 空、加载状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

/* === 与活动页相同的删除按钮样式 === */
.actions {
  padding: 16rpx;
  display: flex;
  align-items: center;
  margin-right: 40rpx;
}

.actions-right {
  position: absolute;
  top: 10rpx;
  right: 10rpx; /* 让按钮靠右上角但不贴边 */
}

.delete-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #ff4d4f;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
}

.cross {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  line-height: 1;
}
</style>
