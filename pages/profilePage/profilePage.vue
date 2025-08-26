<template>
  <Container class="profile-page" :expandable="true">

    <!-- Container for ProfileHeader -->
    <Container :zIndex="0" :expandable="false" height="400rpx">
      <ProfileHeader 
        :avatarUrl="avatarUrl" 
        :username="username" 
		:showVip="level === 1"
        @benefit-click="handleBenefitClick" 
      />
    </Container>

    <!-- Container for InfoGrid -->
    

    <!-- Container for InfoButtons -->
    <Container 
      :zIndex="1" 
      boxShadow="0 32rpx 64rpx rgba(0, 0, 0, 1)" 
      backgroundColor="#f5f5f5" 
      :expandable="true" 
    >
      <!-- Nested InfoButton components -->
      
      <Container marginBottom="20rpx" :zIndex="0" backgroundColor="#ffffff" justifyContent="center" height="150rpx">
      <InfoGrid :items="grid1Items" @item-click="handleGridItemClick" />
      </Container>
      
      <Container marginBottom="20rpx" :zIndex="0" backgroundColor="#ffffff">
        <text class="zichan">西游资产</text>
        <InfoGrid :items="grid2Items" />
      </Container>

      <Container marginBottom="20rpx" :zIndex="0" backgroundColor="#ffffff">
        <InfoButton 
          title="订单" 
          subtitle="查看全部订单" 
          :buttonHeight="100" 
          @button-click="handleButtonClick" 
        />
      </Container>

      <Container marginTop="0rpx" marginBottom="20rpx" :zIndex="0" backgroundColor="#ffffff">
        <InfoButton 
          title="消息通知" 
          :buttonHeight="100" 
          @button-click="handleButtonClick" 
        />
      </Container>

      <Container marginTop="0rpx" marginBottom="20rpx" :zIndex="0" backgroundColor="#ffffff">
        <InfoButton 
          title="预约沟通" 
          :buttonHeight="100" 
          @button-click="handleButtonClick" 
        />
      </Container>

      <!-- Placeholder to fill remaining space -->
    </Container>
  </Container>
</template>

<script>
import ProfileHeader from '../../components/profileComponents/profileHeader.vue';
import InfoButton from '../../components/profileComponents/infoButton.vue';
import Container from '../../components/profileComponents/baseContainer.vue';
import InfoGrid from '../../components/profileComponents/infoGrid.vue';
import { getPoints } from '@/modules/pointsUtils.js';

export default {
  components: {
    ProfileHeader,
    InfoButton,
    Container,
    InfoGrid,
  },
  data() {
    return {
      avatarUrl: 'https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/profilePageImages/applets.jpg',
      username: '登录会员',  
	  level: 0,
      isLoading: true,
      grid1Items: [
        { label: '我的已购' },
        { label: '我的收藏', page: '/pages/profilePage/favorited' },
      ],
      grid2Items: [
        { label: '我的账户' },
        { value: '0', label: '我的积分' },
        { value: '0', label: '我的券码' },
      ],
    };
  },
  created() {
    this.load();
  },
  onShow() {
    this.load();
  },
  methods: {
    async load() {
		console.log("loading");
		var memberId = uni.getStorageSync('memberId');
		var token = uni.getStorageSync('token');
		const points = await getPoints(memberId, token);
				
		this.grid2Items.find(item => item.label === '我的积分').value = points;
		this.isLoading = true;
		try {
		  // Fetch user data from storage
		  const storedData = uni.getStorageSync('userdata');
		  console.log("storedData", storedData)
		  if (storedData && storedData.memberName) {
			this.username = storedData.memberName || '登录会员';
			this.level = storedData.level || 0;
		  } else {
			// Fallback in case no valid data is found
			this.username = '登录会员';
		  }
		  
		  // Optionally, you can also fetch avatarUrl from storage if needed
		  this.avatarUrl = storedData && storedData.avatarUrl ? storedData.avatarUrl : this.avatarUrl;

		} catch (error) {
		  console.error('Error loading user data from storage:', error);
		} finally {
		  this.isLoading = false;
		}
    },
	handleGridItemClick(item) {
	  console.log(item);
	  if (item.page) {
	    uni.navigateTo({ url: item.page });
	  }
	},
    handleBenefitClick() {
		
		console.log("Clicking on the benefit button...")
		
	},
    async handleButtonClick(title) {
        while (this.isLoading) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
    
        if (title === '订单') {
          uni.navigateTo({
            url: '../orderPage/orderPage',
          });
        } else if (title === '消息通知') {
			uni.navigateTo({
			  url: '../messages/messages',
			});
        } else if (title === '预约沟通') {
			uni.navigateTo({
			  url: '../reservationPeople/reservationPeople',
			});
        }
      },
  },
};
</script>

<style>

.profile-page {
  display: flex;
  flex-direction: column; /* Stacks children vertically */
  background-color: #F5F5F5;
  height: 100vh; /* Full height of the screen */
  overflow-y: auto; /* Enable vertical scrolling */
}

.zichan{
  font-size: 26rpx;
  color: #000000;
  font-weight: bold;
  margin-left: 50rpx;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
}
</style>
