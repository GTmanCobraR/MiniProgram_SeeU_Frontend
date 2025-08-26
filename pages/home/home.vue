<template>
	<scroll-view scroll-y="true" class="full_container">
		<view class="container1">
			<image src="https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/background.jpg" class="background-image"></image>

			<view class="logo">
				<image src="https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/seeuLogo.png" class="seeu-logo"></image>
			</view>

			<view class="rectangle">
				<image src="https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/Rectangle29.jpg" class="roundedCorners"></image>

				<view class="interview" @tap="navigateToMianJing">
					<image src="https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/interview.jpg" class="logo-image"></image>
				</view>

				<view class="case" @tap="navigateToAnli">
					<image src="https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/case.jpg" class="logo-image"></image>
				</view>
			</view>
			
			
			<!-- VIP Registration Banner -->
			<view class="vip-entry" @tap="goToVipFormPage">
			  <image
				class="vip-image"
				src="https://seeutest.duckdns.org/images/static/vip-banner.jpg"
				mode="widthFix"
			  ></image>
			</view>

			<view class="newAcitivity">
				<image src="https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/Component4.png" class="logo-image"></image>
			</view>

			<swiper class="swiper-container" autoplay="true" interval="3000">
				<swiper-item v-for="(item, index) in swiperList" :key="index" @tap="navigateToPage(item)">
					<image :src="item.imageUrl" class="event-image"></image>
				</swiper-item>
			</swiper>

			<view class="exampleTwo" @tap="openChannelsProfile">
				<image src="https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/popularLive.jpg" class="event-image"></image>
			</view>

			<!-- <view class="offline-event-button" @tap="navigateToOfflineEvent">
			  <button class="signup-button">线下活动</button>
			</view>
			
			<view class="topic-vote-button" @tap="navigateToTopicVote">
			  <button class="vote-button">话题投票</button>
			</view>
			
			<view class="offline-event-button" @tap="navigateToTestImagePage">
			  <button class="signup-button">测试 HTTPS 图片</button>
			</view> -->

		</view>
	</scroll-view>
</template>

<script>
import { performChannelsJump } from '../../modules/jumpActions';
import { addOps } from '../../modules/pointsUtils'
	function getDefaultNewsLink() {
	  return uni.getStorageSync('customNewsUrl') || 'https://mp.weixin.qq.com/s/lcKSMEPgbHChBcPuUkacfQ';
	}

export default {
	data() {
		return {
		  swiperList: []
		};
	},
	async created() {
		this.fetchSwiperData();
		const memberId = uni.getStorageSync('memberId');
		const token = uni.getStorageSync('token');
		
		console.log("memberId from storage:", memberId);
		
	},
	methods: {
		checkLoginAndRole(requiredRole = null) {
			const token = uni.getStorageSync('token');
			const role = uni.getStorageSync('role');

			if (!token) {
				uni.showToast({ title: '请先登录', icon: 'none' });
				setTimeout(() => {
					uni.redirectTo({ url: '/pages/index/index' });
				}, 1000);
				return false;
			}

			if (requiredRole && role !== requiredRole) {
				uni.showToast({ title: '无权限访问', icon: 'none' });
				return false;
			}

			return true;
		},

		fetchSwiperData() {
			this.swiperList = [
				// {
				// 	imageUrl: 'https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/recentActivities.jpg',
				// 	type: 'recentActivities',
				// 	link: 'https://s2.loli.net/2024/09/18/zfniq63wdoEgMuU.jpg'
				// },
				{
					imageUrl: 'https://seeuedu-image.oss-cn-shenzhen.aliyuncs.com/applets/news.jpg',
					type: 'news',
					link: getDefaultNewsLink()
				}
			];
		},

		navigateToTestImagePage() {
			uni.navigateTo({
				url: '../testImagePage/testImagePage'
			});
		},

		navigateToOfflineEvent() {
			uni.navigateTo({
				url: '../offlineEvent/offlineEvent'
			});
		},

		navigateToTopicVote() {
			uni.navigateTo({
				url: '../topicVote/topicVote'
			});
		},

		navigateToPage(item) {
		  // if (item.type === 'recentActivities') {
		  //   uni.navigateTo({
		  //     url: `../recentActivitiesPage/recentActivitiesPage?link=${item.link}`
		  //   });
		  // } else 
		  if (item.type === 'news') {
		    const role = uni.getStorageSync('role');
		    if (role === '管理员') {
		      uni.navigateTo({
		        url: `../uploadNews/uploadNews`
		      });
		    } else {
		      uni.navigateTo({
		        url: `../news/news?link=${encodeURIComponent(item.link)}`
		      });
		    }
		  }
		},

		navigateToAnli() {
			const check1 = uni.getStorageSync("token");
			const check2 = uni.getStorageSync("wechatMiniOpenId");
			const check3 = uni.getStorageSync("memberId");
			uni.navigateTo({
				url: '../anliMainPage/anliMainPage'
			});
		},

		navigateToMianJing() {
			uni.navigateTo({
				url: '../mianjing/mianjing'
			});
		},
		
		goToVipFormPage() {
		  uni.navigateTo({
			url: '/pages/home/vipform'
		  });
		},

		openChannelsProfile() {
			console.log('Navigating to live list page...');
			uni.navigateTo({
				url: '../liveList/liveList'
			});
		}
	}
}
</script>

