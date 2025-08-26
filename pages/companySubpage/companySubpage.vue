<template>
  <view class="container">
    <!-- Header -->
    <view class="header">
      <text>{{ title }}</text>
    </view>
    
    <!-- Filters -->
    <view class="filters">
      <view class="filter" @tap="toggleDropdown('location')">
        求职地域
        <uni-icons :type="dropdowns.location ? 'up' : 'down'" class="arrow-filter"/>
        <view v-if="dropdowns.location" class="filter-dropdown-long">
          <view @tap="filterBy('location', 'all')" :class="{'selected': filters.location === 'all', 'filter-dropdown-item': true}">院校1</view>
          <view @tap="filterBy('location', 'internship')" :class="{'selected': filters.location === 'internship', 'filter-dropdown-item': true}">院校2</view>
          <view @tap="filterBy('location', 'blank1')" :class="{'selected': filters.location === 'blank1', 'filter-dropdown-item': true}">空白1</view>
          <view @tap="filterBy('location', 'blank2')" :class="{'selected': filters.location === 'blank2', 'filter-dropdown-item': true}">空白2</view>
        </view>
      </view>
      <view class="filter" @tap="toggleDropdown('position')">
        岗位类别
        <uni-icons :type="dropdowns.position ? 'up' : 'down'" class="arrow-filter"/>
        <view v-if="dropdowns.position" class="filter-dropdown-long">
          <view @tap="filterBy('position', 'fulltime')" :class="{'selected': filters.position === 'fulltime', 'filter-dropdown-item1': true}">地域1</view>
          <view @tap="filterBy('position', 'internship')" :class="{'selected': filters.position === 'internship'}">地域2</view>
        </view>
      </view>
    </view>
    
    <!-- List Items -->
    <view class="mianjings">
      <scroll-view class="card-list" scroll-y>
        <card
          v-for="(item, index) in filteredList"
          :key="index"
          :image="item.image"
          :title="item.title"
          :subtitle="item.subtitle"
          :tag="item.tag"
          :views="item.views"
          @tap="openDetail(item)"
        />
      </scroll-view>
    </view>
  </view>
</template>

<script>
import card from '/components/card.vue';
import { companySubList } from '/components/sub.js'; // Adjust the path to where sub.js is located

export default {
  components: {
    card,
  },
  data() {
    return {
      list: companySubList,
      dropdowns: {
        location: false,
        position: false,
      },
      filters: {
        location: null,
        position: null,
      },
    };
  },
  computed: {
    filteredList() {
      return this.list.filter(item => {
        return (
          (this.filters.location === null || item.tag.includes(this.filters.location)) &&
          (this.filters.position === null || item.subtitle.includes(this.filters.position))
        );
      });
    }
  },
  methods: {
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
    openDetail(item) {
      const itemString = encodeURIComponent(JSON.stringify(item));
      uni.navigateTo({
        url: `/pages/companyDetail/companyDetail?item=${itemString}`
      });
    }
  }
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  height: 100vh;
  background-color: #ffffff;
}

.header {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
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

.filter-dropdown-long {
  position: absolute;
  top: 100%;
  left: 0;
  width: 90%; /* Set to longer width */
  background: #ffffff;
  list-style: none;
  padding: 5px 0;
  margin: 0;
  border: 1px solid #ddd;
  z-index: 20;
}

.filter-dropdown-item {
  border-bottom: 1px solid #eee;
}

.filter-dropdown-item1 {
  border-bottom: 1px solid #eee;
}

.mianjings {
  width: 100%;
  flex: 1;
}

.card-list {
  width: 100%;
}
</style>


