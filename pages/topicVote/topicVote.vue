<template>
  <view class="page-wrapper">
	<view
      class="top-gradient"
      :style="{ height: (statusBarHeight + titleBarHeight + gradientExtra) + 'px' }"
    ></view>

    <!-- 自定义导航栏（透明，含返回按钮 + 标题） -->
    <view
      class="custom-nav"
      :style="{ height: navHeight + 'px', paddingTop: statusBarHeight + 'px' }"
    >
	<image
	  class="top-right-img" 
	  src="/static/decorations/Frame1.png" 
	  mode="widthFix"
	/>
      <view class="nav-inner">
        <!-- 返回按钮 -->
        <view v-if="canGoBack" class="back-btn" @tap="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">话题投票</text>
      </view>
    </view>
    <scroll-view
      scroll-y="true"
      class="topic-container"
      :style="{ paddingTop: navHeight + 'px' }"
    >
      <view class="single-topic">
        <!-- 标题 + 日期 -->
        <view class="topic-header">
          <view class="header-row">
            <view class="header-left">
              <view v-if="!isEditing || isPreviewing">
                <text class="topic-title">{{ editableTitle || '暂无标题' }}</text>
              </view>
              <view v-else>
                <input v-model="editableTitle" class="topic-title-input" placeholder="请输入标题" />
              </view>
            </view>

            <view class="header-right">
              <view v-if="!isEditing || isPreviewing">
                <text class="topic-date">{{ editableDate || '暂无截止日期' }} 截止</text>
              </view>
              <view v-else>
                <!-- 日期选择器 -->
                <view class="date-input-group">
                  <view class="date-selectors">
                    <picker 
                      mode="selector" 
                      :range="years" 
                      :value="selectedYearIndex" 
                      @change="onYearChange"
                      class="date-picker"
                    >
                      <view class="picker-text">{{ selectedYear || '年' }}</view>
                    </picker>
                    
                    <picker 
                      mode="selector" 
                      :range="months" 
                      :value="selectedMonthIndex" 
                      @change="onMonthChange"
                      class="date-picker"
                    >
                      <view class="picker-text">{{ selectedMonth || '月' }}</view>
                    </picker>
                    
                    <picker 
                      mode="selector" 
                      :range="days" 
                      :value="selectedDayIndex" 
                      @change="onDayChange"
                      class="date-picker"
                    >
                      <view class="picker-text">{{ selectedDay || '日' }}</view>
                    </picker>
                  </view>
                </view>
              </view>

              <!-- 编辑按钮 -->
              <view v-if="isAdmin && !isEditing && !isPreviewing" class="edit-inline-controls">
                <button class="edit-small-button" @tap="startEditing">编辑</button>
              </view>

              <view v-if="isAdmin && isEditing" class="edit-inline-controls">
                <button v-if="!isPreviewing" class="edit-small-button" @tap="previewChanges">预览</button>
                <button v-else class="edit-small-button" @tap="saveChanges">保存</button>
                <button class="cancel-button" @tap="cancelEditing">取消</button>
              </view>
            </view>
          </view>
        </view>

        <view class="vote-hint">多选：请务必选择三个话题</view>

        <!-- 描述 -->
        <view v-if="!isEditing || isPreviewing">
          <text class="topic-description">{{ editableDescription || '暂无描述' }}</text>
        </view>
        <view v-else>
          <textarea v-model="editableDescription" class="topic-description" placeholder="请输入描述" rows="5" />
        </view>

        <view class="triple-spacer"></view>

        <!-- 投票选项 -->
        <view class="option-list">
          <view
            class="option-item"
            v-for="(item, index) in visibleOptions"
            :key="index"
            :class="{ selected: selectedIndexes.includes(index) || (submitted && !isEditing) || (hasVoted && !isEditing) }"
            @tap="selectOption(index)"
          >
            <view v-if="isEditing && !isPreviewing" class="option-edit-wrapper">
              <input v-model="item.label" class="option-input" placeholder="请输入选项内容" />
              <view class="option-controls">
                <button v-if="index >= 3 && visibleOptions.length > 3" 
                        class="remove-option-btn" 
                        @tap.stop="removeOption(index)">-</button>
              </view>
            </view>

            <view v-else class="option-display-wrapper">
              <view class="radio-circle" v-if="!submitted && !hasVoted && !isEditing">
                <view class="dot" v-if="selectedIndexes.includes(index)"></view>
              </view>
              <text class="option-text">{{ item.label || '暂无选项' }}</text>

              <view v-if="(submitted || hasVoted) && !isEditing" class="vote-result">
                <text>{{ item.percent }}%</text>
                <text class="vote-count">（{{ item.count }}票）</text>
              </view>
            </view>
          </view>
        </view>
		
        <!-- 添加选项按钮 -->
        <view v-if="isEditing && !isPreviewing && visibleOptions.length < 10" class="add-option-wrapper">
          <button class="add-option-btn" @tap="addOption">+ 添加选项</button>
        </view>

        <!-- 空状态提示 -->
        <view v-if="!isEditing && !hasVoteInfo" class="empty-state">
          <text class="empty-text">暂无投票信息</text>
          <text class="empty-hint">管理员可以点击编辑按钮创建投票</text>
        </view>
		
		<!-- seeu logo 紧跟在选项列表之后，自动跟随动态内容 -->
		<view class="seeu-logo-wrapper">
		          <image class="seeu-logo" src="https://seeutest.duckdns.org/images/static/icons/seeu.png" mode="widthFix" />
		</view>

        <view class="bottom-spacer"></view>
      </view>
    </scroll-view>

    <view class="submit-button-wrapper" v-if="!submitted && !isEditing && hasVoteInfo && !hasVoted">
      <button class="submit-button" @tap="submitVote">确认提交</button>
    </view>
  </view>
  
  <view class="popup_points" v-if="showPointPopup">
    <view class="popup-container">
      <!-- 关闭按钮 -->
      <image 
        src="https://seeutest.duckdns.org/images/static/icons/close.png" 
        class="popup-close" 
        @tap="closePointPopup"
      />
  
      <!-- 主标题 -->
      <view class="popup-title">{{ pointPopupTitle }}</view>
  
      <!-- 副标题 -->
      <view class="popup-subtitle">
        {{ pointPopupSubtitle }}
      </view>
  
      <!-- 插画 -->
      <image 
        src="https://seeutest.duckdns.org/images/static/images/character4.png" 
        class="character-points" 
        mode="aspectFit"
      />
  
      <!-- “知道了”按钮 -->
      <button class="popup-share-btn" @tap="closePointPopup">
        知道了
      </button>
    </view>
  </view>
  
