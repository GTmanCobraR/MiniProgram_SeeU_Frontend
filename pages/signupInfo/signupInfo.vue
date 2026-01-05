<template>
  <view class="container">
    <!-- 上半部分：报名信息表格 -->
    <view class="signup-section">
      <view class="section-title">报名信息</view>
      <view class="table-container">
        <view class="table-header">
          <view class="header-cell">报名者姓名</view>
          <view class="header-cell">分享者微信昵称</view>
        </view>
        <scroll-view class="table-body" scroll-y="true">
          <view
            v-for="(item, index) in signupList"
            :key="index"
            class="table-row"
          >
            <view class="table-cell">{{ item.name || '-' }}</view>
            <view class="table-cell">{{ item.wechatNickname || '-' }}</view>
          </view>
          <view v-if="signupList.length === 0" class="empty-row">
            <text>暂无报名信息</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 下半部分：加积分功能（搜索 + 弹窗） -->
    <view class="points-section">
      <view class="section-title">加积分功能</view>

      <!-- 搜索框 -->
      <view class="search-container">
        <input
          class="search-input"
          placeholder="搜索用户微信昵称"
          v-model="searchKeyword"
          @input="onSearchInput"
        />
        <button class="search-button" @tap="searchMembers">搜索</button>
      </view>

      <!-- 搜索结果 -->
      <view v-if="searchResults.length > 0" class="search-results">
        <view class="results-title">搜索结果：</view>
        <view
          v-for="(member, index) in searchResults"
          :key="index"
          class="result-item"
          :class="{ 'selected': selectedMember && selectedMember.memberId === member.memberId }"
          @tap="selectMember(member)"
        >
          <text>{{ member.wechatName }}</text>
          <text v-if="selectedMember && selectedMember.memberId === member.memberId" class="selected-mark">✓</text>
        </view>
      </view>
    </view>

    <!-- 加积分弹窗 -->
    <view v-if="showAddPointsModal" class="modal-mask">
      <view class="modal-container">
        <view class="modal-title">为 {{ selectedMember.wechatName }} 加积分</view>
    
        <view class="form-group">
          <text class="label">每次积分数量：</text>
          <input
            class="input"
            type="number"
            v-model="pointsPerTime"
            placeholder="请输入积分数量"
            :placeholder-style="'font-size: 32rpx; line-height: 90rpx; color: #999;'"
          />
        </view>
    
        <view class="form-group">
          <text class="label">积分次数：</text>
          <input
            class="input"
            type="number"
            v-model="times"
            placeholder="请输入次数"
            :placeholder-style="'font-size: 32rpx; line-height: 90rpx; color: #999;'"
          />
        </view>
    
        <view class="total-points">总积分：{{ totalPoints }}</view>
    
        <view class="modal-buttons">
          <button class="cancel-button" @tap="showAddPointsModal = false">取消</button>
          <button class="confirm-button" @tap="addPoints">确认</button>
        </view>
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
      searchKeyword: '',
      searchResults: [],
      selectedMember: null,
      pointsPerTime: '',
      times: '',
      showAddPointsModal: false,
      baseUrl: 'https://seeu-applets.seeu-edu.com/v2/seeuapp'
    };
  },
  computed: {
    totalPoints() {
      const points = parseInt(this.pointsPerTime) || 0;
      const times = parseInt(this.times) || 0;
      return points * times;
    }
  },
  
   onLoad(options) {
	if (options.eventID) {
	  this.eventID = options.eventID;
	}
	console.log(this.eventID);
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
      try {
        const res = await uni.request({
          url: `${this.baseUrl}/admin/signup/list`,
          method: 'GET',
          data: { eventId: this.eventID },
		  header: {
		  	'Content-Type': 'application/json',
		  	"token": await this.getToken()
		  }
        });
        if (res.data.code === 200) {
          this.signupList = res.data.data || [];
        } else {
          uni.showToast({ title: res.data.message || '获取报名信息失败', icon: 'none' });
        }
      } catch (error) {
        console.error('获取报名信息失败:', error);
        uni.showToast({ title: '获取报名信息失败', icon: 'none' });
      }
    },
    onSearchInput() {
      // 可加防抖逻辑
    },
    async searchMembers() {
      if (!this.searchKeyword.trim()) {
        uni.showToast({ title: '请输入搜索关键词', icon: 'none' });
        return;
      }
      try {
        const res = await uni.request({
          url: `${this.baseUrl}/admin/member/search`,
          method: 'GET',
          data: { wechatName: this.searchKeyword },
		  header: {
		  	'Content-Type': 'application/json',
		  	"token": await this.getToken()
		  }
        });
        if (res.data.code === 200) {
          this.searchResults = res.data.data || [];
          this.selectedMember = null;
        } else {
          uni.showToast({ title: res.data.message || '搜索失败', icon: 'none' });
        }
      } catch (error) {
        console.error('搜索失败:', error);
        uni.showToast({ title: '搜索失败', icon: 'none' });
      }
    },
    selectMember(member) {
      this.selectedMember = member;
      this.pointsPerTime = '';
      this.times = '';
      this.showAddPointsModal = true;
    },
    async addPoints() {
      if (!this.selectedMember) {
        uni.showToast({ title: '请先选择用户', icon: 'none' });
        return;
      }
      if (!this.pointsPerTime || !this.times) {
        uni.showToast({ title: '请填写积分数量和次数', icon: 'none' });
        return;
      }
      const points = parseInt(this.pointsPerTime);
      const times = parseInt(this.times);
      if (points <= 0 || times <= 0) {
        uni.showToast({ title: '积分数量和次数必须大于0', icon: 'none' });
        return;
      }
      try {
        const res = await uni.request({
          url: `${this.baseUrl}/admin/points/add`,
          method: 'POST',
          data: {
            wechatName: this.selectedMember.wechatName,
            pointsPerTime: points,
            times: times
          },
          header: {
          	'Content-Type': 'application/json',
          	"token": await this.getToken()
          }
        });
        if (res.data.code === 200) {
          uni.showToast({ title: '积分添加成功', icon: 'success' });
          this.showAddPointsModal = false;
          this.selectedMember = null;
          this.pointsPerTime = '';
          this.times = '';
          this.searchResults = [];
        } else {
          uni.showToast({ title: res.data.message || '积分添加失败', icon: 'none' });
        }
      } catch (error) {
        console.error('添加积分失败:', error);
        uni.showToast({ title: '添加积分失败', icon: 'none' });
      }
    },
  }
};
</script>

