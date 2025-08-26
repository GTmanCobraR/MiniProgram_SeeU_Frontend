<template>
  <view class="profile-header">
    <Container backgroundColor="transparent" boxShadow="none" :expandable="true" flexDirection = "row" margin-top="35rpx" margin-left="10rpx">
      <image class="profile-avatar" :src="avatarUrl" />
      <view class="profile-info">
		<Container backgroundColor="transparent" boxShadow="none" flexDirection = "row" justifyContent="center" alignItems="center">
			<view class="profile-name">{{ username }}</view>
			<image 
			    v-if="showVip" 
			    src="https://seeutest.duckdns.org/images/static/vip-banner.jpg" 
			    class="vip-icon" 
			  />
		</Container>
		<Container backgroundColor="transparent" boxShadow="none" flexDirection = "row" justifyContent="center" alignItems="center">
			<button class="bind-email-button" @click="handleBindEmailClick">
				<text>绑定邮箱</text>
			</button>
		</Container>
		<image 
		      v-if="showVip" 
		      src="https://seeutest.duckdns.org/images/static/vip-banner.jpg" 
		      class="vip-icon" 
		/>
        <!-- <MembershipBenefitButton 
          membershipBenefit="积分福利" 
          @button-click="handleBenefitClick" 
        /> -->
      </view>
    </Container>
	
	<Container backgroundColor="transparent" boxShadow="none" justifyContent="center" alignItems="center" marginTop="60rpx">
	  <MembershipCard 
		primaryText="月度会员" 
		buttonText="立即开通" 
		@card-button-click="handleCardButtonClick" 
	  />
	</Container>
  </view>
</template>

<script>
import MembershipBenefitButton from './membershipBenefits.vue';
import Container from '../../components/profileComponents/baseContainer.vue';
import MembershipCard  from '../../components/profileComponents/membershipCard.vue';

export default {
  components: {
    MembershipBenefitButton,
    Container,
    MembershipCard,
  },
  props: {
    avatarUrl: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      default: 'Seeu User',
    },
	showVip: {
	    type: Boolean,
	    default: false
	  }
  },
  methods: {
    handleBenefitClick() {
      this.$emit('benefit-click');
    },
    handleCardButtonClick() {
      this.$emit('card-button-click');
    },
    handleBindEmailClick() {
      // Retrieve the stored email from local storage
      const storedEmail = uni.getStorageSync('email');
	  // console.log("storedemail", storedEmail);

      // Check if the email exists and is not empty
      if (storedEmail && storedEmail !== '') {
        // Show a modal to inform the user that the email is already bound
        uni.showModal({
          content: "您已绑定邮箱",
          showCancel: false, // No need for a cancel button
          confirmText: "确认"
        });
      } else {
        // If the email is not bound, navigate to the bind email page
        uni.navigateTo({
          url: '/pages/bindOfEmail/bindOfEmail',
        });
        this.$emit('bind-email-click');
      }
    },
  },
};
</script>

<style>
:host {
  display: contents;
}
</style>

<style scoped>
.profile-header {
  background: url('https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/profilePageImages/profileHeaderBackground.jpg') no-repeat center center;
  background-size: cover;
  height: 180rpx;
  
  flex: 1 1 0; /* Moved from inline style */
}

.profile-avatar {
  width: 158rpx;
  height: 158rpx;
  border-radius: 100%;
  margin-left: 40rpx;
  border: 6rpx solid #4888F4;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  margin-left: 30rpx;
}

.profile-name {
  font-size: 38rpx;
  font-weight: bold;
  color: #4D4E50;
  margin-top: 15rpx;
  margin-bottom: 20rpx;
  transform: scaleY(1.02); /* Adjust the scale factor as needed */
  transform-origin: top; 
}


.bind-email-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white; /* Background is now white */
  color: #4888F4; /* Text color is blue */
  border: none;
  border-radius: 25rpx;
  font-size: 28rpx;
  height: 56rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2); /* Add shadow */
  font-weight: bold;
}
.vip-icon {
  width: 40rpx;
  height: 40rpx;
  margin-left: 10rpx;
}
</style>