</template>

<script>
import { addPoints } from '@/modules/pointsUtils.js';
export default {
  data() {
	const sys = uni.getSystemInfoSync();
    const statusBarHeight = sys.statusBarHeight || 20;
    const titleBarHeight = 44;
    return {
	  statusBarHeight,
      titleBarHeight,
      navHeight: statusBarHeight + titleBarHeight,
      gradientExtra: 160,
      canGoBack: false,
	  
      voteID: 'abc123',
      options: [
        { label: '', count: 0, percent: 0 },
        { label: '', count: 0, percent: 0 },
        { label: '', count: 0, percent: 0 }
      ],
      selectedIndexes: [],
      submitted: false,
      totalVotes: 0,

      isAdmin: false,
      isEditing: false,
      isPreviewing: false,
      hasVoteInfo: false,
      editableTitle: '',
      editableDate: '',
      editableDescription: '',

      originalTitle: '',
      originalDate: '',
      originalDescription: '',
      originalOptions: [],
	  
	  showPointPopup: false,
	  pointPopupTitle: '',
	  pointPopupSubtitle: '',
	  pointPopupCallback: null,
		  
      baseUrl: 'https://seeutest.duckdns.org/seeuapp',
      hasVoted: false, // 新增：标记用户是否已经投票
      // 日期选择器数据
      years: [],
      months: [],
      days: [],
      selectedYearIndex: 0,
      selectedMonthIndex: 0,
      selectedDayIndex: 0,
      selectedYear: '',
      selectedMonth: '',
      selectedDay: ''
    };
  },

  computed: {
    visibleOptions() {
      if (this.isEditing) return this.options;
      return this.options.filter(opt => opt.label && opt.label.trim() !== '');
    }
  },

  onLoad(options) {
    const role = uni.getStorageSync('role');
    this.isAdmin = role === '管理员';
	this.initDatePickers();
    this.loadVoteInformation();
	
	if (options.options) {
	  this.voteID = options.options;
	} 
	console.log('vote页面加载，活动ID:', this.voteID);
  },
  
  onShow() {
      // 👇 新增：判断是否可返回
      const pages = getCurrentPages();
      this.canGoBack = pages && pages.length > 1;
  },

  methods: {
	  
	goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
      } else {
        // 如果是首页或 tab 页，不可返回，可改成跳首页
        uni.switchTab({ url: '/pages/index/index' });
      }
    },
	
    // 初始化日期选择器
    initDatePickers() {
      // 生成年份列表 (当前年份前后10年)
      const currentYear = new Date().getFullYear();
      this.years = [];
      for (let i = currentYear - 5; i <= currentYear + 10; i++) {
        this.years.push(i.toString());
      }
      
      // 生成月份列表
      this.months = [];
      for (let i = 1; i <= 12; i++) {
        this.months.push(i.toString().padStart(2, '0'));
      }
      
      // 生成日期列表 (默认31天，会根据年月动态调整)
      this.updateDays();
    },
    
    // 更新日期列表
    updateDays() {
      const year = parseInt(this.selectedYear || new Date().getFullYear());
      const month = parseInt(this.selectedMonth || 1);
      const daysInMonth = new Date(year, month, 0).getDate();
      
      this.days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        this.days.push(i.toString().padStart(2, '0'));
      }
      
      // 如果当前选择的日期超出范围，重置为1
      if (this.selectedDayIndex >= this.days.length) {
        this.selectedDayIndex = 0;
        this.selectedDay = this.days[0] || '';
      }
    },
    
    // 年份选择事件
    onYearChange(e) {
      this.selectedYearIndex = e.detail.value;
      this.selectedYear = this.years[this.selectedYearIndex];
      this.updateDays();
      this.updateVoteDate();
    },
    
    // 月份选择事件
    onMonthChange(e) {
      this.selectedMonthIndex = e.detail.value;
      this.selectedMonth = this.months[this.selectedMonthIndex];
      this.updateDays();
      this.updateVoteDate();
    },
    
    // 日期选择事件
    onDayChange(e) {
      this.selectedDayIndex = e.detail.value;
      this.selectedDay = this.days[this.selectedDayIndex];
      this.updateVoteDate();
    },
    
    // 更新editableDate字段
    updateVoteDate() {
      if (this.selectedYear && this.selectedMonth && this.selectedDay) {
		  
		const year = parseInt(this.selectedYear, 10);
		const month = parseInt(this.selectedMonth, 10) - 1; // JS months are 0-based
		const day = parseInt(this.selectedDay, 10);
			
		const dateObj = new Date(year, month, day);  
		this.editableDate = dateObj.getTime();
      }
    },
    
    // 解析现有日期到选择器
    parseExistingDate(dateInput) {
      if (!dateInput) return;
      
      let date;
      
      // 检查是否是 epoch time（数字格式）
      if (typeof dateInput === 'number' || !isNaN(Number(dateInput))) {
        date = new Date(Number(dateInput));
      } else if (typeof dateInput === 'string') {
        // 检查是否是字符串格式的日期
        const dateMatch = dateInput.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (dateMatch) {
          const [, year, month, day] = dateMatch;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // 尝试直接解析字符串
          date = new Date(dateInput);
        }
      } else {
        return;
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.error('无效的日期格式:', dateInput);
        return;
      }
      
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      // 设置年份
      const yearIndex = this.years.indexOf(year);
      if (yearIndex !== -1) {
        this.selectedYearIndex = yearIndex;
        this.selectedYear = year;
      }
      
      // 设置月份
      const monthIndex = this.months.indexOf(month);
      if (monthIndex !== -1) {
        this.selectedMonthIndex = monthIndex;
        this.selectedMonth = month;
      }
      
      // 更新日期列表
      this.updateDays();
      
      // 设置日期
      const dayIndex = this.days.indexOf(day);
      if (dayIndex !== -1) {
        this.selectedDayIndex = dayIndex;
        this.selectedDay = day;
      }
    },
	async getToken() {
	  try {
	    const res = await uni.getStorageSync('token');
	    return `Bearer ${res}`;
	  } catch (e) {
	    this.handleAuthError();
	    throw e;
	  }
	},
	  
    startEditing() {
      this.originalTitle = this.editableTitle;
      this.originalDate = this.editableDate;
      this.originalDescription = this.editableDescription;
      this.originalOptions = JSON.parse(JSON.stringify(this.options));
      this.isEditing = true;
      this.isPreviewing = false;
      
      // 解析当前日期到选择器
      this.parseExistingDate(this.editableDate);
    },

    cancelEditing() {
      this.editableTitle = this.originalTitle;
      this.editableDate = this.originalDate;
      this.editableDescription = this.originalDescription;
      this.options = JSON.parse(JSON.stringify(this.originalOptions));
      this.isEditing = false;
      this.isPreviewing = false;
      
      // 重新解析日期到选择器
      this.parseExistingDate(this.editableDate);
    },

    addOption() {
      if (this.options.length < 10) {
        this.options.push({ label: '', count: 0, percent: 0 });
      }
    },

    removeOption(index) {
      if (this.options.length > 3) {
        this.options.splice(index, 1);
        this.selectedIndexes = this.selectedIndexes
          .filter(i => i !== index)
          .map(i => (i > index ? i - 1 : i));
      }
    },

    selectOption(index) {
      // 如果是编辑模式，允许管理员操作
      if (this.isEditing) return;
      // 如果已经提交投票或已经投票，普通用户不能选择
      if (this.submitted || this.hasVoted) return;
      const i = this.selectedIndexes.indexOf(index);
      if (i !== -1) {
        this.selectedIndexes.splice(i, 1);
      } else {
        if (this.selectedIndexes.length >= 3) {
          uni.showToast({ title: '必须选择三个，不可多选', icon: 'none' });
          return;
        }
        this.selectedIndexes.push(index);
      }
    },

    async loadVoteResults() {
		
	  var token = await this.getToken();
      uni.request({
        url: `${this.baseUrl}/vote/getResult`,
        method: 'GET',
        data: { voteid: this.voteID },
		header: {
			'Content-Type': 'application/json',
			"token": token
		},
        success: (res) => {
          if (res.data.code === 200 && res.data.data) {
            const voteData = res.data.data;
            this.totalVotes = 0;
            for (let i = 0; i < 10; i++) {
              const key = `option${i + 1}`;
              if (this.options[i]) {
                this.options[i].count = voteData[key] || 0;
                this.totalVotes += this.options[i].count;
              }
            }
            this.options.forEach(opt => {
              opt.percent = this.totalVotes > 0
                ? Math.round((opt.count / this.totalVotes) * 100)
                : 0;
            });
          }
        },
        fail: (err) => {
          console.error('获取投票结果失败:', err);
        }
      });
    },

    async checkUserVoteStatus() {
      const memberId = uni.getStorageSync('memberId');
      if (!memberId) {
        console.log('用户未登录，无法检查投票状态');
        return;
      }
	  
	  var token = await this.getToken();
	  
      uni.request({
        url: `${this.baseUrl}/vote/checkUserVote`,
        method: 'GET',
        data: { 
          voteid: this.voteID,
          memberId: memberId
        },
		header: {
			'Content-Type': 'application/json',
			"token": token
		},
        success: (res) => {
          if (res.data.code === 200) {
            this.hasVoted = res.data.data;
			console.log(this.hasVoted);
            if (this.hasVoted) {
              // 用户已经投票，直接显示结果
              this.submitted = true;
              console.log('用户已经投票，显示投票结果');
            }
          } else {
            console.error('检查用户投票状态失败:', res.data.message);
          }
        },
        fail: (err) => {
          console.error('检查用户投票状态请求失败:', err);
        }
      });
    },

    async loadVoteInformation() {
	  
	  var token = await this.getToken(); 
	  
      uni.request({
        url: `${this.baseUrl}/vote/getInformation`,
        method: 'GET',
        data: { voteid: this.voteID },
		header: {
			'Content-Type': 'application/json',
			"token": token
		},
        success: (res) => {
          if (res.data.code === 200 && res.data.data) {
            const voteInfo = res.data.data;
            this.editableTitle = voteInfo.title || '';
            this.editableDescription = voteInfo.description || '';
            this.editableDate = voteInfo.date || '';
            this.hasVoteInfo = !!(voteInfo.title && voteInfo.title.trim() !== '');
            
            // 解析现有日期到选择器
            this.parseExistingDate(this.editableDate);
            this.options = [
              { label: '', count: 0, percent: 0 },
              { label: '', count: 0, percent: 0 },
              { label: '', count: 0, percent: 0 }
            ];
            for (let i = 1; i <= 10; i++) {
              const key = `option${i}`;
              const val = voteInfo[key];
              if (val && val.trim() !== '') {
                if (this.options[i - 1]) {
                  this.options[i - 1].label = val;
                } else {
                  this.options.push({ label: val, count: 0, percent: 0 });
                }
              }
            }
            if (this.hasVoteInfo) {
              this.loadVoteResults();
              // 检查用户是否已经投票
              this.checkUserVoteStatus();
            } else if (this.isAdmin) {
              this.isEditing = true;
            }
          } else {
            this.hasVoteInfo = false;
            if (this.isAdmin) this.isEditing = true;
          }
        },
        fail: () => {
          this.hasVoteInfo = false;
          if (this.isAdmin) this.isEditing = true;
        }
      });
    },
	
	closePointPopup() {
	  this.showPointPopup = false;
	  if (typeof this.pointPopupCallback === 'function') {
	    this.pointPopupCallback();
	    this.pointPopupCallback = null;
	  }
	},

    // ✅ 显示积分奖励弹窗
    showPointSuccessModal(callback) {
      this.pointPopupTitle = '积分奖励';
      this.pointPopupSubtitle = '投票成功！获得积分可用于兑换会员福利等，请前往个人中心查看积分余额。';
      this.pointPopupCallback = callback || null;
      this.showPointPopup = true;
    },

    // ✅ 替换 toast 的提交逻辑
    async submitVote() {
      if (this.selectedIndexes.length !== 3) {
        uni.showToast({ title: '必须选择三个选项', icon: 'none' });
        return;
      }

      const voteData = {
        voteid: this.voteID,
        option1: 0, option2: 0, option3: 0, option4: 0, option5: 0,
        option6: 0, option7: 0, option8: 0, option9: 0, option10: 0
      };

      this.selectedIndexes.forEach(index => {
        voteData[`option${index + 1}`] = 1;
      });

      const memberId = uni.getStorageSync('memberId');
      if (!memberId) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }

      voteData.memberId = memberId;
	  let token = await this.getToken();
	  
      uni.request({
        url: `${this.baseUrl}/vote/process`,
        method: 'POST',
        data: voteData,
        header: { 
			'Content-Type': 'application/json' ,
			"token": token
		},
        success: async (res) => {
		  console.log(res.data.code);
          if (res.data.code === 200) {
            // 投票成功后，调用 pointUtils 加分
            const token = uni.getStorageSync('token');
            if (token) {
              try {
                const points = await addPoints('vote', this.voteID, memberId, token);
                if (points > 0) {
                  // 获得积分，显示积分弹窗
                  this.showPointSuccessModal(() => {
                    this.submitted = true;
                    this.loadVoteResults();
                  });
                } else {
                  // 已经获得过积分，直接显示投票成功
                  this.submitted = true;
                  this.loadVoteResults();
                  uni.showToast({ title: '投票成功', icon: 'success' });
                }
              } catch (err) {
                console.error('积分处理失败:', err);
                // 积分处理失败不影响投票结果
                this.submitted = true;
                this.loadVoteResults();
                uni.showToast({ title: '投票成功', icon: 'success' });
              }
            } else {
              // 没有token，直接显示投票成功
              this.submitted = true;
              this.loadVoteResults();
              uni.showToast({ title: '投票成功', icon: 'success' });
            }
          } else {
            uni.showToast({ title: res.data.message || '提交失败', icon: 'none' });
          }
        },
        fail: (err) => {
          uni.showToast({ title: '提交失败，请稍后重试', icon: 'none' });
          console.log('投票请求失败:', err);
        }
      });
    },

    previewChanges() {
      if (!this.editableTitle.trim() || !this.editableDescription.trim()) {
        uni.showToast({ title: '请填写完整标题、日期和描述', icon: 'none' });
        return;
      }

      const labels = this.options
        .map(opt => opt.label.replace(/\s+/g, '').toLowerCase())
        .filter(label => label !== '');

      const hasDuplicate = labels.some((label, index) => labels.indexOf(label) !== index);
      if (hasDuplicate) {
        uni.showToast({ title: '选项内容不能重复', icon: 'none' });
        return;
      }

      if (labels.length === 0) {
        uni.showToast({ title: '请至少填写一个选项', icon: 'none' });
        return;
      }

      uni.showModal({
        title: '预览提示',
        content: '您正在预览更改，点击"保存"以提交到服务器。',
        showCancel: false,
        success: () => {
          this.isPreviewing = true;
        }
      });
    },

    async saveChanges() {
      // 确保 date 是 epoch time 格式
      this.updateVoteDate();
      
      const voteInfoData = {
        voteid: this.voteID,
        title: this.editableTitle.trim(),
        description: this.editableDescription.trim(),
        date: this.editableDate,
        option1: '', option2: '', option3: '', option4: '', option5: '',
        option6: '', option7: '', option8: '', option9: '', option10: ''
      };

      this.options.forEach((opt, idx) => {
        if (idx < 10 && opt.label && opt.label.trim() !== '') {
          voteInfoData[`option${idx + 1}`] = opt.label.trim();
        }
      });
	  
	  var token = await this.getToken();
	  
      uni.request({
        url: `${this.baseUrl}/vote/updateInformation`,
        method: 'POST',
        data: voteInfoData,
        header: {
        	'Content-Type': 'application/json',
        	"token": token
        },
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: '保存成功', icon: 'success' });
            this.isEditing = false;
            this.isPreviewing = false;
            this.hasVoteInfo = true;
            this.originalTitle = this.editableTitle;
            this.originalDate = this.editableDate;
            this.originalDescription = this.editableDescription;
            this.originalOptions = JSON.parse(JSON.stringify(this.options));
          } else {
            uni.showToast({ title: res.data.message || '保存失败', icon: 'none' });
          }
        },
        fail: (err) => {
          uni.showToast({ title: '保存失败', icon: 'none' });
          console.error('保存投票信息失败:', err);
        }
      });
    }
  }
};
</script>


