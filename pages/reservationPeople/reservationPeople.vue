<template>
  <view class="container">
    <view class="mianjings">
      <scroll-view class="card-list" scroll-y>
        <card
          v-for="(item, index) in displayedData"
          :key="index"
          :image="item.image"
          :title="item.teacherName"
          :subtitle="item.motto"
          :tag="getTag(item.postType)"
          @start-reserve="navigateToReservation(item)"
        />
				
        <view v-if="loading" class="loading">加载中...</view>
        <view v-if="allLoaded" class="end-of-data">已加载全部数据</view>
				
      </scroll-view>
    </view>
  </view>
</template>

<script>
import card from '/components/reservationPeopleCard.vue';
import filterDropdown from '/components/filterDropdown.vue';
import { requestWithTokenAndMemberId, getToken,getMemberId } from '../../modules/requestUtils';

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
			memberLevelId:null,
      
    };
  },
  methods: {
    fitstr(str) {
      if (!str) return '';
      if (str.length > 25) {
        return str.substring(0, 25);
      }
      return str;
    },
    getTag(postType) {
      // return postType === '1' ? '实习' : '全职';
	  
			return '预约';
	  },
    async fetchData(pageNum, pageSize) {
			console.log("fetchData() triggered")
      this.loading = true;
      const token = getToken();
      console.log(`token: ${token}`)
      const memberID = getMemberId();
      console.log(`memberId: ${memberID}`);
      
      const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/appointmentBase/teacherPageList`;
      
      const data = {
      	"pageSize":this.pageSize,
      	"pageNum":this.pageNum,
				"isEnable": true,
      }
      
	  
			try{
				const res = await requestWithTokenAndMemberId(url, "POST",data,token,memberID);
				console.log(res);
				
				
				console.log(res.data.records);
				this.displayedData = res.data.records;
				this.allData = this.displayedData;
				this.loading = false;
				console.log(this.displayedData.length);
			}catch(e){
				console.log(e);
			}
	  
	  
	  
	  // this.displayedData = testData;
	  // this.allData = this.displayedData;
	  // this.loading = false;
	  // console.log(this.displayedData.length);
	  
	  
    },
    loadMoreData() {
      if (this.allLoaded || this.loading) return;

      this.pageNum += 1;
      this.fetchData(this.pageNum, this.pageSize);
    },
    
		navigateToReservation(item) {
			console.log("navigation to reservation triggered");
			
			console.log(this.memberLevelId);
			
			if (this.memberLevelId === "1760452581253971968"){
				uni.showModal({
				  title: '预约失败', // Title of the modal
				  content: '尚未加入西游VIP，暂无此服务', // Message to display
				  showCancel: false, // Only show the confirm button
				  confirmText: '确定', // Text of the confirm button
				  success: function (res) {
				    if (res.confirm) {
				      uni.navigateBack(); // Go back to the previous page when "确定" is clicked
				    }
				  }
				});
			}
			else{
				const today = new Date();
				uni.navigateTo({
				  url: `/pages/reservation/reservation?teacherId=${encodeURIComponent(item.teacherId)}&currentYear=${today.getFullYear()}&currentMonth=${today.getMonth()}`,
				});
			}
			
			
			
			
		},
		async checkSignedMember(){
			const token = getToken();
			const memberID = getMemberId();
			
			const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/memberBase/queryByFacade`;
			
			const data = {
			};
			
			try {
			  const res = await requestWithTokenAndMemberId(url, 'POST', data, token, memberID);
			  
				console.log("check signed member response");
				console.log(res);
				
				this.memberLevelId = res.data.memberLevelId;
				
			  console.log(this.memberLevelId);
			
			  
			} catch (e) {
			  console.log(e);
			}
		}
  },
  async mounted() {
    
    this.fetchData(this.pageNum, this.pageSize);
		this.checkSignedMember();
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
  width: 95%;
	/* flex-grow: 1; */
  overflow: hidden; /* Ensure the container does not scroll */
}

.card-list {
  height: 95%; /* Make sure scroll-view takes up full height of parent */
  overflow-y: scroll; /* Enable vertical scrolling */
}

.loading,
.end-of-data {
  text-align: center;
  padding: 10px;
  color: #888;
}
</style>