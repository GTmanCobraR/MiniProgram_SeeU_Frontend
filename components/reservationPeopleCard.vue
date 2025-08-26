<template>
  <view class="card">
    <view class="card-left">
      <image class="card-image" :src="image" />

    </view>
		
		<view class="card-content">
		  <view class="card-title">{{ title }}</view>
		  <view class="card-subtitle">{{ subtitle }}</view>
		</view>
		<button class="card-button" @click="startReserve">{{ tag }}</button>
  </view>
</template>

<script>
export default {
  props: {
    image: String,
    title: String,
    subtitle: String,
    tag: String,
    views: Number,
    file: String,
  },
  methods: {
    openPdf() {
      this.$emit("open-pdf", this.file);
    },
		startReserve() {
		  this.$emit("start-reserve", this.item); // Emit the event with the parameters
		}
  },
};
</script>

<style scoped>
.card {
  display: flex;
  align-items: center;
  padding: 10px;
  width: 100%;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  background-color: #ffffff;
  justify-content: space-between;
  margin-bottom: 10px; /* Add spacing between cards */
}

.card-left {
  display: flex;
  align-items: center;
  margin-right: 5px;
}

.card-image {
  width: 60px;
	height: 60px;
  border-radius: 50%; 
  margin-right: 10px;
	object-fit: cover;
	display: block;
	overflow: hidden;
}



.card-content {
  flex-grow: 1;
  max-width: 60%;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-weight: bold;
  margin-bottom: 4px;
  /* white-space: nowrap; */
  overflow: hidden; /* Hide overflow text */
  text-overflow: ellipsis; /* Adds ellipsis (...) to indicate overflowing text */
}

.card-subtitle {
  color: #666;
  font-size: 13px; /* Make the subtitle text smaller */
  overflow: hidden; /* Hide overflow text */
  display: -webkit-box; /* Required for multi-line ellipsis */
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* Limit to 2 lines */
  line-height: 1.4; /* Adjust line height for better readability */
  text-overflow: ellipsis;
}

.card-button {
  background-color: #4285f4;
  color: #ffffff;
  padding: 4px 12px; /* Adjust padding */
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  height: auto;
  display: flex;
  align-items: center; /* Ensures the text inside the button is vertically centered */
  justify-content: center;
  min-width: 80px; /* Set minimum width for the button */
  max-width: 30%; /* Set maximum width for the button */
	margin-right:25px;
	flex-shrink: 0;
}
</style>