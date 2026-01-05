<template>
  <view class="live-list-container">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else>
      <view v-for="(stream, index) in streams" :key="stream.id" class="stream-item" @tap="goToDetail(stream)">
        <view class="stream-image-container">
          <image :src="displayImages[stream.id]" class="stream-image" mode="aspectFill" @load="(e) => onCoverImageLoad(stream)" @error="(e) => onCoverImageError(e, stream)" />
        </view>
        <view class="stream-info">
          <text class="stream-title">{{ stream.title }}</text>
          <text class="stream-desc">{{ stream.description }}</text>
          <view class="stream-meta">
            <text class="stream-points">可获得 {{ stream.pointsReward || 0 }} 积分</text>
            <text class="stream-status" :class="getStatusClass(stream.status)">{{ getStatusText(stream.status) }}</text>
          </view>
        </view>
      </view>
      <view v-if="streams.length === 0" class="empty">暂无直播</view>
    </view>
    
    <!-- 管理按钮 -->
    <view v-if="isAdmin" class="admin-button-wrapper">
      <button class="admin-button" @tap="goToLiveAdmin">管理</button>
    </view>

  </view>
</template>

<script>
import { requestWithToken } from '../../modules/requestUtils.js';

export default {
  data() {
    return {
      streams: [],
      loading: true,
      isAdmin: false, // Admin status for management button visibility

      // Image handling related fields
      imageCache: {}, // Image cache to avoid repeated downloads
    };
  },
  computed: {
    // Computed property for each stream's display image (like offlineEvent's displayImage)
    displayImages() {
      const images = {};
      this.streams.forEach(stream => {
        // Priority 1: downloaded temp image (fallback from direct loading)
        if (stream.tempCoverImagePath && stream.tempCoverImagePath.trim()) {
          console.log(`Using downloaded temp image for stream ${stream.id}:`, stream.tempCoverImagePath);
          images[stream.id] = stream.tempCoverImagePath;
        }
        // Priority 2: direct URL loading with cache busting (like offlineEvent)
        else if (stream.coverImage && stream.coverImage.startsWith('/files/')) {
          const timestamp = new Date().getTime();
          const directUrl = `https://seeu-applets.seeu-edu.com/v2/seeuapp${stream.coverImage}?t=${timestamp}`;
          console.log(`Attempting direct URL loading for stream ${stream.id}:`, directUrl);
          
          // Pre-test the URL to detect JSON responses before the image component tries to load it
          this.preTestImageUrl(directUrl, stream.id);
          
          images[stream.id] = directUrl;
        }
        // Priority 3: local fallback images
        else {
          const fallbackImages = [
            'https://seeu-applets.seeu-edu.com/images/static/case.jpg',
            'https://seeu-applets.seeu-edu.com/images/static/interview.jpg',
            'https://seeu-applets.seeu-edu.com/images/static/recentActivities.jpg',
            'https://seeu-applets.seeu-edu.com/images/static/popularLive.jpg'
          ];
          const index = this.streams.indexOf(stream);
          images[stream.id] = fallbackImages[index % fallbackImages.length];
          console.log(`Using fallback image for stream ${stream.id}:`, images[stream.id]);
        }
      });
      return images;
    }
  },
  async onLoad() {
    this.loading = true;
    
    // Check admin status for management button visibility
    await this.checkAdminStatus();
    
    try {
      // Try to fetch from backend first
      const backendStreams = await this.fetchLiveStreamsFromBackend();
      console.log("*******************************************");
      if (backendStreams && backendStreams.length > 0) {
        this.streams = this.filterFutureLivestreams(backendStreams);
        // Handle cover images for backend streams
		// Filter to only show future livestreams (upcoming or live, not ended)
		console.log(this.streams);
        await this.handleCoverImages();
      } else {
        // No backend data available
        this.streams = [];
      }
    } catch (error) {
      console.error('Error loading live streams:', error);
      this.streams = [];
    }
    
    this.loading = false;
  },
  methods: {
	filterFutureLivestreams(streams) {
	  const now = new Date();
	  console.log('Filtering livestreams, current time:', now);
	  
	  const futureStreams = streams.filter(stream => {
		
		// If the stream has a scheduledTime field, check if it's in the future or happening now
		
		const streamTime = new Date(stream.startTime);
		const streamEndTime = new Date(stream.endTime);
		
		/* Potentially adding an indication to show that stream is 'in progress' */
		
		/* TODO */
		if(streamTime <= now && streamEndTime >= now){
			stream.status = "live";
		} else if(streamEndTime < now){
			stream.status = "ended";
		}
		
		/* Reject streams that have already ended*/
		// if(streamEndTime < now){
		// 	return false;
		// }
		
		
		// Keep streams that are 'live' or 'upcoming'
		console.log(`Keeping stream: ${stream.title} (status: ${stream.status})`);
		return true;
	  });
	  
	  console.log(`Filtered ${streams.length} streams down to ${futureStreams.length} future streams`);
	  return futureStreams;
	},
	  
    async fetchLiveStreamsFromBackend() {
      try {
        // Use the same approach as live admin page
        const rawToken = uni.getStorageSync("token");
        
        if (!rawToken) {
          console.log('No token found, cannot fetch live streams');
          return [];
        }
        
        // Format token the same way as admin page
        const token = `Bearer ${rawToken}`;
        console.log('Token formatted for request:', token);
        
        const response = await requestWithToken(
          'https://seeu-applets.seeu-edu.com/v2/seeuapp/livestream/list',
          'GET',
          {},
          token
        );
        
        if (response.code === 200 && response.data) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error('Backend API error:', error);
        return [];
      }
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'live':
          return 'status-live';
        case 'upcoming':
          return 'status-upcoming';
        case 'ended':
          return 'status-ended';
        default:
          return 'status-upcoming';
      }
    },
    
    getStatusText(status) {
      switch (status) {
        case 'live':
          return '直播中';
        case 'upcoming':
          return '即将开始';
        case 'ended':
          return '已结束';
        default:
          return '即将开始';
      }
    },
    

    
    goToDetail(stream) {
		
	  if (stream.status === 'ended') {
		  console.log(`Stream "${stream.title}" has ended, navigation blocked`);
		  uni.showModal({
			title: '提示',
			content: '直播已结束',
			showCancel: false,
			confirmText: '确定'
		  });
		  return;
		}
		
      const points = stream.pointsReward ? stream.pointsReward : 5;
      const liveId = stream.id;
	  
	  // 视频号id
	  const finderUserName = "sphuM9hRxttKRC4";
	  let noticeId = "";
	  let feedId = "";
	  let nonceId = "";
	  
	  console.log("TESTING LIVESTREAM REDIRECTION")
	  
	  wx.getChannelsLiveInfo({
		finderUserName: finderUserName,
		success: (res) => {
		  feedId = res.feedId || {};
		  nonceId = res.nonceId || {};
		  // this.setData({ noticeId });
		  console.log('getChannelsLiveNoticeInfo ok:', res);
		  console.log(feedId);
		  console.log(nonceId);
		  
		  wx.openChannelsLive({
		  		  
		  	finderUserName: finderUserName,
			feedId: feedId,
			nonceId: nonceId,
			success: (chan) => {
				
				console.log('openChannelsLive: ', chan);
				
			}
		  		  
		  })
		},
		fail: (err) => {
		  console.error('getChannelsLiveNoticeInfo fail:', err);
		  wx.showToast({ icon: 'none', title: err?.errMsg || '获取直播预告失败' });
		}
	  });
      // uni.navigateTo({
      //   url: `/pages/liveReservationDetail/liveReservationDetail?points=${points}&liveId=${liveId}`
      // });
    },
    
    goToLiveAdmin() {
      uni.navigateTo({
        url: '/pages/liveAdmin/liveAdmin'
      });
    },
    
    async checkAdminStatus() {
      // Use backend API to check admin status
      this.isAdmin = await this.checkAdmin();
    },
    
    async checkAdmin() {
      var og_email = await uni.getStorageSync('email');
      const token = await this.getToken();
      var email = (og_email || "").trim();
      
      console.log('Checking admin status for email:', email);
      if(email === "") {
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
          console.log('Admin check result:', res.data);
          console.log('Email:', email);
          return res.data;
        } else {
          console.log('API Error code:', res.code);
          console.log('Email:', email);
          console.error('API Error:', res.error);
          return false;
        }
      } catch (e) {
        console.error('Request Failed:', e);
        return false;
      }
    },
    
    async getToken() {
      try {
        const res = await uni.getStorageSync('token');
        return `Bearer ${res}`;
      } catch (e) {
        console.error('Token not found:', e);
        return '';
      }
    },
    


    
    async downloadCoverImageFromBackend(relativeUrl, streamId) {
      try {
        console.log(`Downloading cover image from backend (fallback method):`, relativeUrl);
        
        // Check cache first
        const cacheKey = `cover_${relativeUrl}`;
        if (this.imageCache[cacheKey]) {
          console.log(`Using cached cover image:`, this.imageCache[cacheKey]);
          return this.imageCache[cacheKey];
        }
        
        // Convert relative URL to full backend URL
        const fullUrl = `https://seeu-applets.seeu-edu.com/v2/seeuapp${relativeUrl}`;
        console.log(`Full URL for download:`, fullUrl);
        const res = await uni.getStorageSync('token');
        var token = `Bearer ${res}`;
        // Download the image to local temp file using Promise
        const tempFilePath = await new Promise((resolve, reject) => {
          uni.downloadFile({
            url: fullUrl,
            header: {
              "token": token
            },
            success: (res) => {
              console.log(`Cover image download success:`, res);
              console.log(`HTTP Status Code: ${res.statusCode}`);
              console.log(`Response Headers:`, res.header);
              console.log(`Data Length: ${res.dataLength}`);
              console.log(`Temp File Path: ${res.tempFilePath}`);
              
              if (res.statusCode === 200) {
                // Check if the downloaded file is actually an image
                if (res.tempFilePath && !res.tempFilePath.endsWith('.json')) {
                  console.log(`Valid image file downloaded:`, res.tempFilePath);
                  resolve(res.tempFilePath);
                } else {
                  console.log(`Downloaded file is not an image (JSON response):`, res.tempFilePath);
                  console.log(`Backend returned JSON with 200 status - this indicates a backend configuration issue`);
                  reject(new Error('Backend returned JSON instead of image'));
                }
              } else {
                console.log(`HTTP Error Status: ${res.statusCode}`);
                reject(new Error(`Download failed with status: ${res.statusCode}`));
              }
            },
            fail: (err) => {
              console.error(`Cover image download failed:`, err);
			  console.log(fullUrl);
              console.log(`Network/Connection Error Details:`, err);
              reject(err);
            }
          });
        });
        
        // Cache the successful download
        this.imageCache[cacheKey] = tempFilePath;
        
        // Update the stream's temp cover image path
        const stream = this.streams.find(s => s.id === streamId);
        if (stream) {
          // Use Vue.set to ensure reactivity
          this.$set(stream, 'tempCoverImagePath', tempFilePath);
          // Force computed property to update
          this.$forceUpdate();
        }
        
        console.log(`Cover image downloaded to:`, tempFilePath);
        return tempFilePath;
        
                   } catch (error) {
        console.error(`Failed to download cover image:`, error);
        console.log(`Error message: ${error.message}`);
        console.log(`Full error object:`, error);
        
        // Check if we have a cached version to fall back to
        const cacheKey = `cover_${relativeUrl}`;
        if (this.imageCache[cacheKey]) {
          console.log(`Falling back to cached cover image`);
          return this.imageCache[cacheKey];
        }
        
        // For production: Don't use fallback images, let the getDisplayCoverImage handle it
        console.log(`Download failed, will use fallback in getDisplayCoverImage`);
        return null;
      }
    },
    
    async handleCoverImages() {
      // No longer automatically download images - let direct URL loading try first
      // Download fallback will be triggered by onCoverImageError if direct loading fails
      console.log('Cover images will be loaded via direct URL with download fallback');
    },
    
    onCoverImageLoad(stream) {
      console.log('=== DIRECT URL LOADING SUCCESS ===');
      console.log('Cover image loaded successfully via direct URL for stream:', stream.id);
      console.log('Image URL:', stream.coverImage);
      console.log('This means the backend is serving images correctly!');
      
      // If direct URL loading worked, we don't need to download
      if (stream && stream.coverImage && stream.coverImage.startsWith('/files/')) {
        console.log('✅ Direct URL loading successful - no download fallback needed');
      }
    },
    
    onCoverImageError(e, stream) {
      console.error('Cover image loading failed:', e);
      
      // Detailed error analysis for backend debugging
      if (stream && stream.coverImage && stream.coverImage.startsWith('/files/')) {
        const timestamp = new Date().getTime();
        const directUrl = `https://seeu-applets.seeu-edu.com/v2/seeuapp${stream.coverImage}?t=${timestamp}`;
        
        console.log('=== DIRECT URL LOADING FAILURE ANALYSIS ===');
        console.log('Stream ID:', stream.id);
        console.log('Original coverImage path:', stream.coverImage);
        console.log('Full direct URL attempted:', directUrl);
        console.log('Error type:', e.type);
        console.log('Error timestamp:', e.timeStamp);
        console.log('Error target:', e.target);
        console.log('Error currentTarget:', e.currentTarget);
        
        // Test the URL directly to get more specific error info
        this.testImageUrlForBackendDebug(directUrl, stream.id);
        
        console.log('Direct URL loading failed, attempting download fallback');
        console.log('Triggering download fallback for stream:', stream.id);
        this.downloadCoverImageFromBackend(stream.coverImage, stream.id);
      }
    },
    
    getLocalImage(index) {
      const images = [
        'https://seeu-applets.seeu-edu.com/images/static/case.jpg',
        'https://seeu-applets.seeu-edu.com/images/static/interview.jpg',
        'https://seeu-applets.seeu-edu.com/images/static/recentActivities.jpg',
        'https://seeu-applets.seeu-edu.com/images/static/popularLive.jpg'
      ];
      return images[index % images.length];
    },
    
    // Pre-test image URL to detect JSON responses before image component loads
    async preTestImageUrl(imageUrl, streamId) {
      console.log(`=== PRE-TESTING IMAGE URL FOR STREAM ${streamId} ===`);
      console.log('Pre-testing URL:', imageUrl);
      
      try {
        // Test with HEAD request to get response headers
        const response = await new Promise((resolve, reject) => {
          uni.request({
            url: imageUrl,
            method: 'HEAD',
            success: (res) => {
              console.log('Pre-test HEAD response:', res);
              resolve(res);
            },
            fail: (err) => {
              console.log('Pre-test HEAD failed:', err);
              reject(err);
            }
          });
        });
        
        // Analyze the response
        console.log('=== PRE-TEST RESPONSE ANALYSIS ===');
        console.log('HTTP Status Code:', response.statusCode);
        console.log('Content-Type Header:', response.header['content-type']);
        
        // If backend returns JSON with 200 status, trigger download fallback immediately
        if (response.statusCode === 200) {
          const contentType = response.header['content-type'] || '';
          if (contentType.includes('application/json')) {
            console.log('❌ PRE-TEST: Backend returning JSON instead of image');
            console.log(' TRIGGERING IMMEDIATE DOWNLOAD FALLBACK');
            
            // Find the stream and trigger download fallback
            const stream = this.streams.find(s => s.id === streamId);
            if (stream && stream.coverImage) {
              this.downloadCoverImageFromBackend(stream.coverImage, streamId);
            }
          } else if (contentType.includes('image/')) {
            console.log('✅ PRE-TEST: Content-Type is correct (image)');
          } else {
            console.log('❓ PRE-TEST: Unexpected Content-Type:', contentType);
          }
        } else if (response.statusCode === 404) {
          console.log('❌ PRE-TEST: File not found (404) - will trigger fallback on image load error');
        } else {
          console.log('❓ PRE-TEST: Unexpected status code:', response.statusCode);
        }
        
      } catch (error) {
        console.log('❌ Pre-test failed:', error);
      }
      
      console.log('=== END PRE-TEST ===');
    },
    
    // Detailed URL testing for backend debugging
    async testImageUrlForBackendDebug(imageUrl, streamId) {
      console.log(`=== BACKEND URL TESTING FOR STREAM ${streamId} ===`);
      console.log('Testing URL:', imageUrl);
      
      try {
        // Test with HEAD request to get response headers
        const res = await uni.getStorageSync('token');
        var token = `Bearer ${res}`;
        const response = await new Promise((resolve, reject) => {
          uni.request({
            url: imageUrl,
            method: 'HEAD',
            header: {
              "token": token
            },
            success: (res) => {
              console.log('HEAD request response:', res);
              console.log('Status Code:', res.statusCode);
              console.log('Response Headers:', res.header);
              resolve(res);
            },
            fail: (err) => {
              console.log('HEAD request failed:', err);
              reject(err);
            }
          });
        });
        
        // Analyze the response
        console.log('=== BACKEND RESPONSE ANALYSIS ===');
        console.log('HTTP Status Code:', response.statusCode);
        console.log('Content-Type Header:', response.header['content-type']);
        console.log('Content-Length Header:', response.header['content-length']);
        console.log('All Response Headers:', response.header);
        
        // Determine the issue
        if (response.statusCode === 200) {
          const contentType = response.header['content-type'] || '';
          if (contentType.includes('application/json')) {
            console.log('❌ ISSUE IDENTIFIED: Backend returning JSON instead of image');
            console.log(' BACKEND FIX NEEDED: Configure static file serving to return proper image MIME types');
          } else if (contentType.includes('image/')) {
            console.log('✅ Content-Type is correct (image)');
            console.log(' OTHER ISSUE: Check CORS headers or file path configuration');
          } else {
            console.log('❓ UNKNOWN ISSUE: Unexpected Content-Type:', contentType);
          }
        } else if (response.statusCode === 404) {
          console.log('❌ ISSUE IDENTIFIED: File not found (404)');
          console.log(' BACKEND FIX NEEDED: Check file path configuration and static file serving setup');
        } else if (response.statusCode === 403) {
          console.log('❌ ISSUE IDENTIFIED: Access forbidden (403)');
          console.log(' BACKEND FIX NEEDED: Check authentication/authorization for static file access');
        } else if (response.statusCode === 500) {
          console.log('❌ ISSUE IDENTIFIED: Server error (500)');
          console.log(' BACKEND FIX NEEDED: Check server logs for internal error details');
        } else {
          console.log('❓ UNKNOWN ISSUE: Unexpected status code:', response.statusCode);
        }
        
      } catch (error) {
        console.log('❌ URL testing failed:', error);
        console.log(' BACKEND FIX NEEDED: Check network connectivity and server availability');
      }
      
      console.log('=== END BACKEND URL TESTING ===');
    }
  }
};
</script>

