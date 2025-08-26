<template>
  <view class="form-container">
    <!-- 表单区域 -->
    <view class="form-group">
      <text class="label"><text class="required">*</text> 姓名：</text>
      <input class="input" placeholder="请输入您的姓名" v-model="name" />
    </view>

    <view class="form-group">
      <text class="label"><text class="required">*</text> 电话：</text>
      <input class="input" type="number" maxlength="11" placeholder="请输入您的电话" v-model="phone" />
    </view>

    <view class="form-group">
      <text class="label"><text class="required">*</text> 学校：</text>
      <input class="input" placeholder="请输入您所在的学校" v-model="school" />
    </view>

    <view class="form-group">
      <text class="label"><text class="required">*</text> 专业：</text>
      <input class="input" placeholder="请输入您的专业" v-model="major" />
    </view>

    <view class="form-group">
      <text class="label"><text class="required">*</text> 年级（本科/硕士/博士）：</text>
      <picker :range="gradeOptions" @change="onGradeChange">
        <view class="input">{{ selectedGrade || '请选择您的年级' }}</view>
      </picker>
    </view>

    <view class="form-group">
      <text class="label">分享者微信昵称（可选）：</text>
      <input class="input" placeholder="请输入分享者的微信昵称" v-model="wechatNickname" />
    </view>

    <button class="submit-button" @tap="submitForm">提交报名</button>

    <!-- ✅ 报名成功弹窗 -->
    <view class="popup-mask" v-if="showPopup">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">报名成功</text>
          <text class="popup-subtitle">\n非常期待您的到来！</text>
          <image class="popup-close" src="https://seeutest.duckdns.org/images/static/icons/close.png" @tap="closePopup" />
        </view>
                  <image class="popup-character" src="https://seeutest.duckdns.org/images/static/images/character3.png" mode="widthFix" />
        <view class="popup-note">
          <text>请准时参加活动，</text>
          <text>\n若无法参加请提前取消哦。</text>
        </view>
      </view>
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
  
      <!-- 副标题 -->
      <view class="popup-subtitle">
        {{ pointPopupSubtitle }}
      </view>
  
      <!-- 插画 -->
      <image 
        src="https://seeutest.duckdns.org/images/static/images/character4.png" 
        class="character-points" 
        mode="aspectFit"
      />
  
      <!-- “知道了”按钮 -->
      <button class="popup-share-btn" @tap="closePointPopup">
        知道了
      </button>
    </view>
  </view>
</template>

<script>
import { addPoints } from '@/modules/pointsUtils.js';

