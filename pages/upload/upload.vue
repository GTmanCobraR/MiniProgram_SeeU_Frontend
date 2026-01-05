<template>
  <view class="upload-container">
    <button @tap="chooseImage">选择图片</button>

    <view v-if="imageUrl">
      <image :src="imageUrl" mode="widthFix" class="preview-img"></image>
      <button type="primary" @tap="uploadToServer">上传到服务器</button>
    </view>
  </view>
</template>

<script>
import { getToken, getMemberId } from '@/modules/requestUtils.js'; 

export default {
  data() {
    return {
      imageUrl: '',
    };
  },
  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.imageUrl = res.tempFilePaths[0];
        }
      });
    },
	async uploadToServer() {
	  const token = getToken();
	  const memberId = getMemberId();
	  console.log(memberId);
	
	  if (!token || !memberId) {
	    uni.showToast({ title: '请先登录', icon: 'none' });
	    return;
	  }
	  
	const requestData = {
	  url: 'https://seeu-applets.seeu-edu.com/v2/seeuapp/files/upload',
	  filePath: this.imageUrl,
	  name: 'file',
	  header: {
		'token': await getToken(),
		'memberId': await getMemberId()
	  }
	};
  
	//console.log('上传文件请求参数:', requestData);
	
	  wx.uploadFile({
		...requestData,
	    success: (res) => {
	      console.log('上传成功', res);
	      uni.showToast({ title: '上传成功', icon: 'success' });
	    },
	    fail: (err) => {
	      console.error('上传失败', err);
	      uni.showToast({ title: '上传失败', icon: 'none' });
	    }
	  });
	}
  }
};
</script>

<style>
.upload-container {
  padding: 20rpx;
}
.preview-img {
  width: 100%;
  margin-top: 20rpx;
}
</style>