<style scoped>
.live-list-container {
  padding: 40rpx;
  background-image: url('https://seeu-applets.seeu-edu.com/images/static/background2.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  min-height: 100vh;
  position: relative;
}
.loading {
  text-align: center;
  color: #888;
  margin-top: 80rpx;
}
.stream-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  padding: 30rpx;
  width: 90%;
  max-width: 682rpx;
  height: 240rpx;
  margin-left: auto;
  margin-right: auto;
}
.stream-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200rpx;
  height: 240rpx;
  margin-right: 20rpx;
}
.stream-image {
  width: 200rpx;
  height: 240rpx;
  border-radius: 16rpx;
  background: #eee;
}
.stream-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}
.stream-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}
.stream-desc {
  font-size: 32rpx;
  color: #666;
  font-weight: medium;
  margin-bottom: 16rpx;
  line-height: 1.4;
}
.stream-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stream-points {
  font-size: 28rpx;
  color: #ff9800;
  font-weight: bold;
}
.stream-status {
  font-size: 28rpx;
  padding: 8rpx 16rpx;
  border-radius: 36rpx;
  font-weight: 400;
  width: 150rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.status-live {
  background: #ff4444;
  color: white;
}
.status-upcoming {
  background: #4980FD;
  color: white;
}
.status-ended {
  background: #999;
  color: white;
}
.empty {
  text-align: center;
  color: #aaa;
  margin-top: 80rpx;
}
.admin-btn {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
}

/* 管理按钮样式 */
.admin-button-wrapper {
  position: fixed;
  top: 0rpx;
  right: 0rpx;
  z-index: 10;
}

.admin-button {
  background-color: #4285f4;
  color: white;
  font-size: 28rpx;
  padding: 15rpx 30rpx;
  border-radius: 40rpx;
  border: none;
}
</style> 