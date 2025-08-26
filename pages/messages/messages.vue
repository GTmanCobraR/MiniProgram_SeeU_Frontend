<template>
  <view class="container">
    <view class="mianjings">
      <scroll-view class="card-list" scroll-y @scrolltolower="loadMoreData">
        <card
          v-for="(item, index) in displayedData"
          :key="index"
          :title="getType(item.type)"
          :mainMessage="extractContent(item.content)"
					:timeMessage="extractTime(item.pushTime)"
        />
        <view v-if="loading" class="loading">加载中...</view>
        <view v-if="allLoaded" class="end-of-data">已加载全部数据</view>

      </scroll-view>
    </view>

    
  </view>
</template>

<script>
import card from '/components/messageCard.vue';
import filterDropdown from '/components/filterDropdown.vue';
import { requestWithToken, requestWithTokenAndMemberId } from '../../modules/requestUtils';

export default {
  components: {
    card,
    filterDropdown,
  },
  data() {
    return {
     
      
      
      endQuery: true,
      displayedData: [], // To store the data to be displayed
      allData: [],
      pageNum: 1, // Initial page number
      pageSize: 50, // Page size
      totalData: 0, // Total number of data items available
      loading: false, // Loading state
      allLoaded: false, // All data loaded state
    };
  },
  methods: {
    
    getToken() {
      try {
        const res = uni.getStorageSync('Hannatoken');
        return res;
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
      // return postType === '1' ? '实习' : '全职';
	  
			switch(postType){
				case '1':
					return '课程';
				case '2':
					return '面经';
				case '3':
					return '案例';
				case '4':
					return '预约'
			}
    },
    async fetchData(pageNum, pageSize) {
      this.loading = true;
      const token = this.getToken();
			console.log(`token: ${token}`)
			const memberID = uni.getStorageSync("memberId");
			console.log(`memberId: ${memberID}`);
      
      const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/memberMessage/queryPageListByFacade`;

			const data = {
				"pageSize":this.pageSize,
				"pageNum":this.pageNum
			}
			
	 
			try{
				const res = await requestWithTokenAndMemberId(url, "POST",data,token,memberID);
				console.log(`res from messages.vue:`);
				console.log(res);
				
				// res.data.records.push({
    //       "memberMessageId": "1808711591469776896",
    //       "memberMessageGroupId": "YYTX",
    //       "type": "reserve",
    //       "sourceId": "",
    //       "memberId": "1795685570587918336",
    //       "title": "您的预约已取消",
    //       "content": "<p>取消预约者：<p>取消预约时间：北京时间 2024-09-27 09:00 至 10:00<p>取消预约地址：<a href=\"https://www.seeuedu.com/\">https://www.seeuedu.com/</a></p><p>联系电话：020 8362-7689</p><p>备注：您已成功取消预约《模拟面试》。</p>",
    //       "pushData": null,
    //       "pushTime": "2024-08-29 16:56:30",
    //       "isRead": true,
    //       "isPushWiki": false,
    //       "updateVersion": 1,
    //       "createTime": "2024-08-29 16:56:31",
    //       "updateTime": "2024-08-30 14:21:00"
    //     });
				
				// res.data.records.push({
    //       "memberMessageId": "1808711537424072704",
    //       "memberMessageGroupId": "YYTX",
    //       "type": "reserve",
    //       "sourceId": "",
    //       "memberId": "1795685570587918336",
    //       "title": "您的预约已成功提交",
    //       "content": "<p>预约者：<p>预约时间：北京时间 2024-09-27 09:00 至 10:00<p>预约地址：<a href=\"https://www.seeuedu.com/\">https://www.seeuedu.com/</a></p><p>联系电话：020 8362-7689</p><p>备注：您已成功提交预约《模拟面试》。</p>",
    //       "pushData": null,
    //       "pushTime": "2024-08-29 16:55:39",
    //       "isRead": true,
    //       "isPushWiki": false,
    //       "updateVersion": 1,
    //       "createTime": "2024-08-29 16:55:39",
    //       "updateTime": "2024-08-30 14:21:00"
    //     });
				
				// console.log(res.data.records);
				this.displayedData = res.data.records;
				this.allData = this.displayedData;
				this.loading = false;
				console.log(this.displayedData.length);
			}catch(e){
				console.log(e);
			}
    },
		
		extractContent(content) {
		  const keyword = "您已成功";
		  const startIndex = content.indexOf(keyword);
			const endIndex = content.indexOf("》");
		
		  // Check if the keyword exists
		  if (startIndex !== -1) {
		    // Extract content after "备注："
		    let temp = content.substring(startIndex, endIndex + 1);
				return temp.replace(/<\/?[^>]+(>|$)/g, "").trim();
		  } else {
		    return null;
		  }
		},
		
		extractTime(time){
			return time.substring(0,10);
		},
    loadMoreData() {
      if (this.allLoaded || this.loading) return;

      this.pageNum += 1;
      this.fetchData(this.pageNum, this.pageSize);
    },
    
		navigateToEmpty() {
		  uni.navigateTo({
		    url: `/pages/empty/empty1`,
		  });
		},
		
		getType(type){
			if (type === "reserve"){
				return "预约沟通";
			}
			else{
				return "已购资料";
			}
		}
    
  },
  async mounted() {
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
  background-color: #F2F3F5;
}

.mianjings {
  width: 100%;
  overflow: hidden; /* Ensure the container does not scroll */
}

.card-list {
  height: 95%; /* Make sure scroll-view takes up full height of parent */
  overflow-y: scroll; /* Enable vertical scrolling */
	width:100%;
}

.loading,
.end-of-data {
  text-align: center;
  padding: 10px;
  color: #888;
}
</style>