<template>
  <view class="admin-container">
    <view class="header">
      <text class="title">直播管理</text>
      <text v-if="isAdmin" class="admin-status">管理员已登录</text>
    </view>
    
    <!-- Admin login prompt -->
    <view v-if="!isAdmin" class="login-section">
      <text class="login-title">需要管理员权限</text>
      <text class="login-desc">请输入管理员凭据以访问管理功能</text>
      <button @tap="showAdminLogin" class="login-btn">管理员登录</button>
    </view>
    
    <!-- Admin content (only shown when logged in) -->
    <view v-if="isAdmin">
      <!-- Add new live stream form -->
      <view class="form-section">
        <text class="section-title">添加新直播</text>
        
        <!-- Cover Image Upload Section -->
        <view class="image-upload-section">
          <text class="input-label">直播封面图片：</text>
          <button class="select-image-button" @tap="selectCoverImage">选择封面图片</button>
          <view v-if="displayCoverImage && displayCoverImage.trim()" class="image-preview">
            <image 
              :src="displayCoverImage" 
              :key="displayCoverImage"
              mode="aspectFit" 
              class="preview-image"
              @load="onCoverImageLoad"
              @error="onCoverImageError"
            ></image>
            <text class="image-url-text">
              {{ getImageSourceText('cover') }}
            </text>
          </view>
        </view>
        
        <!-- QR Code Image Upload Section -->
        <!-- <view class="image-upload-section">
          <text class="input-label">二维码图片：</text>
          <button class="select-image-button" @tap="selectQRCodeImage">选择二维码图片</button>
          <view v-if="displayQRCodeImage && displayQRCodeImage.trim()" class="image-preview">
            <image 
              :src="displayQRCodeImage" 
              :key="displayQRCodeImage"
              mode="aspectFit" 
              class="preview-image"
              @load="onQRCodeImageLoad"
              @error="onQRCodeImageError"
            ></image>
            <text class="image-url-text">
              {{ getImageSourceText('qr') }}
            </text>
          </view>
        </view> -->
        
        <view class="input-with-counter">
          <input v-model="newStream.title" placeholder="直播标题" class="input" maxlength="16" />
          <text class="char-counter">{{ newStream.title.length }}/16</text>
        </view>
        <textarea v-model="newStream.description" placeholder="直播描述" class="textarea" />
        <input v-model="newStream.pointsReward" placeholder="扫码积分奖励" type="number" class="input" />
        <input v-model="newStream.sharePointsReward" placeholder="分享积分奖励" type="number" class="input" />
        
        <!-- Date and Time Fields -->
        <view class="datetime-section">
          <text class="datetime-label">开始时间</text>
          <picker mode="date" :value="newStream.startDate" @change="onStartDateChange" class="date-picker">
            <view class="picker-text">{{ newStream.startDate || '选择日期' }}</view>
          </picker>
          <picker mode="time" :value="newStream.startTime" @change="onStartTimeChange" class="time-picker">
            <view class="picker-text">{{ newStream.startTime || '选择时间' }}</view>
          </picker>
        </view>
        
        <view class="datetime-section">
          <text class="datetime-label">结束时间</text>
          <picker mode="date" :value="newStream.endDate" @change="onEndDateChange" class="date-picker">
            <view class="picker-text">{{ newStream.endDate || '选择日期' }}</view>
          </picker>
          <picker mode="time" :value="newStream.endTime" @change="onEndTimeChange" class="time-picker">
            <view class="picker-text">{{ newStream.endTime || '选择时间' }}</view>
          </picker>
        </view>
        
        <button @tap="addLiveStream" class="add-btn">添加直播</button>
      </view>
      
      <!-- Existing live streams -->
      <view class="streams-section">
        <view class="section-header">
          <text class="section-title">现有直播</text>
          <view class="bulk-actions" v-if="liveStreams.length > 0">
            <button @tap="selectAll" class="select-btn">{{ isAllSelected ? '取消全选' : '全选' }}</button>
            <button @tap="deleteSelected" class="bulk-delete-btn" v-if="selectedStreams.length > 0">
              删除选中 ({{ selectedStreams.length }})
            </button>
          </view>
        </view>
        
        <view v-for="stream in liveStreams" :key="stream.id || stream.liveId" class="stream-item" :class="{ 'selected': isStreamSelected(stream) }">
          <view class="stream-checkbox" @tap="toggleStreamSelection(stream)">
            <view class="checkbox" :class="{ 'checked': isStreamSelected(stream) }">
              <text v-if="isStreamSelected(stream)" class="checkmark">✓</text>
            </view>
          </view>
          <view class="stream-info">
            <text class="stream-title">{{ stream.title }}</text>
            <text class="stream-desc">{{ stream.description }}</text>
            <text class="stream-points">{{ stream.pointsReward || stream.points }} 积分</text>
            <text class="stream-time">开始: {{ stream.startTime || '未设置' }}</text>
            <text class="stream-time">结束: {{ stream.endTime || '未设置' }}</text>
            <text class="stream-status">状态: {{ stream.status || 'upcoming' }}</text>
          </view>
          <view class="stream-actions">
			<!-- Removed edit button due to it not being implemented -->
            <!-- <button @tap="editStream(stream)" class="edit-btn">编辑</button> -->
            <button @tap="deleteStream(stream.id || stream.liveId)" class="delete-btn">删除</button>
          </view>
        </view>
        
        <view v-if="liveStreams.length === 0" class="empty-state">
          <text class="empty-text">暂无直播数据</text>
        </view>
      </view>
      
      <!-- Test data section -->
      <view class="test-section">
        <text class="section-title">测试功能</text>
        <button @tap="clearAllData" class="clear-btn">清空所有数据</button>
        <button @tap="exportData" class="export-btn">导出数据</button>
        <button @tap="logout" class="logout-btn">退出登录</button>
      </view>
    </view>
  </view>
