<template> <!-- Card for contractServices admain page -->
    <view class="card">

        <view class="card-main-content">
            <!-- Left Section: Title and Subtitles -->
            <view class="card-info">
                <view class="card-title">{{ title }}</view> <!-- Title -->
                <view class="card-subtitle">{{ subtitle1 }}</view> <!-- Subtitle 1 -->
            </view>

            <!-- Right Section 1: Action Buttons -->
            <template v-if="currentIsAddedStatus === 0">
                <!-- Middle Section: Status Text -->
                <view class="card-status-text">
                    是否添加：
                </view>

                <!-- Right Section: Action Buttons -->
                <view class="card-actions">
                    <view class="action-button not-added" @tap.stop="onMarkAsNotAdded">未添加</view>
                    <view class="action-button added" @tap.stop="onMarkAsAdded">已添加</view>
                </view>
            </template>

            <!-- Right Section 2: Revoke Button (for processed items) -->
            <template v-else-if="currentIsAddedStatus === 2">
                <view class="card-actions">
                    <view class="action-button revoke" @tap.stop="onRevoke">撤销</view> <!-- 未添加积分可以改变状态 -->
                </view>
            </template>
            <template v-else-if="currentIsAddedStatus === 1"> 
                <view class="card-actions">
                    <view class="action-button cannot-revoke" @tap.stop="onRevoke">已添加无法撤销</view> <!-- 若要撤销需要pointsUtils提供减分fc otherwise仅改变状态但仍有积分 -->
                </view>
            </template>
        </view>

        <!-- Subtitle2 (now at the bottom, acting as memberID display) -->
        <view class="card-subtitle-bottom">{{ subtitle2 }}</view>
    </view>
</template>

<script>
export default {
    name: 'card3',
    props: {
        title: {
            type: String,
            default: '昵称'
        },
        subtitle1: {
            type: String,
            default: '微信名'
        },
        subtitle2: {
            type: String,
            default: 'id'
        },
        // 传递整个item对象，方便父组件识别是哪个卡片触发了事件
        item: {
            type: Object,
            default: () => ({})
        },
        currentIsAddedStatus: {
            type: Number,
            default: 0 // Default to 0 (unprocessed) if not provided
        }
    },

    methods: {
        onMarkAsNotAdded() {
            this.$emit('mark-not-added', this.item);
        },
        onMarkAsAdded() {
            this.$emit('mark-added', this.item);
        },
        onRevoke() {
            this.$emit('revoke', this.item);
        }
    }
};
</script>

<style scoped>
.card {
    display: flex;
    flex-direction: column;
    padding: 15px;
    margin: 10px 15px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-main-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.card-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-shrink: 0;
    /* 防止信息区域被压缩 */
}

.card-title {
    font-weight: bold;
    font-size: 16px; /* Reverted to original size */
    color: #333333;
}

.card-subtitle {
    font-size: 14px; /* Reverted to original size */
    color: #888888;
    margin-top: 4px;
}

.card-status-text {
    font-size: 14px; /* Reverted to original size */
    color: #555555;
    text-align: center;
    margin: 10px;
    flex-grow: 1;
}

.card-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
    /* 防止按钮被压缩 */
}

.action-button {
    padding: 6px 12px;
    border-radius: 15px;
    color: #ffffff;
    font-size: 12px;
    cursor: pointer;
    text-align: center;
}

.action-button:first-child {
    margin-right: 8px;
}

.not-added {
    background-color: #fa3534;
    /* 红色 */
}

.added {
    background-color: #19be6b;
    /* 绿色 */
}

.revoke {
    background-color: #fa3534; /* 红色 */
    /* You can adjust padding or margin if needed for a single button */
}

.cannot-revoke {
    background-color: #bc9898;
}

.card-subtitle-bottom {
    margin-top: 12px; /* Spacing from the main content */
    align-self: flex-start; /* Align to the left */
    font-size: 12px;
    color: #999999;
}
</style>