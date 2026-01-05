<template>
  <view v-if="isCalendarReady" class="container">
    <!-- Calendar -->
    <van-calendar
      v-if="isCalendarReady"
      :show="showCalendar"
      :color="'#4285f4'"
      :min-date="minDate"
      @confirm="onDateConfirm"
      @close="closeAndGoBack"
      :formatter="formatter"
    />

    <!-- Date Display -->
    <view class="selected-date" @tap="showCalendar = true">
      <text>{{ selectedDate ? selectedDate : '请选择日期' }}</text>
    </view>
		
		<view class="timezone-text">
		  <text>*日期与时间均为北京时间</text>
		</view>

    <!-- Title for Time Slots -->
    <view class="title">开始时间</view>

    <!-- 1-Hour Sections -->
    <scroll-view v-if="selectedDate" class="time-sections">
      <view
        v-for="(time, index) in allTimeSlots"
        :key="index"
        class="time-slot"
        :class="{ 'grayed-out': !timeSlots.includes(time) }"
        @tap="selectTimeSlot(time, index)"
      >
        <image
          v-if="selectedTimeSlot === time"
          src="https://seeu-applets.seeu-edu.com/images/static/blue_checkmark.svg.png"
          class="checkbox checked"
        />
        <view v-else class="checkbox" :class="{ 'grayed-out-checkbox': !timeSlots.includes(time) }"></view>
        <text>{{ time }}</text>
      </view>
    </scroll-view>

    <!-- Reservation Type Section -->
    <view class="title">预约类型</view>
    <scroll-view class="reservation-type-section">
      <view
        v-for="(type, index) in reservationTypes"
        :key="index"
        class="reservation-type"
        @tap="selectReservationType(type, index)"
      >
        <image
          v-if="selectedReservationType === type"
          src="https://seeu-applets.seeu-edu.com/images/static/blue_checkmark.svg.png"
          class="checkbox checked"
        />
        <view v-else class="checkbox"></view>
        <text>{{ type }}</text>
      </view>
    </scroll-view>

    <!-- Communication Purpose Section -->
    <!-- <view class="title">沟通目的</view> -->
    <!-- <input type="text" class="purpose-input" v-model="communicationPurpose" placeholder="请描述你的需求" /> -->


		<view class="purpose-section">
      <text class="title">沟通目的</text>
      <textarea
        class="purpose-input"
        placeholder="请描述你的需求"
        v-model="communicationPurpose"
        rows="3"
        show-confirm-bar="false"
        :maxlength="200"
      />
    </view>
    <!-- Submit Button -->
    <button class="submit-button" @tap="submitReservation">
      提交预约
    </button>
  </view>
	
	<view v-else class="loading-container">
	  <text class="loading-text">加载中...</text>
	</view>
		
		
</template>