</template>

<script>
import { addOps } from '../../modules/pointsUtils.js';
import { requestWithToken } from '../../modules/requestUtils.js';

export default {
  data() {
    return {
      liveStreams: [],
      newStream: {
        title: '',
        description: '',
        imageUrl: '',
        qrCodeUrl: '',
        pointsReward: 5,
        sharePointsReward: 3,
        startDate: '', // Added for date picker
        startTime: '', // Added for time picker
        endDate: '',   // Added for date picker
        endTime: '',   // Added for time picker
      },
      isAdmin: false,
      // Image upload related fields
      tempCoverImagePath: '', // Temporary cover image path
      tempQRCodeImagePath: '', // Temporary QR code image path
      hasCoverImageChanged: false, // Mark if cover image has changed
      hasQRCodeImageChanged: false, // Mark if QR code image has changed
      baseUrl: 'https://seeu-applets.seeu-edu.com/v2/seeuapp',
      // Local temp file storage for downloaded images
      imageCache: {}, // Cache downloaded images to avoid repeated downloads
      downloadedCoverImagePath: '', // Downloaded cover image local path
      downloadedQRCodeImagePath: '', // Downloaded QR code image local path
      // Selection functionality
      selectedStreams: [], // Array of selected stream IDs
      isAllSelected: false // Whether all streams are selected
    };
  },
  computed: {
    // Partner's priority system: local temp file > original URL > default
    displayCoverImage() {
      // Priority 1: Local temp file (downloaded)
      if (this.downloadedCoverImagePath && this.downloadedCoverImagePath.trim()) {
        return this.downloadedCoverImagePath;
      }
      // Priority 2: Temporary selected image
      if (this.tempCoverImagePath && this.tempCoverImagePath.trim()) {
        return this.tempCoverImagePath;
      }
      // Priority 3: Original URL (will be downloaded if HTTP)
      if (this.newStream.imageUrl && this.newStream.imageUrl.trim()) {
        return this.newStream.imageUrl;
      }
      // Priority 4: No default image - return empty string
      return '';
    },
    
    displayQRCodeImage() {
      // Priority 1: Local temp file (downloaded)
      if (this.downloadedQRCodeImagePath && this.downloadedQRCodeImagePath.trim()) {
        return this.downloadedQRCodeImagePath;
      }
      // Priority 2: Temporary selected image
      if (this.tempQRCodeImagePath && this.tempQRCodeImagePath.trim()) {
        return this.tempQRCodeImagePath;
      }
      // Priority 3: Original URL (will be downloaded if HTTP)
      if (this.newStream.qrCodeUrl && this.newStream.qrCodeUrl.trim()) {
        return this.newStream.qrCodeUrl;
      }
      // Priority 4: No default image - return empty string
      return '';
    }
  },
  async onLoad() {
    await this.checkAdminStatus();
    if (this.isAdmin) {
      await this.loadLiveStreams();
    }
  },
      methods: {
      async checkAdminStatus() {
        // Use backend API to check admin status
        const isAdmin = await this.checkAdmin();
        if (isAdmin) {
          this.isAdmin = true;
        } else {
          // Show login dialog
          this.showAdminLogin();
        }
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
      
      showAdminLogin() {
        uni.showModal({
          title: '管理员登录',
          content: '请输入管理员凭据',
          editable: true,
          placeholderText: '用户名: admin, 密码: admin123',
          success: (res) => {
            if (res.confirm) {
              const input = res.content;
              if (input === 'admin:admin123') {
                uni.setStorageSync('adminUsername', 'admin');
                uni.setStorageSync('adminPassword', 'admin123');
                this.isAdmin = true;
                this.loadLiveStreams();
                uni.showToast({
                  title: '登录成功',
                  icon: 'success'
                });
              } else {
                uni.showToast({
                  title: '凭据错误',
                  icon: 'error'
                });
                this.showAdminLogin();
              }
            } else {
              // User cancelled, go back
              uni.navigateBack();
            }
          }
        });
      },
      
      async loadLiveStreams() {
      try {
        // Try to fetch from backend first
        const backendStreams = await this.fetchLiveStreamsFromBackend();
        console.log(backendStreams);
        if (backendStreams && backendStreams.length > 0) {
          this.liveStreams = backendStreams;
        } else {
          // Fallback to empty array if no data
          this.liveStreams = [];
        }
        
        // Check and add liveReservation operation type if it doesn't exist
        await this.ensureLiveReservationOperation();
      } catch (error) {
        console.error('Error loading live streams:', error);
        // Fallback to empty array on error
        this.liveStreams = [];
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
    
    async fetchLiveStreamsFromBackend() {
	  
      const token = await this.getToken();
	  
      try {
        const response = await requestWithToken(
          `${this.baseUrl}/livestream/list`,
          'GET',
          {},
          token
        );
        console.log(response);
        if (response && response.code === 200 && response.data) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error('Backend API error:', error);
        return [];
      }
    },
    
    async ensureLiveReservationOperation() {
      try {
        const token = uni.getStorageSync("token");
        console.log('Current token:', token); // Debug: see what token is being used
        
        if (!token) {
          console.log('No token available, skipping operation setup');
          return;
        }
        
        const memberId = uni.getStorageSync('memberId') || 'admin';
        
        // Try to add the liveReservation operation type (5 points reward)
        const success = await addOps('liveReservation', 5, memberId, token);
        
        if (success) {
          console.log('LiveReservation operation type added successfully');
        } else {
          console.log('LiveReservation operation type already exists or failed to add');
        }
        
        // Try to add the liveShare operation type (3 points reward)
        const shareSuccess = await addOps('liveShare', 3, memberId, token);
        
        if (shareSuccess) {
          console.log('LiveShare operation type added successfully');
        } else {
          console.log('LiveShare operation type already exists or failed to add');
        }
      } catch (error) {
        console.error('Error ensuring liveReservation operation:', error);
      }
    },
    
    // Cover image upload methods
    selectCoverImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          console.log('选择的封面图片路径:', tempFilePath);
          
          // Set temporary image path, don't upload immediately
          this.tempCoverImagePath = tempFilePath;
          this.hasCoverImageChanged = true;
          
          uni.showToast({ 
            title: '封面图片已选择，点击添加直播时会上传', 
            icon: 'none',
            duration: 2000
          });
        },
        fail: (err) => {
          console.error('选择封面图片失败:', err);
          uni.showToast({ title: '选择封面图片失败', icon: 'none' });
        }
      });
    },

    onCoverImageLoad() {
      console.log('封面图片加载成功');
    },

    onCoverImageError(e) {
      console.error('封面图片加载失败:', e);
      console.log('当前图片URL:', this.newStream.imageUrl);
      console.log('临时图片路径:', this.tempCoverImagePath);
      console.log('下载的图片路径:', this.downloadedCoverImagePath);
      
      // Partner's retry logic: If local temp file failed, try to download again
      if (this.newStream.imageUrl && this.newStream.imageUrl.startsWith('http')) {
        console.log('尝试重新下载封面图片...');
        this.checkAndDownloadImage(this.newStream.imageUrl, 'cover');
      }
    },

    // QR code image upload methods
    selectQRCodeImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          console.log('选择的二维码图片路径:', tempFilePath);
          
          // Set temporary image path, don't upload immediately
          this.tempQRCodeImagePath = tempFilePath;
          this.hasQRCodeImageChanged = true;
          
          uni.showToast({ 
            title: '二维码图片已选择，点击添加直播时会上传', 
            icon: 'none',
            duration: 2000
          });
        },
        fail: (err) => {
          console.error('选择二维码图片失败:', err);
          uni.showToast({ title: '选择二维码图片失败', icon: 'none' });
        }
      });
    },

    onQRCodeImageLoad() {
      console.log('二维码图片加载成功');
    },

    onQRCodeImageError(e) {
      console.error('二维码图片加载失败:', e);
      console.log('当前图片URL:', this.newStream.qrCodeUrl);
      console.log('临时图片路径:', this.tempQRCodeImagePath);
      console.log('下载的图片路径:', this.downloadedQRCodeImagePath);
      
      // Partner's retry logic: If local temp file failed, try to download again
      if (this.newStream.qrCodeUrl && this.newStream.qrCodeUrl.startsWith('http')) {
        console.log('尝试重新下载二维码图片...');
        this.checkAndDownloadImage(this.newStream.qrCodeUrl, 'qr');
      }
    },

    // Upload images and then add live stream
    async uploadImagesAndAddLiveStream() {
      const uploadPromises = [];
      
      // Upload cover image if needed
      if (this.hasCoverImageChanged && this.tempCoverImagePath) {
        const coverImagePromise = this.uploadCoverImage();
        uploadPromises.push(coverImagePromise);
      }
      
      // Upload QR code image if needed
      if (this.hasQRCodeImageChanged && this.tempQRCodeImagePath) {
        const qrCodeImagePromise = this.uploadQRCodeImage();
        uploadPromises.push(qrCodeImagePromise);
      }
      
      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        try {
          await Promise.all(uploadPromises);
        } catch (error) {
          console.error('Image upload failed:', error);
          uni.hideLoading();
          uni.showToast({ 
            title: '图片上传失败', 
            icon: 'none' 
          });
          return;
        }
      }
      
      // Continue with adding live stream
      await this.addLiveStreamData();
    },

    async uploadCoverImage() {
      return new Promise(async (resolve, reject) => {
        // Get token here with Bearer prefix
        const token = await this.getToken();

        // Generate a proper liveStreamId that matches backend validation
        const tempLiveStreamId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        uni.uploadFile({
          url: `${this.baseUrl}/livestream/upload-cover-image`,
          filePath: this.tempCoverImagePath,
          name: 'file',
		  header: {
		    "token": token
		  },
          formData: {
            liveStreamId: tempLiveStreamId,
          },
          success: (res) => {
            try {
              console.log('Raw upload response:', res);
              console.log('Response data:', res.data);
              console.log('Response statusCode:', res.statusCode);
              
              const response = JSON.parse(res.data);
              console.log('Parsed response:', response);
              
              if (response.code === 200) {
                // Store the image URL returned from server
                this.newStream.imageUrl = response.message;
                console.log('Cover image uploaded successfully:', this.newStream.imageUrl);
                resolve();
              } else {
                console.error('Cover image upload failed:', response);
                reject(new Error(response.message || response.error || 'Cover image upload failed'));
              }
            } catch (error) {
              console.error('Failed to parse upload response:', error);
              console.error('Raw response data:', res.data);
              reject(error);
            }
          },
          fail: (err) => {
            console.error('Cover image upload failed:', err);
            reject(err);
          }
        });
      });
    },

    async uploadQRCodeImage() {
      return new Promise(async (resolve, reject) => {
        // Get token here with Bearer prefix
        const token = await this.getToken();
        
        // Generate a proper liveStreamId that matches backend validation
        const tempLiveStreamId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        uni.uploadFile({
          url: `${this.baseUrl}/livestream/upload-qr-image`,
          filePath: this.tempQRCodeImagePath,
          name: 'file',
		  header: {
		    "token": token
		  },
          formData: {
            liveStreamId: tempLiveStreamId,
          },
          success: (res) => {
            try {
              console.log('Raw QR upload response:', res);
              console.log('QR Response data:', res.data);
              console.log('QR Response statusCode:', res.statusCode);
              
              const response = JSON.parse(res.data);
              console.log('Parsed QR response:', response);
              
              if (response.code === 200) {
                // Store the image URL returned from server
                this.newStream.qrCodeUrl = response.message;
                console.log('QR code image uploaded successfully:', this.newStream.qrCodeUrl);
                resolve();
              } else {
                console.error('QR code image upload failed:', response);
                reject(new Error(response.message || response.error || 'QR code image upload failed'));
              }
            } catch (error) {
              console.error('Failed to parse QR upload response:', error);
              console.error('Raw QR response data:', res.data);
              reject(error);
            }
          },
          fail: (err) => {
            console.error('QR code image upload failed:', err);
            reject(err);
          }
        });
      });
    },
    
    async addLiveStream() {
      try {
        if (!this.newStream.title || !this.newStream.description) {
          uni.showToast({
            title: '请填写标题和描述',
            icon: 'none'
          });
          return;
        }

        // Validate datetime fields
        if (!this.newStream.startDate || !this.newStream.startTime) {
          uni.showToast({
            title: '请选择开始时间',
            icon: 'none'
          });
          return;
        }

        if (!this.newStream.endDate || !this.newStream.endTime) {
          uni.showToast({
            title: '请选择结束时间',
            icon: 'none'
          });
          return;
        }

        uni.showLoading({ title: '添加中...' });

        // If there are images to upload, do that first
        if ((this.hasCoverImageChanged && this.tempCoverImagePath) || 
            (this.hasQRCodeImageChanged && this.tempQRCodeImagePath)) {
          await this.uploadImagesAndAddLiveStream();
        } else {
          // No images to upload, proceed directly
          await this.addLiveStreamData();
        }
      } catch (error) {
        uni.hideLoading();
        console.error('Error adding live stream:', error);
        uni.showToast({
          title: '添加失败',
          icon: 'error'
        });
      }
    },

    async addLiveStreamData() {
      try {
        // Handle image URLs before creating live stream
        await this.handleImageUrls();
        
        // Use downloaded images if available, otherwise use original URLs
        const coverImageUrl = this.downloadedCoverImagePath || this.newStream.imageUrl || '';
        const qrCodeImageUrl = this.downloadedQRCodeImagePath || this.newStream.qrCodeUrl || '';
        
        const token = await this.getToken();
        if (!token) {
          uni.hideLoading();
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        // 3. Add the live stream event as before (backend API)
        const liveStreamData = {
          title: this.newStream.title,
          description: this.newStream.description,
          coverImage: coverImageUrl,
          qrCodeImage: qrCodeImageUrl,
          pointsReward: this.newStream.pointsReward,
          sharePointsReward: this.newStream.sharePointsReward,
          startTime: this.formatDateTime(this.newStream.startDate, this.newStream.startTime),
          endTime: this.formatDateTime(this.newStream.endDate, this.newStream.endTime),
          status: 'upcoming'
        };
        
        console.log('Creating live stream with data:', liveStreamData);
        
        const res = await requestWithToken(
          `${this.baseUrl}/livestream/create`,
          'POST',
          liveStreamData,
          token
        );
        
        if (res && res.code === 200 && res.data === true) {
          uni.hideLoading();
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          });
          this.resetForm();
          await this.loadLiveStreams();
        } else {
          uni.hideLoading();
		  console.error(res);
          uni.showToast({
            title: '添加失败',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('Error creating live stream:', error);
        uni.hideLoading();
        uni.showToast({
          title: '添加失败',
          icon: 'error'
        });
      }
    },

    resetForm() {
      this.newStream = {
        title: '',
        description: '',
        imageUrl: '',
        qrCodeUrl: '',
        pointsReward: 5,
        sharePointsReward: 3,
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
      };
      this.tempCoverImagePath = '';
      this.tempQRCodeImagePath = '';
      this.hasCoverImageChanged = false;
      this.hasQRCodeImageChanged = false;
      // Clear downloaded image paths (partner's approach)
      this.downloadedCoverImagePath = '';
      this.downloadedQRCodeImagePath = '';
      // Clear image cache for new uploads
      this.imageCache = {};
    },
    
    // editStream(stream) {
    //   // For now, just show the stream details
    //   uni.showModal({
    //     title: '编辑直播',
    //     content: `标题: ${stream.title}\n描述: ${stream.description}\n积分: ${stream.pointsReward}`,
    //     showCancel: false
    //   });
    // },
    
    async deleteStream(liveId) {
      try {
        uni.showModal({
          title: '确认删除',
          content: '确定要删除这个直播吗？此操作将同时删除相关的图片文件且不可恢复！',
          confirmText: '删除',
          confirmColor: '#f44336',
          success: async (res) => {
            if (res.confirm) {
              uni.showLoading({ title: '删除中...' });
              
              try {
                // Try to delete from backend first
                const backendResult = await this.deleteLiveStreamFromBackend(liveId);
                
                if (backendResult) {
                  uni.hideLoading();
                  uni.showToast({
                    title: '删除成功',
                    icon: 'success'
                  });
                  await this.loadLiveStreams();
                } else {
                  uni.hideLoading();
                  uni.showToast({
                    title: '删除失败',
                    icon: 'error'
                  });
                }
              } catch (error) {
                uni.hideLoading();
                console.error('Error deleting live stream:', error);
                uni.showToast({
                  title: '删除失败',
                  icon: 'error'
                });
              }
            }
          }
        });
      } catch (error) {
        console.error('Error in delete confirmation:', error);
      }
    },
    
    async deleteLiveStreamFromBackend(liveId) {
      try {
        const token = await this.getToken();
        if (!token) {
          console.warn('No token available for backend deletion');
          return false;
        }
        
        const response = await requestWithToken(
          `${this.baseUrl}/livestream/delete/${liveId}`,
          'DELETE',
          {},
          token
        );
        
        if (response && response.code === 200 && response.data === true) {
          console.log('Live stream deleted successfully from backend:', liveId);
          return true;
        } else {
          console.error('Backend deletion failed:', response);
          return false;
        }
      } catch (error) {
        console.error('Error calling backend delete API:', error);
        return false;
      }
    },
    
    // Selection methods
    toggleStreamSelection(stream) {
      const streamId = stream.id || stream.liveId;
      const index = this.selectedStreams.indexOf(streamId);
      
      if (index > -1) {
        this.selectedStreams.splice(index, 1);
      } else {
        this.selectedStreams.push(streamId);
      }
      
      this.updateSelectionState();
    },
    
    isStreamSelected(stream) {
      const streamId = stream.id || stream.liveId;
      return this.selectedStreams.includes(streamId);
    },
    
    selectAll() {
      if (this.isAllSelected) {
        this.selectedStreams = [];
      } else {
        this.selectedStreams = this.liveStreams.map(stream => stream.id || stream.liveId);
      }
      this.updateSelectionState();
    },
    
    updateSelectionState() {
      this.isAllSelected = this.selectedStreams.length === this.liveStreams.length && this.liveStreams.length > 0;
    },
    
    async deleteSelected() {
      if (this.selectedStreams.length === 0) {
        uni.showToast({
          title: '请先选择要删除的直播',
          icon: 'none'
        });
        return;
      }
      
      uni.showModal({
        title: '确认批量删除',
        content: `确定要删除选中的 ${this.selectedStreams.length} 个直播吗？此操作将同时删除相关的图片文件且不可恢复！`,
        confirmText: '删除',
        confirmColor: '#f44336',
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '批量删除中...' });
            
            try {
              // Try bulk delete first
              const bulkResult = await this.bulkDeleteLiveStreamsFromBackend(this.selectedStreams);
              
              if (bulkResult) {
                uni.hideLoading();
                uni.showToast({
                  title: `成功删除 ${this.selectedStreams.length} 个直播`,
                  icon: 'success'
                });
              } else {
                // Fallback to individual deletion
                uni.showLoading({ title: `逐个删除中... (0/${this.selectedStreams.length})` });
                
                let successCount = 0;
                let failCount = 0;
                
                for (let i = 0; i < this.selectedStreams.length; i++) {
                  const streamId = this.selectedStreams[i];
                  uni.showLoading({ title: `删除中... (${i + 1}/${this.selectedStreams.length})` });
                  
                  try {
                    const result = await this.deleteLiveStreamFromBackend(streamId);
                    if (result) {
                      successCount++;
                    } else {
                      failCount++;
                    }
                  } catch (error) {
                    console.error('Error deleting stream:', streamId, error);
                    failCount++;
                  }
                }
                
                uni.hideLoading();
                
                if (failCount === 0) {
                  uni.showToast({
                    title: `成功删除 ${successCount} 个直播`,
                    icon: 'success'
                  });
                } else {
                  uni.showToast({
                    title: `删除完成：成功 ${successCount} 个，失败 ${failCount} 个`,
                    icon: 'none',
                    duration: 3000
                  });
                }
              }
            } catch (error) {
              uni.hideLoading();
              console.error('Error in bulk deletion:', error);
              uni.showToast({
                title: '删除失败',
                icon: 'error'
              });
            }
            
            // Clear selection and reload data
            this.selectedStreams = [];
            this.updateSelectionState();
            await this.loadLiveStreams();
          }
        }
      });
    },
    
    async bulkDeleteLiveStreamsFromBackend(streamIds) {
      try {
        const token = await this.getToken();
        if (!token) {
          console.warn('No token available for bulk deletion');
          return false;
        }
        
        const response = await requestWithToken(
          `${this.baseUrl}/livestream/delete/bulk`,
          'DELETE',
          streamIds,
          token
        );
        
        if (response && response.code === 200 && response.data === true) {
          console.log('Live streams bulk deleted successfully:', streamIds);
          return true;
        } else {
          console.error('Bulk deletion failed:', response);
          return false;
        }
      } catch (error) {
        console.error('Error calling bulk delete API:', error);
        return false;
      }
    },
    

    
    async clearAllData() {
      try {
        uni.showModal({
          title: '确认清空',
          content: '确定要清空所有数据吗？此操作不可恢复！',
          success: async (res) => {
            if (res.confirm) {
              // Clear data from backend instead of local database
              uni.showToast({
                title: '清空功能需要后端支持',
                icon: 'none'
              });
              await this.loadLiveStreams();
            }
          }
        });
      } catch (error) {
        console.error('Error clearing data:', error);
      }
    },
    
    async exportData() {
      try {
        // Export data from backend instead of local database
        uni.showModal({
          title: '数据导出',
          content: '导出功能需要后端支持',
          showCancel: false
        });
      } catch (error) {
        console.error('Error exporting data:', error);
      }
    },
    
    logout() {
      uni.removeStorageSync('adminUsername');
      uni.removeStorageSync('adminPassword');
      this.isAdmin = false;
      uni.showToast({
        title: '已退出登录',
        icon: 'success'
      });
    },
    
    handleAuthError() {
      // Handle authentication error - you can customize this
      console.error('Authentication error occurred');
      uni.showToast({
        title: '认证失败',
        icon: 'error'
      });
    },

    // New methods for date/time pickers
    onStartDateChange(e) {
      this.newStream.startDate = e.detail.value;
    },
    onStartTimeChange(e) {
      this.newStream.startTime = e.detail.value;
    },
    onEndDateChange(e) {
      this.newStream.endDate = e.detail.value;
    },
    onEndTimeChange(e) {
      this.newStream.endTime = e.detail.value;
    },
    
    formatDateTime(date, time) {
      if (!date || !time) {
        // Return current datetime if not provided
        const now = new Date();
        return now.toISOString().slice(0, 19).replace('T', ' ');
      }
      return `${date} ${time}:00`;
    },

    // Partner's approach: Download HTTP images to local temp files
    async checkAndDownloadImage(imageUrl, type) {
      try {
        console.log(`Attempting to download ${type} image from:`, imageUrl);
        
        // Check if image is already cached
        if (this.imageCache[imageUrl]) {
          console.log(`${type} image already cached:`, this.imageCache[imageUrl]);
          if (type === 'cover') {
            this.downloadedCoverImagePath = this.imageCache[imageUrl];
          } else {
            this.downloadedQRCodeImagePath = this.imageCache[imageUrl];
          }
          return;
        }
        
        // Download image using uni.downloadFile (partner's approach)
        const downloadResult = await new Promise((resolve, reject) => {
          uni.downloadFile({
            url: imageUrl,
            success: (res) => {
              if (res.statusCode === 200) {
                resolve(res.tempFilePath);
              } else {
                reject(new Error(`Download failed with status: ${res.statusCode}`));
              }
            },
            fail: (err) => {
              reject(err);
            }
          });
        });
        
        // Cache the downloaded image path (partner's caching strategy)
        this.imageCache[imageUrl] = downloadResult;
        
        // Set the appropriate downloaded path
        if (type === 'cover') {
          this.downloadedCoverImagePath = downloadResult;
          console.log('Cover image downloaded to local temp file:', downloadResult);
        } else {
          this.downloadedQRCodeImagePath = downloadResult;
          console.log('QR code image downloaded to local temp file:', downloadResult);
        }
        
      } catch (error) {
        console.error(`Failed to download ${type} image:`, error);
        // Fall back to original URL if download fails
        if (type === 'cover') {
          this.downloadedCoverImagePath = '';
        } else {
          this.downloadedQRCodeImagePath = '';
        }
      }
    },

    // Handle image URLs (partner's approach)
    async handleImageUrls() {
      // Download cover image if it's an HTTP URL
      if (this.newStream.imageUrl && this.newStream.imageUrl.startsWith('http')) {
        await this.checkAndDownloadImage(this.newStream.imageUrl, 'cover');
      }
      
      // Download QR code image if it's an HTTP URL
      if (this.newStream.qrCodeUrl && this.newStream.qrCodeUrl.startsWith('http')) {
        await this.checkAndDownloadImage(this.newStream.qrCodeUrl, 'qr');
      }
    },

    // Get the image source for display, prioritizing local temp files
    getDisplayImageSource(imageUrl, type) {
      if (this.imageCache[imageUrl]) {
        return this.imageCache[imageUrl];
      }
      if (imageUrl && imageUrl.startsWith('http')) {
        return imageUrl; // If it's an HTTP URL, return it directly
      }
      return ''; // Fallback to empty string if no image source found
    },

    // Get the text for the image source display
    getImageSourceText(type) {
      if (type === 'cover') {
        if (this.downloadedCoverImagePath) {
          return '本地临时文件';
        } else if (this.tempCoverImagePath) {
          return '临时图片（点击添加直播时会上传）';
        } else if (this.newStream.imageUrl) {
          return '原始URL';
        } else {
          return '未选择图片';
        }
      } else if (type === 'qr') {
        if (this.downloadedQRCodeImagePath) {
          return '本地临时文件';
        } else if (this.tempQRCodeImagePath) {
          return '临时图片（点击添加直播时会上传）';
        } else if (this.newStream.qrCodeUrl) {
          return '原始URL';
        } else {
          return '未选择图片';
        }
      }
      return '未知';
    }
  }
};
</script>

