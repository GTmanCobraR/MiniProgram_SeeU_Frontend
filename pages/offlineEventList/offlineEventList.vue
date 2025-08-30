<template>
  <view>
    <!-- ===== CALENDAR STRIP (today + next 6 days) ===== -->
    <view class="calendar-wrapper">
      <scroll-view class="date-strip-horizontal" scroll-x :show-scrollbar="false">
        <view
          v-for="(day, i) in days"
          :key="i"
          class="date-tile"
          :class="{ active: i === selected }"
          @tap="select(i)"
        >
          <text class="weekday">{{ day.weekday }}</text>
          <text class="day-number">{{ day.date.getDate() }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 🌍 Floating planet + IP image -->
    <image class="planet" src="/static/decorations/planet.png" mode="aspectFit" />
    <image class="ip" src="/static/decorations/IP.png" mode="aspectFit" />

    <!-- ✨ Stars around IP -->
    <image class="star star-left" src="/static/decorations/star.png" mode="aspectFit" />
    <image class="star star1" src="/static/decorations/star1.png" mode="aspectFit" />
    <image class="star star2" src="/static/decorations/star2.png" mode="aspectFit" />

    <!-- 仅显示活动列表 -->
    <view class="activity-list">
      <block v-for="act in activities" :key="act.id">
        <view class="activity-card" @tap="goToActivity(act)">
          <image class="cover" :src="act.cover || placeholder" mode="aspectFill" />
          <view class="info">
            <text class="title">{{ act.title }}</text>
            <text class="subtitle">{{ act.subtitle }}</text>
          </view>
        </view>
      </block>
    </view>
  </view>
</template>

<script>
import { requestWithToken } from '@/modules/requestUtils.js';
export default {
  name: 'OfflineEventList',
  data() {
    return {
      selected: 0,
      days: [],
      activities: [],
      loading: false,
      refreshing: false,
      placeholder: '/static/decorations/logo1.png'
    };
  },
  async created() {
    this.buildDays();
    this.select(0);
  },
  methods: {
    async getToken() {
      try {
        const res = await uni.getStorageSync('token');
        return `Bearer ${res}`;
      } catch (e) {
        throw e;
      }
    },

    buildDays() {
      const today = new Date();
      const weekdayMap = ['日', '一', '二', '三', '四', '五', '六'];
      for (let i = 0; i < 7; i += 1) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        this.days.push({ date, weekday: weekdayMap[date.getDay()] });
      }
    },

    async select(index) {
      this.selected = index;
      this.activities = [];

      const clicked = this.days[index]?.date || new Date();
      const utc = clicked.getTime() + clicked.getTimezoneOffset() * 60000;
      const beijingDate = new Date(utc + 8 * 60 * 60000);
      const dateStr = beijingDate.toISOString().split('T')[0];
      await this.fetchActivities(dateStr);
    },

    async fetchActivities(dateStr) {
      const token = await this.getToken();
      try {
        const actRes = await requestWithToken(
          `https://seeutest.duckdns.org/seeuapp/event/load`,
          'GET',
          { date: dateStr },
          token
        );
        if (actRes.code === 200) {
          const list = Array.isArray(actRes.data) ? actRes.data : [];
          const mapped = list.map(item => ({
            id: item.eventId ?? item.eventid ?? item.id ?? String(Math.random()),
            title: item.title ?? '',
            subtitle: item.details ?? item.description ?? '',
            time: [],
            url: '/pages/offlineEvent/offlineEvent'
          }));
          this.activities.push(...mapped);
        }
      } catch (e) {
        console.error('fetchActivities failed', e);
      }
    },

    goToActivity(act) {
      if (act.url) {
        const jumpUrl = `${act.url}?options=${act.id}`;
        uni.navigateTo({ url: jumpUrl });
      }
    }
  }
};
</script>

<style scoped>
.calendar-wrapper { width: 100%; padding: 0 24rpx; box-sizing: border-box; }
.date-strip-horizontal { display: flex; flex-direction: row; overflow-x: auto; overflow-y: hidden; white-space: nowrap; padding: 16rpx 0; background: #fff; }
.date-tile { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 4rpx; width: 96rpx; height: 96rpx; margin-right: 12rpx; border-radius: 8rpx; background: #f0f0f0; color: #333; }
.date-tile:last-child { margin-right: 0; }
.date-tile.active { background: #1e88ff; color: #fff; }
.weekday { font-size: 24rpx; line-height: 1; }
.day-number { font-size: 32rpx; font-weight: bold; line-height: 1; }

/* 🌍 Planet image styles */
.planet { 
  position: fixed;
  bottom: -110px;
  left: 50%;
  transform: translateX(-50%);
  width: 850rpx;
  height: 500rpx;
  z-index: 0;
  opacity: 0.9;
}

/* 🛰 IP image */
.ip {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 300rpx;
  height: 300rpx;
  z-index: 1;
}

/* ✨ Stars (different sizes + heights) */
.star {
  position: fixed;
  z-index: 2;
}

/* Left star (medium, a bit higher) */
.star-left {
  left: calc(50% - 250rpx);
  bottom: 80px;
  width: 60rpx;
  height: 60rpx;
}

/* Right stars - small cluster, varied heights */
.star1 {
  left: calc(50% + 160rpx);
  bottom: 70px;
  width: 40rpx;
  height: 40rpx;
}

.star2 {
  left: calc(50% + 210rpx);
  bottom: 90px;
  width: 20rpx;
  height: 20rpx;
}

.activity-list { padding: 24rpx; }
.activity-card { display: flex; flex-direction: row; width: 100%; background: #fff; border-radius: 12rpx; margin-bottom: 24rpx; overflow: hidden; box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06); }
.cover { width: 160rpx; height: 160rpx; background: #e0e0e0; flex-shrink: 0; }
.info { display: flex; flex-direction: column; justify-content: center; padding: 24rpx; flex: 1; }
.title { font-size: 30rpx; font-weight: 600; color: #333; margin-bottom: 12rpx; }
.subtitle { font-size: 24rpx; color: #888; }
</style>
