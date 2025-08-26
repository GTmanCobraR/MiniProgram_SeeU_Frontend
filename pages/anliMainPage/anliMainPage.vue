<template>
  <view class="container">
    <view class="search-bar">
      <view class="search-dropdown" @tap="searchToggleDropdown">
        <text>{{ selectedOption }}</text>
        <uni-icons :type="showDropdown ? 'up' : 'down'" class="arrow-search" />
      </view>
      <view v-if="showDropdown" class="dropdown-menu">
        <view
          v-for="(option, index) in options"
          :key="index"
          class="dropdown-item"
          @tap="selectOption(option)"
        >
          <text :class="{ selected: option === selectedOption }">{{ option }}</text>
        </view>
      </view>
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

    <view class="tabs">
      <view
        class="tab"
        :class="{ active: activeTab === 'jobs' }"
        @tap="selectTab('jobs')"
        >求职</view
      >
      <view
        class="tab"
        :class="{ active: activeTab === 'study' }"
        @tap="selectTab('study')"
        >申研</view
      >
    </view>

    <!-- Job Filters -->
    <view v-if="activeTab === 'jobs' && showFilters" class="filters">
      <view class="filter" @tap="toggleDropdown('location')">求职地区
        <uni-icons
          :type="dropdowns.location ? 'up' : 'down'"
          class="arrow-filter"
        />
      </view>
      <view class="filter" @tap="toggleDropdown('position')">岗位类别
        <uni-icons
          :type="dropdowns.position ? 'up' : 'down'"
          class="arrow-filter"
        />
        <view v-if="dropdowns.position" class="filter-dropdown-position">
          <view
            @tap="filterBy('position', '全职')"
            :class="{
              selected: filters.position === '全职',
              'filter-dropdown-item1': true
            }"
            >全职</view
          >
          <view
            @tap="filterBy('position', '实习')"
            :class="{ selected: filters.position === '实习' }"
            >实习</view
          >
        </view>
      </view>
    </view>

    <!-- Study Filters -->
    <view v-if="activeTab === 'study' && showFilters" class="filters">
      <view class="filter" @tap="toggleDropdown('studyLocation')">申研地区
        <uni-icons
          :type="dropdowns.studyLocation ? 'up' : 'down'"
          class="arrow-filter"
        />
      </view>
      <view class="filter" @tap="toggleDropdown('university')">所属院校
        <uni-icons
          :type="dropdowns.university ? 'up' : 'down'"
          class="arrow-filter"
        />
      </view>
      <view class="filter" @tap="toggleDropdown('major')">所属专业
        <uni-icons
          :type="dropdowns.major ? 'up' : 'down'"
          class="arrow-filter"
        />
      </view>
    </view>

    <!-- Combined Scroll View for Job and Study List -->
    <scroll-view
      class="card-list"
      scroll-y
      @scrolltolower="handleScrollToLower"
      :lower-threshold="20"
    >
      <view v-if="activeTab === 'jobs'" class="mianjings">
        <view
          v-for="(item, index) in uniqueJobList"
          :key="index"
          class="card-wrapper"
        >
          <card
            :image="item.exampleImgUrl"
            :title="item.major"
            :subtitle="item.majorEn"
            :views="item.views"
            @tap="openJobSubpage(item.major)"
          />
        </view>
      </view>
      <view v-if="activeTab === 'study'" class="mianjings">
        <view
          v-for="(item, index) in uniqueStudyList"
          :key="index"
          class="card-wrapper"
        >
          <card
            :image="item.exampleImgUrl"
            :title="item.major"
            :subtitle="item.majorType"
            :views="item.views"
            @tap="openStudySubpage(item.major)"
          />
        </view>
      </view>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="allLoaded" class="end-of-data">已加载全部数据</view>
    </scroll-view>
  </view>
</template>

<script>
import card from "/components/card 3.vue";
import { requestWithToken } from '@/modules/requestUtils.js';

