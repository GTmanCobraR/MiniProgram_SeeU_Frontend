<template>
  <view class="container">
    <!-- Background image covering entire page -->
    <image src="https://seeutest.duckdns.org/images/static/backgroundLive.png" class="background-image" mode="aspectFill" @load="onBackgroundImageLoad" @error="onBackgroundImageError" />
    
    <!-- QR Code Rectangle -->
    <view class="qr-container">
      <image 
        v-if="displayQRCodeImage" 
        :src="displayQRCodeImage" 
        class="qr-code-image" 
        mode="aspectFit" 
        show-menu-by-longpress="true" 
        @longpress="onQRCodeLongPress" 
        @tap="onQRCodeTap"
        @load="onQRCodeImageLoad" 
        @error="onQRCodeImageError" 
      />
    </view>
    
    <!-- Dynamic Points Status Text -->
    <view class="points-status-text">
      <text class="status-text">{{ getPointsStatusText() }}</text>
    </view>
    
    <!-- SeeU Logo -->
    <view class="logo-container">
      <image src="https://seeutest.duckdns.org/images/static/seeuLogo.jpg" class="seeu-logo" mode="aspectFit" @load="onLogoLoad" @error="onLogoError" />
    </view>
    
    <!-- Bottom Border Decoration -->
    <view class="bottom-decoration">
      <image src="https://seeutest.duckdns.org/images/static/Frame 2001.png" class="bottom-frame" mode="aspectFill" @load="onBottomFrameLoad" @error="onBottomFrameError" />
    </view>
    
    <!-- 管理按钮 -->
    <view v-if="isAdmin" class="admin-button-wrapper">
      <button class="admin-button" @tap="goToLiveAdmin">管理</button>
    </view>
  </view>
</template>

<script>
import { addPoints, getPoints } from '../../modules/pointsUtils.js';
import { requestWithToken } from '../../modules/requestUtils.js';

