<template>
  <view class="container">
    <button class="redirect-button" @tap="redirectToMessage">
      消息通知
    </button>
		
		<button class="redirect-button" @tap="redirectToReservation">
		  预约
		</button>
  </view>
</template>

<script>
export default {
  methods: {
    redirectToMessage() {
      // Navigate to the second page (to be created later)
      uni.navigateTo({
        url: '/pages/messages/messages'
		// url:'/pages/test/test'
      });
    },
		redirectToReservation() {
		  // Navigate to the second page (to be created later)
		  uni.navigateTo({
		    url: '/pages/reservationPeople/reservationPeople'
		// url:'/pages/test/test'
		  });
		}
  }
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #e0e0e0; /* Light gray background */
}

.redirect-button {
  padding: 15px 30px;
  background-color: #ffffff; /* White button */
  color: #00000; /* black text color */
  border: none;
  border-radius: 5px;
  font-size: 18px;
}
</style>
