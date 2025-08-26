<template>
  <view class="card-list">
    <view
      v-for="(item, index) in surveys"
      :key="index"
      class="card"
      @tap="openSurvey(item.activityId)"
    >
      <text>{{ item.title }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      surveys: [
        { title: "问卷A", activityId: "Q1w1pE3" },
        { title: "问卷B", activityId: "Q1w1pE3" },
        { title: "问卷C", activityId: "Q1w1pE3" }
      ]
    };
  },
  methods: {
    openSurvey(activityId) {
      const memberId = uni.getStorageSync('memberId') || '';
      const token = uni.getStorageSync('token') || '';

      if (!memberId || !token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      // Open WJX Mini Program
      uni.navigateToMiniProgram({
        appId: 'wxd947200f82267e58',
        path: `pages/wjxqList/wjxqList?activityId=${activityId}`,
        success() {
          console.log('跳转问卷成功');
        }
      });

      // You don't need to pass memberId/token to WJX — handle them in jumpback.vue
    }
  }
};
</script>

<style scoped>
.card-list {
  padding: 30rpx;
}
.card {
  margin: 20rpx;
  padding: 30rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}
</style>
