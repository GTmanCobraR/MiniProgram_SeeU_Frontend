<template>
  <view class="container">
    <!-- Company Information -->
    <view class="company-info">
      <image :src="item.image" class="company-logo" />
      <text class="company-title">{{ item.companyName }}</text>
    </view>

    <!-- User Information -->
    <view class="user-info">
      <view class="user-section">
        <image src="https://seeu-applets.seeu-edu.com/images/static/images/person_icon.jpg" class="user-icon" />
        <view class="text-container">
          <text class="user-text">{{ item.userName }}</text>
        </view>
      </view>
      <view class="divider"></view>
      <view class="user-section">
        <image src="https://seeu-applets.seeu-edu.com/images/static/images/book_icon.jpg" class="user-icon" />
        <view class="text-container">
          <text class="user-text">本科 · 计算机科学</text>
        </view>
      </view>
      <view class="divider"></view>
      <view class="user-section">
        <image src="https://seeu-applets.seeu-edu.com/images/static/images/briefcase_icon.jpg" class="user-icon" />
        <view class="text-container">
          <text class="user-text">{{ item.position }}</text>
        </view>
      </view>
    </view>

    <!-- Company Description -->
    <view class="company-description">
      <view class="section-header">公司介绍</view>
      <text class="description-text">{{ item.description }}</text>
      <view class="link">
        <text class="link-text">LinkedIn链接（仅对vip开放）</text>
        <text class="link-url">xxx.com</text>
      </view>
      <view class="section-header">学生背景</view>
      <text class="description-text">{{ item.studentBackground }}</text>
      <view class="section-header">西游单个招聘及辅导情况</view>
      <text class="description-text">{{ item.recruitmentInfo }}</text>
    </view>

    <!-- Bottom Watermark -->
    <view class="watermark">
      <image src="https://seeu-applets.seeu-edu.com/images/static/images/watermark.jpg" class="watermark-image" />
    </view>
    <view class="watermark-text-container">
      <text class="watermark-text">—— 让 OFFER 触 手 可 及 ——</text>
    </view>
  </view>
</template>

<script>
import { companyList } from '/components/detail_list.js'; // Adjust the path as needed

export default {
  data() {
    return {
      item: companyList[0], // Initialize with the first item or adjust as needed
    };
  },
  onLoad(options) {
    if (options.itemIndex) {
      this.item = companyList[options.itemIndex];
    }
  }
};
</script>

<style>
.container {
  padding: 16px;
  background-color: #ffffff;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

.company-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.company-logo {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.company-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.user-info {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.user-section {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.user-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.text-container {
  display: flex;
  flex-direction: column;
}

.user-text {
  font-size: 16px;
  color: #333;
}

.user-subtext {
  font-size: 14px;
  color: #666;
}

.divider {
  width: 100%;
  height: 1px;
  background-color: #e0e0e0;
  margin-bottom: 16px;
}

.company-description {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
}

.section-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  margin-top: 16px;
  color: #333;
}

.description-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.link {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.link-text {
  font-size: 14px;
  color: #333;
}

.link-url {
  font-size: 14px;
  color: #4285f4;
  margin-left: 8px;
}

.watermark {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.watermark-image {
  width: 100%;
  opacity: 0.1;
}

.watermark-text-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.watermark-text {
  font-size: 14px;
  color: #999999;
}
</style>


