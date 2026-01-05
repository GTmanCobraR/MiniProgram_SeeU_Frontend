<template>
  <view class="container">
    <view class="content-box">
      <!-- University Information -->
      <view class="university-info section">
        <text class="university-name"> {{ item.graduateCollege }}</text>
      </view>

      <!-- User Information -->
      <view class="user-info section">
        <view class="user-section">
          <image src="https://seeu-applets.seeu-edu.com/images/static/icons/user.jpg" class="icon" />
          <view class="text-container">
            <text class="user-text">姓名</text>
            <text class="user-value">{{ item.studentName }}</text>
          </view>
        </view>
        <view class="divider"></view>
        <view class="user-section">
          <image src="https://seeu-applets.seeu-edu.com/images/static/icons/university.jpg" class="icon" />
          <view class="text-container">
            <text class="user-text">本科院校</text>
            <text class="user-value">{{ item.undergraduatedCollege }}</text>
          </view>
        </view>
        <view class="divider"></view>
        <view class="user-section">
          <image src="https://seeu-applets.seeu-edu.com/images/static/icons/major.jpg" class="icon" />
          <view class="text-container">
            <text class="user-text">本科专业</text>
            <text class="user-value">{{ item.major }}</text>
          </view>
        </view>
        <view class="divider"></view>
        <view class="user-section">
          <image src="https://seeu-applets.seeu-edu.com/images/static/icons/gpa.jpg" class="icon" />
          <view class="text-container">
            <text class="user-text">GPA</text>
            <text class="user-value">{{ item.gpa }}</text>
          </view>
        </view>
        <view class="divider"></view>
        <view class="user-section">
          <image src="https://seeu-applets.seeu-edu.com/images/static/icons/language.jpg" class="icon" />
          <view class="text-container">
            <text class="user-text">语言成绩</text>
            <text class="user-value">{{ item.languageScore }}</text>
          </view>
        </view>
        <view class="divider"></view>
        <view class="user-section">
          <image src="https://seeu-applets.seeu-edu.com/images/static/icons/gre.jpg" class="icon" />
          <view class="text-container">
            <text class="user-text">GRE/GMAT</text>
            <text class="user-value">{{ item.greGmat }}</text>
          </view>
        </view>
		<view class="divider"></view>
      </view>

      <!-- Soft Skills Background -->
      <view class="soft-skills section">
        <view class="section-header">软实力背景</view>
        <text class="description-text soft-skills-text">{{ item.softPowerBg }}</text>
      </view>

      <!-- Bottom Watermark -->
      <view class="watermark">
        <image src="https://seeu-applets.seeu-edu.com/images/static/images/watermark.jpg" mode="aspectFill" class="watermark-image"/>
        <text class="watermark-text">—— 让 OFFER 触 手 可 及 ——</text>
      </view>
    </view>
  </view>
</template>

<script>
	import { requestWithToken } from '@/modules/requestUtils.js';
	
export default {
  data() {
    return {
      item: {},
    };
  },
  async onLoad(options) {
    if (options.id) {
      await this.fetchStudyDetail(options.id);
    }
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
    // async requestWithToken(url, method, data) {
    //   try {
    //     const token = await this.getToken();
    //     const res = await uni.request({
    //       url,
    //       method,
    //       data,
    //       header: {
    //         'Content-Type': 'application/json',
    //         'Authorization': token
    //       }
    //     });
    //     return res.data;
    //   } catch (e) {
    //     this.handleAuthError();
    //     throw e;
    //   }
    // },
    async fetchStudyDetail(id) {
      try {
        const res = await requestWithToken(
          `https://seeu-applets.seeu-edu.com/seeuapp/exampleOfGraduate/get/${id}`,
          'GET',
					this.getToken()
        );
        if (res.code === 200) {
          this.item = res.data;
        } else {
          console.error('API Error:', res.message);
          this.handleAuthError();
        }
      } catch (e) {
        console.error('Request Failed:', e);
      }
    },
    handleAuthError() {
      uni.showToast({
        title: '认证失败，请重新登录',
        icon: 'none',
        duration: 2000,
        complete() {
          wx.navigateTo({
            url: '/pages/index/index' // 跳转到登录页面
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f0f0f0; 
  min-height: 100vh;
  display: flex;
  justify-content: center; 
  align-items: center; 
}

.content-box {
  background-color: #ffffff; 
  padding: 20px;
  border-radius: 10px; 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

.section {
  padding: 15px 10px; /* 设置统一的内边距 */
   
}

.university-info {
  display: flex;
  align-items: center; /* 使子元素上下居中 */
  justify-content: center; /* 使子元素左右居中 */
  padding: 20px 0; /* 添加内边距，以便更好地控制行距 */
}

.university-name {
  font-size: 20px; 
  font-weight: bold; 
  color: #000; 
  text-align: center; /* 居中对齐文本 */
}
.user-info {
  background-color: #ffffff;
  border-radius: 10px;
  width: 100%;
}

.user-section {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.text-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
}

.user-text {
  font-size: 14px;
  color: #666;
}

.user-value {
  font-size: 16px;
  color: #333;
}

.divider {
   width: calc(100% - 20px); /* 减去左右边距 */
   height: 1px;
   background-color: #e0e0e0;
}

.section-header {
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
  color: #333;
  text-align: left;
}

.description-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  text-align: left;
}

.soft-skills-text {
  color: #999999; 
}

.watermark {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
  width: 100%; 
}

.watermark-image {
  width: 80%;
  opacity: 1;
}

.watermark-text {
  font-size: 14px;
  color: #999999;
  margin-top: 10px;
  text-align: center;
}
</style>
