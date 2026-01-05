<template>
  <view class="page">
    <!-- 顶部渐变背景 -->
    <view
      class="top-gradient"
      :style="{ height: (statusBarHeight + titleBarHeight + gradientExtra) + 'px' }"
    ></view>

    <!-- 背景大字 SEEU -->
    <text class="bg-see-u">SEEU</text>

    <!-- 自定义导航栏（透明，含返回按钮 + 标题） -->
    <view
      class="custom-nav"
      :style="{ height: navHeight + 'px', paddingTop: statusBarHeight + 'px' }"
    >
      <view class="nav-inner">
        <!-- 返回按钮 -->
        <view v-if="canGoBack" class="back-btn" @tap="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">问卷</text>
      </view>
    </view>

    <!-- 内容区：整体下移 navHeight，避免被覆盖 -->
    <view v-if="isAdmin" class="card-list" :style="{ marginTop: navHeight + 'px' }">
      <view class="admin-buttons">
        <view class="admin-button primary" @tap="openSurveyAsUser">
          <text>打开问卷</text>
        </view>
        <view class="admin-button secondary" @tap="editSurveyUrl">
          <text>编辑问卷URL</text>
        </view>
      </view>
    </view>
	
	<image
	  class="bottom-logo"
	  src="@/static/decorations/survey_logo.png"
	  mode="widthFix"
	></image>
  </view>
</template>

<script>
import { requestWithToken } from '@/modules/requestUtils.js';

