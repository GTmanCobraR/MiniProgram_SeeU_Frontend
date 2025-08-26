<template>
  <view class="container">
    <!-- Filters -->
    <view class="filters">
      <view class="filter" @tap="toggleDropdown('location')">
        求职地区
        <uni-icons :type="dropdowns.location ? 'up' : 'down'" class="arrow-filter" />
        <view v-if="dropdowns.location" class="filter-dropdown">
          <view
            @tap="filterBy('location', 'all')"
            :class="{ selected: filters.location === null, 'filter-dropdown-item': true }"
          >全部</view>
          <view
            v-for="(location, index) in jobLocations"
            :key="index"
            @tap="filterBy('location', location.value)"
            :class="{ selected: filters.location === location.value, 'filter-dropdown-item': true }"
          >
            {{ location.label }}
          </view>
        </view>
      </view>
      <view class="filter" @tap="toggleDropdown('industry')">
        所属行业
        <uni-icons :type="dropdowns.industry ? 'up' : 'down'" class="arrow-filter" />
        <view v-if="dropdowns.industry" class="filter-dropdown">
          <view
            @tap="filterBy('industry', 'all')"
            :class="{ selected: filters.industry === null, 'filter-dropdown-item': true }"
          >全部</view>
          <view
            v-for="(industry, index) in industries"
            :key="index"
            @tap="filterBy('industry', industry.value)"
            :class="{ selected: filters.industry === industry.value, 'filter-dropdown-item': true }"
          >
            {{ industry.label }}
          </view>
        </view>
      </view>
      <view class="filter" @tap="toggleDropdown('position')">
        岗位类别
        <uni-icons :type="dropdowns.position ? 'up' : 'down'" class="arrow-filter" />
        <view v-if="dropdowns.position" class="filter-dropdown">
          <view
            @tap="filterBy('position', 'all')"
            :class="{ selected: filters.position === null, 'filter-dropdown-item': true }"
          >全部</view>
          <view
            @tap="filterBy('position', '1')"
            :class="{ selected: filters.position === '1', 'filter-dropdown-item': true }"
          >实习</view>
          <view
            @tap="filterBy('position', '2')"
            :class="{ selected: filters.position === '2', 'filter-dropdown-item': true }"
          >全职</view>
        </view>
      </view>
    </view>

    <!-- Job List -->
    <scroll-view
      class="card-list"
      scroll-y
      lower-threshold="20"
      @scrolltolower="loadMoreJobs"
    >
      <card
        v-for="(item, index) in filteredList"
        :key="index"
        :image="item.exampleImgUrl"
        :title="item.studentName"
        :subtitle="item.post"
        :tag="item.postType === '1' ? '实习' : '全职'"
        :favorited="item.favorited"
        @toggleFavorite="toggleFavorite(item)"
        @tap="openDetailPage(item.id)"
      />
    </scroll-view>
  </view>
</template>

<script>
import card from '../../components/card 2.vue';
import { requestWithToken } from '@/modules/requestUtils.js';

export default {
  components: { card },
  data() {
    return {
      dropdowns: { location: false, position: false, industry: false },
      filters: { location: null, position: null, industry: null },
      jobList: [],
      pageNum: 1,
      pageSize: 6,
      major: '',
      totalPages: 0,
      jobLocations: [],
      industries: [],
      lastFilter: { type: null, value: null },
	  // new for member Id
	  memberId: null,
    };
  },
  computed: {
    filteredList() {
      return this.jobList.filter((item) => {
        return (
          (this.filters.location === null || item.area === this.filters.location) &&
          (this.filters.industry === null || item.industry === this.filters.industry) &&
          (this.filters.position === null || item.postType === this.filters.position)
        );
      });
    },
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
		  `https://seeutest.duckdns.org/seeuapp/collection/job/check?memberId=${memberId}&exampleId=${exampleId}`,
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
		  `https://seeutest.duckdns.org/seeuapp/collection/job?memberId=${memberId}&exampleId=${exampleId}`,
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
		  `https://seeutest.duckdns.org/seeuapp/collection/job?memberId=${memberId}&exampleId=${exampleId}`,
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
        return res.code === 200 ? res.data : [];
      } catch (e) {
        return [];
      }
    },
    async loadFilters() {
      this.jobLocations = await this.fetchFilterData('area_job');
      this.industries = await this.fetchFilterData('industry');
    },
    async fetchJobList() {
      const requestData = { major: this.major };
      try {
        const res = await requestWithToken(
          `https://seeu-applets.seeu-edu.com/seeuapp/exampleOfJob/listPage?pageNum=${this.pageNum}&pageSize=${this.pageSize}`,
          "POST",
          requestData,
          this.getToken()
        );
        if (res.code === 200) {
		  // 并行检查收藏状态
		  const records = res.data.records;
		  console.log(this.pageNum)
		  console.log(this.pageSize)
		  // console.log(records)
		  const updated = await Promise.all(
			records.map(async item => {
			  const isFav = await this.getCollected(this.memberId, item.id);
			  return { ...item, favorited: isFav };
			})
		  );
		  this.totalPages = Math.ceil(res.data.total / this.pageSize);
		  this.jobList = this.pageNum === 1
			? updated
			: this.jobList.concat(updated);
		}
      } catch (e) {
        console.error('fetchJobList failed', e);
      }
    },
    loadMoreJobs() {
      if (this.pageNum < this.totalPages) {
        this.pageNum += 1;
        this.fetchJobList();
      }
    },
    toggleDropdown(type) {
      this.dropdowns[type] = !this.dropdowns[type];
      for (let key in this.dropdowns) {
        if (key !== type) this.dropdowns[key] = false;
      }
    },
    filterBy(type, value) {
      if (this.lastFilter.type === type && this.lastFilter.value === value) {
        this.filters[type] = null;
      } else {
        this.filters[type] = value === 'all' ? null : value;
      }
      this.lastFilter = { type, value };
      this.dropdowns[type] = false;
      this.pageNum = 1;
      this.jobList = [];
      this.fetchJobList();
    },
    openDetailPage(id) {
      wx.navigateTo({ url: `/pages/job_detail/job_detail?id=${encodeURIComponent(id)}` });
    },
    handleAuthError() {
      uni.showToast({
        title: '认证失败，请重新登录',
        icon: 'none',
        duration: 2000,
        complete() {
          wx.navigateTo({ url: '/pages/index/index' });
        },
      });
    },
	
  },
  async onLoad(options) {
	this.memberId = await this.getMemberId();
    await this.loadFilters();
    if (options.major) {
      this.major = options.major;
      await this.fetchJobList();
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