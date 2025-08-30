<template>
  <Container class="profile-page" :expandable="true">
    <!-- Header 放大到“西游资产”上方 -->
    <Container :zIndex="0" :expandable="false" :height="headerHeight">
      <ProfileHeader
        :avatarUrl="avatarUrl"
        :username="username"
        :showVip="level === 1"
        :headerHeight="headerHeight"
        :gradientHeight="headerHeight"
        :contentOffset="'100rpx'"
        :backgroundOffset="'60rpx'"
        @benefit-click="handleBenefitClick"
      />
    </Container>

    <!-- Info 区域：不再下移 -->
    <Container
      :zIndex="1"
      boxShadow="0 32rpx 64rpx rgba(0, 0, 0, 1)"
      backgroundColor="#f5f5f5"
      :expandable="true"
      :marginTop="'0rpx'"
    >
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
  components: { ProfileHeader, InfoButton, Container, InfoGrid },
  data() {
    return {
      avatarUrl:
        'https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/profilePageImages/applets.jpg',
      username: '登录会员',
      level: 0,
      isLoading: true,

      // 统一控制 Header 高度（按需调整到合适位置）
      headerHeight: '650rpx',

      grid2Items: [
        { label: '我的账户' },
        { value: '0', label: '我的积分' },
        { value: '0', label: '我的券码' }
      ]
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
      const memberId = uni.getStorageSync('memberId');
      const token = uni.getStorageSync('token');
      const points = await getPoints(memberId, token);

      const pointsItem = this.grid2Items.find(i => i.label === '我的积分');
      if (pointsItem) pointsItem.value = points;

      this.isLoading = true;
      try {
        const storedData = uni.getStorageSync('userdata');
        if (storedData && storedData.memberName) {
          this.username = storedData.memberName || '登录会员';
          this.level = storedData.level || 0;
        } else {
          this.username = '登录会员';
        }
        this.avatarUrl =
          (storedData && storedData.avatarUrl) ? storedData.avatarUrl : this.avatarUrl;
      } catch (e) {
        console.error('Error loading user data from storage:', e);
      } finally {
        this.isLoading = false;
      }
    },
    handleBenefitClick() {
      console.log('Clicking on the benefit button...');
    },
    async handleButtonClick(title) {
      while (this.isLoading) {
        await new Promise(r => setTimeout(r, 100));
      }
      if (title === '订单') {
        uni.navigateTo({ url: '../orderPage/orderPage' });
      } else if (title === '消息通知') {
        uni.navigateTo({ url: '../messages/messages' });
      } else if (title === '预约沟通') {
        uni.navigateTo({ url: '../reservationPeople/reservationPeople' });
      }
    }
  }
};
</script>

<style>
.profile-page {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  height: 100vh;
  overflow-y: auto;
}

.zichan {
  font-size: 26rpx;
  color: #000000;
  font-weight: bold;
  margin-left: 50rpx;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
}
</style>