<style>
.full_container {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
}

.container1 {
  position: relative;
  width: 100%;
  height: 100vh;
}

.background {
	width: 100%;
	height: 100%;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.logo {
	position: absolute;
	width: 165.458rpx;
	height: 160.8397rpx;
	left: 291.9847rpx;
	top: 43.656rpx;
}

.seeu-logo {
	width: 100%;
	height: 115%;
}

.logo-image {
	width: 100%;
	height: 100%;
}

.event-image {
	width: 100%;
	height: 100%;
	border-radius: 7px;
}

.rectangle {
	position: absolute;
	width: 667.9389rpx;
	height: 320.328rpx;
	left: calc(50% - 667.9389rpx/2 + 0.9542rpx);
	top: 285.66rpx;
	border-radius: 50px;
}

.roundedCorners {
	width: 100%;
	height: 100%;
	border-radius: 7px;
}

.newStuff {
	position: absolute;
	width: 667.9389rpx;
	height: 83.9695rpx;
	left: 41.9847rpx;
	top: 610.5268rpx;
}

.newAcitivity {
	position: absolute;
	width: 137.4046rpx;
	height: 41.9847rpx;
	left: 41.9847rpx;
	top: 671rpx;
}

.learnMore {
	position: absolute;
	width: 91.603rpx;
	height: 23.4427rpx;
	left: 618.3206rpx;
	top: 676.6335rpx;
}

.exampleOne {
	position: absolute;
	width: 667.9389rpx;
	height: 190.5725rpx;
	left: calc(50% - 667.9389rpx/2 + 0.9542rpx);
	top: 825rpx;
}

.exampleTwo {
	position: absolute;
	width: 650.9389rpx;
	height: 276.5725rpx;
	left: calc(50% - 650.9389rpx/2 + 0.9542rpx);
	top: 990rpx;
	border-radius: 20px;
}

.exampleThree {
	position: absolute;
	width: 667.9389rpx;
	height: 175.5725rpx;
	left: calc(50% - 667.9389rpx/2 + 0.9542rpx);
	top: 1235rpx;
}

.vip {
	position: absolute;
	width: 286.2595rpx;
	height: 24.4427rpx;
	left: 30rpx;
	top: 7px;
}

.addVip {
	position: absolute;
	width: 116.4122rpx;
	height: 34.4427rpx;
	right: 30rpx;
	top: 7px;
}

.interview {
	position: absolute;
	width: 293.893rpx;
	height: 240.458rpx;
	left: 30rpx;
	top: 18px;
}

.case {
	position: absolute;
	width: 293.893rpx;
	height: 240.458rpx;
	right: 30rpx;
	top: 18px;
}

.swiper-container {
  position: absolute;
  width: 650.9389rpx;
  height: 276.5725rpx;
  left: calc(50% - 650.9389rpx/2 + 0.9542rpx);
  top: 650rpx;
  border-radius: 20px;
  overflow: hidden;
}

.swiper-item {
  width: 100%;
  height: 100%;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.offline-event-button {
  position: absolute;
  bottom: 40rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
}

.signup-button {
  background-color: #4CAF50;
  color: white;
  font-size: 32rpx;
  padding: 20rpx;
  border-radius: 10rpx;
}

.topic-vote-button {
  position: absolute;
  bottom: 120rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
}

.vote-button {
  background-color: #ff9500;
  color: white;
  font-size: 32rpx;
  padding: 20rpx;
  border-radius: 10rpx;
}
</style>