<style scoped>
.admin-container {
  padding: 20px;
  background: #f7f7f7;
  min-height: 100vh;
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.admin-status {
  font-size: 14px;
  color: #4caf50;
  margin-top: 10px;
  display: block;
}

.login-section {
  background: white;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.login-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  display: block;
}

.login-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  display: block;
}

.login-btn {
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 12px 30px;
  font-size: 16px;
}

.form-section, .streams-section, .test-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  display: block;
}

.input-with-counter {
  position: relative;
  margin-bottom: 10px;
}

.input, .textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
  font-size: 14px;
}

.char-counter {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #999;
  pointer-events: none;
}

.textarea {
  height: 80px;
  resize: none;
}

.add-btn {
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 14px;
  width: 100%;
}

.datetime-section {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.datetime-label {
  font-size: 14px;
  color: #555;
  margin-right: 10px;
  min-width: 60px;
}

.date-picker, .time-picker {
  flex: 1;
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  color: #333;
}

.picker-text {
  font-size: 14px;
  color: #333;
}

.stream-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
  margin-bottom: 10px;
}

.stream-info {
  flex: 1;
}

.stream-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.stream-desc {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 5px;
}

.stream-points {
  font-size: 12px;
  color: #ff9800;
  font-weight: bold;
}

.stream-time {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.stream-status {
  font-size: 12px;
  color: #4caf50; /* Green for active/upcoming */
  font-weight: bold;
  margin-top: 5px;
}

.stream-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  font-size: 12px;
}