<script>
  import { requestWithTokenAndMemberId, getToken, getMemberId } from '../../modules/requestUtils';

  export default {
    data() {
      return {
        showCalendar: true,
        selectedDate: null,
        allTimeSlots: [],
        timeSlots: [],
        selectedTimeSlot: null,
        availableDates: [new Date(2024, 8, 8), new Date(2024, 8, 15), new Date(2024, 8, 17), new Date(2024, 8, 20)], // Example available dates (Year, Month, Day)
        teacherId: null,
        year: null,
        month: null,
				validMonths: [],
        minDate: new Date().getTime(),
        isCalendarReady: false,
				
				allData: null,
        // New Data for Reservation Type
        // reservationTypes: ["模拟面试", "简历精修", "综合咨询"],
				reservationTypes: [],
        selectedReservationType: null,

        // New Data for Communication Purpose
        communicationPurpose: '',
				
				appointmentIds: [],
				appointmentBaseId: null,
				memberLevelId: null
      };
    },

    onLoad(options) {
      let teacherId = decodeURIComponent(options.teacherId);
      let year = decodeURIComponent(options.currentYear);
      let month = decodeURIComponent(options.currentMonth);

      this.teacherId = teacherId;
      this.year = year;
      this.month = parseInt(month);
			
			this.validMonths.push(this.month);
			
			if(this.month < 12){
				this.validMonths.push(this.month + 1);
			}
			else{
				this.validMonths.push(1);
			}
			
    },

    async mounted() {
      this.fetchCalendarData();
			// this.checkSignedMember();
    },

    methods: {
			
			closeAndGoBack(){
				this.showCalendar = false; // Hide the calendar
				uni.navigateBack();
			},
			
      async onDateConfirm(event) {
        let date = event.detail;
        if (!(date instanceof Date)) {
          date = new Date(date);
        }
        this.selectedDate = this.parseDate(date);
        this.showCalendar = false;

        const token = getToken();
        const memberID = getMemberId();

        const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/appointmentBase/queryTeacherCalendar`;

        const data = {
          appointmentTimeZoneId: '1754344501240922112',
          monthItem: date.getMonth()+1, // because month is 0-index
          yearItem: date.getFullYear(),
          teacherId: this.teacherId,
          dayItem: date.getDate(),
        };

        try {
          const res = await requestWithTokenAndMemberId(url, 'POST', data, token, memberID);
          let newAllTimeSlots = [];
          let newTimeSlots = [];

					console.log("on date confirm response");
					console.log(res);
					console.log(res.data);
					
					this.allData = res.data;
          let timeSlots = res.data;

          for (let i = 0; i < timeSlots.length; i++) {
            let startTime = timeSlots[i]['startTime'].substring(11, 16);
            let startTime2 = this.convertTo12Hour(startTime);

            newAllTimeSlots.push(startTime2);

            let matched = false;
            for (let j = 0; j < timeSlots[i]['calendarList'].length; j++) {
              if (timeSlots[i]['calendarList'][j]['appointmentStatus'] === 'MATCH') {
                matched = true;
                break;
              }
            }

            if (!matched) {
              newTimeSlots.push(startTime2);
            }
          }

          this.allTimeSlots = newAllTimeSlots;
          this.timeSlots = newTimeSlots;
        } catch (e) {
          console.log(e);
        }
      },
			
			async checkSignedMember(){
				const token = getToken();
				const memberID = getMemberId();
				
				const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/memberBase/queryByFacade`;
				
				const data = {
				};
				
				try {
				  const res = await requestWithTokenAndMemberId(url, 'POST', data, token, memberID);
				  
					console.log("check signed member response");
					console.log(res);
					
					this.memberLevelId = res.data.memberLevelId;
					
				  
				
				  
				} catch (e) {
				  console.log(e);
				}
			},

      parseDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        return `${year}年${month}月${day}日`;
      },

      convertTo12Hour(time) {
        let [hour, minute] = time.split(':');
        hour = parseInt(hour, 10);
        minute = parseInt(minute, 10);
        let period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour < 10 ? '0' : ''}${hour}:${minute < 10 ? '0' : ''}${minute} ${period}`;
      },

      selectTimeSlot(time, index) {
        if (this.timeSlots.includes(time)) {
          this.selectedTimeSlot = time;
        }
				
				let types = [];
				let newAppointmentIds = []
				
				for (let i = 0 ; i < this.allData[index]["calendarList"].length; i ++){
					types.push(this.allData[index]["calendarList"][i]["appointmentTypeName"]);
					newAppointmentIds.push(this.allData[index]["calendarList"][i]["appointmentBaseId"]);
				}
				
				this.reservationTypes = types;
				this.appointmentIds = newAppointmentIds;
				this.selectedReservationType = null;
				
				console.log(this.appointmentIds);
				
      },

      selectReservationType(type, index) {
        this.selectedReservationType = type;
				this.appointmentBaseId = this.appointmentIds[index];
				
				console.log(this.appointmentBaseId);
      },

      async submitReservation() {
				// console.log(this.selectedReservationType);
				// console.log(this.communicationPurpose);
				
        // uni.navigateTo({
        //   url: `/pages/reservationPeople/reservationPeople`,
        // });
				
				const token = getToken();
				const memberID = getMemberId();
				
				console.log("member id: ");
				console.log(memberID);
				
				const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/appointmentMember/add`;
				
				const data = {
				  appointmentBaseId: this.appointmentBaseId,
					appointmentMemberRemarks: this.selectedReservationType,
					memberId: memberID
				};
				
				
				try {
				  const res = await requestWithTokenAndMemberId(url, 'POST', data, token, memberID);
				  
					console.log("res after submitting reservation");
					console.log(res);
					
					if(res.httpStatus === 200){
						uni.showModal({
						  title: '预约成功', // Title of the modal
						  content: '您已成功预约', // Message to display
						  showCancel: false, // Only show the confirm button
						  confirmText: '确定', // Text of the confirm button
						  success: function (res) {
						    if (res.confirm) {
						      uni.navigateBack(); // Go back to the previous page when "确定" is clicked
						    }
						  }
						});
					}
					else{
						uni.showModal({
						  title: '预约失败', // Title of the modal
						  content: res.message, // Message to display
						  showCancel: false, // Only show the confirm button
						  confirmText: '确定', // Text of the confirm button
						  success: function (res) {
						    if (res.confirm) {
						      uni.navigateBack(); // Go back to the previous page when "确定" is clicked
						    }
						  }
						});
					}
					
					
				} catch (e) {
				  console.log(e);
				}
				
				// uni.navigateBack();s

      },

      async fetchCalendarData() {
        const token = getToken();
        const memberID = getMemberId();
        const url = `https://cool-hanna.seeu-edu.com/meetfun-app-facade/facade/appointmentBase/queryTeacherCalendarDayAndItem`;

				console.log("from fetchCalendatData");
				// console.log(this.validMonths);

				let dates = [];
				for (let i = 0; i < 2; i ++){
					
					let year = this.year;
					
					if (i == 1 && this.validMonths[i] == 1){
						year = (parseInt(this.year) + 1).toString();
					}
					
					// console.log(year);
					const data = {
					  appointmentTimeZoneId: '1754344501240922112',
					  monthItem: this.validMonths[i] + 1,
					  yearItem: year,
					  teacherId: this.teacherId,
					};
					
					try {
					  const res = await requestWithTokenAndMemberId(url, 'POST', data, token, memberID);
					  
						console.log(res)
					
					  for (let j = 0; j < res.data.length; j++) {
					    if (res.data[j]['appointmentStatus'] === 'MATCH') {
					      dates.push(new Date(this.year, this.validMonths[i], j + 1));
					    }
					  }
						
					  
					} catch (e) {
					  console.log(e);
					}
				}
        
				
				this.availableDates = dates;
				this.isCalendarReady = true;
      },

      formatter(day) {
        const date = new Date(day.date);
        const isAvailable = this.availableDates.some(
          (availableDate) =>
            availableDate.getFullYear() === date.getFullYear() &&
            availableDate.getMonth() === date.getMonth() &&
            availableDate.getDate() === date.getDate()
        );

        if (!isAvailable) {
          day.className = 'grayed-out-day';
          day.text = day.text;
          day.type = 'disabled';
        }

        return day;
      },
    },
  };
