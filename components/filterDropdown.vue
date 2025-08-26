<!-- components/FilterDropdown.vue -->
<template>
  <view class="filterDropdown">
    <view v-for="option in options" :key="option.value" @tap="selectOption(option)" class="filter-dropdown-item">
      <view :class="{'selected': option.value === selectedValue}">{{ option.label }}</view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    options: Array,
    selectedValue: String
  },
  methods: {
    selectOption(option) {
      this.$emit('select', option.value);
    }
  }
}
</script>

<style scoped>
.filterDropdown {
  position: absolute;
  top: 100%;
  left: -10%;
  background: #ffffff;
  list-style: none;
  padding: 5px 0;
  margin: 0;
  width: 120%;
  z-index: 10;
  border: 1px solid #ccc;
  border-radius: 5px;
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

.filterDropdown view.selected {
  color: #4285f4;
}

.filterDropdown view:hover {
  background-color: #f0f0f0;
}
</style>
