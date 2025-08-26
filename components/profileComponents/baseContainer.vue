<template>
  <view :style="containerStyle">
    <slot></slot> <!-- Slot for placing any content inside the container -->
  </view>
</template>

<script>
export default {
  name: 'Container',
  props: {
    marginTop: {
      type: String,
      default: '0rpx',
    },
    marginBottom: {
      type: String,
      default: '0rpx',
    },
	marginLeft: {
      type: String,
      default: '0rpx',
    },
	marginRight: {
      type: String,
      default: '0rpx',
    },
    zIndex: {
      type: Number,
      default: 1,
    },
    backgroundColor: {
      type: String,
      default: 'transparent',
    },
	borderColor: {
      type: String,
      default: 'transparent',
	},
    boxShadow: {
      type: String,
      default: 'none',
    },
    expandable: {
      type: Boolean,
      default: false, // Default to not expanding
    },
	flexDirection: {
      type: String,
      default: 'column',
    },
	justifyContent: {
      type: String,
      default: 'none',
    },
	alignItems: {
      type: String,
      default: 'none',
    },
	height: {
      type: String,
      default: 'auto',
    },
	minHeight: {
	  type: String,
	  default: '', // Empty string means no minHeight provided
	},
  },
  computed: {
    containerStyle() {
      return {
        backgroundColor: this.backgroundColor,
        marginTop: this.marginTop,
        marginBottom: this.marginBottom,
		marginLeft: this.marginLeft,
		marginRight: this.marginRight,
        boxShadow: this.boxShadow,
        zIndex: this.zIndex,
        position: 'relative',
        display: 'flex',         // Enables Flexbox for children
        flexDirection: this.flexDirection, // Flex direction can be adjusted if needed
        flexGrow: this.expandable ? 1 : 0,   // Allows the container to grow if expandable is true
        flexShrink: this.expandable ? 1 : 0, // Allows the container to shrink if expandable is true
        flexBasis: this.expandable ? 'auto' : 'auto', // Flex basis remains auto but can be adjusted if needed
		justifyContent: this.justifyContent, // Aligns children along the main axis
		alignItems: this.alignItems, // Aligns children along the cross axis
        minHeight: this.minHeight || this.expandable ? 0 : 'auto', // Allows the container to shrink below its content size if expandable
		border: `0rpx solid ${this.borderColor}`,
		height: this.height,
      };
    },
  },
};
</script>

<style>
:host {
  display: contents;
}
</style>