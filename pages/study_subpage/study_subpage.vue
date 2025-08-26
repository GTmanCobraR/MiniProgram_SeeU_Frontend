<template>
  <view class="container">
    <!-- 筛选器 -->
    <view class="filters">
      <view class="filter" @tap="toggleDropdown('studyLocation')">
        申研地区
        <uni-icons :type="dropdowns.studyLocation ? 'up' : 'down'" class="arrow-filter" />
        <view v-if="dropdowns.studyLocation" class="filter-dropdown">
          <view
            class="filter-dropdown-item"
            @tap="filterBy('studyLocation', 'all')"
            :class="{ selected: filters.studyLocation === null }"
          >全部</view>
          <view
            v-for="(location, index) in studyLocations"
            :key="index"
            class="filter-dropdown-item"
            @tap="filterBy('studyLocation', location.value)"
            :class="{ selected: filters.studyLocation === location.value }"
          >
            {{ location.label }}
          </view>
        </view>
      </view>
      <view class="filter" @tap="toggleDropdown('major')">
        专业类型
        <uni-icons :type="dropdowns.major ? 'up' : 'down'" class="arrow-filter" />
        <view v-if="dropdowns.major" class="filter-dropdown">
          <view
            class="filter-dropdown-item"
            @tap="filterBy('major', 'all')"
            :class="{ selected: filters.major === null }"
          >全部</view>
          <view
            v-for="(major, index) in majors"
            :key="index"
            class="filter-dropdown-item"
            @tap="filterBy('major', major.value)"
            :class="{ selected: filters.major === major.value }"
          >
            {{ major.label }}
          </view>
        </view>
      </view>
    </view>

    <!-- 研究列表 -->
    <scroll-view class="card-list" scroll-y lower-threshold="20" @scrolltolower="loadMoreStudies">
      <card
        v-for="(item, index) in filteredList"
        :key="index"
        :image="item.exampleImgUrl"
        :title="item.studentName"
        :subtitle="item.majorType"
        :tag="item.area"
        :favorited="item.favorited"
        @toggleFavorite="toggleFavorite(item)"
        @tap="openDetailPage(item.id)"
      />
    </scroll-view>
  </view>
</template>

<script>
import card from '/components/card 2.vue';
import { requestWithToken } from '@/modules/requestUtils.js';


