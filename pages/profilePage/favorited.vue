<template>
  <view class="container">
    <!-- Search bar -->
    <view class="search-row">
   <button class="edit-button" @click="toggleEdit">
  {{ showEditOptions ? '完成' : '编辑' }}
   </button>
   <view class="search-bar">
  <input
    class="search-input"
    type="text"
    confirm-type="search"
    placeholder="搜索案例资料"
    v-model="searchQuery"
    @confirm="onSearch"
  />
  <button class="search-button" @tap="onSearch">
    <uni-icons type="search" color="#ffffff" size="25" />
  </button>
   </view>
 </view>
 <!-- 取消全部收藏 -->
 <view v-if="showEditOptions" class="popup" @tap="confirmClear">
   <view class="popup-content popup-action">
  <text class="danger-text">取消全部收藏</text>
   </view>
 </view>
 <view v-if="showConfirmPopup" class="popup">
   <view class="popup-content">
  <text>确定要取消全部收藏吗？</text>
  <view class="popup-buttons">
    <button @click="clearFavorites">确认</button>
    <button @click="cancelClear">取消</button>
  </view>
   </view>
 </view>
    <!-- Tabs -->
    <view class="tabs">
      <view
        class="tab"
        :class="{ active: activeTab === 'jobs' }"
        @tap="selectTab('jobs')"
      >求职</view>
      <view
        class="tab"
        :class="{ active: activeTab === 'study' }"
        @tap="selectTab('study')"
      >申研</view>
    </view>

    <!-- Scroll View with Card Lists -->
    <scroll-view class="card-list" scroll-y>
      <view v-if="activeTab === 'jobs'" class="mianjings">
        <view
          v-for="(item, index) in filteredJobList"
          :key="index"
          class="card-wrapper"
        >
          <card
            :image="item.exampleImgUrl"
            :title="item.studentName"
            :subtitle="item.post"
            :tag="item.postType === '1' ? '实习' : '全职'"
            :favorited="item.favorited"
            @toggleFavorite="toggleFavorite(item)"
            @tap="openJobSubpage(item.id)"
          />
        </view>
      </view>
      <view v-if="activeTab === 'study'" class="mianjings">
        <view
          v-for="(item, index) in filteredStudyList"
          :key="index"
          class="card-wrapper"
        >
          <card
            :image="item.exampleImgUrl"
            :title="item.major"
            :subtitle="item.majorType"
            :favorited="item.favorited"
            @toggleFavorite="toggleFavorite(item)"
            @tap="openStudySubpage(item.id)"
          />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import card from "/components/card 2.vue";
import { requestWithToken } from '@/modules/requestUtils.js';

