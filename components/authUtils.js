// authUtils.js
export function checkAuthAndRedirect() {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    const memberId = uni.getStorageSync('memberId');

    if (!token || !memberId) {
      uni.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/index/index' // Adjust the path as per your index page location
        });
      }, 2000);
      reject('User not authenticated');
    } else {
      resolve({ token, memberId });
    }
  });
}