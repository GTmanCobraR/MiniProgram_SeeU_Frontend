<template>
  <view class="event-container">
    <scroll-view scroll-y="true" class="scroll-area">
      <view class="content page-wrapper">

        <!-- 活动图片 -->
        <image 
          class="event-image" 
          :src="displayImage" 
          :key="displayImage"
          mode="aspectFill"
          @load="onMainImageLoad"
          @error="onMainImageError"
        ></image>

        <view class="event-info">
          <!-- 编辑模式下显示表单 -->
          <view v-if="isEditing && !isPreviewing" class="edit-form">
            <!-- 图片选择 -->
            <view class="image-input-section">
              <text class="input-label">活动图片：</text>
              <button class="select-image-button" @tap="selectImage">选择图片</button>
              <view v-if="tempImagePath || formData.imageUrl" class="image-preview">
                <image 
                  :src="tempImagePath || formData.imageUrl" 
                  :key="tempImagePath || formData.imageUrl"
                  mode="aspectFit" 
                  class="preview-image"
                  @load="onImageLoad"
                  @error="onImageError"
                ></image>
                <text class="image-url-text">
                  {{ tempImagePath ? '临时图片（点击保存时会上传）' : (formData.imageUrl || '') }}
                </text>
              </view>
            </view>
          
            <!-- 输入项 -->
            <input v-model="formData.title" placeholder="活动标题" class="input spacing" />
            <input v-model="formData.details" placeholder="活动详情" class="input spacing" />
            
            <!-- 日期选择器 -->
            <view class="date-input-group spacing">
              <text class="date-label">活动时间：</text>
              <view class="date-selectors">
                <picker 
                  mode="selector" 
                  :range="years" 
                  :value="selectedYearIndex" 
                  @change="onYearChange"
                  class="date-picker"
                >
                  <view class="picker-text">{{ selectedYear || '选择年份' }}</view>
                </picker>
                <text class="date-separator">年</text>
                
                <picker 
                  mode="selector" 
                  :range="months" 
                  :value="selectedMonthIndex" 
                  @change="onMonthChange"
                  class="date-picker"
                >
                  <view class="picker-text">{{ selectedMonth || '选择月份' }}</view>
                </picker>
                <text class="date-separator">月</text>
                
                <picker 
                  mode="selector" 
                  :range="days" 
                  :value="selectedDayIndex" 
                  @change="onDayChange"
                  class="date-picker"
                >
                  <view class="picker-text">{{ selectedDay || '选择日期' }}</view>
                </picker>
                <text class="date-separator">日</text>
              </view>
            </view>
            
            <input v-model="formData.location" placeholder="活动地点" class="input spacing" />
            <input v-model="formData.maxParticipants" placeholder="活动人数" class="input spacing" type="number" />
            <textarea v-model="formData.description" placeholder="活动介绍" class="textarea spacing" rows="5" />
          
            <!-- 预览按钮 -->
            <button class="preview-button spacing" @tap="previewChanges">预览</button>
          </view>

          <!-- 非编辑模式下显示 -->
          <view v-if="!isEditing || isPreviewing" class="full-info-box">
         
           <!-- 板块 1：标题和详情 -->
           <view class="info-section">
             <view class="info-title">{{ formData.title || '暂无标题' }}</view>
             <view class="info-description">{{ formData.details || '暂无详情' }}</view>
           </view>
         
           <!-- 板块 2：活动信息 -->
           <view class="info-section">
             <view class="info-heading">活动信息</view>
           
             <view class="info-line">
               <text class="icon">🕒</text>
               <text class="label-text">时间：</text>
               <text class="value-text">{{ formData.eventTime || '暂无时间' }}</text>
             </view>
             <view class="info-divider"></view> <!-- 横线 -->
           
             <view class="info-line">
               <text class="icon">📍</text>
               <text class="label-text">地点：</text>
               <text class="value-text">{{ formData.location || '暂无地点' }}</text>
             </view>
             <view class="info-divider"></view> <!-- 横线 -->
           
             <view class="info-line">
               <text class="icon">👥</text>
               <text class="label-text">人数：</text>
               <text class="value-text">{{ formData.maxParticipants ? formData.maxParticipants + '人' : '不限人数' }}</text>
             </view>
           </view>
         
           <!-- 板块 3：活动介绍 -->
           <view class="info-section">
             <view class="info-heading">活动介绍</view>
             <text class="description-text">{{ formData.description || '暂无介绍' }}</text>
           </view>
         
         
           <!-- 分享和报名按钮 -->
           <view class="bottom-action-row">
             <button 
               open-type="share"
               class="pure-icon-button"
               hover-class="none"
               type="default"
             >
               <image 
                 src="https://seeutest.duckdns.org/images/static/icons/share.png" 
                 class="bottom-share-icon" 
                 mode="aspectFit"
               />
             </button>
         
             <button 
               class="big-register-button" 
               :class="{ 'disabled': hasSignedUp }"
               :disabled="hasSignedUp"
               @tap="goToSignupForm"
             >
               {{ hasSignedUp ? '已报名' : '立即报名' }}
             </button>
           </view>
         </view>
        </view>
      </view>
    </scroll-view>

    <!-- 编辑按钮 -->
    <view v-if="isAdmin" class="edit-button-wrapper">
      <view v-if="!isEditing">
        <button class="edit-button" @tap="startEditing">编辑</button>
        <button class="edit-button" @tap="goToSignupInfo">查看报名信息</button>
        <button class="edit-button" @tap="goToAllSignups">查看所有报名</button>
      </view>
      <view v-else>
        <button v-if="!isPreviewing" class="edit-button" @tap="previewChanges">预览</button>
        <button v-else class="edit-button" @tap="saveChanges">保存</button>
        <button class="edit-button cancel-button" @tap="cancelEditing">取消</button>
      </view>
    </view>
  </view>
  
    <view class="popup-mask" v-if="showPopup">
      <view class="popup-container">
        
        <!-- 关闭按钮 -->
        <image 
          src="https://seeutest.duckdns.org/images/static/icons/close.png" 
          class="popup-close" 
          @tap="closePopup"
        />
    
        <!-- 标题文字（支持动态替换） -->
        <view class="popup-title">{{ popupTitle }}</view>
    
        <!-- 中部插画 -->
        <image 
          src="https://seeutest.duckdns.org/images/static/images/character.png" 
          class="popup-character" 
          mode="aspectFit"
        />
    
        <!-- 去分享按钮 -->
        <button open-type="share" class="popup-share-btn" @tap="onShare">
          去分享
        </button>
    
      </view>
    </view>
	
	<view class="popup_points" v-if="showPointPopup">
	  <view class="popup-container">
	    <!-- 关闭按钮 -->
	    <image 
	              src="https://seeutest.duckdns.org/images/static/icons/close.png" 
	      class="popup-close" 
	      @tap="closePointPopup"
	    />
	
	    <!-- 主标题 -->
	    <view class="popup-title">{{ pointPopupTitle }}</view>
	
	    <!-- 副标题 👇 -->
	    <view class="popup-subtitle">
	      {{ pointPopupSubtitle }}
	    </view>
	
	    <!-- 插画 -->
	    <image 
	              src="https://seeutest.duckdns.org/images/static/images/character4.png" 
	      class="popup-character" 
	      mode="aspectFit"
	    />
	
	    <!-- 知道了按钮 -->
	    <button class="popup-share-btn" @tap="closePointPopup">
	      知道了
	    </button>
	  </view>
	</view>
