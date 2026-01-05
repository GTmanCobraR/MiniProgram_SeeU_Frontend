<template>
  <view class="redirecting">
    <view class="content">
      <image class="character" src="https://seeu-applets.seeu-edu.com/images/static/images/character2.png" mode="widthFix" />
      <text class="text">正在前往投票页面</text>
    </view>
    <image class="logo" src="https://seeu-applets.seeu-edu.com/images/static/icons/seeu.png" mode="widthFix" />
  </view>
</template>

<script>
export default {
  name: 'Activity3',
  onLoad() {
    setTimeout(() => {
      uni.redirectTo({
        url: '../topicVote/topicVote'
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