export default {
  data() {
    return {
      name: '',
      phone: '',
      school: '',
      major: '',
      selectedGrade: '',
      wechatNickname: '',
      gradeOptions: ['本科', '硕士', '博士', '其他'],
      eventID: 'event114514',
      showPopup: false,
	  showPointPopup: false,      // 新增：积分弹窗控制变量
	  pointPopupTitle: '',        // 新增：积分弹窗主标题
	  pointPopupSubtitle: '',
    };
  },

  onLoad(options) {
    if (options.eventID) {
      this.eventID = options.eventID;
    }
    console.log('报名页面加载，活动ID:', this.eventID);
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
	
    onGradeChange(e) {
      this.selectedGrade = this.gradeOptions[e.detail.value];
    },

    isValidPhone(phone) {
      const trimmed = phone.trim();
      return /^(\+?\d{1,3})?\d{10,11}$/.test(trimmed);
    },

    async submitForm() {
      if (!this.name.trim()) {
        uni.showToast({ title: '请输入姓名', icon: 'none' });
        return;
      }
      if (!this.phone.trim()) {
        uni.showToast({ title: '请输入电话', icon: 'none' });
        return;
      }
      if (!this.isValidPhone(this.phone)) {
        uni.showToast({ title: '请输入有效手机号（支持中国/美国）', icon: 'none' });
        return;
      }
      if (!this.school.trim()) {
        uni.showToast({ title: '请输入学校', icon: 'none' });
        return;
      }
      if (!this.major.trim()) {
        uni.showToast({ title: '请输入专业', icon: 'none' });
        return;
      }
      if (!this.selectedGrade) {
        uni.showToast({ title: '请选择年级', icon: 'none' });
        return;
      }
		
	  const token = await this.getToken();
		
      const memberID = uni.getStorageSync("memberId");
      const signupData = {
        memberID,
        eventID: this.eventID,
        name: this.name,
        phone: this.phone,
        school: this.school,
        major: this.major,
        grade: this.selectedGrade,
        wechatNickname: this.wechatNickname
      };

      console.log('提交报名数据:', signupData);

      uni.request({
        url: 'https://seeutest.duckdns.org/seeuapp/signup/save',
        method: 'POST',
        data: signupData,
        header: {
          'Content-Type': 'application/json',
		  'token': token
        },
        success: async (res) => {
          if (res.data.code === 200) {
            // 报名成功后，调用 pointUtils 处理积分
            const token = uni.getStorageSync('token');
            if (token) {
              try {
                const points = await addPoints('signup', this.eventID, memberID, token);
                if (points > 0) {
                  // 获得积分，显示积分弹窗
                  this.showPopup = true;
                } else {
                  // 已经获得过积分，直接显示报名成功
                  uni.showToast({ title: '报名成功', icon: 'success' });
                  setTimeout(() => {
                    uni.navigateBack();
                  }, 1500);
                }
              } catch (err) {
                console.error('积分处理失败:', err);
                // 积分处理失败不影响报名结果
                this.showPopup = true;
              }
            } else {
              // 没有token，直接显示报名成功
              this.showPopup = true;
            }
          } else {
			console.log(res.data.code);
			console.log(res.data);
            uni.showToast({
              title: res.data.message || '报名失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          uni.showToast({ title: '报名失败', icon: 'none' });
        }
      });
    },
    
    closePopup() {
      this.showPopup = false;

      // ✅ 弹出积分奖励弹窗
      setTimeout(() => {
            this.pointPopupTitle = '积分奖励';
            this.pointPopupSubtitle = '报名成功！获得积分可用于兑换会员福利等，请前往个人中心查看积分余额。';
            this.showPointPopup = true;
        }, 300);
    },
	
	closePointPopup() {
	    this.showPointPopup = false;
	    uni.navigateBack(); // ✅ 可选：自动返回上一页
	}
  }
};
</script>

<style>
.form-container {
  padding: 40rpx;
}

.form-group {
  margin-bottom: 40rpx;
}

.label {
  font-size: 30rpx;
  display: block;
  margin-bottom: 10rpx;
}

.required {
  color: red;
  margin-right: 6rpx;
}

.input {
  border: 1rpx solid #ccc;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 30rpx;
  background-color: #fff;
}

.submit-button {
  background-color: #007aff;
  color: #fff;
  font-size: 34rpx;
  padding: 20rpx 0;
  border-radius: 12rpx;
}

/* ✅ 自定义报名成功弹窗样式 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.popup-content {
  position: absolute;
  width: 614rpx;
  height: 494rpx;
  top: 400rpx;
  left: 70rpx;
  background: #fff;
  padding: 40rpx 30rpx;
  border-radius: 10rpx;
  text-align: center;
  box-sizing: border-box;
}

.popup-header {
  margin-bottom: 130rpx;
  text-align: left;
}

.popup-title {
  white-space: pre-line;
  text-align: left;
  font-size: 75rpx;
  color: #4980FD;
  font-weight: bold;
  margin-top: 5rpx;
  margin-bottom: 20rpx;
  line-height: 1.2;
}

.popup-subtitle {
  text-align: left;
  font-size: 60rpx;
  color: #4980FD;
  font-weight: bold;
  margin-top: 5rpx;
}

.popup-close {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 50rpx;
  height: 50rpx;
}

.popup-character {
  width: 360rpx; 
  position: absolute;
  bottom: 5rpx;
  right: 0;
}

.popup-note {
  text-align: left;
  font-size: 25rpx;
  color: #333;
  margin: 20rpx 0;
  line-height: 1.4;
}

.popup_points {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
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
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.popup-close {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 50rpx;
  height: 50rpx;
}

.popup-title {
  white-space: pre-line;
  text-align: center;
  font-size: 75rpx;
  color: #4980FD;
  font-weight: bold;
  margin-top: 5rpx;
  margin-bottom: 20rpx;
  line-height: 1.4;
}

.popup-subtitle {
  font-size: 32rpx;
  color: #000000;
  line-height: 1.5;
  text-align: left;
  padding: 0 60rpx;
  margin-bottom: 250rpx;
  white-space: pre-line;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: normal; /* ✅ 改为正常字体粗细 */
}

.character-points {
  position: absolute;
  left: 2rpx;
  bottom: 0rpx;
  width: 233rpx;
  height: 151rpx;
  transform: scale(1.8);
  transform-origin: bottom left;
  object-fit: contain;
}

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
