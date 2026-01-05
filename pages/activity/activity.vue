<template>
  <!-- 顶部日期筛选条已移除 -->

  <!-- ===== ACTIVITY CARD LIST ===== -->
  <scroll-view 
    class="activity-list" 
    scroll-y 
    refresher-enabled="true"
    :refresher-triggered="refreshing"
    @refresherrefresh="onRefresh"
  >
    <block v-for="act in activities" :key="act.id">
      <view class="activity-card" @tap="goToActivity(act)">
        <!-- cover or placeholder -->
        <image
          class="cover"
          :src="act.cover || placeholder"
          mode="aspectFill"
        />
        <!-- textual content -->
        <view class="info">
          <text class="title">{{ act.title }}</text>
          <text class="subtitle">{{ act.subtitle }}</text>
        </view>
      </view>
    </block>
	
      <!-- 前往全部活动蓝色按钮 -->
      <view class="all-activities-button" @tap="goToAllActivities">
        <view class="info">
          <text class="title">查看所有线下活动</text>
        </view>
      </view>
    

    <!-- 管理员按钮组 -->
    <view v-if="showAddActivity || showAddVote" class="bottom-buttons">
      <button
        v-if="showAddActivity"
        class="action-button"
        @tap="goToAddActivity"
      >
        添加活动
      </button>
      <button
        v-if="showAddVote"
        class="action-button"
        @tap="goToAddVote"
      >
        添加投票
      </button>
    </view>

    <!-- 查看历史数据按钮组 -->
    <view v-if="showAddActivity || showAddVote" class="history-buttons">
      <button
        class="history-button"
        @tap="goToAllActivitiesHistory"
      >
        查看所有活动
      </button>
      <button
        class="history-button"
        @tap="goToAllVotes"
      >
        查看所有投票
      </button>
    </view>
	
  </scroll-view>
  
  
</template>

