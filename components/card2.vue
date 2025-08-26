<template>
  <view class="card" @tap="onTapCard">
    <image :src="image" class="card-image" />
    <view class="card-content">
      <view class="card-title">{{ title }}</view>
      <view class="card-subtitle">{{ subtitle }}</view>
      <view class="card-tag">{{ tag }}</view>
      <view class="card-views">{{ views }} views</view>
    </view>
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
    major: String
  },
  methods: {
    openPdf() {
      this.$emit('open-pdf', this.file);
    },
    onTapCard() {
      this.$emit('tap');
    }
  }
};
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.card-image {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  margin-right: 10px;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 5px;
}

.card-subtitle {
  font-size: 14px;
  color: #888888;
  margin-bottom: 5px;
}

.card-tag {
  font-size: 12px;
  color: #4285f4;
  margin-bottom: 5px;
}

.card-views {
  font-size: 12px;
  color: #888888;
}
</style>