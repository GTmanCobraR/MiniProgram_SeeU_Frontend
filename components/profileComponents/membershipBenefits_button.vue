<template>
  <view class="benefit-container">
    <image class="coin-icon" :src="coinIconUrl" />
    <view 
      class="benefit-button" 
      @tap="handleTap" 
      hover-class="viewhover"
	  hover-stay-time="200"
    >
      {{ membershipBenefit }}
    </view>
  </view>
</template>

<script>
export default {
  props: {
    membershipBenefit: {
      type: String,
      default: '积分福利', // Text for the benefit button
    },
    coinIconUrl: {
      type: String,
      default: 'https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/icons/coin.png', // Path to the coin icon
    }
  },
  data() {
    return {
    };
  },
  methods: {
    handleTap() {
      
		this.$emit('button-click'); 
    },
  },
};
</script>

<style>
:host {
  display: contents;
}
</style>

<style scoped>
.benefit-container {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
  width: auto; /* Ensure the container has auto width */
}

.coin-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 8rpx;
}

.benefit-button {
  background-color: #f0f7ff;
  color: #296AEF;
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  white-space: nowrap; /* Prevent the text from wrapping */
  transition: transform 0.1s ease, color 0.1s ease;
}

.viewhover {
  transform: scale(0.97); /* Shrinks the button slightly when clicked */
  color: #000000; /* Changes text color to black */
}
</style>