<script>
import { performOfficialAccountJump, performChannelsJump } from '/modules/jumpActions';
import { requestWithToken } from '@/modules/requestUtils.js';
export default {
  name: 'Activity',
  data() {
    return {
      activities: [],
      activitiesDefault: [
        {
          id: 1,
          title: "参与问卷调查",
          // 你模板里用的是 act.cover，所以这里要提供 cover（见下一条）
          cover: '/static/decorations/logo3.png',
          url: '/pages/activity/act1'
        },
        {
          id: 4,
          title: 'SeeU公众号',
          subtitle: '点击查看即可获得10积分',
          time: [],
          cover: '/static/decorations/logo3.png',
        },
        {
          id: 5,
          title: 'SeeU视频号',
          subtitle: '点击查看即可获得10积分',
          time: [],
          cover: '/static/decorations/logo2.png',
        },
        {
          id: 6,
          title: '西游小助手',
          subtitle: '成功添加小助手可获得50积分',
          time: [],
          cover: '/static/decorations/logo1.png',
          url: '/pages/contractServices/addAssistantQRcode' 
        }
      ],
      placeholder: '/static/decorations/logo1.png',
      showAddActivity: false, // placeholder condition
      showAddVote: false,     // placeholder condition
      refreshing: false       // 下拉刷新状态
    };
  },
  async onLoad() {
    const isAdmin = await this.checkAdmin();
	this.showAddActivity = isAdmin;
	this.showAddVote = isAdmin;
  },
  
  async created() {
    await this.loadTodayContent();
    // const isAdmin = await this.checkAdmin();
    // this.showAddActivity = isAdmin;
    // this.showAddVote = isAdmin;
  },

  // 页面显示时重新加载数据
  async onShow() {
    // 只刷新投票数据，不重新加载默认活动
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijingDate = new Date(utc + 8 * 60 * 60000);
    const dateStr = beijingDate.toISOString().split('T')[0];
    await this.loadTodayVotes(dateStr);
  },
  computed: {},
  methods: {
      
  async getToken() {
    try {
      const res = await uni.getStorageSync('token');
      return `Bearer ${res}`;
    } catch (e) {
      this.handleAuthError();
      throw e;
    }
  },  
  
  async checkAdmin(){
          
    var og_email = await uni.getStorageSync('email');
    //
    const token = await this.getToken();
    var email = (og_email || "").trim();
	
    console.log(email);
    if(email === "") 
    {
      return false;
    }
    
    try {
      const res = await requestWithToken(
        `https://seeutest.duckdns.org/seeuapp/admin/check?email=${email}`,
        'POST',
        {},
        token
      );
      if (res.code === 200) {
        console.log(res.data);
        console.log(email);
        return res.data;
      } else {
        console.log(res.code);
        console.log(email);
        console.error('API Error:', res.error);
        return false;
      }
    } catch (e) {
      console.error('Request Failed:', e);
      return false;
    }
    
  },
  
  async loadTodayContent() {
    // 只在第一次加载时清空数组
    if (this.activities.length === 0) {
      this.activities = [];
      
      // 加载默认活动（公众号、视频号、小助手等）
      this.activitiesDefault.forEach(obj => {
        this.activities.push(obj);
      });
    }
		  
    // 加载今日投票
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijingDate = new Date(utc + 8 * 60 * 60000);
    const dateStr = beijingDate.toISOString().split('T')[0];
    await this.loadTodayVotes(dateStr);
  },

  async loadTodayVotes(dateStr) {
    const token = await this.getToken();
    try {
      // fetch votes for date
      const actRes = await requestWithToken(
        `https://seeutest.duckdns.org/seeuapp/admin/signup/load`,
        "GET",
        {date: dateStr},
        token
      );
      if (actRes.code === 200) {
        const list = Array.isArray(actRes.data) ? actRes.data : [];
        
        console.log("原始投票数据:", list);
        
        const mapped = list.map(item => ({
          id: item.voteId ?? item.voteid ?? item.id ?? String(Math.random()),
          title: item.title ?? '',
          subtitle: item.details ?? item.description ?? '',
          time: [],
          url: 'signup'
        }));
        
        console.log("映射后的投票数据:", mapped);
        
        // 移除现有的投票项目（url为'signup'的项目）
        this.activities = this.activities.filter(activity => activity.url !== 'signup');
        
        // 添加新的投票数据
        mapped.forEach(obj => {
            this.activities.push(obj);
        });
        
        console.log("最终活动列表:", this.activities);
        console.log("request successful: ", actRes)
      } else {
        console.error("Job API Error:", actRes);
      }
    } catch (e) {
      console.error("Request Failed:", e);
    }
  },

  goToActivity(act) {
    if (act.id === 4) {
      console.log('onJump.vue: Attempting to perform official account jump...');
      performOfficialAccountJump();
      return;
    } else if (act.id === 5) {
      console.log('onJump.vue: Attempting to perform channels jump...');
      performChannelsJump();
      return;
    } else if (act.id === 1) {
		console.log("jumping to questionaire")
        uni.navigateTo({
          url: act.url
        });
    }
    
    if(act.url === 'signup'){
        
        var signId = act.id;
        console.log(signId);
        var jumpUrl = `../topicVote/topicVote` + `?options=${signId}`;
        console.log(jumpUrl);
        uni.navigateTo({
        url: jumpUrl
        });
        return;
    }
    
    if (act.url) {
		var eventId = act.id;
		console.log(eventId);
		var jumpUrl = act.url + `?options=${eventId}`;
		console.log(jumpUrl);
		  uni.navigateTo({
			url: jumpUrl
		  });
    }
  },

  goToAllActivities() {
    uni.navigateTo({ url: '/pages/offlineEventList/offlineEventList' });
  },

  goToAllActivitiesHistory() {
    uni.navigateTo({ url: '/pages/allActivities/allActivities' });
  },

  goToAllVotes() {
    uni.navigateTo({ url: '/pages/allVotes/allVotes' });
  },

  async goToAddActivity() {
    // placeholder navigation
    console.log("Navigating to Add Activity page...");
    
    const token = await this.getToken(); // if you use auth
    
    const startDate = new Date(0);
    const dateStr = startDate.toISOString().split("T")[0];
    
	const timestamp = Date.now();
	const eventId = `event${timestamp}`;
	
 //    try {
 //    // fetch all available activities from date
 //    const actRes = await requestWithToken(
 //      `https://seeutest.duckdns.org/seeuapp/event/load`,
 //      "GET",
 //      {date: dateStr},
 //      token
 //    );
 //    if (actRes.code === 200) {
 //      const list = Array.isArray(actRes.data) ? actRes.data : [];
      
 //      var nextNum = list.length + 1;
 //      eventId = eventId + nextNum;
      
 //      console.log("request successful: ", actRes)
 //    } else {
 //      console.error("Job API Error:", actRes);
 //    }
 //    } catch (e) {
 //        console.error("Request Failed:", e);
 //    }
    
    const jumpUrl = '../offlineEvent/offlineEvent' + `?options=${eventId}`
    
    uni.navigateTo({
    url: jumpUrl
    });
  },
  async goToAddVote() {
    // 直接跳转到投票创建页面
    console.log("Navigating to Add Vote page...");
    
    // 生成新的投票ID
    const timestamp = Date.now();
    const eventId = `vote${timestamp}`;
    
    const jumpUrl = '../topicVote/topicVote' + `?options=${eventId}&mode=create`
    
    uni.navigateTo({
      url: jumpUrl
    });
  },

  // 下拉刷新处理
  async onRefresh() {
    this.refreshing = true;
    try {
      // 下拉刷新时重新加载所有数据
      this.activities = [];
      this.activitiesDefault.forEach(obj => {
        this.activities.push(obj);
      });
      
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const beijingDate = new Date(utc + 8 * 60 * 60000);
      const dateStr = beijingDate.toISOString().split('T')[0];
      await this.loadTodayVotes(dateStr);
      
      uni.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      });
    } catch (error) {
      console.error('刷新失败:', error);
      uni.showToast({
        title: '刷新失败',
        icon: 'none',
        duration: 1000
      });
    } finally {
      this.refreshing = false;
    }
  }
  }
};
</script>

