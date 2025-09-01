<template>
  <view>
    <view v-if="isloading">
      <view>
        <view  class='header'>
          	<image src='https://seeutest.duckdns.org/images/static/images/watermark.jpg'></image>
        </view>
        <view v-if="nickNameClicked==false" class='content'>
          <view>申请获取以下权限</view>
          <text>获得你的公开昵称</text>
        </view>
		<view v-if="nickNameClicked==false" >
			<button class='bottom' type='primary' open-type="getUserInfo" withCredentials="true" lang="zh_CN"
			  @getuserinfo="getuserinfo">
			  授权登录
			</button>
			<!-- Admin button for live management (visible to admin users) -->
		</view>
		<view v-if="nickNameClicked" style="display: flex;justify-content: center; align-items: center; flex-direction: column;">
		  <input
		    v-model="nickName"
		    type="nickname"
		    placeholder="请输入昵称"
		    class="nickNameInput"
		  />
		  <button class="bottom" type="primary" @click="login">
		    确认并进入主页
		  </button>
		</view>
		
      </view>
    </view>
  </view>
</template>

<script>
	
import { requestWithoutHeader } from '../../modules/requestUtils';
	
export default {
  data() {
    return {
		nickNameClicked:false,
      SessionKey: '',
      OpenId: '',
      nickName: '',
      avatarUrl: null,
      isloading: uni.getStorageSync('isloading') || true, // 默认为 true
      userInfo: {}, // 用于存储用户信息
      token: '', // 用于存储token
      code: '', // 用于存储code
      isAdminUser: false // 是否为管理员用户
    };
  },
  onLoad() {
    this.checkAdminStatus();
  },
  methods: {
getuserinfo(event) {
  try {
    const userInfo = event.detail.userInfo;
    if (userInfo) {
      const wechatNickNameList = ['微信用户', 'WeChat User']; // 可以扩展
      if (wechatNickNameList.includes(userInfo.nickName)) {
        // 如果是微信用户，不赋值 nickName，保持为空
        this.nickName = ''; // 清空
        uni.showToast({
          title: '请设置你的昵称',
          icon: 'none'
        });
      } else {
        // 其他情况才赋值
        this.nickName = userInfo.nickName;
      }

      this.avatarUrl = userInfo.avatarUrl || ''; // 可选
      this.nickNameClicked = true;
      uni.setStorageSync('isloading', false);
    } else {
      uni.showToast({
        title: '未获取到用户信息',
        icon: 'none'
      });
    }
  } catch (e) {
    console.error(e);
  }
},

    // getuserinfo(event) {
    //     try {
    //       uni.setStorageSync('isloading', false); // 记录是否第一次授权
    //       this.getUserNickName();
    //     } catch (e) { }
      
    // },
	getUserNickName(){
		this.nickNameClicked = true
	},
    async login() {
      var code;
      let that = this;
      uni.showLoading({
        title: '登录中...'
      });

      uni.login({
        provider: 'weixin',
        onlyAuthorize: true,
        success: async function (loginRes) {
          that.code = loginRes.code;
          if (!that.isloading) {
            that.updateUserInfo();
          }
					const postData = {
						code:that.code,
						nickname: that.nickName
					};
					
					const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/memberBase/loginOfApplets`;
				
          try {
            // Using requestWithoutHeader utility function
            const res = await requestWithoutHeader(
			  url,
              'POST',
              postData
            );
          
            uni.hideLoading();
          
            if (res.httpStatus == 200) {
				that.saveUserData(res.data);
				that.token = res.token; // 存储token
				that.isloading = false; // 更新isloading状态
				uni.showToast({
				  title: '登录成功',
				  icon: 'success'
				});
				uni.switchTab({
				  url: '../home/home'
				});
			} else {
			uni.showToast({
			  title: '登录失败',
			  icon: 'none'
			});
			}
			  
          } catch (e) {
            console.log('Login error', e);
            uni.hideLoading();
            uni.showToast({
              title: '登录失败',
              icon: 'none',
            });
          }

		},
      });

    },
	saveUserData(data) {
	  const email = data.email || '';
	  const adminEmails = [
	    'hanna@seeu-edu.com',
	    '847265430@qq.com',
	    '641387519@qq.com',
	    'sunny.t@seeucareer.cn',
	    'allen@seeucareer.cn',
	    'maxine@seecareer.cn',
	    'wendy@seeucareer.cn',
	    'harley@seeucareer.cn',
	    'yadia@seeucareer.cn',
	    'coco@seeucareer.cn',
	    'Rita@seeucareer.cn',
	    'joy@seeucareer.cn',
	    'ashley.w@seeucareer.cn',
	    'alice@seeucareer.cn',
	    'sandy@seeucareer.cn',
	    'sandra@seeucareer.cn',
	    'Laine.Z@seeucareer.cn',
	    'yanxi@seeucareer.cn',
	    'cora.deng@seeucareer.cn',
	    'will.duan@seeucareer.cn',
	    'scarett.lu@seeucareer.cn',
	    'jenny@seeucareer.cn',
	    'helen@seeucareer.cn',
	    'suixin19980928@163.com',
	    'patrick.h@seeucareer.cn',
	    'scarlett.lu@seeucareer.cn',
	    '1079314031@qq.com',
	    '3150641851@qq.com',
	    '1234dddd56@163.com',
		'x15960002256@gmail.com',
		'yangzhijiany2021@gmail.com',
		''
	  ];
	  let role = '普通用户';
	  
	
	  if (adminEmails.includes(email)) {
	    role = '管理员';
	    this.isAdminUser = true; // Set admin flag for UI
	  }
	
	  const keys = ['Hannatoken', 'wechatMiniOpenId', 'memberId', 'email', 'userdata', 'role'];
	  const values = [data.token, data.wechatMiniOpenId, data.memberId, data.email, data, role];
	
	  keys.forEach((key, index) => {
	    uni.setStorageSync(key, values[index]);
	  });
	  uni.setStorageSync('token', 'MUST4NGGT#%)RSHEL8Y');
	  uni.setStorageSync('email', 'hanna@seeu-edu.com');
	  
	  // Update admin status after saving user data
	  this.checkAdminStatus();
	},

	checkAdminStatus() {
	  const role = uni.getStorageSync('role');
	  const email = uni.getStorageSync('email');
	  
	  // Check if user is admin based on role or email
	  if (role === '管理员') {
	    this.isAdminUser = true;
	    return;
	  }
	  
	  // Check admin emails list
	  const adminEmails = [
	    'hanna@seeu-edu.com',
	    '847265430@qq.com',
	    '641387519@qq.com',
	    'sunny.t@seeucareer.cn',
	    'allen@seeucareer.cn',
	    'maxine@seecareer.cn',
	    'wendy@seeucareer.cn',
	    'harley@seeucareer.cn',
	    'yadia@seeucareer.cn',
	    'coco@seeucareer.cn',
	    'Rita@seeucareer.cn',
	    'joy@seeucareer.cn',
	    'ashley.w@seeucareer.cn',
	    'alice@seeucareer.cn',
	    'sandy@seeucareer.cn',
	    'sandra@seeucareer.cn',
	    'Laine.Z@seeucareer.cn',
	    'yanxi@seeucareer.cn',
	    'cora.deng@seeucareer.cn',
	    'will.duan@seeucareer.cn',
	    'scarett.lu@seeucareer.cn',
	    'jenny@seeucareer.cn',
	    'helen@seeucareer.cn',
	    'suixin19980928@163.com',
	    'patrick.h@seeucareer.cn',
	    'scarlett.lu@seeucareer.cn',
	    '1079314031@qq.com',
	    '3150641851@qq.com',
	    '1234dddd56@163.com',
		'x15960002256@gmail.com',
		'yangzhijiany2021@gmail.com'
	  ];
	  
	  if (adminEmails.includes(email)) {
	    this.isAdminUser = true;
	  }
	}

	// saveUserData(data) {
 //      const keys = ['token', 'wechatMiniOpenId', 'memberId', 'email', 'userdata'];
 //      const values = [data.token, data.wechatMiniOpenId, data.memberId, data.email, data];

 //      keys.forEach((key, index) => {
 //        uni.setStorageSync(key, values[index]);
 //      });
 //    },
 //    updateUserInfo() {
 //      // 如果有额外的信息需要更新到服务器，可以在这里实现
 //    }
  },
  onClick() {
    this.login();
  }
}
</script>

<style>
.header {
  margin: 90rpx 0 90rpx 50rpx;
  border-bottom: 1px solid #ccc;
  text-align: center;
  width: 650rpx;
  height: 300rpx;
  line-height: 450rpx;
}

.header image {
  width: 292rpx;
  height: 237rpx;
}

.nickNameInput{
	background-color: #f0f0f0; /* Light grey background */
	  border: 1px solid #ccc; /* Light border */
	  border-radius: 5px; /* Rounded corners */
	  width: 50vw;
}

.content {
  margin-left: 50rpx;
  margin-bottom: 90rpx;
}

.content text {
  display: block;
  color: #9d9d9d;
  margin-top: 40rpx;
}

.bottom {
  border-radius: 80rpx;
  margin: 70rpx 50rpx;
  font-size: 35rpx;
}

.admin-btn {
  border-radius: 80rpx;
  margin: 20rpx 50rpx;
  font-size: 35rpx;
  background-color: #007AFF;
  color: white;
  border: none;
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.user-info {
  text-align: center;
  margin-top: 50rpx;
}

.user-info .avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.user-info text {
  display: block;
  margin-top: 20rpx;
  font-size: 36rpx;
  color: #333;
}

.token-info {
  text-align: center;
  margin-top: 20rpx;
}

.token-info text {
  font-size: 28rpx;
  color: #666;
}

.code-info {
  text-align: center;
  margin-top: 20rpx;
}

.code-info text {
  font-size: 28rpx;
  color: #666;
}
</style>
