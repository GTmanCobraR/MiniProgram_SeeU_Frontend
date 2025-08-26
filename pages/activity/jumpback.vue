<template>
  <view class="container">
    <text class="message">欢迎回来</text>
  </view>
</template>

<script>
import {addPoints} from '@/util/points.js' // adjust path if needed

export default {
  data() {
    return {
      message: '正在处理积分...'
    };
  },
  onLoad(query) {
    const { activityId, userId, token } = query;

    if (!activityId || !userId || !token) {
      this.message = '参数缺失，无法发放积分';
      return;
    }

    this.handleSurveyReward(activityId, userId, token);
  },
  methods: {
    async handleSurveyReward(activityId, memberId, token) {
      try {
        const added = await addPoints("wjx", activityId, memberId, token);

        if (added === 0) {
          this.message = '您已提交过该问卷，积分无法重复领取。';
        } else {
          this.message = `问卷提交成功，积分 +${added}！`;
        }
      } catch (err) {
        console.error(err);
        this.message = '积分发放失败，请稍后重试。';
      }
    }
  }
};
</script>

<style scoped>
.container {
  padding: 80rpx;
  text-align: center;
}
.message {
  font-size: 36rpx;
  color: #333;
}
</style>