<style scoped>
/* ================= CALENDAR STRIP STYLES ================= */
.calendar-wrapper {
  width: 100%;
  padding: 0 24rpx;
  box-sizing: border-box;
}
.date-strip-horizontal {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  padding: 16rpx 0;
  background: #fff;
}
.date-tile {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  width: 96rpx;
  height: 96rpx;
  margin-right: 12rpx;
  border-radius: 8rpx;
  background: #f0f0f0;
  color: #333;
}
.date-tile:last-child {
  margin-right: 0;
}
.date-tile.active {
  background: #1e88ff;
  color: #fff;
}
.weekday {
  font-size: 24rpx;
  line-height: 1;
}
.day-number {
  font-size: 32rpx;
  font-weight: bold;
  line-height: 1;
}

/* ================= ACTIVITY CARD LIST STYLES ================= */
.activity-list {
  padding: 24rpx;
}
.activity-card {
  display: flex;
  flex-direction: row;
  width: 100%;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}
.cover {
  width: 160rpx;
  height: 160rpx;
  background: #e0e0e0;
  flex-shrink: 0;
}
.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24rpx;
  flex: 1;
}
.title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}
.subtitle {
  font-size: 24rpx;
  color: #888;
}

/* Bottom buttons fixed at the bottom */
.bottom-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 24rpx;
  padding-right: 64rpx;
  background: #fff;
  box-shadow: 0 -2rpx 8rpx rgba(0,0,0,0.06);
}

.action-button {
  flex: 1;
  margin: 0 12rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  background-color: #1e88ff;
  color: #fff;
  font-size: 30rpx;
  text-align: center;
}

/* History buttons */
.history-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 24rpx;
  padding-right: 64rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.history-button {
  flex: 1;
  margin: 0 12rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background-color: #34c759;
  color: #fff;
  font-size: 28rpx;
  text-align: center;
}

/* 前往全部活动蓝色按钮 */
.all-activities-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 660rpx;         /* 宽度改大 */
  height: 100rpx;        /* 高度改大 */
  border-radius: 12rpx;
  padding: 24rpx;
  gap: 8rpx;

  background-color: #296AEF;
  margin: 0 0 24rpx 5rpx;  /* 水平居中 */
}

.all-activities-button .title {
  font-family: "PingFang SC", sans-serif;
  font-weight: 700;       /* Medium */
  font-size: 18px;        /* 20px ≈ 40rpx */
  line-height: 22px;      /* 22px ≈ 44rpx */
  letter-spacing: 0; 
  text-align: center;     /* 居中 */
  vertical-align: middle;
  color: #fff;
}

</style>
