<template>
  <view class="container">
    <!-- 只展示新闻页面 -->
    <web-view :src="newsUrl" class="webview-container"></web-view>
  </view>
</template>

<!-- <script>
export default {
  data() {
    return {
      newsUrl: ''
    };
  },
  onLoad() {
    uni.request({
      url: 'https://seeu-applets.seeu-edu.com/v2/seeuapp/news/get',
      method: 'GET',
      success: (res) => {
        const link = res.data?.data?.url;
        this.newsUrl = (link)
          ? link
          : 'https://mp.weixin.qq.com/s/lcKSMEPgbHChBcPuUkacfQ';
      },
      fail: () => {
        this.newsUrl = 'https://mp.weixin.qq.com/s/lcKSMEPgbHChBcPuUkacfQ';
      }
    });
  }
};
</script -->
<script>
export default {
  data() {
    return {
      newsUrl: ''
    };
  },
  async onLoad(options) {
    if (options.link) {
      this.newsUrl = decodeURIComponent(options.link);
    } else {
		var token = ''
		try {
		  const res = await uni.getStorageSync('token');
		  token = `Bearer ${res}`;
		} catch (e) {
		  throw e;
		}
	
      uni.request({
        url: 'https://seeu-applets.seeu-edu.com/v2/seeuapp/news/get',
        method: 'GET',
		header: {
		  "Content-Type": "application/json",
		  "token": token
		},
        success: (res) => {
          const link = res.data?.data?.url;
          this.newsUrl = (link)
            ? link
            : 'https://mp.weixin.qq.com/s/lcKSMEPgbHChBcPuUkacfQ';
        },
        fail: () => {
		  uni.showToast({
		    title: '没有可显示的文章',
		    icon: 'none'
		  });
        }
      });
    }
  }
};
</script>

<style>
.webview-container {
  width: 100%;
  height: 100vh;
}
</style>