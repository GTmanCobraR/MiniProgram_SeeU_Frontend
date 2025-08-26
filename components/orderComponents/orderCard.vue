<template>
  <view class="message-card" @tap="navigate">
    <!-- Left part -->
    <view class="message-left">
      <view class="message-title">{{ title }}</view>
      <view class="message-content">
        <view class="dot blue-dot"></view>
        <view class="message-text">{{ mainMessage }}</view>
      </view>
      <view class="message-content">
        <view class="dot green-dot"></view>
        <view class="message-text">{{ timeMessage }}</view>
      </view>
    </view>
    
    <!-- Right part -->
    <view class="message-right">
      <view class="details-text">详情 ></view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    title: String,           
    mainMessage: String,     
    timeMessage: String,     
    type: String,            // Order type prop
    link: String              // URL for PDF or other details
  },
  methods: {
    navigate() {
      // Handle navigation based on order type
      if (this.type === '面经') {
        this.navigateToPdfViewer(this.link || 'https://seeuedu-file.oss-cn-shenzhen.aliyuncs.com/interview_file/job/Amazon%20Workstyle%20Assessment.pdf');
      } else if (this.type === '案例') {
        this.openDetailPage(this.link || '7c95a99c86b14a66996239d964d41da1');
      } else if (this.type === '课程') {
        uni.navigateTo({
          url: '/pages/courseDetail/courseDetail?courseID=' + this.link,

        });
      }
    },
    navigateToPdfViewer(filePath) {
      uni.navigateTo({
        url: `/pages/pdf-viewer/pdf-viewer?filePath=${encodeURIComponent(filePath)}`,
      });
    },
	
	openDetailPage(id) {
	  wx.navigateTo({
	    url: `/pages/job_detail/job_detail?id=${encodeURIComponent(id)}`,
	  });
	},
  }
};
</script>

<style scoped>
.message-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  background-color: #ffffff;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}

.message-left {
  display: flex;
  flex-direction: column;
}

.message-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.message-content {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.blue-dot {
  background-color: #4285f4;
}

.green-dot {
  background-color: #34a853;
}

.message-text {
  font-size: 14px;
  color: #666;
}

.message-right {
  display: flex;
  align-items: flex-start;
}

.details-text {
  color: #888;
  font-size: 14px;
}
</style>