export default {
  data() {
    return {
      qrCodeImageUrl: '', // QR code image URL - no default fallback
      liveStreamUrl: '', // URL that QR code should redirect to
      points: 5,
      liveId: '',
      pointsAwarded: 0,
      sharePointsAwarded: 0,
      isProcessing: false,
      liveStream: null,
      memberId: '',
      sharePoints: 3, // Default share points reward
      isAdmin: false, // Admin status for management button visibility
      // Image handling related fields
      tempQRCodeImagePath: '', // Temporary QR code image path
      imageCache: {}, // Image cache to avoid repeated downloads
      // displayQRCodeImage: '' // To display local temp file path - REMOVED
    };
  },
  onShow() {
    uni.showShareMenu({ withShareTicket: true });
    
    // Refresh points status when page becomes visible
    this.refreshPointsStatus();
  },
  computed: {
    displayQRCodeImage() {
      // Priority 1: temp file (downloaded image) - HIGHEST PRIORITY
      // if (this.tempQRCodeImagePath && this.tempQRCodeImagePath.trim()) {
      //   return this.tempQRCodeImagePath;
      // }
      
      // Priority 2: direct URL loading with cache busting (like liveList)
      if (this.qrCodeImageUrl && this.qrCodeImageUrl.startsWith('/files/')) {
        const timestamp = new Date().getTime();
        const directUrl = `https://seeutest.duckdns.org/seeuapp${this.qrCodeImageUrl}?t=${timestamp}`;
        
        // Pre-test the URL
        this.preTestQRCodeUrl(directUrl);
        
        return directUrl;
      }
      
      // Priority 3: no image
      return null;
    }
  },
  async onLoad(options) {
    if (options.points) {
      this.points = Number(options.points);
    } else {
      this.points = 10;
    }
    if (options.liveId) {
      this.liveId = options.liveId;
    } else {
      this.liveId = 'ls_001';
    }
    
    // Get user info from storage
    this.memberId = uni.getStorageSync('memberId') || 'test_user_001';
    
    // Check admin status for management button visibility
    await this.checkAdminStatus();
    
    // Load live stream details from backend
    await this.loadLiveStreamDetails();
    
    // Check if points have already been awarded for this live stream
    await this.checkPointsStatus();
  },
  
  // WeChat sharing lifecycle method
  onShareAppMessage() {
    // Award points for sharing, only once per user per event
    this.handleSharePoints();
    return {
      title: this.liveStream ? this.liveStream.title : '精彩直播',
      desc: this.liveStream ? this.liveStream.description : '快来观看精彩直播！',
      path: `/pages/liveReservationDetail/liveReservationDetail?liveId=${this.liveId}`,
      imageUrl: this.liveStream ? this.liveStream.coverImage : 'https://seeutest.duckdns.org/images/static/backgroundLive.png'
    };
  },
  methods: {
    async loadLiveStreamDetails() {
      try {
        // Try to fetch from backend first
        const backendStream = await this.fetchLiveStreamFromBackend();
        
		console.log(backendStream);
		
        if (backendStream) {
          this.liveStream = backendStream;
          // Extract QR code image URL from backend data
          this.qrCodeImageUrl = backendStream.qrCodeImage || this.qrCodeImageUrl;
          // Extract live stream URL from backend data
          this.liveStreamUrl = backendStream.liveStreamUrl || backendStream.streamUrl || backendStream.videoUrl || '';
		  
		  // Debug: Log all available fields from backend
		  console.log('Backend stream data:', backendStream);
		  console.log('QR Code Image URL:', backendStream.qrCodeImage);
		  console.log('Live Stream URL:', this.liveStreamUrl);
		  console.log('Available URL fields:', {
		    liveStreamUrl: backendStream.liveStreamUrl,
		    streamUrl: backendStream.streamUrl,
		    videoUrl: backendStream.videoUrl,
		    qrCodeUrl: backendStream.qrCodeUrl,
		    redirectUrl: backendStream.redirectUrl
		  });
		  
          this.points = backendStream.pointsReward || this.points;
          this.sharePoints = backendStream.sharePointsReward || this.sharePoints;
        } else {
          // No backend data available
          this.liveStream = null;
        }
        
        // QR code images will be loaded via direct URL with download fallback (like liveList)
      } catch (error) {
        console.error('Error loading live stream details:', error);
      }
    },
    
    // Pre-test QR code URL to detect JSON responses before image component loads
    async preTestQRCodeUrl(imageUrl) {
      try {
        // Test with HEAD request to get response headers
        const response = await new Promise((resolve, reject) => {
          uni.request({
            url: imageUrl,
            method: 'HEAD',
            success: (res) => resolve(res),
            fail: (err) => reject(err)
          });
        });
        
        // If backend returns JSON with 200 status, trigger download fallback immediately
        if (response.statusCode === 200) {
          const contentType = response.header['content-type'] || '';
          if (contentType.includes('application/json')) {
            // Trigger download fallback
            if (this.qrCodeImageUrl) {
              this.downloadImageFromBackend(this.qrCodeImageUrl, 'qr');
            }
          }
        }
        
      } catch (error) {
        // Silent fail - will trigger fallback on image load error
      }
    },
    
    async downloadImageFromBackend(relativeUrl, type) {
      try {
        console.log(`Downloading ${type} image from backend:`, relativeUrl);
        
        // Check cache first
        const cacheKey = `${type}_${relativeUrl}`;
        if (this.imageCache[cacheKey]) {
          console.log(`Using cached ${type} image:`, this.imageCache[cacheKey]);
          if (type === 'cover') {
            this.tempCoverImagePath = this.imageCache[cacheKey];
          } else {
            this.tempQRCodeImagePath = this.imageCache[cacheKey];
          }
          return;
        }
        
        // Convert relative URL to full backend URL
        const fullUrl = `https://seeutest.duckdns.org/seeuapp${relativeUrl}`;
        console.log(`Full URL for download:`, fullUrl);
        
        // Get authentication token
        const token = await this.getToken();
        
        // Download the image to local temp file using Promise
        const tempFilePath = await new Promise((resolve, reject) => {
          uni.downloadFile({
            url: fullUrl,
            header: {
              "token": token
            },
            success: (res) => {
              console.log(`${type} image download success:`, res);
              if (res.statusCode === 200) {
                // Check if the downloaded file is actually an image
                if (res.tempFilePath && !res.tempFilePath.endsWith('.json')) {
                  resolve(res.tempFilePath);
                } else {
                  reject(new Error('Backend returned JSON instead of image'));
                }
              } else {
                reject(new Error(`Download failed with status: ${res.statusCode}`));
              }
            },
            fail: (err) => {
              console.error(`${type} image download failed:`, err);
              reject(err);
            }
          });
        });
        
        // Cache the successful download
        this.imageCache[cacheKey] = tempFilePath;
        
        // Set the temp file path
        if (type === 'cover') {
          this.tempCoverImagePath = tempFilePath;
          console.log(`Cover image downloaded to:`, this.tempCoverImagePath);
        } else {
          this.tempQRCodeImagePath = tempFilePath;
          console.log(`QR code image downloaded to:`, this.tempQRCodeImagePath);
        }
        
      } catch (error) {
        console.error(`Failed to download ${type} image:`, error);
        
        // Check if we have a cached version to fall back to
        const cacheKey = `${type}_${relativeUrl}`;
        if (this.imageCache[cacheKey]) {
          console.log(`Falling back to cached ${type} image`);
          if (type === 'cover') {
            this.tempCoverImagePath = this.imageCache[cacheKey];
          } else {
            this.tempQRCodeImagePath = this.imageCache[cacheKey];
          }
          return;
        }
        
        // Final fallback to static images (only for cover images)
        if (type === 'cover') {
          this.tempCoverImagePath = 'https://seeutest.duckdns.org/images/static/popularLive.jpg';
        }
        // No fallback for QR code images - let the container show as blank
      }
    },
	
	async getToken() {
	  try {
	    const res = await uni.getStorageSync('token');
	    return `Bearer ${res}`;
	  } catch (e) {
	    this.handleAuthError();
	    throw e;
	  }
	},
    
    async fetchLiveStreamFromBackend() {
      try {
        const token = await this.getToken();
        const response = await requestWithToken(
          `https://seeutest.duckdns.org/seeuapp/livestream/detail/${this.liveId}`,
          'GET',
          {},
          token
        );
        
        if (response.code === 200 && response.data) {
          return response.data;
        }
        return null;
      } catch (error) {
        console.error('Backend API error:', error);
        return null;
      }
    },
    
    redirectToLiveStream() {
      if (this.liveStreamUrl && this.liveStreamUrl.trim()) {
        console.log('Redirecting to live stream URL:', this.liveStreamUrl);
        
        // For WeChat MiniProgram, handle external URLs differently
        if (this.liveStreamUrl.startsWith('http')) {
          // Check if it's a WeChat official account URL
          const isWeChatUrl = this.liveStreamUrl.includes('mp.weixin.qq.com') || 
                             this.liveStreamUrl.includes('weixin.qq.com') ||
                             this.liveStreamUrl.includes('微信');
          
          // External URL - copy to clipboard and show instructions
          uni.setClipboardData({
            data: this.liveStreamUrl,
            success: () => {
              console.log('URL copied to clipboard');
              
              let content = '直播链接已复制到剪贴板，请在微信中打开链接观看直播';
              if (isWeChatUrl) {
                content = '直播链接已复制到剪贴板，请在微信中打开链接观看直播\n\n提示：这是微信公众号直播，请在微信聊天中粘贴链接并点击打开';
              }
              
              uni.showModal({
                title: '直播链接已复制',
                content: content,
                showCancel: false,
                confirmText: '知道了'
              });
            },
            fail: (err) => {
              console.error('Failed to copy URL:', err);
              // Fallback: show URL to user
              uni.showModal({
                title: '直播链接',
                content: `请复制以下链接到浏览器观看直播：\n${this.liveStreamUrl}`,
                showCancel: false,
                confirmText: '复制链接'
              });
            }
          });
        } else {
          // Internal page URL
          uni.navigateTo({
            url: this.liveStreamUrl,
            fail: (err) => {
              console.error('Failed to navigate to live stream:', err);
              uni.showToast({
                title: '跳转失败，请手动访问直播',
                icon: 'none',
                duration: 3000
              });
            }
          });
        }
      } else {
        console.log('No live stream URL available');
        // Show instructions for QR code scanning instead
        uni.showModal({
          title: '观看直播',
          content: '请使用微信扫描上方二维码观看直播\n\n二维码已包含直播链接，扫描后会自动跳转到直播页面',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    },
    
    async refreshPointsStatus() {
      // Only refresh if we have the necessary data
      if (this.memberId && this.liveId) {
        console.log('Refreshing points status...');
        await this.checkPointsStatus();
      }
    },
    
    async checkPointsStatus() {
      try {
        // Check QR code points status using the same logic as pointsUtils
        await this.checkQRPointsStatus();
        
        // Check share points status
        await this.checkSharePointsStatus();
        
        console.log('Points status check completed:');
        console.log('  QR points awarded:', this.pointsAwarded);
        console.log('  Share points awarded:', this.sharePointsAwarded);
      } catch (error) {
        console.error('Error checking points status:', error);
      }
    },
    
    async checkQRPointsStatus() {
      try {
        const token = await this.getToken();
        const opId = 'liveReservation' + this.liveId;
        
        // Use a GET request to check status without awarding points
        const response = await requestWithToken(
          `https://seeutest.duckdns.org/seeuapp/userLog/check?opName=${opId}&memberId=${this.memberId}`,
          'GET',
          {},
          token
        );
        
        if (response.code === 200 && response.data && response.data.hasAttended) {
          this.pointsAwarded = this.points;
          console.log('QR points already awarded');
        } else if (response.code === 404) {
          // 404 means the operation has already been completed (points already awarded)
          this.pointsAwarded = this.points;
          console.log('QR points already awarded (404 response)');
        } else {
          this.pointsAwarded = 0;
          console.log('QR points not yet awarded');
        }
      } catch (error) {
        console.error('Error checking QR points status:', error);
        // If there's an error, we should check if it's a 404 (already awarded)
        if (error.statusCode === 404 || (error.data && error.data.code === 404)) {
          this.pointsAwarded = this.points;
          console.log('QR points already awarded (404 error)');
        } else {
          this.pointsAwarded = 0;
        }
      }
    },
    
    async checkSharePointsStatus() {
      try {
        const token = await this.getToken();
        const opId = 'liveShare' + this.liveId;
        
        // Use a GET request to check status without awarding points
        const response = await requestWithToken(
          `https://seeutest.duckdns.org/seeuapp/userLog/check?opName=${opId}&memberId=${this.memberId}`,
          'GET',
          {},
          token
        );
        
        if (response.code === 200 && response.data && response.data.hasAttended) {
          this.sharePointsAwarded = this.sharePoints;
          console.log('Share points already awarded');
        } else if (response.code === 404) {
          // 404 means the operation has already been completed (points already awarded)
          this.sharePointsAwarded = this.sharePoints;
          console.log('Share points already awarded (404 response)');
        } else {
          this.sharePointsAwarded = 0;
          console.log('Share points not yet awarded');
        }
      } catch (error) {
        console.error('Error checking share points status:', error);
        // If there's an error, we should check if it's a 404 (already awarded)
        if (error.statusCode === 404 || (error.data && error.data.code === 404)) {
          this.sharePointsAwarded = this.sharePoints;
          console.log('Share points already awarded (404 error)');
        } else {
          this.sharePointsAwarded = 0;
        }
      }
    },
    
    async checkReservationFromBackend() {
      try {
		  
        const token = await this.getToken();
        const response = await requestWithToken(
          `https://seeutest.duckdns.org/seeuapp/livestream/reservation/check?memberId=${this.memberId}&liveStreamId=${this.liveId}`,
          'GET',
          {},
          token
        );
        
        if (response.code === 200 && response.data) {
          return response.data;
        }
        return null;
      } catch (error) {
        console.error('Backend API error:', error);
        return null;
      }
    },
    
    async completeReservation() {
      // Only allow if QR points haven't been awarded yet
      if (this.isProcessing || this.pointsAwarded > 0) {
        return;
      }
      
      this.isProcessing = true;
      
      try {
        // Show loading
        uni.showLoading({
          title: '添加积分中...'
        });
        
        // Try to complete reservation via backend first
        const backendResult = await this.completeReservationViaBackend();
        
        if (backendResult && backendResult.success) {
          uni.hideLoading();
          
          this.pointsAwarded = backendResult.pointsRewarded || this.points;
          
          // Show success message and redirect to live stream
          uni.showToast({
            title: `获得${this.pointsAwarded}积分！正在跳转到直播...`,
            icon: 'success',
            duration: 2000
          });
          
          // Redirect to live stream URL after a short delay
          setTimeout(() => {
            this.redirectToLiveStream();
          }, 2000);
          
          return;
        }
        
        // No local database fallback needed
        // Award points using new pointsUtils
        const token = await this.getToken();
        const result = await addPoints(
          'liveReservation',
          this.liveId,
          this.memberId,
          token
        );
        
        // Mark reservation as completed (no local database needed)
        
        uni.hideLoading();
        
        if (result.success) {
          if (result.alreadyAwarded) {
            // Points were already awarded for this operation
            this.pointsAwarded = this.points;
            
            // Show toast that points were already awarded
            uni.showToast({
              title: '您已获得过扫码积分',
              icon: 'none',
              duration: 2000
            });
            
            // Still redirect to live stream even if points were already awarded
            setTimeout(() => {
              this.redirectToLiveStream();
            }, 2000);
          } else {
            // Points were successfully awarded
            this.pointsAwarded = result.points;
            
            // Show success message and redirect to live stream
            uni.showToast({
              title: `获得${result.points}积分！正在跳转到直播...`,
              icon: 'success',
              duration: 2000
            });
            
            // Redirect to live stream URL after a short delay
            setTimeout(() => {
              this.redirectToLiveStream();
            }, 2000);
          }
        } else {
          // Points awarding failed
          uni.showToast({
            title: '积分获取失败，请重试',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('Error completing reservation:', error);
        uni.hideLoading();
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.isProcessing = false;
      }
    },
    
    async completeReservationViaBackend() {
      try {
        const token = await this.getToken();
        // Send memberId and liveStreamId as query parameters
        const url = `https://seeutest.duckdns.org/seeuapp/livestream/reservation/complete?memberId=${this.memberId}&liveStreamId=${this.liveId}`;
        const response = await requestWithToken(
          url,
          'POST',
          {}, // No body needed
          token
        );
        if (response.code === 200 && response.data) {
          return response.data;
        }
        return null;
      } catch (error) {
        console.error('Backend API error:', error);
        return null;
      }
    },
    
    onQRCodeLongPress() {
      // Only allow if QR points haven't been awarded yet
      if (this.isProcessing || this.pointsAwarded > 0) {
        return;
      }
      
      // Call the existing completeReservation method
      this.completeReservation();
    },
    
    onQRCodeTap() {
      // Show instructions for QR code scanning
      uni.showModal({
        title: '观看直播',
        content: '请使用微信扫描此二维码观看直播\n\n长按二维码可获得积分并跳转到直播页面',
        showCancel: false,
        confirmText: '知道了'
      });
    },

    
    onQRCodeImageLoad() {
      console.log('QR code image loaded successfully');
    },
    
    onQRCodeImageError(e) {
      if (this.qrCodeImageUrl && this.qrCodeImageUrl.startsWith('/files/')) {
        this.downloadImageFromBackend(this.qrCodeImageUrl, 'qr');
      } else {
        uni.showToast({ 
          title: '二维码加载失败', 
          icon: 'none',
          duration: 3000
        });
      }
    },
    
    onBackgroundImageLoad() {
      console.log('Background image loaded successfully');
    },
    
    onBackgroundImageError(e) {
      console.error('Background image loading failed:', e);
    },
    
    onLogoLoad() {
      console.log('SeeU logo loaded successfully');
    },
    
    onLogoError(e) {
      console.error('SeeU logo loading failed:', e);
    },
    
    onBottomFrameLoad() {
      console.log('Bottom frame loaded successfully');
      console.log('Frame positioned at:', 558, 'px from top');
    },
    
    onBottomFrameError(e) {
      console.error('Bottom frame loading failed:', e);
      console.log('Frame file path: https://seeutest.duckdns.org/images/static/Frame 2001.png');
    },
    
    async handleSharePoints() {
      // Only allow if share points haven't been awarded yet
      if (this.sharePointsAwarded > 0) {
        return;
      }
      
      try {
        // Award points for sharing
        const token = await this.getToken();
        const result = await addPoints(
          'liveShare',
          this.liveId,
          this.memberId,
          token
        );
        
        if (result.success) {
          if (result.alreadyAwarded) {
            // Points were already awarded
            this.sharePointsAwarded = this.sharePoints;
            
            // Show toast that points were already awarded
            uni.showToast({
              title: '您已获得过分享积分',
              icon: 'none',
              duration: 2000
            });
          } else {
            // Points were successfully awarded
            this.sharePointsAwarded = result.points;
            
            // Show success message
            uni.showToast({
              title: `获得${result.points}分享积分！`,
              icon: 'success',
              duration: 2000
            });
          }
          
          // Refresh points status to ensure UI is up to date
          await this.refreshPointsStatus();
        } else {
          // Points awarding failed
          uni.showToast({
            title: '分享积分获取失败',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('Error awarding share points:', error);
      }
    },

    getPointsStatusText() {
      console.log('Getting points status text:');
      console.log('  pointsAwarded:', this.pointsAwarded);
      console.log('  sharePointsAwarded:', this.sharePointsAwarded);
      
      // Check if user has received both types of points
      if (this.pointsAwarded > 0 && this.sharePointsAwarded > 0) {
        console.log('  Status: Both points awarded');
        return "已获得所有积分";
      }
      // Check if user has only received share points
      else if (this.sharePointsAwarded > 0 && this.pointsAwarded === 0) {
        console.log('  Status: Only share points awarded');
        return "已获得分享积分，扫码还可获得更多积分";
      }
      // Check if user has only received scan points
      else if (this.pointsAwarded > 0 && this.sharePointsAwarded === 0) {
        console.log('  Status: Only QR points awarded');
        return "已获得扫码积分，分享还可获得更多积分";
      }
      // User hasn't received any points yet
      else {
        console.log('  Status: No points awarded yet');
        return "分享给朋友/扫描上方二维码预约\n均可获得相应积分";
      }
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
          `https://seeutest.duckdns.org/seeuapp/admin/check?email=${email}`,
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
    }
  }
};
</script>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: visible;
  /* Ensure minimum height to accommodate all elements */
  min-height: 800px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stream-info {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}



.points-info {
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
}

.points-info text {
  font-size: 18px;
  color: #ff9800;
  font-weight: bold;
}

.qr-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
}

.qr-code-image {
  width: 200px;
  height: 200px;
  margin-bottom: 15px;
}

.qr-tip {
  font-size: 16px;
  color: #666;
}

.complete-btn {
  width: 100%;
  height: 50px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.complete-btn:disabled {
  background: #ccc;
}

.complete-btn.completed {
  background: #4caf50;
}

.success-message {
  background: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  margin-top: 20px;
}

.success-message text {
  font-size: 18px;
  color: #4caf50;
  font-weight: bold;
}

/* Background image covering entire page */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}

/* QR Code Rectangle - 256x324 pixels (20% smaller), 16px corner radius, centered, 46px from top (moved up 100px) */
.qr-container {
  position: absolute;
  top: 146px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 405px;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1;
  max-width: 320px;
  max-height: 405px;
  flex: none;
  flex-shrink: 0;
  flex-grow: 0;
}

.qr-code-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  max-width: 320px;
  max-height: 405px;
}

/* Dynamic Points Status Text - 420px from top (50px beneath QR code), blue text, PingFang SC font, MEDIUM */
.points-status-text {
  position: absolute;
  top: 606px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  width: 100%;
  padding: 0 20px;
  z-index: 2;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-text {
  font-family: 'PingFang SC', 'Inter', 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #072C7D;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-line;
  position: relative;
}

/* Left gradient rectangle */
.status-text::before {
  content: '';
  position: absolute;
  left: -50px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 2px;
  background: linear-gradient(to right, rgba(22, 70, 174, 0.2), #1646AE);
}

/* Right gradient rectangle */
.status-text::after {
  content: '';
  position: absolute;
  right: -50px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 2px;
  background: linear-gradient(to left, rgba(22, 70, 174, 0.2), #1646AE);
}

/* SeeU Logo - 470px from top (50px beneath text), 51x58 pixels */
.logo-container {
  position: absolute;
  top: 725px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 2;
}

.seeu-logo {
  width: 51px;
  height: 58px;
}

/* Bottom Border Decoration - 30px beneath SeeU logo */
.bottom-decoration {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.bottom-frame {
  width: 100%;
  max-width: 393px;
  height: 50px;
  object-fit: contain;
  display: block;
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