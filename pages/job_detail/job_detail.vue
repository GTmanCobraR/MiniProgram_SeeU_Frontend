<template>
  <view class="container">
    <!-- 内容容器 -->
    <view class="content-container">
      <!-- 公司信息 -->
      <view class="company-info">
        <image src="https://seeu-applets.seeu-edu.com/images/static/images/company_logo.jpg" class="company-logo" />
        <text class="company-title">{{ item.offerCompany }}</text>
      </view>

      <!-- 用户信息 -->
      <view class="user-info">
        <view class="user-section">
          <image src="https://seeu-applets.seeu-edu.com/images/static/images/person_icon.jpg" class="user-icon" />
          <view class="text-container">
            <text class="user-text">姓名</text>
            <text class="user-value">{{ item.studentName }}</text>
          </view>
        </view>
        <view class="divider"></view>
        <view class="user-section">
          <image src="https://seeu-applets.seeu-edu.com/images/static/images/book_icon.jpg" class="user-icon" />
          <view class="text-container">
            <text class="user-text">学历与专业</text>
            <text class="user-value">{{ item.educational === '0' ? '本科' : item.educational === '1' ? '研究生' : '博士' }} · {{ item.major }}</text>
          </view>
        </view>
        <view class="divider"></view>
        <view class="user-section">
          <image src="https://seeu-applets.seeu-edu.com/images/static/images/briefcase_icon.jpg" class="user-icon" />
          <view class="text-container">
            <text class="user-text">岗位</text>
            <text class="user-value">{{ item.post }}</text>
          </view>
        </view>
        <view class="divider"></view> <!-- 在岗位数据下方添加一条横线 -->
      </view>

      <!-- 公司介绍 -->
      <view class="company-description">
        <view class="section-header">公司介绍</view>
        <text class="description-text special-line-height">{{ item.companyIntroduction }}</text>
        <view class="section-header special-line-height">学生背景</view>
        <text class="description-text">{{ item.studentBg }}</text>
		<view class="link-text special-line-height">LinkedIn链接（仅对vip开放）</view>
		<text class="link-url">{{ item.linkedIn }}</text>
        <view class="section-header special-line-height">辅导情况</view>
        <text class="description-text">{{ item.counselingSituation }}</text>
      </view>
    </view>

    <!-- 底部水印文字 -->
    <view class="watermark-text-container">
      <text class="watermark-text">—— 让 OFFER 触 手 可 及 ——</text>
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
      await this.fetchJobDetail(options.id);
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
    async fetchJobDetail(id) {
      try {
        const res = await requestWithToken(
          `https://seeu-applets.seeu-edu.com/seeuapp/exampleOfJob/get/${id}`,
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
html, body {
  overflow-x: hidden;
}

.container {
  padding: 20px;
  background-color: #f0f0f0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 将数据置顶 */
  align-items: center;
  overflow-x: hidden; /* 禁止横向滚动 */
}

.content-container {
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100;
  max-width: 600px;
  padding: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 将内容靠上对齐 */
}

.content-container::before {
  content: '';
  background-image: url('https://seeu-applets.seeu-edu.com/images/static/images/watermark.jpg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain; /* 设置水印图片的具体尺寸 */
  opacity: 0.1; /* 设置水印图片的透明度 */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0; /* 确保水印图片在内容下方 */
}

.company-info {
  display: flex;
  align-items: center; /* 将内容靠左对齐 */
  padding: 16px;
  z-index: 1; /* 确保内容在水印图片上层 */
}

.company-logo {
  width: 32px; /* 缩小为原来的三分之一 */
  height: 32px; /* 缩小为原来的三分之一 */
  margin-right: 16px;
}

.company-title {
  font-size: 20px;
  font-weight: bold;
  text-align: left; /* 将文本靠左对齐 */
}

.user-info {
  padding: 16px;
  z-index: 1; /* 确保内容在水印图片上层 */
  width: 100%; /* 确保user-info占据整个宽度 */
}

.user-section {
  display: flex;
  align-items: center;
  margin-bottom: 8px; /* 统一行距 */
  width: 100%; /* 确保user-section占据整个宽度 */
}

.user-icon {
  width: 24px;
  height: 24px;
  margin-right: 16px;
}

.text-container {
  display: flex;
  flex-direction: column;
  width: 100%; /* 确保text-container占据整个宽度 */
}

.user-text{
  font-size: 14px;
  color: #6A7BA2; /* 将文本颜色设置为蓝灰色 */
  line-height: 1.6;
  text-align: left; /* 将文本靠左对齐 */
}

.user-value {
  font-size: 16px;
  color: #333;
  text-align: left; /* 将文本靠左对齐 */
  margin-bottom: 8px; /* 增加下边距以便于放置divider */
}

.divider {
  width: calc(100% - 30px); /* 减去左右边距 */
  height: 1px;
  background-color: #e0e0e0;
  margin-bottom: 8px; /* 增加下边距以便于放置divider */
}

.company-description {
  padding: 0 16px; /* 确保与其他部分的内边距一致 */
  z-index: 1; /* 确保内容在水印图片上层 */
}

.section-header {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: left; /* 将文本靠左对齐 */
  line-height: 1.5;
}

.description-text, .link-url {
  font-size: 14px;
  color: #6A7BA2; /* 将文本颜色设置为蓝灰色 */
  text-align: left; /* 将文本靠左对齐 */
  line-height: 1.5;
}

.link {
  display: flex;
  align-items: center;
  line-height: 1.5;
}

.watermark-text-container {
  display: flex;
  justify-content: center;
  margin-top: 10px; /* 统一行距 */
  width: 100%;
}

.watermark-text {
  font-size: 14px;
  color: #999999;
  text-align: left; /* 将文本靠左对齐 */
}

.special-line-height {
  display: block;
  line-height: 1.5; /* 默认行距 */
}

.special-line-height::first-line {
  line-height: 2.5; /* 第一行的行距 */
}

.special-line-height::last-line {
  line-height: 2.5; /* 最后一行的行距 */
}
</style>