</template>

<script>
import { addPoints } from '@/modules/pointsUtils.js';
import { requestWithToken } from '@/modules/requestUtils.js';
export default {
  data() {
    return {
      eventId: 'event114514',
          isAdmin: false,
          isEditing: false,
          isPreviewing: false,
          hasSignedUp: false,
      
          // ✅ 弹窗控制变量
          showPopup: false,
		  showPointPopup: false,
          popupTitle: '邀请好友参加\n可获得200积分！',
		  pointPopupTitle: '',
		  pointPopupSubtitle: '',
		  pointPopupCallback: null,
      
          originalFormData: {},
          formData: {
            imageUrl: '',
            title: '',
            details: '',
            eventTime: '',
            location: '',
            maxParticipants: null,
            description: ''
          },
          // 日期选择器数据
          years: [],
          months: [],
          days: [],
          selectedYearIndex: 0,
          selectedMonthIndex: 0,
          selectedDayIndex: 0,
          selectedYear: '',
          selectedMonth: '',
          selectedDay: '',
          baseUrl: 'https://seeutest.duckdns.org/seeuapp',
          tempImagePath: '',
          hasImageChanged: false,
          imageCache: {}
    };
  },

  computed: {
    displayImage() {
      // 优先显示临时图片（预览模式）
      if (this.tempImagePath && this.tempImagePath.trim()) {
        return this.tempImagePath;
      }
      // 如果有图片URL，使用微信小程序下载机制
      if (this.formData.imageUrl && this.formData.imageUrl.trim()) {
        // 返回原始URL，让微信小程序处理
        return this.formData.imageUrl;
      }
      // 否则返回默认图片
      return 'https://dummyimage.com/160x160/ffcc00/000000';
    }
  },

  async onLoad(options) {
    	console.log(options);
    	if (options && options.options) {
    		this.eventId = options.options;
    	}
        const role = uni.getStorageSync('role');
        this.isAdmin = await this.checkAdmin();
		this.initDatePickers();
        this.loadEventInformation();
        this.checkSignupStatus();
      
        // ✅ 页面加载后延迟显示弹窗
        setTimeout(() => {
          this.showPopup = true;
        }, 300);
      },


  onShow() {
    // 页面显示时重新检查报名状态
    this.checkSignupStatus();
  },

  methods: {
	  
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
	      `https://seeutest.duckdns.org/seeuapp/admin/check?email=${email}`,
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
	
    // 初始化日期选择器
    initDatePickers() {
      // 生成年份列表 (当前年份前后10年)
      const currentYear = new Date().getFullYear();
      this.years = [];
      for (let i = currentYear - 5; i <= currentYear + 10; i++) {
        this.years.push(i.toString());
      }
      
      // 生成月份列表
      this.months = [];
      for (let i = 1; i <= 12; i++) {
        this.months.push(i.toString().padStart(2, '0'));
      }
      
      // 生成日期列表 (默认31天，会根据年月动态调整)
      this.updateDays();
    },
    
    // 更新日期列表
    updateDays() {
      const year = parseInt(this.selectedYear || new Date().getFullYear());
      const month = parseInt(this.selectedMonth || 1);
      const daysInMonth = new Date(year, month, 0).getDate();
      
      this.days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        this.days.push(i.toString().padStart(2, '0'));
      }
      
      // 如果当前选择的日期超出范围，重置为1
      if (this.selectedDayIndex >= this.days.length) {
        this.selectedDayIndex = 0;
        this.selectedDay = this.days[0] || '';
      }
    },
    
    // 年份选择事件
    onYearChange(e) {
      this.selectedYearIndex = e.detail.value;
      this.selectedYear = this.years[this.selectedYearIndex];
      this.updateDays();
      this.updateEventTime();
    },
    
    // 月份选择事件
    onMonthChange(e) {
      this.selectedMonthIndex = e.detail.value;
      this.selectedMonth = this.months[this.selectedMonthIndex];
      this.updateDays();
      this.updateEventTime();
    },
    
    // 日期选择事件
    onDayChange(e) {
      this.selectedDayIndex = e.detail.value;
      this.selectedDay = this.days[this.selectedDayIndex];
      this.updateEventTime();
    },
    
    // 更新eventTime字段
    updateEventTime() {
      if (this.selectedYear && this.selectedMonth && this.selectedDay) {
        const year = parseInt(this.selectedYear, 10);
		const month = parseInt(this.selectedMonth, 10) - 1; // JS months are 0-based
		const day = parseInt(this.selectedDay, 10);
	
		const dateObj = new Date(year, month, day);  
		this.formData.eventTime = dateObj.getTime(); 
      }
    },
    
    // 解析现有日期到选择器
    parseExistingDate(dateInput) {
      if (!dateInput) return;
      
      let date;
      
      // 检查是否是 epoch time（数字格式）
      if (typeof dateInput === 'number' || !isNaN(Number(dateInput))) {
        date = new Date(Number(dateInput));
      } else if (typeof dateInput === 'string') {
        // 检查是否是字符串格式的日期
        const dateMatch = dateInput.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (dateMatch) {
          const [, year, month, day] = dateMatch;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // 尝试直接解析字符串
          date = new Date(dateInput);
        }
      } else {
        return;
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.error('无效的日期格式:', dateInput);
        return;
      }
      
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      // 设置年份
      const yearIndex = this.years.indexOf(year);
      if (yearIndex !== -1) {
        this.selectedYearIndex = yearIndex;
        this.selectedYear = year;
      }
      
      // 设置月份
      const monthIndex = this.months.indexOf(month);
      if (monthIndex !== -1) {
        this.selectedMonthIndex = monthIndex;
        this.selectedMonth = month;
      }
      
      // 更新日期列表
      this.updateDays();
      
      // 设置日期
      const dayIndex = this.days.indexOf(day);
      if (dayIndex !== -1) {
        this.selectedDayIndex = dayIndex;
        this.selectedDay = day;
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
	
    startEditing() {
      this.originalFormData = JSON.parse(JSON.stringify(this.formData));
      this.isEditing = true;
      this.isPreviewing = false;
      this.tempImagePath = ''; // 清空临时图片
      this.hasImageChanged = false; // 重置图片更改标记
      
      // 解析当前日期到选择器
      this.parseExistingDate(this.formData.eventTime);
    },

    cancelEditing() {
      this.formData = JSON.parse(JSON.stringify(this.originalFormData));
      this.isEditing = false;
      this.isPreviewing = false;
      this.tempImagePath = ''; // 清空临时图片
      this.hasImageChanged = false; // 重置图片更改标记
      
      // 重新解析日期到选择器
      this.parseExistingDate(this.formData.eventTime);
    },

    previewChanges() {
      const { title, details, eventTime, location } = this.formData;
      if (!title.trim() || !details.trim() || !location.trim()) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' });
        return;
      }

      // 验证日期格式
      // const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      // if (!dateRegex.test(eventTime)) {
      //   uni.showToast({ 
      //     title: '请选择完整的日期', 
      //     icon: 'none' 
      //   });
      //   return;
      // }

      uni.showModal({
        title: '预览提示',
        content: '您正在预览更改。点击"保存"提交更改，或点击"取消"退出编辑。',
        showCancel: false,
        success: () => {
          this.isPreviewing = true;
        }
      });
    },
	
	closePopup() {
	    this.showPopup = false;
	},
	closePointPopup() {
	  this.showPointPopup = false;
	
	  // 如果有回调，执行
	  if (typeof this.pointPopupCallback === 'function') {
	    this.pointPopupCallback();
	    this.pointPopupCallback = null;
	  }
	},
	async onShare() {
	  console.log("entering onShare");
	  this.showPopup = false;
	  
	  // 当使用 open-type="share" 时，onShare 函数主要用于关闭弹窗
	  // 实际的分享积分处理在 onShareAppMessage 中进行
	},
	
	// 处理分享积分的函数
	async handleSharePoints(memberId) {
	  console.log("entering handleSharePoints");
	  const token = uni.getStorageSync('token');
	  if (!memberId || !token) {
	    console.log('用户未登录，无法处理分享积分');
	    return;
	  }
	
	  // 使用 pointUtils 处理分享积分
	  try {
	    const points = await addPoints('share', this.eventId, memberId, token);
	    if (points > 0) {
	      this.showPointSuccessModal();
	    } else {
	      console.log('用户已经获得过分享积分（静默处理）');
	    }
	  } catch (err) {
	    console.error('分享积分处理失败:', err);
	  }
	},
	  
    async loadEventInformation() {
      uni.request({
        url: `${this.baseUrl}/event/getInformation`,
        method: 'GET',
        data: { eventid: this.eventId },
		header: {
		  "Content-Type": "application/json",
		  "token": await this.getToken()
		},
        success: (res) => {
          if (res.data.code === 200 && res.data.data) {
            const info = res.data.data;
            this.formData = {
              imageUrl: info.imageUrl || '',
              title: info.title || '',
              details: info.details || '',
              eventTime: info.eventTime || '',
              location: info.location || '',
              maxParticipants: info.maxParticipants,
              description: info.description || ''
            };
            this.originalFormData = JSON.parse(JSON.stringify(this.formData));
            
            // 解析现有日期到选择器
            this.parseExistingDate(this.formData.eventTime);
            
            // 如果有图片URL，检查缓存后下载到本地
            if (this.formData.imageUrl && this.formData.imageUrl.trim()) {
              this.checkAndDownloadImage(this.formData.imageUrl);
            }
          } else if (this.isAdmin) {
            this.isEditing = true;
            this.isPreviewing = false;
          }
        },
        fail: () => {
          if (this.isAdmin) {
            this.isEditing = true;
            this.isPreviewing = false;
          }
        }
      });
    },

    saveChanges() {
      uni.showLoading({ title: '保存中...' });
      
      // 如果有图片更改，先上传图片
      if (this.hasImageChanged && this.tempImagePath) {
        this.uploadImageAndSave();
      } else {
        // 没有图片更改，直接保存活动信息
        this.saveEventData();
      }
    },

    async saveEventData() {
      // 确保 eventTime 是 epoch time 格式
      this.updateEventTime();
      
      const payload = {
        eventid: this.eventId,
        imageUrl: this.formData.imageUrl,
        title: this.formData.title,
        details: this.formData.details,
        eventTime: this.formData.eventTime,
        location: this.formData.location,
        maxParticipants: parseInt(this.formData.maxParticipants) || 0,
        description: this.formData.description
      };
	  
	  var token = await this.getToken();

      uni.request({
        url: `${this.baseUrl}/event/updateInformation`,
        method: 'POST',
        data: payload,
        header: { 
			'Content-Type': 'application/json',
			"token": token
		},
        success: (res) => {
          uni.hideLoading();
          if (res.statusCode === 200 && res.data.code === 200) {
            uni.showToast({ title: '保存成功', icon: 'success' });
            this.isEditing = false;
            this.isPreviewing = false;
            this.originalFormData = JSON.parse(JSON.stringify(this.formData));
            // 清空临时图片状态
            this.tempImagePath = '';
            this.hasImageChanged = false;
          } else {
            uni.showToast({ title: res.data.message || '保存失败', icon: 'none' });
          }
        },
        fail: () => {
          uni.hideLoading();
          uni.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    },

    // 新增：先上传图片再保存活动信息
    async uploadImageAndSave() {
		
	  var token = await this.getToken();	
		
      uni.uploadFile({
        url: `${this.baseUrl}/files/upload-event-image`,
        filePath: this.tempImagePath,
        name: 'file',
        formData: {
          eventId: this.eventId
        },
		header: {
			"token": token
		},
        success: (res) => {
          if (res.statusCode === 200) {
			// 解析返回的文件名
			const fileName = res.data.replace('Event image uploaded successfully: ', '');
			// 构建访问URL，添加时间戳防止缓存
			const timestamp = new Date().getTime();
			const imageUrl = `${this.baseUrl}/files/event-image/${fileName}?t=${timestamp}`;
			
			// 更新formData中的图片URL
			this.formData.imageUrl = imageUrl;
			
			console.log(imageUrl);
			
			// 继续保存活动信息
			this.saveEventData();
          } else {
			console.log(res);
            uni.hideLoading();
            uni.showToast({ 
              title: '图片上传失败', 
              icon: 'none' 
            });
          }
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('上传失败:', err);
          uni.showToast({ 
            title: '图片上传失败', 
            icon: 'none' 
          });
        }
      });
    },

    goToSignupForm() {
      // 如果已经报名，不允许再次报名
      if (this.hasSignedUp) {
        uni.showToast({ title: '您已经报名了', icon: 'none' });
        return;
      }
      console.log(this.eventId);
      uni.navigateTo({ 
        url: `/pages/signupForm/signupForm?eventID=${this.eventId}` 
      });
    },
	
    async goToSignupInfo() {
	  if(await this.adminLogin()){
	  	uni.navigateTo({
	  	  url: `/pages/signupInfo/signupInfo?eventID=${this.eventId}` 
	  	});
	  }
	  else{
	  	uni.showToast({
	  			title: 'YOU ARE NOT AUTHORIZED TO PERFORM THIS ACTION',
	  			icon: 'none',
	  		});
	  }
	  
	  // uni.navigateTo({
	  //   url: `/pages/signupInfo/signupInfo?eventID=${this.eventId}` 
	  // });
    },
	
    async goToAllSignups() {
	  if(await this.adminLogin()){
	  	uni.navigateTo({
	  	  url: `/pages/allSignups/allSignups?eventID=${this.eventId}` 
	  	});
	  }
	  else{
	  	uni.showToast({
	  			title: 'YOU ARE NOT AUTHORIZED TO PERFORM THIS ACTION',
	  			icon: 'none',
	  		});
	  }
    },
	
	async adminLogin(){
			
			var og_email = await uni.getStorageSync('email');
			//
			const token = await this.getToken();
			var email = (og_email || "").trim();
			email = "x15960002256@gmail.com";
			email = "hanna@seeu-edu.com";
			console.log(email);
			if(email === "") 
			{
				console.log("What is going on????");
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

    async checkSignupStatus() {
      const memberId = uni.getStorageSync('memberId');
      console.log('🔍 开始检查报名状态');
      console.log('用户ID:', memberId);
      console.log('活动ID:', this.eventId);
      console.log('📋 数据库中的记录ID: 1835469104953163776-event001');
      console.log('🔍 当前检查的ID:', `${memberId}-${this.eventId}`);
      console.log('❓ ID是否匹配:', memberId === '1835469104953163776');
      
      if (!memberId) {
        console.log('❌ 用户ID未获取');
        return;
      }
	  
	  var token = await this.getToken();
	  
      const requestData = {
        memberId,
        eventId: this.eventId
      };
      
      console.log('📤 发送请求参数:', requestData);
      console.log('🔗 请求URL:', `${this.baseUrl}/signup/check`);
      
      uni.request({
        url: `${this.baseUrl}/signup/check`,
        method: 'GET',
        data: requestData,
		header: {
			'Content-Type': 'application/json',
			"token": token
		},
        success: (res) => {
          console.log('📡 API响应:', res.data);
          
          if (res.data.code === 200) {
            this.hasSignedUp = res.data.data;
            console.log('✅ 设置报名状态为:', this.hasSignedUp);
          } else {
            console.error('❌ 报名状态检查失败:', res.data);
          }
        },
        fail: (err) => {
          console.error('❌ 检查报名状态网络错误:', err);
        }
      });
    },

    // ✅ 显示积分奖励提示
    showPointSuccessModal(callback) {
        this.pointPopupTitle = '积分奖励';
        this.pointPopupSubtitle = '分享成功！获得积分可用于兑换会员福利等，请前往个人中心查看积分余额。';
        this.pointPopupCallback = callback || null;
        this.showPointPopup = true;
    },

    selectImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          console.log('选择的图片路径:', tempFilePath);
          
          // 设置临时图片路径，不立即上传
          this.tempImagePath = tempFilePath;
          this.hasImageChanged = true;
          
          uni.showToast({ 
            title: '图片已选择，点击保存时会上传', 
            icon: 'none',
            duration: 2000
          });
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          uni.showToast({ title: '选择图片失败', icon: 'none' });
        }
      });
    },



    onImageLoad() {
      console.log('图片加载成功');
    },

    onImageError(e) {
      console.error('图片加载失败:', e);
      console.log('当前图片URL:', this.formData.imageUrl);
      console.log('临时图片路径:', this.tempImagePath);
      console.log('显示图片URL:', this.displayImage);
      console.log('baseUrl:', this.baseUrl);
      
      // 显示错误提示
      uni.showToast({ 
        title: '图片加载失败，请检查网络连接', 
        icon: 'none',
        duration: 3000
      });
    },

    onMainImageLoad() {
      console.log('主图片加载成功');
      console.log('主图片URL:', this.displayImage);
    },

    onMainImageError(e) {
      console.error('主图片加载失败:', e);
      console.log('当前图片URL:', this.formData.imageUrl);
      console.log('临时图片路径:', this.tempImagePath);
      console.log('显示图片URL:', this.displayImage);
      console.log('baseUrl:', this.baseUrl);
      
      // 如果图片URL是网络地址，尝试下载到本地
      if (this.formData.imageUrl && this.formData.imageUrl.startsWith('http')) {
        console.log('尝试下载图片到本地...');
        this.checkAndDownloadImage(this.formData.imageUrl);
      } else if (this.formData.imageUrl && (this.formData.imageUrl.startsWith('wxfile://') || this.formData.imageUrl.startsWith('file://'))) {
        // 本地文件加载失败，可能是文件不存在
        console.log('本地文件加载失败，可能是文件不存在');
        uni.showToast({ 
          title: '本地图片加载失败', 
          icon: 'none',
          duration: 2000
        });
      } else {
        // 显示错误提示
        uni.showToast({ 
          title: '主图片加载失败，请检查网络连接', 
          icon: 'none',
          duration: 3000
        });
      }
      
      // 只对网络URL进行测试
      if (this.formData.imageUrl && this.formData.imageUrl.startsWith('http')) {
        this.testImageUrl(this.formData.imageUrl);
      }
    },

    // 测试图片URL是否可访问
    async testImageUrl(imageUrl) {
      // 如果是本地文件路径，跳过测试
      if (imageUrl.startsWith('wxfile://') || imageUrl.startsWith('file://')) {
        console.log('跳过本地文件URL测试:', imageUrl);
        return;
      }
      var token = await this.getToken();
      // 如果是网络URL，才进行测试
      if (imageUrl.startsWith('http')) {
        console.log('开始测试网络图片URL:', imageUrl);
		
        uni.request({
          url: imageUrl,
          method: 'HEAD', // 只获取响应头，不下载内容
		  header: {
			'Content-Type': 'application/json',
		  	"token": token
		  },
          success: (res) => {
            console.log('图片URL测试成功:', res.statusCode);
          },
          fail: (err) => {
            console.error('图片URL测试失败:', err);
            console.log('图片URL不可访问，请检查服务器配置');
          }
        });
      }
    },

    // 检查缓存并下载图片到本地临时文件
    checkAndDownloadImage(imageUrl) {
      // 检查是否已经缓存过这个图片
      if (this.imageCache[imageUrl]) {
        console.log('使用缓存的图片路径:', this.imageCache[imageUrl]);
        this.formData.imageUrl = this.imageCache[imageUrl];
        this.$forceUpdate();
        return;
      }
      
      // 没有缓存，开始下载
      this.downloadImageToLocal(imageUrl);
    },

    // 下载图片到本地临时文件
    async downloadImageToLocal(imageUrl) {
      console.log('开始下载图片到本地:', imageUrl);
      
	  var token = await this.getToken();
	  
      uni.downloadFile({
        url: imageUrl,
		header: { "token": token },
        success: (res) => {
		  console.log(res.statusCode);
          console.log('图片下载成功:', res.tempFilePath);
          // 缓存图片路径
          this.imageCache[imageUrl] = res.tempFilePath;
          // 更新图片路径为本地临时文件
          this.formData.imageUrl = res.tempFilePath;
          // 强制刷新显示
          this.$forceUpdate();
        },
        fail: (err) => {
          console.error('图片下载失败:', err);
          uni.showToast({ 
            title: '图片下载失败', 
            icon: 'none' 
          });
        }
      });
    }
  },
  
  
  onShareAppMessage() {
    console.log("entering onShareAppMessage");
    const email = uni.getStorageSync('email');
    const memberId = uni.getStorageSync('memberId');
    const that = this; // ✅ 捕获上下文
  
    if (!email || !memberId) {
      return {
        title: '请先登录后分享',
        path: 'pages/login/login',
        imageUrl: this.displayImage
      };
    }
  
    // 立即处理分享积分
    that.handleSharePoints(memberId);
  
    return {
      title: this.formData.title || '活动信息',
      path: `pages/offlineEvent/offlineEvent?referrer_id=${encodeURIComponent(email)}`,
      imageUrl: this.displayImage
    };
  }
};
</script>

<style>
.event-container {
  position: relative;
  height: 100vh;
  background-color: #f8f8f8;
}

.scroll-area {
  flex: 1;
  height: 100%;
}

.page-wrapper {
  width: 100%;
  max-width: 100%;
  padding: 0 30rpx;
  box-sizing: border-box;
  position: relative;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}

.event-image {
  width: 100%;
  max-width: 750rpx;
  aspect-ratio: 513 / 287;
  border-radius: 0rpx;
  object-fit: cover;
  margin-top: 0rpx;
  position: relative;
  z-index: 1;
}

/* 编辑模式：表单样式 */
.edit-form {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.image-input-section {
  width: 100%;
  margin-bottom: 20rpx;
}

.input-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.select-image-button {
  background-color: #3478F6;
  color: white;
  padding: 15rpx 30rpx;
  font-size: 28rpx;
  border-radius: 12rpx;
  margin-top: 10rpx;
}

.image-preview {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-image {
  width: 300rpx;
  height: 180rpx;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
}

.image-url-text {
  font-size: 24rpx;
  color: #888;
}

.input,
.textarea {
  width: 100%;
  padding: 0 30rpx;
  font-size: 30rpx;
  border: 1rpx solid #ccc;
  border-radius: 12rpx;
  box-sizing: border-box;
  background-color: #fff;
}

.date-input-group {
  width: 100%;
}

.date-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.date-selectors {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.date-picker {
  flex: 1;
  background-color: #fff;
  border: 1rpx solid #ccc;
  border-radius: 12rpx;
  padding: 20rpx 15rpx;
  min-height: 80rpx;
  display: flex;
  align-items: center;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
  text-align: center;
  width: 100%;
}

.date-separator {
  font-size: 28rpx;
  color: #666;
  margin: 0 5rpx;
}

.spacing {
  margin-bottom: 25rpx;
}

.preview-button {
  background-color: #6c63ff;
  color: white;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
  border-radius: 50rpx;
}

/* 非编辑模式：活动详情展示盒子 */
.full-info-box {
  position: absolute;
  top: 420rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 682rpx;
  padding: 40rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  z-index: 10;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: calc(100vh - 435rpx);
}

/* 板块样式 */
.info-section {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.info-section:last-child {
  border-bottom: none;
}

.info-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #222;
  margin-bottom: 10rpx;
}

.info-description {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.info-heading {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.info-line {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 30rpx;
  flex-wrap: wrap;
}

.info-divider {
  width: 100%;
  height: 1rpx;
  background-color: #e0e0e0; /* 淡灰色 */
  margin: 10rpx 0; /* 上下间距 */
}

.icon {
  font-size: 28rpx;
  margin-right: 10rpx;
}

.label-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-right: 8rpx;
}

.value-text {
  font-size: 28rpx;
  color: #444;
  flex: 1;
  word-break: break-word;
}

.description-text {
  font-size: 28rpx;
  color: #444;
  line-height: 1.7;
  word-break: break-word;
}

/* 分享 + 报名按钮 */
.bottom-action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40rpx;
}

.share-icon-button {
  width: 75rpx;
  height: 75rpx;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  box-shadow: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pure-icon-button {
  all: unset;
  width: 75rpx;
  height: 75rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  padding: 0 !important;
  margin: 0 !important;
  line-height: 0 !important;
  color: transparent !important;
}

.bottom-share-icon {
  width: 100%;
  height: 100%;
  display: block;
  border: none;
}

.big-register-button {
  flex: 1;
  margin-left: 50rpx;
  background-color: #3478F6;
  color: #fff;
  font-size: 28rpx;
  padding: 24rpx 0;
  border-radius: 80rpx;
  text-align: center;
}

.big-register-button.disabled {
  background-color: #ccc;
  color: #999;
}

/* 编辑按钮组 */
.edit-button-wrapper {
  position: fixed;
  top: 0rpx;
  right: 0rpx;
  z-index: 10;
}

.edit-button {
  background-color: #ff9500;
  color: white;
  font-size: 28rpx;
  padding: 15rpx 30rpx;
  border-radius: 40rpx;
}

.cancel-button {
  background-color: #999;
  color: white;
  font-size: 28rpx;
  padding: 15rpx 30rpx;
  border-radius: 40rpx;
  margin-left: 20rpx;
}

.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-container {
  position: relative;
  width: 80%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  position: relative;
  text-align: center;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
  min-height: 500rpx;  /* ✅ 明确设置最小高度 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* X 关闭按钮 */
.popup-close {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 50rpx;
  height: 50rpx;
}

/* 弹窗标题文字 */
.popup-title {
  white-space: pre-line;
  text-align: left;
  font-size: 75rpx;
  color: #4980FD;
  font-weight: bold;
  margin-top: 5rpx;
  margin-bottom: 20rpx;
  line-height: 1.4;
}

/*卡通图 */
.popup-character {
  position: absolute;
  left: 2rpx;
  bottom: 30rpx;
  width: 233rpx;
  height: 151rpx;
  transform: scale(2); /* ✅ 放大 1.2 倍 */
  transform-origin: bottom left; /* ✅ 从左下角放大 */
  object-fit: contain;
}

/* 去分享按钮 */
.popup-share-btn {
  position: absolute;
  right: 10rpx;
  bottom: 60rpx;

  background-color: #4980FD;
  color: white;
  font-size: 28rpx;
  border-radius: 50rpx;
  padding: 10rpx 100rpx;

  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.popup_points {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-container {
  position: relative;
  width: 80%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
  min-height: 500rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 关闭按钮 */
.popup-close {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 50rpx;
  height: 50rpx;
}

/* 主标题 */
.popup-title {
  white-space: pre-line;
  text-align: center; /* ✅ 改为居中 */
  font-size: 75rpx;
  color: #4980FD;
  font-weight: bold;
  margin-top: 5rpx;
  margin-bottom: 20rpx;
  line-height: 1.4;
}

/* 副标题 */
.popup-subtitle {
  font-size: 32rpx;
  color: #000000;
  line-height: 1.5;
  text-align: left;
  padding: 0 60rpx;
  margin-bottom: 250rpx;
  white-space: pre-line;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
}

/* 卡通图 */
.popup-character {
  position: absolute;
  left: 2rpx;
  bottom: 0rpx;
  width: 233rpx;
  height: 151rpx;
  transform: scale(1.8);
  transform-origin: bottom left;
  object-fit: contain;
}

/* “知道了”按钮 */
.popup-share-btn {
  position: absolute;
  right: 35rpx;
  bottom: 30rpx;
  background-color: #4980FD;
  color: white;
  font-size: 30rpx;
  border-radius: 50rpx;
  padding: 5rpx 80rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

</style>


