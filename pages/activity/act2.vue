<template>
  <view class="redirecting">
    <view class="content">
      <image class="character" src="https://seeutest.duckdns.org/images/static/images/character2.png" mode="widthFix" />
      <text class="text">正在前往线下活动</text>
    </view>
    <image class="logo" src="https://seeutest.duckdns.org/images/static/icons/seeu.png" mode="widthFix" />
  </view>
</template>


<script>
export default {
  name: 'Activity2',
  onLoad() {
    // 使用 redirectTo 替代 navigateTo，防止用户返回时回到此中转页
    setTimeout(() => {
      uni.redirectTo({
        url: '../offlineEvent/offlineEvent'  // 请确保此路径存在并已在 pages.json 注册
      });
    }, 300);
  }
};
</script>

<style scoped>
.redirecting {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100vh;
  padding: 60rpx 0;
  background-color: #fff;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.character {
  width: 300rpx;
  margin-bottom: 30rpx;
}

.text {
  font-size: 32rpx;
  color: #000000;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica", "Arial", sans-serif;
  font-weight: bold;
}

.logo {
  width: 150rpx;
  margin-bottom: 85rpx;
}
</style>