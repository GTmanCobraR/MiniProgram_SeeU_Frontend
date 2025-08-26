<template>
  <view class="container">
    <view class="search-bar">
      <view class="search-dropdown" @tap="searchToggleDropdown">
        <text>{{ selectedOption }}</text>
        <uni-icons :type="showDropdown ? 'up' : 'down'" class="arrow-search"/>
      </view>
      <view v-if="showDropdown" class="dropdown-menu">
        <view v-for="(option, index) in options" :key="index" class="dropdown-item" @tap="selectOption(option)">
          <text :class="{'selected': option === selectedOption}">{{ option }}</text>
        </view>
      </view>
      <input class="search-input" type="text" placeholder="搜索案例资料" v-model="searchQuery" />
      <button class="search-button" @tap="onSearch">
        <uni-icons type="search" color="#ffffff" size="25"/>
      </button>
    </view>
    
    <view class="tabs">
      <view class="tab" :class="{ active: activeTab === 'jobs' }" @tap="selectTab('jobs')">求职</view>
      <view class="tab" :class="{ active: activeTab === 'study' }" @tap="selectTab('study')">申研</view>
    </view>

    <view v-if="activeTab === 'jobs'" class="filters">
      <view class="filter" @tap="toggleDropdown('location')">求职地域
        <uni-icons :type="dropdowns.location ? 'up' : 'down'" class="arrow-filter"/>
      </view>
      <view class="filter" @tap="toggleDropdown('position')">岗位类别
        <uni-icons :type="dropdowns.position ? 'up' : 'down'" class="arrow-filter"/>
        <view v-if="dropdowns.position" class="filter-dropdown-position">
          <view @tap="filterBy('position', '全职')" :class="{'selected': filters.position === '全职', 'filter-dropdown-item1': true}">全职</view>
          <view @tap="filterBy('position', '实习')" :class="{'selected': filters.position === '实习'}">实习</view>
        </view>
      </view>
    </view>

    <view v-if="activeTab === 'study'" class="filters">
      <view class="filter" @tap="toggleDropdown('studyLocation')">申研地域
        <uni-icons :type="dropdowns.studyLocation ? 'up' : 'down'" class="arrow-filter"/>
      </view>
      <view class="filter" @tap="toggleDropdown('university')">所属院校
        <uni-icons :type="dropdowns.university ? 'up' : 'down'" class="arrow-filter"/>
      </view>
      <view class="filter" @tap="toggleDropdown('major')">所属专业
        <uni-icons :type="dropdowns.major ? 'up' : 'down'" class="arrow-filter"/>
      </view>
    </view>

    <!-- Job List -->
    <view v-if="activeTab === 'jobs' && jobList.length > 0" class="mianjings">
      <scroll-view class="card-list" scroll-y lower-threshold="20" @scrolltolower="loadMoreJobs">
        <card v-for="(item, index) in jobList" :key="index" :image="item.image" :title="item.major" :views="item.views" @tap="openSubpage(item.major, 'jobs')"/>
      </scroll-view>
    </view>
    
    <!-- Study List -->
    <view v-if="activeTab === 'study' && studyList.length > 0" class="mianjings">
      <scroll-view class="card-list" scroll-y lower-threshold="20" @scrolltolower="loadMoreStudies">
        <card v-for="(item, index) in studyList" :key="index" :image="item.image" :title="item.major" :views="item.views" @tap="openSubpage(item.major, 'study')"/>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import card from '/components/card.vue';

