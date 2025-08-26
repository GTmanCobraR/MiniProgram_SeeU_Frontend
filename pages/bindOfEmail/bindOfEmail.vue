<template>
  <view class="binding-container">
    <view class="binding-item">
      <label>绑定邮箱</label>
      <input 
        v-model="email" 
        placeholder="请输入您的邮箱" 
        @input="inputEmail"
      />
    </view>
    <view>
      <button class="binding-btn" @click="bindingAdd">{{ buttonText }}</button>
    </view>
  </view>
</template>

<script>
	import { requestWithoutHeader } from '../../modules/requestUtils';
	
import { checkAuthAndRedirect } from '/components/authUtils.js';

export default {
  data() {
    return {
      email: '',
      openId: '',  // 这里我们会从缓存中获取
	  memberId: '', // 这里我们会从缓存中获取
      buttonText: '完成绑定',
    };
  },
  mounted() {
    checkAuthAndRedirect()
	  .then(({ token, memberId }) => {
		this.token = token;
		this.memberId = memberId;
		this.openId = uni.getStorageSync('wechatMiniOpenId');
	  })
	  .catch((err) => {
		console.error(err);
	  });
  },
  methods: {
    inputEmail(event) {
      this.email = event.target.value;
    },
    async bindingAdd() {
      let that = this;
      uni.showLoading({
        title: '绑定中...'
      });

      const postData = {
		email: this.email,
        openId: this.openId,
		memberId: this.memberId
      };
	  console.log('postData:', postData);

      try {
        // Using requestWithoutHeader utility function
        const res = await requestWithoutHeader(
          'https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/memberBase/bindOfEmail',
          'POST',
          postData
        );
      
        uni.hideLoading();
        console.log('res:', res);
      
        if (res.httpStatus == 200) {
          that.saveUserData(res.data);
      
          uni.showToast({
            title: '邮箱绑定成功',
            icon: 'success',
          });
      
          setTimeout(() => {
            uni.navigateBack();
          }, 2000); // Delay for 2 seconds
        } else {
          const fail_message = res.message;
          if (fail_message && fail_message !== '') {
            uni.showToast({
              title: fail_message,
              icon: 'none',
            });
          } else {
            uni.showToast({
              title: '绑定失败，请重试！',
              icon: 'none',
						});
          }
        }
      } catch (error) {
        console.error(error);
        uni.hideLoading();
        uni.showToast({
          title: '请求失败，请稍后重试！',
          icon: 'none',
        });
			}
	},
	saveUserData(data) {
	  const keys = ['token', 'wechatMiniOpenId', 'memberId', 'email', 'userdata'];
	  const values = [data.token, data.wechatMiniOpenId, data.memberId, data.email, data];
	
	  keys.forEach((key, index) => {
		uni.setStorageSync(key, values[index]);
	  });
	},
		
	},
	
};
</script>

<style scoped>
.binding-container {
  padding: 20px;
}

.binding-item {
  margin: 40rpx;
  padding: 20rpx 0 40rpx;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #dedede;
}

.binding-item label {
  font-size: 32rpx;
  margin-right: 10px;
}

.binding-item input {
  flex-grow: 1;
  padding-left: 20rpx;
}

.binding-btn {
  background-color: "white";
  width: 66%;
  color: #4888F4;
  text-align: center;
  border: none;
  cursor: pointer;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  font-weight: 550;
}

.binding-btn:disabled {
  background-color: #c1c1c1;
  cursor: not-allowed;
}
</style>
