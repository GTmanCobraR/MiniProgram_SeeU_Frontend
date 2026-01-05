<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">所有报名信息</text>
      <text class="subtitle">共 {{ signupList.length }} 人报名</text>
    </view>



    <!-- 报名信息卡片列表 -->
    <scroll-view class="signup-list" scroll-y="true" @scrolltolower="loadMore">
      <view
        v-for="(item, index) in signupList"
        :key="index"
        class="signup-card"
      >
        <view class="card-header">
          <view class="user-info">
            <view class="user-name">{{ item.name || '未填写姓名' }}</view>
            <view class="user-id">ID: {{ item.memberID || '未知' }}</view>
          </view>
          <view class="card-number">#{{ index + 1 }}</view>
        </view>
        
        <view class="card-content">
          <view class="info-row">
            <text class="info-label"> 手机号：</text>
            <text class="info-value">{{ item.phone || '未填写' }}</text>
          </view>
          
          <view class="info-row">
            <text class="info-label"> 学校：</text>
            <text class="info-value">{{ item.school || '未填写' }}</text>
          </view>
          
          <view class="info-row">
            <text class="info-label"> 专业：</text>
            <text class="info-value">{{ item.major || '未填写' }}</text>
          </view>
          
          <view class="info-row">
            <text class="info-label"> 年级：</text>
            <text class="info-value">{{ item.grade || '未填写' }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="signupList.length === 0" class="empty-state">
        <view class="empty-icon"></view>
        <text class="empty-text">暂无报名信息</text>
        <text class="empty-subtext">当前活动还没有人报名</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>
    </scroll-view>

    <!-- 统计信息 -->
    <view class="stats-container">
      <view class="stat-item">
        <text class="stat-number">{{ signupList.length }}</text>
        <text class="stat-label">总报名</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ uniqueSchools.length }}</text>
        <text class="stat-label">涉及学校</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ uniqueMajors.length }}</text>
        <text class="stat-label">涉及专业</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      eventID: '',
      signupList: [],
      loading: false,
      baseUrl: 'https://seeu-applets.seeu-edu.com/v2/seeuapp'
    };
  },
  
  computed: {
    // 唯一学校数量
    uniqueSchools() {
      return [...new Set(this.signupList.map(item => item.school).filter(Boolean))];
    },
    
    // 唯一专业数量
    uniqueMajors() {
      return [...new Set(this.signupList.map(item => item.major).filter(Boolean))];
    }
  },
  
  onLoad(options) {
    if (options.eventID) {
      this.eventID = options.eventID;
    }
    this.loadSignupList();
  },
  
  methods: {
    async getToken() {
      try {
        const res = await uni.getStorageSync('token');
        return `Bearer ${res}`;
      } catch (e) {
        this.handleAuthError();
        throw e;
      }
    },
    
    async loadSignupList() {
      this.loading = true;
      try {
        const res = await uni.request({
          url: `${this.baseUrl}/admin/signup/export`,
          method: 'GET',
          data: { eventId: this.eventID },
          header: {
            'Content-Type': 'application/json',
            "token": await this.getToken()
          }
        });
        
        if (res.data.code === 200) {
          this.signupList = res.data.data || [];
          uni.showToast({ 
            title: `成功加载 ${this.signupList.length} 条报名信息`, 
            icon: 'success' 
          });
        } else {
          uni.showToast({ 
            title: res.data.message || '获取报名信息失败', 
            icon: 'none' 
          });
        }
      } catch (error) {
        console.error('获取报名信息失败:', error);
        uni.showToast({ 
          title: '获取报名信息失败', 
          icon: 'none' 
        });
      } finally {
        this.loading = false;
      }
    },
    

    
    loadMore() {
      // 如果需要分页加载，可以在这里实现
      console.log('加载更多数据');
    }
  }
};
</script>

<style>
.container {
  padding: 20rpx;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
}

.page-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #666;
}



.signup-list {
  flex: 1;
  margin-bottom: 20rpx;
}

.signup-card {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.user-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.user-id {
  font-size: 24rpx;
  color: #999;
}

.card-number {
  font-size: 28rpx;
  color: #3478F6;
  font-weight: bold;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  margin-bottom: 15rpx;
  align-items: flex-start;
}

.info-label {
  font-size: 28rpx;
  color: #666;
  width: 120rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  word-break: break-all;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.empty-subtext {
  font-size: 24rpx;
  color: #999;
  text-align: center;
}

.loading-more {
  text-align: center;
  padding: 20rpx;
  color: #666;
  font-size: 28rpx;
}

.stats-container {
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 36rpx;
  font-weight: bold;
  color: #3478F6;
  margin-bottom: 5rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}
</style>