export default {
  data() {
    const sys = uni.getSystemInfoSync();
    const statusBarHeight = sys.statusBarHeight || 20;
    const titleBarHeight = 44;
    return {
      isAdmin: false,
      statusBarHeight,
      titleBarHeight,
      navHeight: statusBarHeight + titleBarHeight,
      gradientExtra: 160,
      canGoBack: false,
      baseUrl: 'https://seeu-applets.seeu-edu.com/v2/seeuapp'
    };
  },
  async onLoad() {
    this.isAdmin = await this.checkAdmin();
    
    // If not admin, automatically open survey
    if (!this.isAdmin) {
      await this.openSurveyAsUser();
    }
  },
  onShow() {
    const pages = getCurrentPages();
    this.canGoBack = pages && pages.length > 1;
  },
  methods: {
    async checkAdmin() {
      var og_email = await uni.getStorageSync('email');
      const token = await this.getToken();
      var email = (og_email || "").trim();
      
      console.log(email);
      if (email === "") {
        return false;
      }
      
      try {
        const res = await requestWithToken(
          `https://seeu-applets.seeu-edu.com/v2/seeuapp/admin/check?email=${email}`,
          'POST',
          {},
          token
        );
        if (res.code === 200) {
          console.log(res.data);
          console.log(email);
          return res.data;
        } else {
          console.log(res.code);
          console.log(email);
          console.error('API Error:', res.error);
          return false;
        }
      } catch (e) {
        console.error('Request Failed:', e);
        return false;
      }
    },
    
    async getToken() {
      try {
        const res = await uni.getStorageSync('token');
        return `Bearer ${res}`;
      } catch (e) {
        console.error('Failed to get token:', e);
        throw e;
      }
    },
    
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
      } else {
        // 如果是首页或tab页，不可返回，可改成跳首页
        uni.switchTab({ url: '/pages/index/index' });
      }
    },
    
    async openSurveyAsUser() {
      const memberId = uni.getStorageSync('memberId') || '';
      const token = uni.getStorageSync('token') || '';
      if (!memberId || !token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      
      try {
        // Fetch current URL from backend
        const currentUrl = await this.getCurrentUrl();
        
        if (currentUrl) {
          // Navigate to the URL (open in web view or mini program)
          uni.navigateToMiniProgram({
            appId: 'wxd947200f82267e58',
            path: `pages/wjxqList/wjxqList?activityId=${currentUrl}`,
            success: () => {
              console.log('Successfully opened survey');
            },
            fail: (err) => {
              console.error('Failed to open survey:', err);
              uni.showToast({ title: '打开问卷失败', icon: 'none' });
            }
          });
        } else {
          uni.showToast({ title: '问卷URL未设置', icon: 'none' });
        }
      } catch (e) {
        console.error('Error opening survey:', e);
        uni.showToast({ title: '获取问卷信息失败', icon: 'none' });
      }
    },
    
    async getCurrentUrl() {
      try {
        const token = await this.getToken();
        const res = await requestWithToken(
          `${this.baseUrl}/url/getUrl`,
          'GET',
          {},
          token
        );
        
        if (res.code === 200 && res.data && res.data.url) {
          console.log('Current URL:', res.data.url);
          return res.data.url;
        } else {
          console.error('Failed to get current URL:', res);
          return null;
        }
      } catch (e) {
        console.error('Error fetching current URL:', e);
        return null;
      }
    },
    
    async updateUrl(newUrl) {
      try {
        const token = await this.getToken();
        const res = await requestWithToken(
          `${this.baseUrl}/url/updateUrl?url=${newUrl}`,
          'POST',
          {},
          token
        );
        
        if (res.code === 200) {
          console.log('URL updated successfully');
          uni.showToast({ title: 'URL更新成功', icon: 'success' });
          return true;
        } else {
          console.error('Failed to update URL:', res);
          uni.showToast({ title: 'URL更新失败', icon: 'none' });
          return false;
        }
      } catch (e) {
        console.error('Error updating URL:', e);
        uni.showToast({ title: '网络错误', icon: 'none' });
        return false;
      }
    },
    
    editSurveyUrl() {
      // Show a dialog to edit the URL
      uni.showModal({
        title: '编辑问卷URL',
        editable: true,
        placeholderText: '请输入新的问卷URL或activityId',
        success: async (res) => {
          if (res.confirm && res.content) {
            const newUrl = res.content.trim();
            if (newUrl) {
              await this.updateUrl(newUrl);
            } else {
              uni.showToast({ title: 'URL不能为空', icon: 'none' });
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.page {
  position: relative;
  min-height: 100vh;
  background: #fff;
}

/* 顶部渐变层 */
.top-gradient {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(75, 242, 182, 1) 0%, 
    rgba(75, 242, 182, 0.2) 70%, 
    rgba(75, 242, 182, 0) 100%
  );
}

/* 背景大字 SEEU */
.bg-see-u {
  position: absolute;
  top: -225rpx;
  left: 50%;
  transform: translateX(-50%);
  font-family: "PingFang SC", sans-serif;
  font-weight: 600;
  font-size: 300rpx;
  line-height: 100%;
  text-align: center;
  text-transform: uppercase;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.48) 22.96%,
    rgba(255, 255, 255, 0.12) 75.51%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  z-index: 1;
  pointer-events: none;
}

/* 自定义导航 */
.custom-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 10;
  background: transparent;
}
.nav-inner {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center; /* 保证标题居中 */
  position: relative;
}
.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
  position: relative;
  z-index: 20;
}

/* 返回按钮 */
.back-btn {
  position: absolute;
  left: 20rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 25;
}
.back-arrow {
  font-size: 80rpx;
  color: #111;
  line-height: 1;
}

/* 内容区 */
.card-list {
  padding: 30rpx;
  position: relative;
  z-index: 1;
}
.card {
  margin: 20rpx 0;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.06);
}

.bottom-logo {
  position: fixed;
  bottom: 100rpx;  /* 距离底部 100rpx */
  left: 50%;
  transform: translateX(-50%);
  width: 200rpx;   /* 可调整大小 */
  z-index: 5;
}

/* Admin buttons */
.admin-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.admin-button {
  padding: 40rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.06);
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  transition: all 0.3s ease;
}

.admin-button.primary {
  background: linear-gradient(135deg, #4BF2B6 0%, #3DD9A0 100%);
  color: #fff;
}

.admin-button.secondary {
  background: linear-gradient(135deg, #6C63FF 0%, #5A52E0 100%);
  color: #fff;
}

.admin-button:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>