export default {
  components: { card },
  data() {
    return {
	  showEditOptions: false,
	  showConfirmPopup: false,
	  favoritedList: [],
      searchQuery: "",
      activeTab: "jobs",
      jobList: [],
	  jobBuffer: [],
	  jobFavoriteList: [],
      studyList: [],
	  studyBuffer: [],
	  studyFavoriteList: [],
	  memberId: null,
    };
  },
  computed: {
    filteredJobList() {
	  // Temporary, fetch all job ids that are the same as the ones created in the set
	  const jobIds = new Set(this.jobList)
	  console.log(jobIds)
	  console.log(this.jobFavoriteList)
      return this.jobFavoriteList.filter((item) => jobIds.has(item.id));
    },
    filteredStudyList() {
      // Temporary, fetch all job ids that are the same as the ones created in the set
      const studyIds = new Set(this.studyList)
      // console.log(studyIds)
      // console.log(this.studyFavoriteList)
      return this.studyFavoriteList.filter((item) => studyIds.has(item.id));
    },
  },
  // created() {
  //   this.loadFavoritedCases();
  // },
  methods: {
	
	async getToken() {
	  try {
	    const res = await uni.getStorageSync("token");
				// console.log(`token: ${res}`);
	    return `Bearer ${res}`;
	  } catch (e) {
	    this.handleAuthError();
	    throw e;
	  }
	},
    onSearch() {},
    selectTab(tab) {
      this.activeTab = tab;
    },
	/** 发起收藏 */
	async addCollect(memberId, exampleId, param) {
	  var token = await this.getToken();
	  try {
		const res = await requestWithToken(
		  `https://seeutest.duckdns.org/seeuapp/collection/${param}?memberId=${memberId}&exampleId=${exampleId}`,
		  'POST',
		  {},
		  token
		);
		if (res.code === 200) {
		  return res.data;
		} else {
		  console.error('API Error:', res.message);
		  return false;
		}
	  } catch (e) {
		console.error('Request Failed:', e);
		return false;
	  }
	},
	/** 取消收藏 */
	async deleteCollect(memberId, exampleId, param) {
	  var token = await this.getToken();
	  try {
		const res = await requestWithToken(
		  `https://seeutest.duckdns.org/seeuapp/collection/${param}?memberId=${memberId}&exampleId=${exampleId}`,
		  'DELETE',
		  {},
		  token
		);
		if (res.code === 200) {
		  // console.log(this.activeTab);
		  return res.data;
		} else {
		  console.error('API Error:', res);
		  return false;
		}
	  } catch (e) {
		console.error('Request Failed:', e);
		return false;
	  }
	},
    async toggleFavorite(item) {
	  // console.log(this.activeTab);
	  var param = this.activeTab === "jobs" ? "job": "graduate";
      if (!item.favorited) {
		const ok = await this.addCollect(this.memberId, item.id, param);
		if (ok) {
		  item.favorited = true;
		  uni.showToast({ title: '已收藏', icon: 'success' });
		}
      } else {
		const ok = await this.deleteCollect(this.memberId, item.id, param);
		if (ok) {
		  item.favorited = false;
		  uni.showToast({ title: '已取消收藏', icon: 'none' });
		}
      }
    },
	/** 从本地存储读取 memberId */
	async getMemberId() {
	  try {
		const res = await uni.getStorageSync('memberId');
		console.log(`Member ID: ${res}`);
		return `${res}`;
	  } catch (e) {
		console.error('getMemberId failed', e);
		throw e;
	  }
	},
    async loadFavoritedCases() {
	  // const memberId = await this.getMemberId();
	  var token = await this.getToken();
	  try {
		// fetch job favorites
		const jobRes = await requestWithToken(
		  `https://seeutest.duckdns.org/seeuapp/collection/job/${this.memberId}`,
		  "GET",
		  {},
		  token
		);
		if (jobRes.code === 200) {
		  // console.log("request successful: ", jobRes.data)
		  this.jobList = jobRes.data.map(item => item.exampleId)
		  console.log("request successful: ", this.jobList)
		} else {
		  console.error("Job API Error:", jobRes.code);
		  this.jobList = [];
		}

		// fetch study favorites (swap in your real endpoint if different)
		const studyRes = await requestWithToken(
		  `https://seeutest.duckdns.org/seeuapp/collection/graduate/${this.memberId}`,
		  "GET",
		  {},
		  token
		);
		// this.studyList = studyRes.data;
		if (studyRes.code === 200) {
		  this.studyList = studyRes.data.map(item => item.exampleId);
		  console.log("request successful: ", this.studyList)
		} else {
		  console.error("Study API Error:", studyRes.message);
		  this.studyList = [];
		}
	  } catch (e) {
		console.error("Request Failed:", e);
		this.jobList = [];
		this.studyList = [];
	  }
	},
	async fetchJobList(pageNum) {
	  const requestData = { major: this.major };
	  var token = await this.getToken();
	  try {
		// temporary pageNum and pageSize, until I find a call that calls all exampleOfJob
		// multi-threading
		console.log(pageNum);
	    const res = await requestWithToken(
	      `https://seeu-applets.seeu-edu.com/seeuapp/exampleOfJob/listPage?pageNum=${pageNum}&pageSize=${50}`,
	      "POST",
	      requestData,
	      token
	    );
	    if (res.code === 200) {
		  // 并行检查收藏状态
		  const records = res.data.records;
		  const updated = await Promise.all(
			records.map(async item => {
			  return { ...item, favorited: true };
			})
		  );
		  this.jobBuffer = pageNum === 1
			? updated
			: this.jobBuffer.concat(updated);
		}
	  } catch (e) {
	    console.error('fetchJobList failed', e);
	  }
	},
	async loadAllJobs() {
	  // 1) build an array of page numbers [1…50]
	  const pageNums = Array.from({ length: 50 }, (_, i) => i + 1);
	
	  // 2) kick off all fetches in parallel
	  const fetches = pageNums.map(page => this.fetchJobList(page));
	
	  // 3) wait until every fetchJobList(page) promise resolves
	  await Promise.all(fetches);
	
	  // 4) now that fetchJobList has pushed into jobBuffer for each page,
	  //    copy that into jobFavoriteList
	  this.jobFavoriteList = this.jobBuffer;
	},
	async fetchStudyList(pageNum) {
	  const requestData = { major: this.major };
	  var token = await this.getToken();
	  try {
		// temporary pageNum and pageSize, until I find a call that calls all exampleOfGraduate
	    const res = await requestWithToken(
	      `https://seeu-applets.seeu-edu.com/seeuapp/exampleOfGraduate/listPage?pageNum=${pageNum}&pageSize=${50}`,
	      "POST",
	      requestData,
	      token
	    );
	    if (res.code === 200) {
	      // 并行检查收藏状态
	      const records = res.data.records;
	      const updated = await Promise.all(
			records.map(async item => {
			  return { ...item, favorited: true };
			})
	      );
	      this.studyBuffer = pageNum === 1
	      			? updated
	      			: this.studyBuffer.concat(updated);
	    }
	  } catch (e) {
	    console.error('fetchStudyList failed', e);
	  }
	},
	async loadAllStudies() {
	  // 1) build an array of page numbers [1…50]
	  const pageNums = Array.from({ length: 50 }, (_, i) => i + 1);
	
	  // 2) kick off all fetches in parallel
	  const fetches = pageNums.map(page => this.fetchStudyList(page));
	
	  // 3) wait until every fetchJobList(page) promise resolves
	  await Promise.all(fetches);
	
	  // 4) now that fetchJobList has pushed into jobBuffer for each page,
	  //    copy that into jobFavoriteList
	  this.studyFavoriteList = this.studyBuffer;
	},
	toggleEdit() {
	  this.showEditOptions = !this.showEditOptions;
	},
	confirmClear() {
		this.showEditOptions = false; // hide "取消全部收藏"
		this.showConfirmPopup = true; // show the real confirmation
	},
	async clearFavorites() {
	  console.log("确认 clicked");
	  var param = this.activeTab === "jobs" ? "job": "graduate";
	  if(param === "job"){
		  for(const id of this.jobList){
		  		await this.deleteCollect(this.memberId, id, param);
		  }
		  this.jobFavoriteList = [];
		  this.jobList = [];
	  }
	  else{
		  for(const id of this.studyList){
		  		await this.deleteCollect(this.memberId, id, param);
		  }
		  this.studyFavoriteList = [];
		  this.studyList = [];
	  }
	  this.showConfirmPopup = false;
	  this.showEditOptions = false;
	  uni.showToast({
		  title: '已取消全部收藏',
		  icon: 'none',
		  duration: 2000
		});
	  
	 //  const all = uni.getStorageSync("favoritedCases") || [];
	 //  let updated = [];
	 //  if (this.activeTab === "jobs") {
		// // Remove all jobs, keep studies
		// updated = all.filter(item => item.type !== "job");
	 //  } else {
		// // Remove all studies, keep jobs
		// updated = all.filter(item => item.type !== "study");
	 //  }
	 //  uni.setStorageSync("favoritedCases", updated);
	 //  // Reload lists
	 //  this.loadFavoritedCases();
	 //  this.showConfirmPopup = false;
	 //  this.showEditOptions = false;
	 //  uni.showToast({
		//   title: '已取消全部收藏',
		//   icon: 'none',
		//   duration: 2000
		// });
	},
	cancelClear() {
	  console.log("取消 clicked");
	  this.showConfirmPopup = false;
	},
    openJobSubpage(id) {
      wx.navigateTo({ url: `/pages/job_detail/job_detail?id=${encodeURIComponent(id)}` });
    },
    openStudySubpage(id) {
      wx.navigateTo({ url: `/pages/study_detail/study_detail?id=${encodeURIComponent(id)}` });
    },
  },
  async onLoad(options) {
	this.memberId = await this.getMemberId();
  	// this.memberId = await this.getMemberId();
    await this.loadFavoritedCases();
	await this.loadAllJobs();
	await this.loadAllStudies();
	// await this.fetchStudyList();
    // if (options.major) {
    //   this.major = options.major;
    //   await this.fetchJobList();
    // }
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  height: 40px;
  background-color: #f2f3f5;
  border-radius: 5px;
}

.search-input {
  flex: 1;
  height: 100%;
  padding: 0 10px;
  border: none;
  outline: none;
  background: transparent;
}
.search-button {
  width: 40px;
  height: 40px;
  background-color: #4285f4;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0 5px 5px 0;
}
.tabs {
  display: flex;
  justify-content: space-around;
  width: 100%;
}
.tab {
  font-weight: bold;
  padding: 10px 20px;
  cursor: pointer;
}
.tab.active {
  border-bottom: 5px solid #4285f4;
}
.card-list {
  width: 100%;
  height: 100%;
  overflow: auto;
}
.card-wrapper {
  margin-bottom: 20px;
}
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999; /* make sure it's high */
}
.popup-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}
.popup-buttons button {
  margin: 10px;
}
.edit-button-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 0 16px;
  margin: 5px 0;
}
.edit-button {
  font-size: 12px;
  padding: 4px 10px;
  background-color: #f2f3f5;
  border: none;
  border-radius: 5px;
  color: #333;
}
.search-row {
  display: flex;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 10px;
  width: 100%;
  box-sizing: border-box;
}
.edit-button {
  font-size: 12px;
  padding: 4px 10px;
  background-color: #f2f3f5;
  border: none;
  border-radius: 5px;
  color: #333;
  margin-right: 10px;
  flex-shrink: 0;
}
.popup-action {
  background-color: #fff;
  padding: 15px 20px;
  border-radius: 10px;
  width: 70%;
  text-align: center;
}
</style>