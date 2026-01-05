<template>
  <view class="container">
    <view class="info">
      <text>请输入您想要上传或跳转的文章链接：</text>
    </view>

    <input
      type="text"
      v-model="tempUrl"
      placeholder="请输入新的链接"
      class="url-input"
    />

    <view v-if="finalUrl" class="current-url">
      <text>已预览链接：</text>
      <text class="link-text">{{ finalUrl }}</text>
    </view>

    <button type="primary" @tap="previewUrl">立即跳转预览</button>
    <button type="default" @tap="uploadToBackend" style="margin-top: 20rpx;">上传到后台</button>
    <button type="default" @tap="showCurrentArticle" style="margin-top: 20rpx;">显示当前文章</button>
  </view>
</template>

<script>
import { requestWithToken } from '@/modules/requestUtils.js';
export default {
  data() {
    return {
      tempUrl: '',
      finalUrl: ''
    };
  },
  
  async onLoad(){
	  
	  
	  const isAdmin = await this.checkAdmin();
	  console.log(isAdmin)
	  
	  if(!await this.checkAdmin()){
		  this.showCurrentArticle()
	  }
	  
  },

  onShow() {
    const cachedUrl = uni.getStorageSync('previewedUrl');
	var email = uni.getStorageSync('email');
    console.log(email)
    if (cachedUrl) {
      this.tempUrl = cachedUrl;
      this.finalUrl = cachedUrl;
    }
  },

  methods: {
	async getToken() {
	  try {
	    const res = await uni.getStorageSync('token');
	    return `Bearer ${res}`;
	  } catch (e) {
	    this.handleAuthError();
	    throw e;
	  }
	},
	
	async checkAdmin(){
	        
	  var og_email = await uni.getStorageSync('email');
	  //
	  const token = await this.getToken();
	  var email = (og_email || "").trim();
		
	  console.log(email);
	  if(email === "") 
	  {
	    return false;
	  }
	  
	  try {
	    const res = await requestWithToken(
	      `https://seeu-applets.seeu-edu.com/v2/seeuapp/admin/check?email=${email}`,
	      'POST',
	      {},
	      token
	    );
	    if (res.code === 200) {
	      console.log(res.data);
	      console.log(email);
	      return res.data;
	    } else {
	      console.log(res.code);
	      console.log(email);
	      console.error('API Error:', res.error);
	      return false;
	    }
	  } catch (e) {
	    console.error('Request Failed:', e);
	    return false;
	  }
	  
	},
	
    previewUrl() {
      const trimmed = this.tempUrl.trim();
      if (!trimmed || !trimmed.startsWith('https://mp.weixin.qq.com')) {
        return uni.showToast({
          title: '请输入有效的微信文章链接',
          icon: 'none'
        });
      }

      uni.setStorageSync('previewedUrl', trimmed);
      this.finalUrl = trimmed;

      uni.redirectTo({
        url: `/pages/news/news?link=${encodeURIComponent(trimmed)}`
      });
    },

    async uploadToBackend() {
      const trimmed = this.finalUrl.trim();
      const previewed = uni.getStorageSync('previewedUrl');

      if (!trimmed || trimmed !== previewed) {
        return uni.showToast({
          title: '请先预览再上传',
          icon: 'none'
        });
      }

      if (!trimmed.startsWith('https://mp.weixin.qq.com')) {
        return uni.showToast({
          title: '只能上传微信文章链接',
          icon: 'none'
        });
      }
	  
	  var token = await this.getToken();
	  
      uni.request({
        url: 'https://seeu-applets.seeu-edu.com/v2/seeuapp/news/upload',
        method: 'POST',
        data: { url: trimmed },
		header: {
			'Content-Type': 'application/json',
			"token": token
		},
        success: () => {
          uni.showToast({
            title: '上传成功',
            icon: 'success'
          });
          // uni.removeStorageSync('previewedUrl');
          this.tempUrl = '';
          this.finalUrl = '';
        },
        fail: () => {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
      });
    },

    showCurrentArticle() {

      uni.redirectTo({
        url: `/pages/news/news`
      });
    }
  }
};
</script>

<style>
.container {
  padding: 40rpx;
}
.url-input {
  width: 100%;
  padding: 12rpx;
  margin: 20rpx 0;
  border: 1px solid #ccc;
  border-radius: 8rpx;
}
.info {
  font-size: 28rpx;
  margin-bottom: 20rpx;
}
.current-url {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #666;
}
.link-text {
  display: block;
  color: #1a73e8;
  word-break: break-all;
  margin-top: 8rpx;
}
</style>
