<template>
  <view class="container">
    <image
      v-if="imageUrl"
      :src="imageUrl"
      class="test-image"
      mode="widthFix"
      @error="onImageError"
      @load="onImageLoad"
    />
    <button @tap="loadImage">加载随机图片</button>
    <view v-if="status" class="status-text">{{ status }}</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      imageUrl: '',
      status: ''
    };
  },
  methods: {
    loadImage() {
      const urls = [
        'https://play-lh.googleusercontent.com/xey8dXOB53LtCR97JhDH7T-6np_sUBBE9iF7WP4Sp6T55oO28e6hic1LFTklCELw9Iw',
		  'https://upload.wikimedia.org/wikipedia/commons/6/62/YouTube_social_white_square_%282024%29.svg',
		   'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/640px-Google_2015_logo.svg.png'
      ];
      const index = Math.floor(Math.random() * urls.length);
      this.imageUrl = urls[index];
      this.status = '加载中...';
    },
    onImageLoad() {
      this.status = '加载成功 ✅';
    },
    onImageError() {
      this.status = '加载失败 ❌';
    }
  }
};
</script>

<style>
.container {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.test-image {
  width: 600rpx;
  margin-bottom: 30rpx;
}

.status-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #666;
}
</style>