export default {
  components: { card },
  data() {
    return {
      dropdowns: { studyLocation: false, major: false },
      filters: { studyLocation: null, major: null },
      studyList: [],
      pageNum: 1,
      pageSize: 6,
      major: '',
      totalPages: 0,
      jwtToken: '',
      studyLocations: [], // Store fetched study locations
      majors: [], // Store fetched majors
      lastFilter: { type: null, value: null } ,// Track the last selected filter type and value
	  memberId: null,
    };
  },
  computed: {
    filteredList() {
      return this.studyList.filter(item => {
        return (
          (this.filters.studyLocation === null || item.area === this.filters.studyLocation) &&
          (this.filters.major === null || item.major_type === this.filters.major)
        );
      });
    }
  },
  methods: {
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
	/** 检查某条记录是否已被当前用户收藏 */
	async getCollected(memberId, exampleId) {
	  var token = await this.getToken();
	  try {
		const res = await requestWithToken(
		  `https://seeutest.duckdns.org/seeuapp/collection/graduate/check?memberId=${memberId}&exampleId=${exampleId}`,
		  'GET',
		  {},
		  token
		);
		// return res;
		if (res.code === 200) {
		  return res.data;  // true/false
		} else {
		  console.error('API Error:', res.code);
		  return false;
		}
	  } catch (e) {
		console.error('Request Failed:', e);
		return false;
	  }
	},
	 /** 发起收藏 */
	async addCollect(memberId, exampleId) {
	  var token = await this.getToken();
	  try {
		const res = await requestWithToken(
		  `https://seeutest.duckdns.org/seeuapp/collection/graduate?memberId=${memberId}&exampleId=${exampleId}`,
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
	async deleteCollect(memberId, exampleId) {
	  var token = await this.getToken();
	  try {
		const res = await requestWithToken(
		  `https://seeutest.duckdns.org/seeuapp/collection/graduate?memberId=${memberId}&exampleId=${exampleId}`,
		  'DELETE',
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
	
    async getToken() {
      try {
        const res = await uni.getStorageSync('token');
        return `Bearer ${res}`;
      } catch (e) {
        this.handleAuthError();
        throw e;
      }
    },
	async toggleFavorite(item) {
	  if (!item.favorited) {
		const ok = await this.addCollect(this.memberId, item.id);
		if (ok) {
		  item.favorited = true;
		  uni.showToast({ title: '已收藏', icon: 'success' });
		}
	  } else {
		const ok = await this.deleteCollect(this.memberId, item.id);
		if (ok) {
		  item.favorited = false;
		  uni.showToast({ title: '已取消收藏', icon: 'none' });
		}
	  }
	},
    async fetchFilterData(type) {
      try {
        const res = await requestWithToken(
          `https://seeu-applets.seeu-edu.com/seeuapp/dict/getDictOfType?type=${type}`,
          'GET',
          {},
		this.getToken()
        );
        if (res.code === 200) {
          return res.data; // Adjust based on actual API response structure
        } else {
          console.error('API Error:', res.message);
          return [];
        }
      } catch (e) {
        console.error('Request Failed:', e);
        return [];
      }
    },
    async loadFilters() {
      this.studyLocations = await this.fetchFilterData('area_graduate');
      this.majors = await this.fetchFilterData('major_type');
    },
    async fetchStudyList() {
      const requestData = { major: this.major };
      try {
        const res = await requestWithToken(
          `https://seeu-applets.seeu-edu.com/seeuapp/exampleOfGraduate/listPage?pageNum=${this.pageNum}&pageSize=${this.pageSize}`,
          "POST",
          requestData,
          this.getToken()
        );
        if (res.code === 200) {
          // 并行检查收藏状态
          const records = res.data.records;
          // console.log(this.pageNum)
          // console.log(this.pageSize)
          // console.log(records)
          const updatedRecords = await Promise.all(
			records.map(async item => {
			  const isFav = await this.getCollected(this.memberId, item.id);
			  return { ...item, favorited: isFav };
			})
          );
		  
          this.totalPages = Math.ceil(res.data.total / this.pageSize);
          this.studyList = this.pageNum === 1 ? updatedRecords : this.studyList.concat(updatedRecords);
        }
      } catch (e) {
        console.error('fetchStudyList failed', e);
      }
    },
    loadMoreStudies() {
      if (this.pageNum < this.totalPages) {
        this.pageNum += 1;
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
      // Check if the same filter is selected consecutively
      if (this.lastFilter.type === type && this.lastFilter.value === value) {
        // Reset to 'all' if the same option is selected consecutively
        this.filters[type] = null;
      } else {
        this.filters[type] = value === 'all' ? null : value;
      }

      // Update the last filter state
      this.lastFilter.type = type;
      this.lastFilter.value = value;

      // Collapse the dropdown after an option is selected
      this.dropdowns[type] = false;
      this.pageNum = 1;
      this.studyList = [];
      this.fetchStudyList();
    },
    openDetailPage(id) {
      wx.navigateTo({
        url: `/pages/study_detail/study_detail?id=${encodeURIComponent(id)}`
      });
    },
    handleAuthError() {
      uni.showToast({
        title: '认证失败，请重新登录',
        icon: 'none',
        duration: 2000,
        complete() {
          wx.navigateTo({
            url: '/pages/index/index' // 跳转到登录页面
          });
        }
      });
    }
  },
  async onLoad(options) {
	this.memberId = await this.getMemberId();
    await this.loadFilters(); // Load filters data
    if (options.major) {
      this.major = options.major;
      await this.fetchStudyList();
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  height: 100vh;
  background-color: #ffffff;
}

.filters {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  width: 90%;
  border-bottom: 1px solid #ddd;
}
.filter-bottom-border {
  width: 90%;
  border-bottom: 1px solid #ddd;
  margin-bottom: 10px;
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

.arrow-filter {
  margin-left: -7px;
}

.filter-dropdown {
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

.filter-dropdown-item {
  padding: 5px 10px;
  cursor: pointer;
  text-align: left; /* Align text to the left */
  border-bottom: 1px solid #ddd; /* Add horizontal line between items */
}

.filter-dropdown-item:last-child {
  border-bottom: none; /* Remove border for the last item */
}

.filter-dropdown-item:hover {
  background: #f0f0f0;
}

.selected {
  color: #4285f4; /* Change color to indicate selection */
}

.card-list {
  width: 100%;
  overflow-y: auto;
}
</style>