export default {
  components: { card },
  data() {
    return {
      searchQuery: "",
      selectedOption: "按公司",
      options: ["按公司", "按岗位", "按专业", "按学校"],
      showDropdown: false,
      activeTab: "jobs",
      dropdowns: {
        location: false,
        position: false,
        studyLocation: false,
        university: false,
        major: false,
      },
      filters: {
        location: null,
        position: null,
        studyLocation: null,
        university: null,
        major: null,
      },
      jobList: [],
      studyList: [],
      jobPageNum: 1,
      jobPageSize: 6,
      studyPageNum: 1,
      studyPageSize: 6,
      loading: false,
      allLoaded: false,
      jobTotal: 0,
      studyTotal: 0,
      jwtToken: "",
      studyLocations: [], // Store fetched study locations
      majors: [], // Store fetched majors
      showFilters: false, // New property to control filter visibility
    };
  },
  created() {
    this.loadFilters(); // Load filters data
    this.fetchJobList();
    this.fetchStudyList();
  },
  computed: {
    uniqueJobList() {
      const seen = new Set();
      return this.jobList.filter((item) => {
        const isDuplicate = seen.has(item.major);
        seen.add(item.major);
        return !isDuplicate;
      });
    },
    uniqueStudyList() {
      const seen = new Set();
      return this.studyList.filter((item) => {
        const isDuplicate = seen.has(item.major);
        seen.add(item.major);
        return !isDuplicate;
      });
    },
  },
  methods: {
    async getToken() {
      try {
        const res = await uni.getStorageSync("token");
				console.log(`token: ${res}`);
        return `Bearer ${res}`;
      } catch (e) {
        this.handleAuthError();
        throw e;
      }
    },
    // async requestWithToken(url, method, data) {
    //   try {
    //     const token = await this.getToken();
    //     const res = await uni.request({
    //       url,
    //       method,
    //       data,
    //       header: {
    //         "Content-Type": "application/json",
    //         Authorization: token,
    //       },
    //     });
    //     return res.data;
    //   } catch (e) {
    //     this.handleAuthError();
    //     throw e;
    //   }
    // },
    async loadFilters() {
      this.studyLocations = await this.fetchFilterData("area_graduate");
      this.majors = await this.fetchFilterData("major_type");
    },
    async fetchFilterData(type) {
      // try {
      //   const res = await this.requestWithToken(
      //     `https://seeu-applets.seeu-edu.com/seeuapp/dict/getDictOfType?type=${type}`,
      //     "GET",
      //     {}
      //   );
      //   if (res.code === 200) {
      //     return res.data;
      //   } else {
      //     console.error("API Error:", res.message);
      //     return [];
      //   }
      // } catch (e) {
      //   console.error("Request Failed:", e);
      //   return [];
      // }
			
			try {
			  const res = await requestWithToken(
			    `https://seeu-applets.seeu-edu.com/seeuapp/dict/getDictOfType?type=${type}`,
			    "GET",
			    {},
					this.getToken()
			  );
			  if (res.code === 200) {
			    return res.data;
			  } else {
			    console.error("API Error:", res.message);
			    return [];
			  }
			} catch (e) {
			  console.error("Request Failed:", e);
			  return [];
			}
    },
    searchToggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    selectOption(option) {
      this.selectedOption = option;
      this.showDropdown = false;
      this.activeTab =
        option === "按专业" || option === "按学校" ? "study" : "jobs";
      this.resetLoadingState();
    },
    onSearch() {
      this.resetLoadingState();
    },
    selectTab(tab) {
      this.activeTab = tab;
      this.resetLoadingState();
    },
    toggleDropdown(type) {
      this.dropdowns[type] = !this.dropdowns[type];
      for (let key in this.dropdowns) {
        if (key !== type) {
          this.dropdowns[key] = false;
        }
      }
    },
    filterBy(type, value) {
      this.filters[type] = value === "all" ? null : value;
      this.dropdowns[type] = false;
      this.resetLoadingState();
    },
    async fetchJobList() {
      const requestData = {
        major: this.searchQuery,
      };
      // try {
      //   const res = await this.requestWithToken(
      //     `https://seeu-applets.seeu-edu.com/seeuapp/exampleOfJob/listPage?pageNum=${this.jobPageNum}&pageSize=${this.jobPageSize}`,
      //     "POST",
      //     requestData
      //   );
      //   if (res.code === 200) {
      //     const newData = res.data.records;
      //     this.jobList =
      //       this.jobPageNum === 1 ? newData : this.jobList.concat(newData);
      //     this.jobTotal = res.data.total;
      //     this.loading = false;
      //     if (this.jobList.length >= this.jobTotal) {
      //       this.allLoaded = true;
      //     }
      //   } else {
      //     console.error("API Error:", res.message);
      //     this.handleAuthError();
      //   }
      // } catch (e) {
      //   console.error("Request Failed:", e);
      // }
			
			try {
			  const res = await requestWithToken(
			    `https://seeu-applets.seeu-edu.com/seeuapp/exampleOfJob/listPage?pageNum=${this.jobPageNum}&pageSize=${this.jobPageSize}`,
			    "POST",
			    requestData,
					this.getToken()
			  );
			  if (res.code === 200) {
			    const newData = res.data.records;
			    this.jobList =
			      this.jobPageNum === 1 ? newData : this.jobList.concat(newData);
			    this.jobTotal = res.data.total;
			    this.loading = false;
			    if (this.jobList.length >= this.jobTotal) {
			      this.allLoaded = true;
			    }
			  } else {
			    console.error("API Error:", res.message);
			    this.handleAuthError();
			  }
			} catch (e) {
			  console.error("Request Failed:", e);
			}
    },
    async fetchStudyList() {
      const requestData = {
        major: this.searchQuery,
      };
      // try {
      //   const res = await this.requestWithToken(
      //     `https://seeu-applets.seeu-edu.com/seeuapp/exampleOfGraduate/listPage?pageNum=${this.studyPageNum}&pageSize=${this.studyPageSize}`,
      //     "POST",
      //     requestData
      //   );
      //   if (res.code === 200) {
      //     this.studyTotal = res.data.total;
      //     this.studyList =
      //       this.studyPageNum === 1
      //         ? res.data.records
      //         : this.studyList.concat(res.data.records);
      //     this.loading = false;
      //     if (this.studyList.length >= this.studyTotal) {
      //       this.allLoaded = true;
      //     }
      //   } else {
      //     console.error("API Error:", res.message);
      //     this.handleAuthError();
      //   }
      // } catch (e) {
      //   console.error("Request Failed:", e);
      // }
			
			try {
			  const res = await requestWithToken(
			    `https://seeu-applets.seeu-edu.com/seeuapp/exampleOfGraduate/listPage?pageNum=${this.studyPageNum}&pageSize=${this.studyPageSize}`,
			    "POST",
			    requestData,
					this.getToken()
			  );
			  if (res.code === 200) {
			    this.studyTotal = res.data.total;
			    this.studyList =
			      this.studyPageNum === 1
			        ? res.data.records
			        : this.studyList.concat(res.data.records);
			    this.loading = false;
			    if (this.studyList.length >= this.studyTotal) {
			      this.allLoaded = true;
			    }
			  } else {
			    console.error("API Error:", res.message);
			    this.handleAuthError();
			  }
			} catch (e) {
			  console.error("Request Failed:", e);
			}
    },
    handleScrollToLower() {
      if (this.activeTab === "jobs") {
        this.loadMoreJobs();
      } else {
        this.loadMoreStudies();
      }
    },
    loadMoreJobs() {
      if (this.allLoaded || this.loading) return;
      this.jobPageNum += 1;
      this.fetchJobList();
    },
    loadMoreStudies() {
      if (this.allLoaded || this.loading) return;
      this.studyPageNum += 1;
      this.fetchStudyList();
    },
    resetLoadingState() {
      this.loading = false;
      this.allLoaded = false;
      if (this.activeTab === "jobs") {
        this.jobPageNum = 1;
        this.jobList = [];
        this.fetchJobList();
      } else {
        this.studyPageNum = 1;
        this.studyList = [];
        this.fetchStudyList();
      }
    },
    openJobSubpage(major) {
      uni.navigateTo({
        url: `/pages/job_subpage/job_subpage?major=${major}`,
      });
    },
    openStudySubpage(major) {
      uni.navigateTo({
        url: `/pages/study_subpage/study_subpage?major=${major}`,
      });
    },
    handleAuthError() {
      uni.showToast({
        title: "认证失败，请重新登录",
        icon: "none",
        duration: 2000,
        complete() {
          wx.navigateTo({
            url: "/pages/index/index", // Navigate to login page
          });
        },
      });
    },
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
  display: flex;
  align-items: center;
  width: 90%;
  height: 40px;
  background-color: #f2f3f5;
  border-radius: 5px;
  position: relative;
  margin-bottom: 5px;
}

.search-dropdown {
  display: flex;
  align-items: center;
  padding: 0 10px;
  cursor: pointer;
}

.arrow-search {
  margin-left: 5px;
}

.arrow-filter {
  margin-left: -7px;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  left: 0;
  width: 25%;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.dropdown-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.selected {
  color: #4285f4;
}

.search-input {
  flex: 1;
  height: 100%;
  padding: 0 10px;
  border: none;
  outline: none;
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

.filters {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #ddd;
}

.filter {
  position: relative;
  cursor: pointer;
}

.arrow-filter {
  margin-left: -7px;
}

.filter-dropdown-position {
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  list-style: none;
  padding: 5px 0;
  margin: 0;
  width: 100%;
  z-index: 10;
}

.filter-dropdown-item {
  padding: 5px 10px;
  cursor: pointer;
}

.filter-dropdown-item:hover {
  background: #f0f0f0;
}

.selected {
  color: #4285f4;
}

.card-list {
  width: 100%;
  height: 100%; /* Adjust as needed */
  overflow: auto;
}

.loading,
.end-of-data {
  text-align: center;
  padding: 10px;
  color: #888;
}

.card-wrapper {
  margin-bottom: 20px; /* Add margin to make card bigger for testing */
}
</style>

