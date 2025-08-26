<template>
  <view class="container">
    <!-- University Information -->
    <view class="university-info">
      <image :src="item.image" class="university-logo"/>
      <text class="university-title">{{ item.title }}</text>
      <text class="university-name">{{ item.universityName }}</text>
    </view>

    <!-- User Information -->
    <view class="user-info">
      <view class="user-section">
        <image src="https://seeutest.duckdns.org/images/static/icons/user.jpg" class="icon" />
        <view class="text-container">
          <text class="user-text">姓名</text>
          <text class="user-value">{{ item.userName }}</text>
        </view>
      </view>
      <view class="divider"></view>
      <view class="user-section">
        <image src="https://seeutest.duckdns.org/images/static/icons/university.jpg" class="icon" />
        <view class="text-container">
          <text class="user-text">本科院校</text>
          <text class="user-value">{{ item.undergraduateUniversity }}</text>
        </view>
      </view>
      <view class="divider"></view>
      <view class="user-section">
        <image src="https://seeutest.duckdns.org/images/static/icons/major.jpg" class="icon" />
        <view class="text-container">
          <text class="user-text">本科专业</text>
          <text class="user-value">{{ item.undergraduateMajor }}</text>
        </view>
      </view>
      <view class="divider"></view>
      <view class="user-section">
        <image src="https://seeutest.duckdns.org/images/static/icons/gpa.jpg" class="icon" />
        <view class="text-container">
          <text class="user-text">GPA</text>
          <text class="user-value">{{ item.gpa }}</text>
        </view>
      </view>
      <view class="divider"></view>
      <view class="user-section">
        <image src="https://seeutest.duckdns.org/images/static/icons/language.jpg" class="icon" />
        <view class="text-container">
          <text class="user-text">语言成绩</text>
          <text class="user-value">{{ item.languageScore }}</text>
        </view>
      </view>
      <view class="divider"></view>
      <view class="user-section">
        <image src="https://seeutest.duckdns.org/images/static/icons/gre.jpg" class="icon" />
        <view class="text-container">
          <text class="user-text">GRE/GMAT</text>
          <text class="user-value">{{ item.greGmat }}</text>
        </view>
      </view>
    </view>

    <!-- Soft Skills Background -->
    <view class="soft-skills">
      <view class="section-header">软实力背景</view>
      <text class="description-text soft-skills-text">{{ item.softSkillsBackground }}</text>
    </view>

    <!-- Bottom Watermark -->
    <view class="watermark">
          <image src="https://seeutest.duckdns.org/images/static/images/watermark.jpg" mode="aspectFill" class="watermark-image"/>
          <text class="watermark-text">—— 让 OFFER 触 手 可 及 ——</text>
        </view>
      </view>
</template>

<script>
export default {
  data() {
    return {
      item: {
        image: 'https://seeutest.duckdns.org/images/static/images/university_logo.jpg', // Replace with actual data
        title: '研究生院校名称研究生院校名称',
        universityName: '研究生院校名称',
        userName: '某某某',
        undergraduateUniversity: '某某某大学',
        undergraduateMajor: '计算机科学',
        gpa: 'XXX',
        languageScore: 'XXX',
        greGmat: 'XXX',
        softSkillsBackground: '具备跨文化沟通能力，适应多元文化环境，有效与国际同学和教授交流。同时，拥有出色的团队协作能力，参与多个项目。',
      }
    };
  },
  onLoad(options) {
    if (options.item) {
      this.item = JSON.parse(decodeURIComponent(options.item));
    }
  }
};
</script>

<style>
.container {
  padding: 20px;
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.university-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  background-color: #f9f9f9;
  border-radius: 10px;
  margin-bottom: 20px;
  width: 100%;
}

.university-logo {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
}

.university-title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: #333;
}

.university-name {
  font-size: 14px;
  color: #888;
  margin-top: 5px;
  text-align: center;
}

.user-info {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
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
  width: 100%;
  height: 1px;
  background-color: #e0e0e0;
}

.section-header {
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
  color: #333;
}

.description-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.soft-skills-text {
  color: #999999; /* Set the text color to gray */
}

.watermark {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
}

.watermark-image {
  width: 80%;
  opacity: 0.1;
}

.watermark-text {
  font-size: 14px;
  color: #999999;
  margin-top: 10px;
}
</style>



