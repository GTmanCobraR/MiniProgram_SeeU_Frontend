<template>
  <view class="page-wrapper">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">所有活动</text>
      <text class="page-subtitle">查看所有历史活动</text>
    </view>

    <!-- 活动列表 -->
    <scroll-view 
      class="activity-list" 
      scroll-y 
      refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <block v-for="act in activities" :key="act.eventid">
        <view class="activity-card" @tap="goToActivity(act)">
          <!-- cover or placeholder -->
          <image
            class="cover"
            :src="act.imageUrl || placeholder"
            mode="aspectFill"
          />
          <!-- textual content -->
          <view class="info">
            <text class="title">{{ act.title }}</text>
            <text class="subtitle">{{ act.details }}</text>
            <text class="date">{{ formatDate(act.eventTime) }}</text>
            <text class="location" v-if="act.location"> {{ act.location }}</text>
          </view>

          <!-- 操作区：删除按钮 -->
          <view class="actions">
            <view
              class="delete-btn"
              @tap.stop="deleteEvent(act)"
            >
              <text class="cross">✕</text>
            </view>
          </view>

        </view>
      </block>

      <!-- 空状态 -->
      <view v-if="activities.length === 0 && !loading" class="empty-state">
        <text class="empty-text">暂无活动数据</text>
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
  name: 'AllActivities',
  data() {
    return {
      activities: [],
      loading: false,
      refreshing: false,
      placeholder: 'https://dummyimage.com/160x160/cccccc/fff'
    };
  },

  onLoad() {
    this.loadAllActivities();
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

    async loadAllActivities() {
      this.loading = true;
      try {
        const token = await this.getToken();
        
        // 获取所有活动
        const actRes = await requestWithToken(
          `https://seeu-applets.seeu-edu.com/v2/seeuapp/event/load`,
          "GET",
          {date: "1970-01-01"}, // 使用很早的日期来获取所有活动
          token
        );

        if (actRes.code === 200) {
          this.activities = Array.isArray(actRes.data) ? actRes.data : [];
          console.log("所有活动数据:", this.activities);
        } else {
          console.error("获取活动数据失败:", actRes);
          uni.showToast({
            title: '获取活动数据失败',
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

    goToActivity(act) {
      // 跳转到活动详情页面
      const jumpUrl = `../offlineEvent/offlineEvent?options=${act.eventid}`;
      uni.navigateTo({
        url: jumpUrl
      });
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    // 下拉刷新处理
    async onRefresh() {
      this.refreshing = true;
      try {
        await this.loadAllActivities();
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

    // 删除事件（此处按要求不实现具体逻辑）
    async deleteEvent(act) {
	  
	  const { confirm } = await new Promise(resolve => {
		  uni.showModal({
			title: '确认删除',
			content: `确定要删除“${act.title || '该活动'}”吗？此操作不可恢复。`,
			confirmText: '删除',
			cancelText: '取消',
			confirmColor: '#ff4d4f',
			success: resolve
		  });
		});
		if (!confirm) return; // user canceled
	  
	  try {
	    const token = await this.getToken();
	    console.log(act.eventid);
	    // 删除当前活动
	    const actRes = await requestWithToken(
	      `https://seeu-applets.seeu-edu.com/v2/seeuapp/event/deleteInformation?eventid=${act.eventid}`,
	      "DELETE",
	      {},
	      token
	    );
	  
	    if (actRes.code === 200) {
		  console.log("删除活动成功！",act.eventid);
	      await this.onRefresh()
	    } else {
	      console.error("删除活动失败:", actRes);
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

.activity-list {
  flex: 1;
  padding: 24rpx;
}

.activity-card {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.cover {
  width: 160rpx;
  height: 160rpx;
  background: #e0e0e0;
  flex-shrink: 0;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24rpx;
  flex: 1;
  min-width: 0; /* 防止文字挤压按钮 */
}

.title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 8rpx;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.location {
  font-size: 22rpx;
  color: #666;
}

.actions {
  padding: 16rpx;
  display: flex;
  align-items: center;
  margin-right: 40rpx;
}

.delete-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #ff4d4f; /* red circle */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
}

.cross {
  color: #fff;            /* white cross */
  font-size: 28rpx;
  font-weight: bold;
  line-height: 1;
}
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
</style>
