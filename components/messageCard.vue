<template>
  <view class="message-card" @click="triggerPayment()">
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
    <!-- <view class="message-right">
      <view class="details-text">消息详情 ></view>
    </view> -->
  </view>
</template>

<script>
import { sendPayment } from '../modules/paymentUtils';
export default {
  props: {
    title: String,           // "已购资料" or "预约沟通"
    mainMessage: String,     // The main message text with a blue dot
    timeMessage: String,     // The time-related message text with a green dot
  },
	methods:{
		navigate(){
			uni.navigateTo({
				url:`/pages/empty/empty`,
			});
		},
		
		triggerPayment() {
		  sendPayment();
		}
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
  margin-bottom: 10px; /* Adds space between cards */
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
  background-color: #4285f4; /* Blue color */
}

.green-dot {
  background-color: #34a853; /* Green color */
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