.edit-btn {
  background: #4caf50;
  color: white;
}

.delete-btn {
  background: #f44336;
  color: white;
}

.test-btn, .clear-btn, .export-btn {
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 14px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.clear-btn {
  background: #f44336;
}

.export-btn {
  background: #4caf50;
}

.logout-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 14px;
  margin-right: 10px;
  margin-bottom: 10px;
}

/* Image upload styles */
.image-upload-section {
  margin-bottom: 20px;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-right: 10px;
  display: block;
  margin-bottom: 10px;
}

.select-image-button {
  background-color: #007aff;
  color: white;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  margin-bottom: 10px;
  width: 100%;
}

.image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
  border: 1px solid #eee;
}

.preview-image {
  width: 100%;
  max-width: 150px;
  height: 150px;
  border-radius: 5px;
  object-fit: cover;
  margin-bottom: 10px;
}

.image-url-text {
  font-size: 12px;
  color: #666;
  text-align: center;
  word-break: break-all;
}

/* Selection styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.bulk-actions {
  display: flex;
  gap: 10px;
}

.select-btn {
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 5px 10px;
  font-size: 12px;
}

.bulk-delete-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 5px 10px;
  font-size: 12px;
}

.stream-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
}

.stream-item.selected {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

.stream-checkbox {
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  transition: all 0.2s ease;
}

.checkbox.checked {
  background: #2196f3;
  border-color: #2196f3;
}

.checkmark {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-text {
  font-size: 16px;
  color: #999;
}
</style> 