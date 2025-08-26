<template>
	<view class="container">
		<image src="https://seeutest.duckdns.org/images/static/background.jpg" class="background-image"></image>
		<view class="title">
			<text style="font-weight: bold;">{{ courseName }}</text>
		</view>
		<view>
			<video id="myVideo" :src="videoURL" @error="videoErrorCallback" @timeupdate="timeupdate" controls>
			</video>
		</view>
		<text style="text-align: center;margin-bottom: 10rpx;margin-top: 25rpx;">课程内容</text>

		<view class="menu">
			<view v-for="chapter in courseChapters" :key="chapter.courseChapterId">
				<a href="#" :class="{ 'active-item': isActive(chapter) }" class="chapter"
					@tap="selectCourseChapter(chapter)">
					<view>
						<span style="margin-left: 10rpx;font-size: 23rpx; height: 40rpx; line-height: 40rpx;display: inline-block; /* Or use 'block' for full-width */
  text-align: left;">{{ chapter.courseChapterName }}</span>
					</view>
					<view>
						<span
							style="margin-right: 10rpx; font-size: 23rpx; height: 40rpx; line-height: 40rpx;">{{ chapter.videoLengthFormatted }}</span>
					</view>

				</a>
			</view>
		</view>



	</view>
	<view class="logo">
		<image src='https://seeutest.duckdns.org/images/static/images/transparent_watermark.png' class="logoimg"></image>
	</view>
</template>

<script>
import { requestWithTokenAndMemberId } from '../../modules/requestUtils';
import { sendPayment } from '../../modules/paymentUtils';
export default {
	data() {
		return {
			videoLengthSeconds: 0,
			currentcourseID: '',
			videoURL: '',
			courseName: "西游课程视频",
			courseChapters: [],
			canWatch: null,
			paymentInfo: null,
			price: 0,
			watchRights: null,
			purchased: false,
			isVIP: false,
			modalTriggered: false,
			count: 0
		};
	},
	onLoad: function (option) {
		this.currentcourseID = option.courseID
		this.price = option.price
		this.watchRights = (option.watchRights === "true");
		this.isVIP = (option.vip === "true");
		if (this.isVIP || this.watchRights) {
			this.purchased = true
		}
		this.getVideoURL()
	},
	methods: {
		isActive(chapter) {
			if (this.videoURL === chapter.videoUrl) {
				return true
			} else {
				return false
			}
		},
		selectCourseChapter(chapter) {
			this.videoURL = chapter.videoUrl
			this.videoLengthSeconds = chapter.videoLength
		},

		async getVideoURL() {
			const token = uni.getStorageSync("Hannatoken");
			const memberID = uni.getStorageSync("memberId");

			const data = {
				courseId: this.currentcourseID,
			};

			const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/courseBase/queryByFacade`;

			try {
				const result = await requestWithTokenAndMemberId(url, "POST", data, token, memberID);

				if (result.data) {
					this.courseChapters = result.data.courseChapterList;
					this.courseName = result.data.courseName;
					this.videoURL = this.courseChapters[0].videoUrl;
					this.videoLengthSeconds = this.courseChapters[0].videoLength
					this.canWatch = result.data.isWatchRights;

					// Format video length for each chapter
					this.courseChapters.forEach(item => {
						const minutes = Math.floor(item.videoLength / 60);
						const seconds = item.videoLength % 60;
						item.videoLengthFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
					});
				} else {
					console.error("No data returned for course");
				}
			} catch (err) {
				console.error("Error fetching video URL", err);
			}
		},
		async createOrder() {
			await this.getPaymentInfo();
			sendPayment(this.paymentInfo).then(data => {
				if (data) {
					this.purchased = true
				} else {
					this.modalTriggered = false
					uni.switchTab({
						url: '../course/course'
					});
					uni.showToast({
						title: '支付失败',
						duration: 1000,
						icon: 'error'
					});
				}
			})
		},

		async getPaymentInfo() {
			const token = uni.getStorageSync("Hannatoken");
			const memberID = uni.getStorageSync("memberId");
			const courseIDLocal = String(this.currentcourseID);
			const orderCourseQuantity = String(this.courseChapters.length);

			try {
				const data = {
					courseId: courseIDLocal,
					orderCourseQty: orderCourseQuantity,
					orderType: "1",
				};

				const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/payOfApplets/createOrder`;

				const result = await requestWithTokenAndMemberId(url, "POST", data, token, memberID);

				this.paymentInfo = result.data; // Assuming `result` contains `data` field with payment info
				return "success";
			} catch (error) {
				console.log("Error in fetching payment info", error);
				return "error";
			}
		},
		videoPurchase(e, allowedTime){
			if (!this.isVIP) {
				if (this.price != 0) {
					if (!this.purchased) {
						const refer = this
						var currentTime = Number(e.detail.currentTime.toFixed(2))

						if (currentTime > allowedTime && !refer.modalTriggered) {
							refer.modalTriggered = true
							uni.createVideoContext("myVideo").pause();
							uni.showModal({
								content: "如需观看后续视频，请购买",
								confirmText: "购买",
								success: function (res) {
									if (res.confirm) {
										refer.createOrder();

									} else {
										uni.switchTab({
											url: '../course/course'
										});
									}
								}
							});

							return
						}
					}
				}
			}
		},
		timeupdate(e) {
			if(this.videoLengthSeconds <= 1800){
				this.videoPurchase(e,300)
			}else{
				this.videoPurchase(e,600)
			}
			
		},
	}
};


</script>

<style>
.background-image {
	position: absolute;
	z-index: -1;
	left: 0;
	right: 0;
	bottom: 0;
	right: 0;
	width: 100%;
	height: 100%;
}

.logo {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
}

.logoimg {
	width: 230rpx;
	height: 186rpx;
	margin-top: 200rpx;
	position: absolute;
	bottom: 0;
	/* This sticks the image to the bottom of the parent */
}

.chapter {
	display: flex;
	justify-content: space-between;
	margin-bottom: 7rpx;
}

.active-item {
	background-color: #a9c4f7 !important;
	color: white
}

.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	/* Optional: to give a background color */
}

.text {
	font-size: 24px;
	margin: 10px 0;
}

.title {
	font-size: large;
	padding: 20px;
}

.classes {
	margin: 20px;
}

.menu {
	padding-top: 10rpx;
	border: 2px solid white;
	border-radius: 10px;
	height: 150px;
	width: 300px;
	overflow-y: auto;
}
</style>
