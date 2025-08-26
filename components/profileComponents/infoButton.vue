<template>
  <view
    class="info-button"
    :style="{ height: buttonHeight + 'rpx' }"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <text class="info-title">{{ title }}</text>
    <view class="info-content">
      <text v-if="subtitle" class="info-subtitle">{{ subtitle }}</text>
      <text class="arrow-icon">></text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'InfoButton',
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    buttonHeight: {
      type: Number,
      default: 100, // Default button height adjusted to rpx
    },
  },
  data() {
    return {
      isTapped: false, // State to manage tap animation
    };
  },
  methods: {
    handleClick() {
      this.$emit('button-click', this.title);
    },
    handleTouchStart() {
      this.isTapped = true;
    },
    handleTouchEnd() {
      this.isTapped = false;
    },
  },
};
</script>

<style scoped>
.info-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  background-color: #ffffff;
  cursor: pointer;
  box-sizing: border-box;
  width: 100%;
  transition: transform 0.1s; /* Smooth transition for the tap animation */
}

.info-button:active {
  transform: scale(0.95); /* Scale down the button slightly on tap */
}

.info-content {
  display: flex;
  align-items: center;
}

.info-title {
  font-size: 26rpx;
  color: #333;
  margin-left: 22rpx;
  font-weight: bold;
}

.info-subtitle {
  font-size: 24rpx; /* Adjusted font size to be smaller */
  color: #999;
  margin-top: 6rpx;
}

.arrow-icon {
  font-size: 36rpx;
  color: #999;
  margin-left: 6rpx;
}
</style>
