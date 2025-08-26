<template>
    <view class="container">
        <image class="bg-image" src="https://seeutest.duckdns.org/images/static/images/bg.jpg" mode="scaleToFill" />

        <view class="content">
            <view
                class="card"
                v-for="item in assistants"
                :key="item.id"
            >   
                <!-- 二维码 -->
                <image
                    class="qrcode"
                    :src="item.qr"
                    mode="aspectFit"
                    @longpress="handleLongPress"
                    show-menu-by-longpress="true"
                    @click="previewQRCode(item.qr)"
                />

                <!-- 下方提示 -->
                <text class="tip-text">{{ item.tip }}</text>
            </view>

            <!-- 底部统一提示 -->
            <view class="final-tip">
                <view class="line left" />
                <text class="final-text">扫码添加任一小助手获取积分</text>
                <view class="line right" />
            </view>
        </view>
    </view>
</template>

<script>
import { requestWithToken } from '/modules/requestUtils.js';
import seeuappBaseUrl from '../../modules/testUtils';

export default {
    data() {
        return {
            assistants: [
                {
                    id: 'allen',
                    name: 'SeeU Allen',
                    qr: 'https://seeutest.duckdns.org/images/static/images/seeU_Allen.jpg',
                    tip: '长按识别二维码，添加 Allen'
                },
                {
                    id: 'helen',
                    name: 'SeeU Helen',
                    qr: 'https://seeutest.duckdns.org/images/static/images/seeU_Helen.jpg',
                    tip: '长按识别二维码，添加 Helen'
                }
            ]
        };
    },
    onLoad() {
        const isAdmin = uni.getStorageSync('role') === '管理员';
        console.log(`isAdmin: ${isAdmin}`);
        if (isAdmin) {
            const url = '/pages/contractServices/manageAddMember';
            setTimeout(() => {
                uni.navigateTo({ url });
            }, 400); // 等待 
        }
    },
    methods: {
        previewQRCode(url) {
            if (!url) {
                uni.showToast({
                    title: '二维码未设置',
                    icon: 'none'
                });
                console.warn('addAssistantQRcode.vue: QR code URL is not set.');
                return;
            }
            wx.previewImage({
                urls: [url],
                current: url,
                success: (res) => {
                    console.log('预览二维码成功', res);
                },
                fail: (err) => {
                    console.error('预览二维码失败', err);
                    uni.showToast({
                        title: '预览失败',
                        icon: 'none'
                    });
                }
            });
        },

        async getToken() {
            try {
                const res = await uni.getStorageSync("token");
			 console.log(`token: ${res}`);
                return `Bearer ${res}`;
            } catch (e) {
                this.handleAuthError();
                throw e;
            }
        },

        handleAuthError() {
            uni.showToast({
                title: "认证失败，请重新登录",
                icon: "none",
                duration: 2000,
                complete: () => {
                    wx.navigateTo({
                        url: "/pages/index/index",
                    });
                },
            });
        },

        async handleLongPress() {
            console.log('QR Code long-pressed by user.');
            try {
                const id = uni.getStorageSync('memberId');
                const userWechatName = uni.getStorageSync('nickName');
                if (id === null || userWechatName === null) {
                    this.handleAuthError();
                    return;
                }
                const url = `${seeuappBaseUrl}/activity/addAssistantCodeScanMember?id=${id}&wechatName=${userWechatName}`;
                const token = await this.getToken();
                const res = await requestWithToken(url, 'POST', {}, token);
                if (res.code !== 200) {
                    uni.showToast({
                        title: '添加失败',
                        icon: 'none'
                    });
                    console.log("用户记录失败: " + res.code + " " + res.error);
                }
                console.log("用户记录成功 code: " + res.code);
            } catch (e) {
                console.error('addAssistantQRcode.vue: Error during handleLongPress:', e);
            };
        }

    }
};
</script>

<style scoped>
/* 页面整体容器 */
.container {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

/* 背景图固定铺满 */
.bg-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

/* 主体内容区 */
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 24rpx 24rpx;
}

/* 每张二维码卡片 */
.card {
  width: 70%;
  max-width: 480rpx;   /* ≈ 242px ×2 = 484rpx */
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  padding: 32rpx 24rpx 36rpx;
  margin-bottom: 64rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 二维码占满卡片宽度，保持 1:1 */
.qrcode {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
}

/* 卡片内提示 */
.tip-text {
  font-size: 26rpx;
  color: #7f7f7f;
  text-align: center;
}

/* 底部统一提示 */
.final-tip {
  display: flex;
  align-items: center;
  justify-content: center;
}
.final-text {
  font-size: 32rpx;
  color: #072c7d;
  line-height: 44rpx;
}
.line {
  width: 80rpx;
  height: 4rpx;
  background: linear-gradient(90deg, rgba(22, 70, 174, 0.2) 0%, #1646ae 100%);
}
.left {
  margin-right: 20rpx;
}
.right {
  margin-left: 20rpx;
  transform: scaleX(-1);
}
</style>