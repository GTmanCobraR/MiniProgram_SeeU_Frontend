<template>
	<view class="container">
		<!-- Orders List (Scrollable) -->
		<scroll-view class="card-list" scroll-y @scrolltolower="loadMoreOrders">
			<card v-for="(order, index) in orders" :key="index" :title="'订单号: ' + order.orderId"
				:mainMessage="'类型: 课程 | 状态: ' + order.orderStatus + ' | 总金额: ¥' + order.orderPaymentAmount"
				:timeMessage="order.orderPayTime" :link="order.orderCourseDto[0]?.courseId" :type="'课程'" />
			<!-- Loading and End of Data Messages -->
			<view v-if="loading" class="loading">加载中...</view>
			<view v-if="allLoaded" class="end-of-data">已加载全部订单</view>
			<view style="height: 20px;"></view>
		</scroll-view>
	</view>
</template>

<script>
  import { requestWithTokenAndMemberId } from '../../modules/requestUtils';
  import card from '/components/orderComponents/orderCard.vue';
  import { checkAuthAndRedirect } from '/components/authUtils.js';

  export default {
    components: {
      card,
    },
    data() {
      return {
        orders: [], // List of orders to display
        pageNum: 1, // Current page number for pagination
        pageSize: 10, // Number of orders per page
        loading: false, // Loading state
        allLoaded: false, // All data loaded state
        token: '', // User token
        memberId: '', // User memberId
      };
    },
    methods: {
      async fetchOrders(pageNum, pageSize) {
        this.loading = true;
        console.log('memberId:', this.memberId);
        console.log('token:', this.token);

        // Create postData
        const postData = {
          orderStatus: 'PAYED',
          pageNum: pageNum,
          pageSize: pageSize,
        };

        console.log('postData:', postData);

        // Make a POST request to the API
        try {
          // Use requestWithTokenAndMemberId utility function
          const res = await requestWithTokenAndMemberId(
            'https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/orderBase/queryPageListByFacade',
            'POST',
            postData,
            this.token,
            this.memberId
          );

          console.log('res:', res);

          const fetchedOrders = res.data.records;

          // Check if all data has been loaded
          if (fetchedOrders.length < pageSize) {
            this.allLoaded = true;
          }

          // Append the new orders to the current list
          this.orders = [...this.orders, ...fetchedOrders];
          this.loading = false;
        } catch (err) {
          console.error('API request failed', err);
          this.loading = false;
        }
      },
      loadMoreOrders() {
        if (this.allLoaded || this.loading) return;
        this.pageNum += 1;
        this.fetchOrders(this.pageNum, this.pageSize);
      },
      fetch_auth() {
        try {
          console.log('fetching auth');
          this.token = uni.getStorageSync('Hannatoken');
          this.memberId = uni.getStorageSync('memberId');
        } catch (e) {
          console.log('error:', e);
        }
      },
    },
    mounted() {
      this.fetch_auth();
      this.fetchOrders(this.pageNum, this.pageSize);
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
		overflow: hidden;
		background-color: #f2f3f5;
	}

	.card-list {
		height: 100%;
		overflow-y: scroll;
		width: 100%;
	}

	.loading,
	.end-of-data {
		text-align: center;
		padding: 10px;
		color: #888;
	}
</style>