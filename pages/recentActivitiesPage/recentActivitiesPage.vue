<template>
  <view class="exampleOne">
    <!-- Dynamically load the image and use it for preview -->
    <image :show-menu-by-longpress="true" :src="imageUrl" class="event-image" @click="previewPoster"></image>
  </view>
  <view class="upload-button-section" v-if="isAdmin">
    <button type="primary" @tap="goToUploadPage">更新活动文件</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      imageUrl: '' ,// Holds the image URL passed from the swiper
    };
  },
    onLoad() {
      // 检查登录状态
      const token = uni.getStorageSync('token');
      const role = uni.getStorageSync('role');
  
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => {
          uni.redirectTo({ url: '/pages/index/index' });
        }, 1000);
        return;
      }
  
      // 设置管理员标志
      this.isAdmin = (role === '管理员');
  
      // 设置最新活动图片地址
      this.imageUrl = 'https://seeutest.duckdns.org/seeuapp/files/latest-image-stream'; // 替换为你的后端地址
    },
 //  onLoad(options) {
 //    // Retrieve the link from the query parameters
 //    const link = options.link;
 //    //this.imageUrl = link;
	// this.imageUrl = 'https://seeutest.duckdns.org/seeuapp/files/latest-image-stream'; // 替换为你实际后端地址
 //  },
  methods: {
    previewPoster() {
      // Use the dynamic imageUrl for the preview
      uni.previewImage({
        urls: [this.imageUrl], // The image URL to preview
        current: 0, // Index of the image to start previewing from
        indicator: 'default',
        loop: false,
        success: (res) => {
          console.log('Image preview success', res);
        },
        fail: (err) => {
          console.log('Image preview failed', err);
        }
      });
    },
	goToUploadPage() {
	  uni.navigateTo({
	    url: '/pages/upload/upload'
	  });
	}
  }
};

</script>

<style>
.event-image {
  width: 100%;
  height: 110%;
}

.exampleOne {
  position: absolute;
  width: 667.9389rpx;
  height: 1200.5725rpx;
  left: calc(50% - 667.9389rpx/2 + 0.9542rpx);
  top: 100rpx;
}
</style>
