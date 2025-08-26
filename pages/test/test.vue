<template>
  <view class="container">
    <view class="top">
      <image src="https://seeutest.duckdns.org/images/static/interview.jpg" class="logo-image"></image>
    </view>

    <view class="flex-container">
      <view>热门课程</view>
      <view>求职培训</view>
      <view>行业课程</view>  
      <view>专业技能</view>
      <view>项目课程</view>
      <view>项目课程</view>  
    </view>

    <view class="list">
      <view class="list-item" @tap="navigateToCourseDetail">
        <view class="left">
          <image src="https://seeutest.duckdns.org/images/static/columbia.jpg" class="logo-image"></image>
        </view>
        <view class="right">
          <text>数据职业导论/入门</text>
          <view class="flex-container">
            <text class="price">¥199</text>
            <button class="buy">立即购买</button>
          </view>
        </view>
      </view>

      <view class="list-item" @tap="navigateToCourseDetail">
        <view class="left">
          <image src="https://seeutest.duckdns.org/images/static/columbia.jpg" class="logo-image"></image>
        </view>
        <view class="right">
          <text>数据职业导论/入门</text>
          <view class="flex-container">
            <text class="price">¥199</text>
            <button class="buy">立即购买</button>
          </view>
        </view>
      </view>
      
      <view class="list-item" @tap="navigateToCourseDetail">
        <view class="left">
          <image src="https://seeutest.duckdns.org/images/static/columbia.jpg" class="logo-image"></image>
        </view>
        <view class="right">
          <text>数据职业导论/入门</text>
          <view class="flex-container">
            <text class="price">¥199</text>
            <button class="buy">立即购买</button>
          </view>
        </view>
      </view>
      
      <view class="list-item" @tap="navigateToCourseDetail">
        <view class="left">
          <image src="https://seeutest.duckdns.org/images/static/columbia.jpg" class="logo-image"></image>
        </view>
        <view class="right">
          <text>数据职业导论/入门</text>
          <view class="flex-container">
            <text class="price">¥199</text>
            <button class="buy">立即购买</button>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
export default {
	methods: {
		navigateToCourseDetail() {
			uni.navigateTo({
                  url: '../courseDetail/courseDetail'
                });
		}
	}
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f8f8f8; /* Optional: to give a background color */
  overflow: hidden; /* Hide overflow content */
}

.top {
	width: 100%;
	height: 300rpx;
}

.logo-image {
	width: 100%;
	height: 100%;
}

.flex-container {
  display: flex;
  flex-wrap: nowrap;
  margin: 10px;
}

.flex-container > view {
  background-color: #E8E8E8;
  width: 50px;
  margin: 1px;
  text-align: center;
  line-height: 20px;
  font-size: 10px;
  border-radius: 25px;
}

.list {
}

.list-item {
  width: 300px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 3px 3px 3px #BEBEBE;
  margin-bottom: 10px;
}

.left {
  float: left;
  height: 100px;
  width: 150px;
  margin-right: 10px;
  border-radius: 6px;
  overflow: hidden;
}

.right {
  padding: 15px;
  font-size: 15px;
}

.buy {
  border-radius: 25px;
  font-size: 10px;
  background: #ACD5FF;
  color: white;
}

.price {
  color: #6F9CDE;
}
</style>