export default {
  components: { card },
  data() {
    return {
      searchQuery: '',
      selectedOption: '按公司',
      options: ['按公司', '按岗位', '按专业', '按学校'],
      showDropdown: false,
      activeTab: 'jobs',
      dropdowns: { location: false, position: false, studyLocation: false, university: false, major: false },
      filters: { location: null, position: null, studyLocation: null, university: null, major: null },
      jobList: [],
      studyList: [],
      jobPageNum: 1,
      jobPageSize: 2,
      studyPageNum: 1,
      studyPageSize: 2,
      jobHasMore: true,
      studyHasMore: true,
    };
  },
  created() {
    this.fetchJobList();
    this.fetchStudyList();
  },
  methods: {
    searchToggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    selectOption(option) {
      this.selectedOption = option;
      this.showDropdown = false;
      this.activeTab = option === '按专业' || option === '按学校' ? 'study' : 'jobs';
    },
    onSearch() {
      if (this.activeTab === 'jobs') {
        this.jobPageNum = 1;
        this.jobList = [];
        this.jobHasMore = true;
        this.fetchJobList();
      } else {
        this.studyPageNum = 1;
        this.studyList = [];
        this.studyHasMore = true;
        this.fetchStudyList();
      }
    },
    selectTab(tab) {
      this.activeTab = tab;
      if (tab === 'jobs') {
        this.jobPageNum = 1;
        this.jobList = [];
        this.jobHasMore = true;
        this.fetchJobList();
      } else {
        this.studyPageNum = 1;
        this.studyList = [];
        this.studyHasMore = true;
        this.fetchStudyList();
      }
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
      this.filters[type] = value === 'all' ? null : value;
      this.dropdowns[type] = false;
    },
    openSubpage(major, tab) {
      const page = tab === 'jobs' ? 'job_subpage' : 'study_subpage';
      uni.navigateTo({
        url: `/pages/${page}/${page}?major=${encodeURIComponent(major)}`
      });
    },
    fetchJobList() {
      if (!this.jobHasMore) return;
      const requestData = {
        major: this.searchQuery
      };
      uni.request({
        url: `https://seeu-applets.seeu-edu.com/seeuapp/interviewOfJob/listPage?pageNum=${this.jobPageNum}&pageSize=${this.jobPageSize}`,
        method: 'POST',
        data: requestData,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.data.code === 200) {
            const records = res.data.data.records;
            if (records.length < this.jobPageSize) {
              this.jobHasMore = false;
            }
            this.jobList = this.jobPageNum === 1 ? records : this.jobList.concat(records);
          } else {
            console.error('API Error:', res.data.message);
          }
        },
        fail: (err) => {
          console.error('Request Failed:', err);
        }
      });
    },
    fetchStudyList() {
      if (!this.studyHasMore) return;
      const requestData = {
        major: this.searchQuery
      };
      uni.request({
        url: `https://seeu-applets.seeu-edu.com/seeuapp/exampleOfGraduate/listPage?pageNum=${this.studyPageNum}&pageSize=${this.studyPageSize}`,
        method: 'POST',
        data: requestData,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.data.code === 200) {
            const records = res.data.data.records;
            if (records.length < this.studyPageSize) {
              this.studyHasMore = false;
            }
            this.studyList = this.studyPageNum === 1 ? records : this.studyList.concat(records);
          } else {
            console.error('API Error:', res.data.message);
          }
        },
        fail: (err) => {
          console.error('Request Failed:', err);
        }
      });
    },
    loadMoreJobs() {
      if (this.jobHasMore) {
        this.jobPageNum += 1;
        this.fetchJobList();
      }
    },
    loadMoreStudies() {
      if (this.studyHasMore) {
        this.studyPageNum += 1;
        this.fetchStudyList();
      }
    }
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
  background-color: #F2F3F5;
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

.filter text {
  margin-left: 5px;
}

.filter text.open {
  transform: rotate(180deg);
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

.filter-dropdown-position view {
  padding: 5px 10px;
  cursor: pointer;
}

.filter-dropdown-position view:hover {
  background: #f0f0f0;
}

.filter-dropdown-item1 {
  border-bottom: 1px solid #eee;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  background-color: #ffffff;
  border-top: 1px solid #ddd;
  padding: 10px 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.nav-item text {
  margin-top: 5px;
  font-size: 12px;
}

.nav-item.active uni-icons,
.nav-item.active text {
  color: #4285f4;
}

.mianjings {
  width: 100%;
  flex: 1;
}

.card-list {
  width: 100%;
}
</style>
