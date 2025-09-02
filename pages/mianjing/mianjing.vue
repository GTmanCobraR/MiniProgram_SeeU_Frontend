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
      <input class="search-input" type="text" placeholder="搜索面经资料" v-model="searchQuery" @confirm="onSearch"/>
      <button class="search-button" @tap="onSearch">
        <uni-icons type="search" color="#ffffff" size="25"/>
      </button>
    </view>
	
	<!-- Tabs 求职 申研 -->
    <view class="tabs">
      <view class="tab" :class="{ active: activeTab === 'jobs' }" @tap="selectTab('jobs')">求职</view>
      <view class="tab" :class="{ active: activeTab === 'study' }" @tap="selectTab('study')">申研</view>
    </view>
	
	<!-- Filters Part -->
	<!-- Filters for 求职 -->
	<view v-if="activeTab === 'jobs'" class="filters">
	  <view class="filter" @tap="toggleDropdown('location')">
		求职地区
		<uni-icons :type="dropdowns.location ? 'up' : 'down'" class="arrow-filter"/>
		<filterDropdown v-if="dropdowns.location" :options="areas_job" :selectedValue="filters.location" @select="filterBy('location', $event)"/>
	  </view>
	  <view class="filter" @tap="toggleDropdown('position')">
		岗位类别
		<uni-icons :type="dropdowns.position ? 'up' : 'down'" class="arrow-filter"/>
		<view v-if="dropdowns.position" class="filter-dropdown-position">
		  <view @tap="filterBy('position', 'all')" :class="{'selected': filters.position === 'all', 'filter-dropdown-item1': true}">全部</view>
		  <view @tap="filterBy('position', '全职')" :class="{'selected': filters.position === '全职', 'filter-dropdown-item1': true}">全职</view>
		  <view @tap="filterBy('position', '实习')" :class="{'selected': filters.position === '实习'}">实习</view>
		</view>
	  </view>
	  <view class="filter" @tap="toggleDropdown('industry')">
		所属行业
		<uni-icons :type="dropdowns.industry ? 'up' : 'down'" class="arrow-filter"/>
		<FilterDropdown v-if="dropdowns.industry" :options="industries" :selectedValue="filters.industry" @select="filterBy('industry', $event)"/>
	  </view>
	</view>
	
	<!-- Filters for 申研 -->
	<view v-if="activeTab === 'study'" class="filters">
	  <view class="filter" @tap="toggleDropdown('studyLocation')">
		申研地区
		<uni-icons :type="dropdowns.studyLocation ? 'up' : 'down'" class="arrow-filter"/>
		<FilterDropdown v-if="dropdowns.studyLocation" :options="areas_graduate" :selectedValue="filters.studyLocation" @select="filterBy('studyLocation', $event)"/>
	  </view>
	  <view class="filter" @tap="toggleDropdown('university')">
		所属院校
		<uni-icons :type="dropdowns.university ? 'up' : 'down'" class="arrow-filter"/>
		<!-- Add dropdown content here -->
		<filterDropdown
	      v-if="dropdowns.university"
	      :options="universityOptions"
	      :selectedValue="filters.university"
	      @select="filterBy('university', $event)"
	    />
	  </view>
	  <view class="filter" @tap="toggleDropdown('major')">
		所属专业
		<uni-icons :type="dropdowns.major ? 'up' : 'down'" class="arrow-filter"/>
		<FilterDropdown v-if="dropdowns.major" :options="majors" :selectedValue="filters.major" @select="filterBy('major', $event)"/>
	  </view>
	</view>
	
	
	<!-- 面经s Main Content (Scrollable)-->
	<!-- 求职面经 -->
	<view v-if="activeTab === 'jobs' && endQuery" class="mianjings">
	  <scroll-view class="card-list" scroll-y @scrolltolower="loadMoreData">
		<card
		  v-for="(item, index) in displayedData"
		  :key="index"
		  :image="item.interviewImgUrl"
		  :title="item.company"
		  :subtitle="fitstr(item.post)"
		  :tag="getTag(item.postType)"
		  :views="item.views"
		  :file="item.id"
		  @open-pdf="navigateToPdfViewer(item.remarks)"
		/>
		<view v-if="loading" class="loading">加载中...</view>
		<view v-if="allLoaded" class="end-of-data">已加载全部数据</view>
	  </scroll-view>
	</view>
	
	<!-- 考研面经 -->
	<view v-if="activeTab === 'study' && endQuery" class="mianjings">
		<scroll-view class="card-list" scroll-y @scrolltolower="loadMoreData">
		  <card
			v-for="(item, index) in displayedData"
			:key="index"
			:image="item.interviewImgUrl"
			:title="fitstr(item.college)"
			:subtitle="fitstr(item.major)"
			:views="item.views"
			:file="item.id"
			@open-pdf="navigateToPdfViewer(item.remarks)"
		  />
		  <view v-if="loading" class="loading">加载中...</view>
		  <view v-if="allLoaded" class="end-of-data">已加载全部数据</view>
		</scroll-view>
	</view>
	
	<!-- Search Results -->
	<view v-if="searchResults.length === 0 && !endQuery">
		<view class="end-of-data">无相关数据</view>
	</view>
	<view v-if="searchResults.length > 0 && !endQuery" class="mianjings">
	  <scroll-view class="card-list" scroll-y>
		<card v-if="this.activeTab === 'jobs'"
		  v-for="(item, index) in searchResults"
		  :key="index"
		  :image="item.interviewImgUrl"
		  :title="item.company"
		  :subtitle="fitstr(item.post)"
		  :tag="getTag(item.postType)"
		  :views="item.views"
		  :file="item.id"
		  @open-pdf="navigateToPdfViewer(item.remarks)"
		/>
		<card v-if="this.activeTab === 'study'"
			v-for="(item, index) in searchResults"
			:key="index"
			:image="item.interviewImgUrl"
			:title="fitstr(item.college)"
			:subtitle="fitstr(item.major)"
			:views="item.views"
			:file="item.id"
			@open-pdf="navigateToPdfViewer(item.remarks)"
		/>
	  </scroll-view>
	</view>
	
	
    
  </view>
