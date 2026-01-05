<template>
  <view class="container">
    <view v-if="isReady()" class="top">
      <image src="https://seeu-applets.seeu-edu.com/images/static/course_image.jpg" class="logo-image"></image>
    </view>
    <view v-if="isReady()" class="search-bar">
      <input class="search-input" type="text" placeholder="搜索课程" v-model="searchQuery" @confirm="onSearch" />
      <button class="search-button" @tap="onSearch">
        <uni-icons type="search" color="#ffffff" size="25" />
      </button>
    </view>


    <!-- <view class="category-container">
      <view v-for="view in views" :key="view.id">
        <view class="category-item" :class="{ 'active-item': isActive(view) }" @tap="selectCourseCategory(view)">{{
          view.courseCategory }} </view>
      </view>
    </view> -->
	<scroll-view scroll-x="true" scroll-left="120" style="white-space: nowrap;width: 80%; margin-top: 20rpx; margin-bottom: 20rpx;">
	    <view>
	        <view v-for="view in views" :key="view.id" style="display: inline-block;">
				<view class="category-item" :class="{ 'active-item': isActive(view) }" @tap="selectCourseCategory(view)">
					{{view.courseCategory}}
				</view>
	        </view>
	    </view>
	</scroll-view>



    <view class="list">
      <view v-for="course in courses" class="list-item" @tap="navigateToCourseDetail(course)" :key="course.courseId">
        <view class="left">
          <image :src="course.imageUrl" class="logo-image"></image>
        </view>
        <view class="right">
          <text class="courseName">{{ formatCourseName(course.courseName )}}</text>
          <view class="flex-container">
            <text v-if="displayPrice(course)" class="price">¥{{ course.price/100 }}</text>
			<view v-if="course.price == 0 || isVIP"> <button class="buy">免费观看</button></view>
           <view v-else-if="course.isWatchRights == false"> <button class="buy" @click.stop="purchase(course)">立即购买</button></view>
		   <view v-else><button class="buy">已购买</button></view>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
	import { requestWithTokenAndMemberId } from '../../modules/requestUtils';
	import { sendPayment } from '../../modules/paymentUtils';