<style>
/* 你的原始样式不变 + 新增弹窗样式 */

.container {
  padding: 20rpx;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

.signup-section {
  flex: 1;
  margin-bottom: 20rpx;
}

.table-container {
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  overflow: hidden;
}

.table-header {
  display: flex;
  background-color: #f5f5f5;
  border-bottom: 1rpx solid #ddd;
}

.header-cell {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  font-weight: bold;
  font-size: 28rpx;
}

.table-body {
  max-height: 400rpx;
}

.table-row {
  display: flex;
  border-bottom: 1rpx solid #eee;
}

.table-cell {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  font-size: 28rpx;
}

.empty-row {
  padding: 40rpx;
  text-align: center;
  color: #999;
}

.points-section {
  flex: 1;
}

.search-container {
  display: flex;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  border: 1rpx solid #ddd;
  border-radius: 10rpx 0 0 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.search-button {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 0 10rpx 10rpx 0;
  padding: 20rpx 30rpx;
  font-size: 28rpx;
}

.search-results {
  margin-bottom: 20rpx;
}

.results-title {
  font-size: 28rpx;
  margin-bottom: 10rpx;
  color: #666;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
  background-color: #fff;
}

.result-item.selected {
  background-color: #e3f2fd;
  border-color: #007aff;
}

.selected-mark {
  color: #007aff;
  font-weight: bold;
}

/* 弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  width: 80%;
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
}

.form-group {
  margin-bottom: 20rpx;
}

.label {
  font-size: 28rpx;
  margin-bottom: 10rpx;
  display: block;
  color: #333;
}

.input {
  width: 100%;
  height: 90rpx;
  padding: 0 20rpx;
  font-size: 32rpx;
  line-height: 90rpx;
  border: 1rpx solid #ccc;
  border-radius: 12rpx;
  box-sizing: border-box;
  background-color: #fff;
}

.total-points {
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #007aff;
  margin: 20rpx 0;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
}

.cancel-button,
.confirm-button {
  flex: 1;
  margin: 0 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  border-radius: 10rpx;
  border: none;
}

.cancel-button {
  background-color: #ccc;
  color: #fff;
}

.confirm-button {
  background-color: #007aff;
  color: #fff;
}
</style>