</template>

<script>
import card from '/components/card.vue';
import filterDropdown from '/components/filterDropdown.vue';
import { requestWithToken, requestWithoutToken } from '@/modules/requestUtils.js';


export default {
  components: {
	card,
	filterDropdown
  },
  data() {
    return {
	  universityOptions: [],
      searchQuery: '',
      selectedOption: '按公司',
      options: ['按公司', '按岗位', '按专业', '按学校'],
      showDropdown: false,
      activeTab: 'jobs',
      dropdowns: {
        location: false,
		position: false,
		industry: false,
		studyLocation: false,
		university: false,
		major: false,
      },
      filters: {
        location: null,
		position: null,
		industry: null,
		studyLocation: null,
		university: null,
		major: null,
      },
	  searchResults: [],
	  endQuery: true,
	  displayedData: [], // To store the data to be displayed
	  allData: [],
	  pageNum: 1, // Initial page number
	  pageSize: 50, // Page size
	  totalData: 0, // Total number of data items available
	  loading: false, // Loading state
	  allLoaded: false, // All data loaded state
	  areas_job: [] ,// area_job for filters
	  areas_graduate:[] ,// area_graduate for filters
	  industries: [], // industry for filters
	  majors:[] // major_type for filters
    };
  },
  watch: {
	searchQuery(newVal) {
	  if (newVal === '') {
		  this.endQuery = true
		  this.searchResults = []
	  }
	}
  },
  methods: {
	  // async getTypes(type) {
	  //     try {
	  //       const res = await new Promise((resolve, reject) => {
	  //         uni.request({
	  //           url: `https://seeu-applets.seeu-edu.com/seeuapp/dict/getDictOfType?type=${type}`,
	  //           method: 'GET',
	  //           success: (res) => {
	  //             if (res.data.code === 200) {
	  //               const extracted = res.data.data.map(item => ({
	  //                 label: item.label,
	  //                 value: item.value
	  //               }));
	  //               resolve(extracted);
	  //             } else {
	  //               console.error('GET Type API Error Message:', res.data.message);
	  //               console.error('API Error:', res.data.error);
	  //               reject(res.data.message);
	  //             }
	  //           },
	  //           fail: (err) => {
	  //             console.error('Request Failed:', err);
	  //             reject(err);
	  //           }
	  //         });

	  //       });
			 
					
					
	        
	  //     } catch (error) {
	  //       console.error(error);
	  //       return [];
	  //     }
	  // },
		
		async getTypes(type) {
		  try {
		    const url = `https://seeu-applets.seeu-edu.com/seeuapp/dict/getDictOfType?type=${type}`;
		    const res = await requestWithoutToken(url, 'GET', {}); // Sending an empty object as the `data` field
		
		    if (res.code === 200) {
		      const extracted = res.data.map(item => ({
		        label: item.label,
		        value: item.value
		      }));
		      return extracted;
		    } else {
		      console.error('GET Type API Error Message:', res.message);
		      console.error('API Error:', res.error);
		      return [];
		    }
		  } catch (error) {
		    console.error('Request Failed:', error);
		    return [];
		  }
		},
		
		
		
		
	  getToken() {
			try {
			  const res = uni.getStorageSync('token');
			  return `Bearer ${res}`;
			} catch (e) {
			  this.handleAuthError();
			  throw e;
			}
	  },
	  fitstr(str) {
	      if (!str) return '';
	      if (str.length > 25) {
	        return str.substring(0, 25);
	      }
	      return str;
	    },
	  getTag(postType) {
	        return postType === "1" ? '实习' : '全职';
	  },
	//   fetchData(pageNum, pageSize) {
	// 	this.loading = true;
	// 	const requestData = {
	// 		 // interviewName:"",
	// 	};
	// 	const token = this.getToken();
	// 	// console.log(`token is ${token}`)
	// 	const header = {
	// 		'Authorization': token
	// 	};
	// 	let url = '';
	// 	if (this.activeTab === 'jobs') {
	// 	  url = `https://seeu-applets.seeu-edu.com/seeuapp/interviewOfJob/listPage?pageNum=${pageNum}&pageSize=${pageSize}`;
	// 	} else if (this.activeTab === 'study') {
	// 	  url = `https://seeu-applets.seeu-edu.com/seeuapp/interviewOfGraduate/listPage?pageNum=${pageNum}&pageSize=${pageSize}`;
	// 	}
		
	// 	uni.request({
	// 	  url: url,
	// 	  method: 'POST',
	// 	  header: header,
	// 	  data: requestData,
	// 	  success: (res) => {
	// 		if (res.data.code === 200) {
	// 		  console.log(pageNum,pageSize)
	// 		  const newData = res.data.data.records;
	// 		  console.log(newData)
	// 		  this.displayedData = [...this.displayedData, ...newData];
	// 		  this.allData = this.displayedData;
	// 		  this.totalData = res.data.data.total; // Update the total number of data items
	// 		  this.loading = false;
  
	// 		  if (this.displayedData.length >= this.totalData) {
	// 			this.allLoaded = true;
	// 		  }
	// 		} else {
	// 		  console.error('API Error Message:', res.data.message);
	// 		  console.error('API Error:', res.data.error);
	// 		  this.loading = false;
	// 		  uni.showToast({
	// 			title: `Error: ${res.data.error}`,
	// 			icon: 'none',
	// 			duration: 3000,
	// 			complete: () => {
	// 				setTimeout(() => {
	// 				  uni.switchTab({
	// 					url: '/pages/home/home' // Replace with the actual path to your home page
	// 				  });
	// 				}, 2000); // Navigate after 2 seconds
	// 			}
	// 		  });
	// 		}
	// 	  },
	// 	  fail: (err) => {
	// 		console.error('Request Failed:', err);
	// 		this.loading = false;
	// 	  },
	// 	});

	// },
	
	
	async fetchData(pageNum, pageSize) {
	  this.loading = true;
	  const requestData = {
	    // interviewName:"",
	  };
	  const token = this.getToken();
	  let url = '';
	
	  if (this.activeTab === 'jobs') {
	    url = `https://seeu-applets.seeu-edu.com/seeuapp/interviewOfJob/listPage?pageNum=${pageNum}&pageSize=${pageSize}`;
	  } else if (this.activeTab === 'study') {
	    url = `https://seeu-applets.seeu-edu.com/seeuapp/interviewOfGraduate/listPage?pageNum=${pageNum}&pageSize=${pageSize}`;
	  }
	
	  try {
	    const res = await requestWithToken(url, 'POST', requestData, token);
	
	    if (res.code === 200) {
	      const newData = res.data.records;
	      this.displayedData = [...this.displayedData, ...newData];
	      this.allData = this.displayedData;
	      this.totalData = res.data.total; // Update the total number of data items
	      this.loading = false;
		  this.getUniqueCollegeNames();
	
	      if (this.displayedData.length >= this.totalData) {
	        this.allLoaded = true;
	      }
	    } else {
	      console.error('API Error Message:', res.message);
	      console.error('API Error:', res.error);
	      this.loading = false;
	
	      uni.showToast({
	        title: `Error: ${res.error}`,
	        icon: 'none',
	        duration: 3000,
	        complete: () => {
	          setTimeout(() => {
	            uni.switchTab({
	              url: '/pages/home/home', // Replace with the actual path to your home page
	            });
	          }, 2000); // Navigate after 2 seconds
	        },
	      });
	    }
	  } catch (err) {
	    console.error('Request Failed:', err);
	    this.loading = false;
	  }
	},
	
	loadMoreData() {
		if (this.allLoaded || this.loading) return;
  
		this.pageNum += 1;
		this.fetchData(this.pageNum, this.pageSize);
	},
    searchToggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    selectOption(option) {
      this.selectedOption = option;
      this.showDropdown = false;
	  // Switch the activeTab based on selected option
	  if (option === '按专业' || option === '按学校') {
	          this.activeTab = 'study';
	        } else {
	          this.activeTab = 'jobs';
	  }
	  this.resetData();
    },
		
		
  //   onSearch() {
  //     const requestData = {
  //             company: this.selectedOption === '按公司' ? this.searchQuery : '',
		// 	  post: this.selectedOption === '按岗位' ? this.searchQuery : '',
  //             college: this.selectedOption === '按学校' ? this.searchQuery : '',
  //             major: this.selectedOption === '按专业' ? this.searchQuery : ''
  //           }; // body
  //     let url = '';
  //     if (this.activeTab === 'jobs') {
  //       url = `https://seeu-applets.seeu-edu.com/seeuapp/interviewOfJob/listPage?pageNum=1&pageSize=100`;
  //     } else if (this.activeTab === 'study') {
  //       url = `https://seeu-applets.seeu-edu.com/seeuapp/interviewOfGraduate/listPage?pageNum=1&pageSize=100`;
  //     }
		// uni.request({
		//   url: url,
		//   method: 'POST',
		//   data: requestData,
		//   success: (res) => {
		// 	if (res.data.code === 200) {
		// 	  this.searchResults = res.data.data.records;
		// 	  this.endQuery = false
		// 	  console.log(this.searchResults)
		// 	  console.log(this.searchResults.length)
		// 	  console.log('hi')
		// 	} else {
		// 	  console.error('API Error:', res.data.message);
		// 	}
		//   },
		//   fail: (err) => {
		// 	console.error('Request Failed:', err);
		//   }
		// });
  //   },
	
	
	async onSearch() {
	  const requestData = {
	    company: this.selectedOption === '按公司' ? this.searchQuery : '',
	    post: this.selectedOption === '按岗位' ? this.searchQuery : '',
	    college: this.selectedOption === '按学校' ? this.searchQuery : '',
	    major: this.selectedOption === '按专业' ? this.searchQuery : ''
	  }; // body
	  
	  let url = '';
	  if (this.activeTab === 'jobs') {
	    url = `https://seeu-applets.seeu-edu.com/seeuapp/interviewOfJob/listPage?pageNum=1&pageSize=100`;
	  } else if (this.activeTab === 'study') {
	    url = `https://seeu-applets.seeu-edu.com/seeuapp/interviewOfGraduate/listPage?pageNum=1&pageSize=100`;
	  }
	
	  const token = this.getToken(); // Fetch the token
	
	  try {
	    const res = await requestWithToken(url, 'POST', requestData, token);
	    
	    if (res.code === 200) {
	      this.searchResults = res.data.records;
	      this.endQuery = false;
		  this.getUniqueCollegeNames();
	      console.log(this.searchResults);
	      console.log(this.searchResults.length);
	      console.log('hi');
	    } else {
	      console.error('API Error:', res.message);
	    }
	  } catch (err) {
	    console.error('Request Failed:', err);
	  }
	},
    selectTab(tab) {
      this.activeTab = tab;
	  this.resetData(); // Fetch new data when tab is changed
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
        if (this.filters[type] === value || value === 'all') {
          this.filters[type] = null; // Cancel filter
		  this.resetData();
        }else {
            this.filters[type] = value;
			console.log(this.filters[type])
			this.applyFilters();
        }
    },
    applyFilters() {
        this.displayedData = this.allData.filter(item => {
          const matchesPosition = this.filters.position ? this.getTag(item.postType) === this.filters.position : true;
          const matchesLocation = this.filters.location ? item.area === this.filters.location : true;
          const matchesIndustry = this.filters.industry ? item.industry === this.filters.industry : true;
          const matchesStudyLocation = this.filters.studyLocation ? item.area === this.filters.studyLocation : true;
          const matchesMajor = this.filters.major ? item.majorType === this.filters.major : true;
		  const matchesUniversity = this.filters.university ? item.college === this.filters.university : true;
           return matchesPosition && matchesLocation && matchesIndustry && matchesStudyLocation && matchesMajor && matchesUniversity;
        });
      },
	navigateToPdfViewer(filePath) {
	  uni.navigateTo({
		url: `/pages/pdf-viewer/pdf-viewer?filePath=${encodeURIComponent(filePath)}`
	  });
	},
	resetData() {
	    this.pageNum = 1;
	    this.displayedData = [];
		this.allData = [];
	    this.allLoaded = false;
		this.loading = true;
	    this.fetchData(this.pageNum, this.pageSize);
		console.log(this.allData);
	},
	getUniqueCollegeNames() {
	  const allItems = [...this.displayedData, ...this.searchResults];
	  const collegeNames = allItems
	    .map(item => item.college?.trim())
	    .filter(name => !!name);
	
	  const uniqueColleges = Array.from(new Set(collegeNames)).sort();
	
	  this.universityOptions = [{ label: "全部", value: "all" }]
	    .concat(uniqueColleges.map(name => ({ label: name, value: name })));
	
	  console.log('🎓 Unique School Names:', this.universityOptions);
	},
  },
  async mounted() {
	  this.areas_job = [{label: "全部", value: "all"}].concat(await this.getTypes('area_job'));
	  this.areas_graduate = [{label: "全部", value: "all"}].concat(await this.getTypes('area_graduate'));
	  this.industries = [{label: "全部", value: "all"}].concat(await this.getTypes('industry'));
      this.majors = [{label: "全部", value: "all"}].concat(await this.getTypes('major_type'));
      this.fetchData(this.pageNum, this.pageSize);
    },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  height: 100vh;
  overflow: hidden; /* Prevent the whole page from scrolling */
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
  /* border-bottom: 1px solid #ddd; */
  width: 80%;
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
  width: 90%;
  border-top: 1px solid #ddd;
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
  left: -10%;
  background: #ffffff;
  list-style: none;
  padding: 5px 0;
  margin: 0;
  width: 120%;
  border: 1px solid #ccc;
  border-radius: 5px;
  z-index: 10; /* place filter's dropdown above other elements*/
}

.filter-dropdown-position view {
  padding: 5px 10px;
  cursor: pointer;
}

.filter-dropdown-position view:hover {
  background: #f0f0f0;
}

.filter-dropdown-item1{
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
	/* margin: 0; */
	width: 95%;
	overflow: hidden; /* Ensure the container does not scroll */
}

.card-list {
  height: 100%; /* Make sure scroll-view takes up full height of parent */
  overflow-y: scroll; /* Enable vertical scrolling */
}

.loading,
.end-of-data {
  text-align: center;
  padding: 10px;
  color: #888;
}

</style>