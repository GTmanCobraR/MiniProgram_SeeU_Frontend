<template>
  <view class="vip-form-page">
    <view class="form-container">
      <text class="vip-title">注册会员信息</text>
      <view class="form-row">
        <input v-model="vipForm.name" placeholder="会员姓名" class="form-input" />
      </view>
      <view class="form-row">
        <input v-model="vipForm.nickname" placeholder="会员昵称" class="form-input" />
      </view>
	  <view class="form-row">
	    <input v-model="vipForm.phone" placeholder="手机号" class="form-input" />
	  </view>
      <view class="form-row">
        <input v-model="vipForm.email" placeholder="邮箱" class="form-input" />
      </view>
      <view class="form-row">
        <button class="form-submit" @tap="submitVipForm">提交</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      vipForm: {
        name: '',
        nickname: '',
        phone: '',  
        email: '',
        level: 0
      }
    };
  },
  methods: {
    submitVipForm() {
      if (!this.vipForm.name || !this.vipForm.nickname || !this.vipForm.email) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' });
        return;
      }
	  this.vipForm.level = 1;
      // Simulate saving the data to backend or local storage
      console.log('VIP User Info:', this.vipForm);
      uni.setStorageSync('userdata', this.vipForm);
      uni.showToast({ title: '提交成功！', icon: 'success' });
      setTimeout(() => {
        uni.navigateBack();
      }, 800);
    }
  }
};
</script>

<style>
.vip-form-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
  background: #f8f8f8;
  min-height: 100vh;
}

.form-container {
  width: 100%;
  max-width: 700rpx;
  background: #fff;
  padding: 30rpx;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.vip-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  text-align: center;
}

.form-row {
  width: 100%;
  margin-bottom: 20rpx;
}

.form-input {
  width: 100%;
  border: 1px solid #ccc;
  padding: 30rpx 20rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  direction: ltr;
  unicode-bidi: normal;
  transform: none;
  font-family: Arial, Helvetica, sans-serif; /* Force clear English font */
  text-align: left; /* Ensure left alignment */
  color: #333; /* Optional: improve contrast */
}


.form-submit {
  width: 100%;
  background: #4db3ff;
  color: white;
  padding: 20rpx 0;
  border-radius: 10rpx;
  font-size: 30rpx;
  border: none;
}
</style>