export default {
  data() {
    return {
      views: [],       // this stores all the course categories
      courses: [], // this stores all the courses
      courseID: "",
      searchQuery: "",
      activeCourseCategories: [],
      currentPage: 1,
	  memberLevelID: "",
	  email:"",
	  isVIP: false,
	  avoidOnShow:true,
	  paymentInfo: null,
	  courseAndCategoryLoaded: false
    };
  },
  onLoad: function (option) {
	  uni.showLoading({
	    title: '加载中...'
	  });
		this.gatherInfoAndRequest()
	},
	onShow:function(){
		if (!this.avoidOnShow){
			this.gatherInfoAndRequest()
		}
		this.avoidOnShow = false
	},
  async onReachBottom() {
    const token = uni.getStorageSync("Hannatoken")
    const memberID = uni.getStorageSync("memberId")
    this.currentPage += 1
		
		const url =  `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/courseBase/coursePageList`;
		  
		const data = {
      isEnable: true,
      keyword: this.searchQuery,
      courseCategoryIdList: this.activeCourseCategories,
      postOrderBy: "ASC",
      pageNum: this.currentPage,
      pageSize: 10
    };
			
			try {
			  const res = await requestWithTokenAndMemberId(url, "POST", data, token, memberID);
			    
			  // Check if response contains data and records
			  if (res && res.data && res.data.records) {
			    this.courses = this.courses.concat(res.data.records);
			  } else {
			    console.log("No more records available.");
			  }
			} catch (err) {
			  console.log(err);
			}
				
    
  },
  methods: {
	  isReady(){
		  return this.courseAndCategoryLoaded;
	  },
	  formatCourseName(courseName) {
	        const maxLength = 34;
	        if (courseName.length > maxLength) {
	          const start = courseName.slice(0, 17);
	          const end = courseName.slice(-17);
	          return `${start}...${end}`;
	        }
	        return courseName;
	      },
	  purchase(course){
		  this.createOrder(course)
	  },

	  async createOrder(course) {
			await this.getPaymentInfo(course);
			sendPayment(this.paymentInfo).then(data => {
				if (data) {
					uni.showToast({
						title: '支付成功',
						duration: 1000
					});
					this.fetchCourses(uni.getStorageSync("Hannatoken"), uni.getStorageSync("memberId"));
				} else {
					uni.showToast({
						title: '支付失败',
						duration: 1000,
						icon: 'error'
					});
				}
			})
		},

		async getPaymentInfo(course) {
			const token = uni.getStorageSync("Hannatoken");
			const memberID = uni.getStorageSync("memberId");
			const courseIDLocal = String(course.courseId);
			const orderCourseQuantity = String(course.courseChapterCount);

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
    isActive(view) {
      return this.activeCourseCategories.includes(view.id)
    },
	displayPrice(course){
		if(this.isVIP){
			return false
		}else{
			if(course.price == 0){
				return false
			}else{
				if(course.isWatchRights == false){
					return true
				}else{
					return false
				}
			}
		}
	},
    async selectCourseCategory(view) {
      if (this.activeCourseCategories.includes(view.id)) {
        const index = this.activeCourseCategories.indexOf(view.id);
        this.activeCourseCategories.splice(index, 1);
      } else {
        this.activeCourseCategories.push(view.id);
      }
      const token = uni.getStorageSync("Hannatoken");
      const memberID = uni.getStorageSync("memberId");
		
			
			const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/courseBase/coursePageList`;
			
			const data = {
			  isEnable: true,
			  keyword: this.searchQuery,
			  courseCategoryIdList: this.activeCourseCategories,
			  postOrderBy: "ASC",
			  pageNum: this.currentPage,
			  pageSize: 10
			};
				
				
			try {
			  // Use the request utility function
			  const res = await requestWithTokenAndMemberId(url, "POST", data, token, memberID);
			    
			  // Check if response contains data and records
			  if (res && res.data && res.data.records) {
			    this.courses = res.data.records;
			  } else {
			    console.log("No records found.");
			  }
			} catch (err) {
			  console.log(err);
			}
      
    },
    async onSearch() {
      const token = uni.getStorageSync("Hannatoken")
      const memberID = uni.getStorageSync("memberId")
      this.currentPage = 1
      this.activeCourseCategories = []
      
			const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/courseBase/coursePageList`;
			
			const data = {
			  isEnable: true,
			  keyword: this.searchQuery,
			  courseCategoryIdList: [], // Empty because categories are reset
			  postOrderBy: "ASC",
			  pageNum: 1,
			  pageSize: 10
			};
			
			try {
			  // Use the request utility function
			  const res = await requestWithTokenAndMemberId(url, "POST", data, token, memberID);
			    
			  // Check if response contains data and records
			  if (res && res.data && res.data.records) {
			    this.courses = res.data.records;
			  } else {
			    console.log("No records found.");
			  }
			} catch (err) {
			  console.log(err);
			}
				
				
    },
    navigateToCourseDetail(course) {
      const courseID = course.courseId
	  const watchRight = course.isWatchRights
	  const token = uni.getStorageSync("Hannatoken")
	  const memberID = uni.getStorageSync("memberId")

	  if(token && memberID){
		  const navigateURL = "../courseDetail/courseDetail?courseID=" + courseID+"&price="+course.price+"&watchRights="+watchRight+"&vip="+this.isVIP
		  uni.navigateTo({
			url: navigateURL
		  });
	  }else{
		  const navigateURL = "../index/index"
		  uni.navigateTo({
		  			url: navigateURL
		  });
	  }
      
    },
    async fetchCourses(token, memberID) {
			
			const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/courseBase/coursePageList`;
			
			const data = {
			  isEnable: true,
			  keyword: "", // Empty keyword by default
			  courseCategoryIdList: [], // Empty category list
			  postOrderBy: "ASC",
			  pageNum: 1,
			  pageSize: 10
			};
				
			try {
			  // Use the request utility function
			  const res = await requestWithTokenAndMemberId(url, "POST", data, token, memberID);
				let result = "";
			  // Check if the response contains data and records
			  if (res && res.data && res.data.records) {
			    result = res.data.records;
			    return result;
			  } else {
			    console.log("No courses found.");
			    return "error";
			  }
			} catch (err) {
			  console.log("Error fetching courses:", err);
			  return "error";
			}	
      
    },
    async fetchViews(token, memberID) {
			const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/courseCategory/queryPageList`;
			
			const data = {
			  isEnable: true,
			  keyword: "",
			  pageNum: 1,
			  pageSize: 10
			};
				
				
      try {
        // Use the request utility function
        const res = await requestWithTokenAndMemberId(url, "POST", data, token, memberID);
		let result = "";
		
        // Process the response data
        if (res && res.data && res.data.records) {
          const records = res.data.records;
          result = records.map((x) => ({
            id: x.courseCategoryId,
            courseCategory: x.courseCategoryName
          }));
      
          // Filter out views with "热门课程" (hot courses)
          const filtered = result.filter(item => item.courseCategory !== "热门课程");
          return filtered;
        } else {
          console.log("No views found.");
          return "error";
        }
      } catch (err) {
        console.log("Error fetching views:", err);
        return "error";
      }
    },
    async gatherInfoAndRequest() {
      const token = uni.getStorageSync("Hannatoken")
      const memberID = uni.getStorageSync("memberId")
	  this.email = uni.getStorageSync("email")
	  uni.request({
	    url: `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/memberBase/queryByFacade`,
	    method: "POST",
	    header: {
	      "token": token,
	      "memberId": memberID
	    },
	    success: (res) => {
	      this.memberLevelID = res.data.data.memberLevelId
	    },
	    fail: (err) => {
	      console.log(err)
	    }
	  })
      let courseCategories = await this.fetchViews(token, memberID);
      const courses = await this.fetchCourses(token, memberID);
	  uni.hideLoading();
	  courseCategories = courseCategories.map(course => {
	    return {
	      ...course, // Keep other properties like id unchanged
	      courseCategory: course.courseCategory.length > 4
	        ? course.courseCategory.slice(0, 4)
	        : course.courseCategory
	    };
	  });
	  this.views = courseCategories
	  this.courses = courses
	  
	  if(this.email && this.memberLevelID !=="1760452581253971968"){
		  this.isVIP = true
	  }else{
		  console.log("not vip")
	  }
	  this.courseAndCategoryLoaded = true
    }
  }
}
</script>

<style>
.scroll-view-item_H {
  display: inline-block;
  width: 100%;
  height: 300rpx;
  line-height: 300rpx;
  text-align: center;
  font-size: 36rpx;
}

.courseName{
	font-size: 4vw;
	text-overflow: ellipsis;
}


.active-item {
  background-color: #5687f2 !important;
  color: white
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f8f8f8;
  /* Optional: to give a background color */
  overflow: hidden;
  /* Hide overflow content */
}

.search-input {
  flex: 1;
  height: 100%;
  padding: 0 10px;
  border: 1px;
  outline: none;
  background-color: #f1efef;
  border-radius: 10px 0 0 10px;
  border-style: solid;
}

.search-button {
  width: 40px;
  height: 32px;
  background-color: #4285f4;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0 5px 5px 0;
}

.search-bar {
  display: flex;
  margin-top: 20rpx;
  align-items: center;
  width: 90%;
  height: 30px;
  background-color: #F2F3F5;
  border-radius: 5px;
  position: relative;
  margin-bottom: 5px;
}

.top {
  width: 750rpx;
  height: 238rpx;
}

.logo-image {
  width: 100%;
  height: 100%;
}

.flex-container {
  display: flex;
}

.buy {
  border-radius: 25px;
  font-size: 10px;
  background: #5687f2;
  color: white;
  position: absolute;
  right: 10rpx;
  top: 70px
}

.price {
  color: #6F9CDE;
  position: absolute;
  top: 70px
}

.category-container {
  display: flex;
  flex-wrap: nowrap;
  text-align: center;
  justify-content: flex-start;
  width: 90%;
}

.category-item {
  background-color: #E8E8E8;
  width: 110rpx;
  margin: 1px;
  line-height: 20px;
  font-size: 23rpx;
  border-radius: 25px;
  text-align: center;
}


/* .flex-container>view {
  background-color: #E8E8E8;
  width: 60px;
  margin: 1px;
  text-align: center;
  line-height: 20px;
  font-size: 14px;
  border-radius: 25px;
} */

.list {
  margin-top: 10rpx
}

.list-item {
  width: 90vw;
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
  padding: 5rpx;
  position: relative
}
</style>