<template>
  <view class="benefit-container">
    <image
      class="benefit-button-image"
      src="https://seeutest.duckdns.org/images/static/profilePageImages/membershipButton.jpg"
      @tap="handleTap"
      hover-class="imagehover"
      hover-stay-time="200"
    />
  </view>
</template>
<script>
export default {
  props: {
    membershipBenefit: {
      type: String,
      default: '积分福利', // Text for the benefit button
    },
  },
  data() {
    return {};
  },
  methods: {
    handleTap() {
      this.$emit('button-click');
    },
  },
};
</script>
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

.benefit-button-image {
  width: 200rpx; /* Adjust width as needed */
  height: 50rpx; /* Adjust height as needed */
  border-radius: 10rpx; /* Add border-radius if needed */
  transition: transform 0.1s ease;
}

.imagehover {
  transform: scale(0.97); /* Shrinks the button slightly when clicked */
}
</style>
