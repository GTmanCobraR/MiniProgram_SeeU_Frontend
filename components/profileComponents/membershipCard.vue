<template>
  <view class="bottom-card">
    <!-- Container for the text elements, stacked vertically -->
    <Container
      :flexDirection="'column'"
      alignItems="center"
	  justifyContent="center"
	  marginLeft="36rpx"
    >
      <view class="bottom-card-text">
        {{ primaryText }}
      </view>
      <view v-if="secondaryText" class="bottom-card-text-secondary">
        {{ secondaryText }}
      </view>
    </Container>
    
    <!-- Container for the button, aligned to the right -->
    <Container
      :flexDirection="'row'"
      :justifyContent="'flex-start'"
      :alignItems="'flex-start'"
	  marginRight="45rpx"
    >
      <button class="bottom-card-button" @click="handleCardButtonClick">
        {{ buttonText }}
      </button>
    </Container>
  </view>
</template>



<script>

import Container from '../../components/profileComponents/baseContainer.vue';
	
export default {
  components: {
    Container,
  },
	
  name: 'MembershipCard',
  props: {
    primaryText: {
      type: String,
      default: '月度会员',
    },
    secondaryText: {
      type: String,
      default: '',
    },
    buttonText: {
      type: String,
      default: '立即开通',
    },
  },
  methods: {
    handleCardButtonClick() {
      this.$emit('card-button-click');
	  uni.showModal({
	    content: "会员功能尚未开通.",
	    showCancel: false, // No need for a cancel button
	    confirmText: "确认"
	  });
    },
  },
};
</script>

<style scoped>
:host {
  display: contents;
}

.bottom-card {
  width: 640rpx;
  height: 130rpx;
  margin-top: 25rpx;
  border-radius: 20rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between; /* Ensures space between text and button */
  background: url('https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/profilePageImages/1.jpg') no-repeat center center;
  background-size: cover;
}

.bottom-card-text {

  font-size: 36rpx;
  color: #583C24; /* Darker brown color */
  font-weight: bold;
  margin-bottom: 0rpx;
}

.bottom-card-text-secondary {
  font-size: 28rpx;
  color: #7F7F87; /* Darker brown color */
}

.bottom-card-button {
  min-width: 200rpx;
  height: 60rpx;
  color: #583C24; /* Dark brown text color */
  background: linear-gradient(135deg, #f8d59f, #c59747); /* Gradient background */
  border-radius: 30rpx;
  text-align: center;
  line-height: 60rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  outline: none;
  cursor: pointer; /* Adds a pointer on hover */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