<style>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
}

.topic-container {
  flex: 1;
  padding: 40rpx 30rpx 120rpx;
  background-color: transparent; /* 改成透明，就能看到背后的渐变 */
  box-sizing: border-box;
}

.single-topic {
  background-color: transparent;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  box-sizing: border-box;
}

.topic-header {
  width: 100%;
  margin-bottom: 20rpx;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
  flex-wrap: wrap;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.topic-title {
  font-family: "PingFang SC", "Helvetica", "Arial", sans-serif;
  font-weight: 700;         /* Figma says "Bold" — use 700 (not 400) */
  font-size: 48rpx;         /* 24px ≈ 48rpx in uni-app (2x conversion) */
  line-height: 100%;        /* Keep tight line height */
  letter-spacing: 0rpx;
  color: #000;
}

.topic-date {
  font-size: 24rpx;
  color: #888;
}

.topic-title-input,
.topic-date-input {
  font-size: 32rpx;
  padding: 10rpx 20rpx;
  border: 1px solid #ccc;
  border-radius: 8rpx;
  min-width: 200rpx;
}

.edit-inline-controls {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.edit-small-button {
  background-color: #ff9500;
  color: white;
  font-size: 26rpx;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
}

.cancel-button {
  background-color: #8e8e93;
  color: white;
  font-size: 26rpx;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
}

.vote-hint {
  margin-top: 0rpx;
  margin-bottom: 20rpx; 
  background-color: #007aff;
  color: #ffffff;
  font-size: 28rpx;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  align-self: flex-start;
}

.topic-description {
  font-family: "PingFang SC", "Helvetica", "Arial", sans-serif;
  font-weight: 500;          /* Medium = 500 */
  font-size: 28rpx;          /* 14px ≈ 28rpx */
  line-height: 100%;         /* 100% = tight line spacing */
  letter-spacing: 0rpx;
  color: #000000;
  text-align: justify;
  width: 100%;
  margin-top: 20rpx;
}

.triple-spacer {
  height: 120rpx;
}

.bottom-spacer {
  height: 100rpx;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  border-radius: 20rpx;
  border: 2rpx solid #ddd;
  background-color: #fff;
  width: 100%;
  box-sizing: border-box;
}

.option-item.selected {
  border-color: #7d79ff;
  background-color: #f1f3ff;
}

.option-edit-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 20rpx;
}

.option-input {
  flex: 1;
  font-size: 28rpx;
  padding: 10rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
}

.option-controls {
  display: flex;
  align-items: center;
}

.remove-option-btn {
  background-color: #ff3b30;
  color: white;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
}

.radio-circle {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.option-item.selected .radio-circle {
  border-color: #7d79ff;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #7d79ff;
}

.option-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.vote-result {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 26rpx;
  color: #666;
  margin-left: auto;
}

.vote-count {
  margin-left: 10rpx;
}

.add-option-wrapper {
  margin-top: 30rpx;
  display: flex;
  justify-content: center;
}

.add-option-btn {
  background-color: #34c759;
  color: white;
  font-size: 28rpx;
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  border: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #ccc;
}

.submit-button-wrapper {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  padding: 0 60rpx;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  background-color: #f8f8f8;
}

.submit-button {
  background-color: #7d79ff;
  color: white;
  font-size: 32rpx;
  padding: 24rpx;
  border-radius: 50rpx;
  width: 100%;
  text-align: center;
}

.seeu-logo-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 200rpx;  /* 控制与最后选项的间距 */
  margin-bottom: 100rpx; /* 给底部按钮或安全区留空间 */
}

.seeu-logo {
  width: 120rpx;
  height: auto;
  opacity: 0.8;
}

.popup_points {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-container {
  position: relative;
  width: 80%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
  min-height: 500rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.popup-title {
  white-space: pre-line;
  text-align: center;
  font-size: 75rpx;
  color: #4980FD;
  font-weight: bold;
  margin-top: 5rpx;
  margin-bottom: 20rpx;
  line-height: 1.4;
}

.popup-subtitle {
  font-size: 32rpx;
  color: #000000;
  line-height: 1.5;
  text-align: left;
  padding: 0 60rpx;
  margin-bottom: 250rpx;
  white-space: pre-line;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: normal;
}

.popup-close {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 50rpx;
  height: 50rpx;
}

.character-points {
  position: absolute;
  left: 2rpx;
  bottom: 0rpx;
  width: 233rpx;
  height: 151rpx;
  transform: scale(1.8);
  transform-origin: bottom left;
  object-fit: contain;
}

.popup-share-btn {
  position: absolute;
  right: 35rpx;
  bottom: 30rpx;
  background-color: #4980FD;
  color: white;
  font-size: 30rpx;
  border-radius: 50rpx;
  padding: 5rpx 80rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

/* 日期选择器样式 */
.date-input-group {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.date-selectors {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.date-picker {
  background-color: #fff;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 8rpx 12rpx;
  min-height: 60rpx;
  display: flex;
  align-items: center;
  min-width: 80rpx;
}

.picker-text {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  width: 100%;
}

/* 顶部渐变层（颜色改为 #8ED2FF -> 透明） */
.top-gradient {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    #8ED2FF 0%,
    rgba(142, 210, 255, 0) 100%
  );
}

/* 自定义导航 */
.custom-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 10;
  background: transparent; /* 保持透明，露出渐变 */
}
.nav-inner {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center; /* 标题居中 */
  position: relative;
}
.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
  position: relative;
  z-index: 20;
}

/* 返回按钮 */
.back-btn {
  position: absolute;
  left: 20rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 25;
}
.back-arrow {
  font-size: 80rpx;
  color: #111;
  line-height: 1;
}

.topic-container {
  padding-top: 200rpx; /* 大概 = statusBarHeight + titleBarHeight */
}

.top-right-img {
  position: fixed;
  top: 120rpx;
  right: 30rpx;
  width: 240rpx;    /* ⬅️ was 120rpx; double the size */
  z-index: 3000;
  /* pointer-events: none; */
}
</style>
