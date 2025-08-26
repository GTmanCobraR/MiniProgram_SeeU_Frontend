<template>
  <view class="info-grid">
    <view
      class="info-item"
      v-for="(item, index) in items"
      :key="index"
      :class="{ clickable: item.page }"
      @click="item.page && $emit('item-click', item)"
    >
      <view class="info-value-wrapper">
        <text class="currency-sign" v-if="item.label === '我的账户'">￥</text>
        <text class="info-value">{{ item.value }}</text>
      </view>
      <text class="info-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
.info-grid {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
  background-color: #ffffff;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-value-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.currency-sign {
  font-size: 20rpx;
  font-weight: bold;
  margin-right: 3rpx; /* Adjust the spacing between the ￥ sign and the value */
}

.info-value {
  font-size: 36rpx;
  font-weight: bold;
}

.info-label {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}
.clickable {
  cursor: pointer;
  opacity: 0.95;
}
.clickable:active {
  opacity: 0.6;
}
</style>