<template>
  <view class="profile-header" :style="rootStyle">
    <!-- 顶部渐变背景（#8ED2FF → #8ED2FF00），从页面最上方开始 -->
    <view class="top-gradient"></view>

    <!-- 背景大字 SEEU -->
    <text class="bg-see-u">SEEU</text>

    <!-- 页标题（个人中心） -->
    <view class="page-title">
      <text class="page-title-text">{{ titleText }}</text>
    </view>

    <!-- 统一内容下移 -->
    <view class="content-wrap">
      <Container
        backgroundColor="transparent"
        boxShadow="none"
        :expandable="true"
        flexDirection="row"
        margin-top="140rpx"   
        margin-left="10rpx"
        class="content-layer"
      >
        <image class="profile-avatar" :src="avatarUrl" />
        <view class="profile-info">
          <Container
            backgroundColor="transparent"
            boxShadow="none"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
          >
            <view class="profile-name">{{ username }}</view>
            <image
              v-if="showVip"
              src="https://seeutest.duckdns.org/images/static/vip-banner.jpg"
              class="vip-icon"
            />
          </Container>

          <Container
            backgroundColor="transparent"
            boxShadow="none"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
          >
            <button class="bind-email-button" @click="handleBindEmailClick">
              <text>绑定邮箱</text>
            </button>
          </Container>

          <!-- 按原始代码保留第二个 VIP 图标 -->
          <image
            v-if="showVip"
            src="https://seeutest.duckdns.org/images/static/vip-banner.jpg"
            class="vip-icon"
          />
          <!-- <MembershipBenefitButton membershipBenefit="积分福利" @button-click="handleBenefitClick" /> -->
        </view>
      </Container>

      <!-- 会员卡（位置已上移到头像下方一点） -->
      <Container
        backgroundColor="transparent"
        boxShadow="none"
        justifyContent="center"
        alignItems="center"
        marginTop="20rpx"     
        class="content-layer"
      >
        <MembershipCard
          primaryText="月度会员"
          buttonText="立即开通"
          @card-button-click="handleCardButtonClick"
        />
      </Container>
    </view>
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
    avatarUrl: { type: String, default: '' },
    username: { type: String, default: 'Seeu User' },
    showVip: { type: Boolean, default: false },

    /* 文案与位移配置 */
    titleText: { type: String, default: '个人中心' },
    backgroundOffset: { type: String, default: '40rpx' }, // 控制 SEEU 竖向位置
    contentOffset: { type: String, default: '80rpx' },    // 头像/按钮距离顶部间距（content-wrap 内边距）

    /* 尺寸配置 */
    headerHeight: { type: String, default: '220rpx' },    // Header 整体高度
    gradientHeight: { type: String, default: '260rpx' },  // 顶部渐变高度
  },
  computed: {
    rootStyle() {
      return {
        '--bgOffset': this.backgroundOffset,
        '--contentOffset': this.contentOffset,
        '--gradientHeight': this.gradientHeight,
        '--headerHeight': this.headerHeight,
      };
    }
  },
  methods: {
    handleBenefitClick() { this.$emit('benefit-click'); },
    handleCardButtonClick() { this.$emit('card-button-click'); },
    handleBindEmailClick() {
      const storedEmail = uni.getStorageSync('email');
      if (storedEmail && storedEmail !== '') {
        uni.showModal({
          content: "您已绑定邮箱",
          showCancel: false,
          confirmText: "确认"
        });
      } else {
        uni.navigateTo({ url: '/pages/bindOfEmail/bindOfEmail' });
        this.$emit('bind-email-click');
      }
    },
  },
};
</script>

<style>
:host { display: contents; }
</style>

<style scoped>
.profile-header {
  position: relative;
  height: var(--headerHeight, 220rpx);
  flex: 1 1 0;
  overflow: hidden;
}

/* 渐变从页面最上方开始 */
.top-gradient {
  position: fixed;
  top: 0;
  left: 0; right: 0;
  height: var(--gradientHeight, 260rpx);
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    #8ED2FF 0%,
    rgba(142, 210, 255, 0) 100%
  );
}

/* 背景大字（相对组件位置，可用 --bgOffset 调整） */
.bg-see-u {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(var(--bgOffset, 40rpx) - 60rpx);
  font-family: "PingFang SC", sans-serif;
  font-weight: 600;
  font-size: 300rpx;
  line-height: 100%;
  text-align: center;
  text-transform: uppercase;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.48) 23%,
    rgba(255, 255, 255, 0.12) 76%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  z-index: 1;
  pointer-events: none;
}

/* 标题层 */
.page-title {
  position: absolute;
  top: 8rpx;
  left: 0; right: 0;
  display: flex;
  justify-content: center;
  z-index: 3;
  pointer-events: none;
}
.page-title-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 2rpx;
}

/* 内容整体下移容器 */
.content-wrap {
  position: relative;
  z-index: 2; /* 在渐变之上 */
  padding-top: var(--contentOffset, 80rpx);
}

/* 内容层 */
.content-layer { position: relative; }

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
  transform: scaleY(1.02);
  transform-origin: top; 
}

.bind-email-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  color: #4888F4;
  border: none;
  border-radius: 25rpx;
  font-size: 28rpx;
  height: 56rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
  font-weight: bold;
}

.vip-icon {
  width: 40rpx;
  height: 40rpx;
  margin-left: 10rpx;
}
</style>