</script>

<style scoped>
.container {
  padding: 20px;
}

.title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
  margin-top: 20px;
}

.selected-date {
  padding: 10px;
  background-color: #4285f4;
  color: #ffffff;
  border-radius: 5px;
  text-align: center;
  margin-bottom: 20px;
}

.time-sections {
  margin-top: 10px;
  padding-bottom: 20px;
}

.reservation-type-section {
  margin-top: 10px; /* Reduced the margin top */
  padding-bottom: 20px;
}

.time-slot,
.reservation-type {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  text-align: center;
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #4285f4;
  margin-right: 10px;
}

.timezone-text {
  color: #888; /* Lighter text color */
  font-size: 14px; /* Smaller font size */
  text-align: center;
  margin-top: 10px; /* Space between date and text */
  margin-bottom: 20px; /* Space before the next section */
}

.purpose-input {
  width: 93%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.grayed-out {
  color: #aaa;
  background-color: #f0f0f0;
}

.grayed-out-checkbox {
  border-color: #ccc;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full viewport height to center the text */
}

.submit-button {
  /* position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  padding: 15px 0;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 45px;
  text-align: center;
  font-size: 16px;
  cursor: pointer; */
	
	width: 100%;
	padding: 15px 0;
	margin-top: 20px; /* Space between textarea and button */
	background-color: #4285f4;
	color: white;
	border: none;
	border-radius: 45px;
	text-align: center;
	font-size: 16px;
	cursor: pointer;
}
</style>
