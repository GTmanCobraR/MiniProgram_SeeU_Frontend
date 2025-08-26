Page({
  data: {
    showDropdowns: { studyLocation: false, university: false, major: false },
    filters: { studyLocation: null, university: null, major: null },
    studyList: [],
    pageNum: 1,
    pageSize: 10,
    major: '',
  },
  onLoad(options) {
    if (options.major) {
      this.setData({ major: options.major });
      this.fetchStudyList();
    }
  },
  toggleDropdown(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ [`showDropdowns.${type}`]: !this.data.showDropdowns[type] });
    for (let key in this.data.showDropdowns) {
      if (key !== type) {
        this.setData({ [`showDropdowns.${key}`]: false });
      }
    }
  },
  filterBy(e) {
    const type = e.currentTarget.dataset.type;
    const value = e.currentTarget.dataset.value === 'all' ? null : e.currentTarget.dataset.value;
    this.setData({ [`filters.${type}`]: value, [`showDropdowns.${type}`]: false, pageNum: 1, studyList: [] });
    this.fetchStudyList();
  },
  openDetailPage(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/study_detail/study_detail?id=${encodeURIComponent(id)}` });
  },
  fetchStudyList() {
    const { pageNum, pageSize, major } = this.data;
    wx.request({
      url: `https://seeu-applets.seeu-edu.com/seeuapp/exampleOfGraduate/listPage?pageNum=${pageNum}&pageSize=${pageSize}`,
      method: 'POST',
      data: { major },
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            studyList: pageNum === 1 ? res.data.data.records : this.data.studyList.concat(res.data.data.records),
          });
        } else {
          console.error('API Error:', res.data.message);
        }
      },
      fail: (err) => {
        console.error('Request Failed:', err);
      },
    });
  },
  loadMoreStudies() {
    this.setData({ pageNum: this.data.pageNum + 1 });
    this.fetchStudyList();
  },
  computed: {
    filteredList() {
      return this.data.studyList.filter((item) => {
        return (
          (this.data.filters.studyLocation === null || item.area === this.data.filters.studyLocation) &&
          (this.data.filters.university === null || item.graduateCollege === this.data.filters.university) &&
          (this.data.filters.major === null || item.major === this.data.filters.major)
        );
      });
    },
  },
});
