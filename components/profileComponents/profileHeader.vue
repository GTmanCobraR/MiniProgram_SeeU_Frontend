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
          <Container backgroundColor="transparent" boxShadow="none" flexDirection="row" justifyContent="center" alignItems="center">
            <view class="profile-name">{{ username }}</view>
            <image v-if="showVip" src="https://seeutest.duckdns.org/images/static/vip-banner.jpg" class="vip-icon" />
          </Container>

          <Container backgroundColor="transparent" boxShadow="none" flexDirection="row" justifyContent="center" alignItems="center">
            <button class="bind-email-button" @click="handleBindEmailClick">
              <text>绑定邮箱</text>
            </button>
          </Container>

          <image v-if="showVip" src="https://seeutest.duckdns.org/images/static/vip-banner.jpg" class="vip-icon" />
        </view>
      </Container>

      <!-- 用图片替换 MembershipCard（按钮覆盖在图片上，保持你原有位置与大小） -->
      <Container
        backgroundColor="transparent"
        boxShadow="none"
        justifyContent="center"
        alignItems="center"
        marginTop="0rpx"
        class="content-layer"
      >
        <view class="membership-wrap">
          <image
            class="membership-img"
            src="/static/decorations/profileIP.png"
            mode="widthFix"
          />
          <button
            class="open-btn"
            @tap="handleCardButtonClick"
            @click="handleCardButtonClick"
          >
            <text>立即开通</text>
          </button>
        </view>
      </Container>
    </view>
  </view>
</template>

<script>
import MembershipBenefitButton from './membershipBenefits.vue';
import Container from '../../components/profileComponents/baseContainer.vue';

export default {
  components: { MembershipBenefitButton, Container },
  props: {
    avatarUrl: { type: String, default: '' },
    username: { type: String, default: 'Seeu User' },
    showVip: { type: Boolean, default: false },

    /* 文案与位移配置 */
    titleText: { type: String, default: '个人中心' },
    backgroundOffset: { type: String, default: '40rpx' }, // 控制 SEEU 竖向位置
    contentOffset: { type: String, default: '80rpx' },    // content-wrap 内边距

    /* 尺寸配置 */
    headerHeight: { type: String, default: '220rpx' },    // Header 整体高度
    gradientHeight: { type: String, default: '260rpx' }   // 顶部渐变高度
  },
  computed: {
    rootStyle() {
      return {
        '--bgOffset': this.backgroundOffset,
        '--contentOffset': this.contentOffset,
        '--gradientHeight': this.gradientHeight,
        '--headerHeight': this.headerHeight
      };
    }
  },
  methods: {
    handleBenefitClick() { this.$emit('benefit-click'); },
    handleCardButtonClick() { this.$emit('card-button-click'); },
    handleBindEmailClick() {
      const storedEmail = uni.getStorageSync('email');
      if (storedEmail && storedEmail !== '') {
        uni.showModal({ content: '您已绑定邮箱', showCancel: false, confirmText: '确认' });
      } else {
        uni.navigateTo({ url: '/pages/bindOfEmail/bindOfEmail' });
        this.$emit('bind-email-click');
      }
    }
  }
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
  top: calc(var(--bgOffset, 40rpx) - 100rpx);
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
  margin-bottom: 8rpx;
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
  margin: 0;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
  font-weight: bold;
}

.vip-icon {
  width: 40rpx;
  height: 40rpx;
  margin-left: 10rpx;
}

/* 图片容器：用于相对定位按钮 */
.membership-wrap {
  width: 92%;
  position: relative;
}

/* 会员图片：不拦截点击，避免遮挡按钮 */
.membership-img {
  width: 100%;
  display: block;
  border-radius: 16rpx;
  box-shadow: 0 12rpx 24rpx rgba(0, 0, 0, 0.06);
  pointer-events: none;     /* 关键：图片不吃事件 */
}

/* 按钮保持你的原始位置与尺寸（仅增加 z-index / pointer-events） */
.open-btn {
  position: absolute;
  top: 62%;
  left: 16%;
  transform: translate(-50%, -50%);
  width: 25%;
  height: 60rpx;
  border-radius: 42rpx;
  background: linear-gradient(180deg, #F9E8D4 0%, #FEC320 100%);
  color: #7a4a00;
  font-size: 30rpx;
  font-weight: 700;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 24rpx rgba(254, 195, 32, 0.35);
  padding: 0;
  z-index: 1000;              /* 关键：按钮在图片之上 */
  pointer-events: auto;     /* 关键：按钮可接收事件 */
}
</style>
