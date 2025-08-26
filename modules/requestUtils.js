export async function requestWithTokenAndMemberId(url, method, data, token, memberId) {
	
	if (token === null || memberId === null){
		uni.showToast({
		  title: "认证失败，请重新登录",
		  icon: "none",
		  duration: 2000,
		  complete() {
		    wx.navigateTo({
		      url: "/pages/index/index", // Navigate to login page
		    });
		  },
		});
	}
	
  try {
    const res = await uni.request({
      url,
      method,
      data,
      header: {
				"Content-Type": "application/json",
        "token": token,
				"memberId": memberId
      },
    });
	//console.log(res.statusCode);
    return res.data;
  } catch (e) {
    uni.showToast({
      title: "认证失败，请重新登录",
      icon: "none",
      duration: 2000,
      complete() {
        wx.navigateTo({
          url: "/pages/index/index", // Navigate to login page
        });
      },
    });
    throw e;
  }
}

export async function requestWithoutHeader(url, method, data){
	try {
	  const res = await uni.request({
	    url,
	    method,
	    data,
	  });
	  return res.data;
	} catch (e) {
	  uni.showToast({
	    title: "认证失败，请重新登录",
	    icon: "none",
	    duration: 2000,
	    complete() {
	      wx.navigateTo({
	        url: "/pages/index/index", // Navigate to login page
	      });
	    },
	  });
	  throw e;
	}
}



export async function requestWithToken(url, method, data, token) {
	if (token === null){
		uni.showToast({
		  title: "认证失败，请重新登录",
		  icon: "none",
		  duration: 2000,
		  complete() {
		    wx.navigateTo({
		      url: "/pages/index/index", // Navigate to login page
		    });
		  },
		});
	}
  try {
    const res = await uni.request({
      url,
      method,
      data,
      header: {
				"Content-Type": "application/json",
        "token": token
      },
    });
    return res.data;
  } catch (e) {
    uni.showToast({
      title: "认证失败，请重新登录",
      icon: "none",
      duration: 2000,
      complete() {
        wx.navigateTo({
          url: "/pages/index/index", // Navigate to login page
        });
      },
    });
    throw e;
  }
}

export async function requestWithoutToken(url, method, data) {
  try {
    const res = await uni.request({
      url,
      method,
      data,
      header: {
				"Content-Type": "application/json",
				//memberId
      },
    });
    return res.data;
  } catch (e) {
    uni.showToast({
      title: "认证失败，请重新登录",
      icon: "none",
      duration: 2000,
      complete() {
        wx.navigateTo({
          url: "/pages/index/index", // Navigate to login page
        });
      },
    });
    throw e;
  }
}

// export function requestWithoutToken_NonAsync(url, method, data) {
//   try {
//     const res = uni.request({
//       url,
//       method,
//       data,
//       header: {
// 				"Content-Type": "application/json"
//       },
//     });
//     return res.data;
//   } catch (e) {
//     uni.showToast({
//       title: "认证失败，请重新登录",
//       icon: "none",
//       duration: 2000,
//       complete() {
//         wx.navigateTo({
//           url: "/pages/index/index", // Navigate to login page
//         });
//       },
//     });
//     throw e;
//   }
// }
	
export function getToken() {
  try {
    const res = uni.getStorageSync('token');
    return res;
  } catch (e) {
    uni.showToast({
      title: "认证失败，请重新登录",
      icon: "none",
      duration: 2000,
      complete() {
        wx.navigateTo({
          url: "/pages/index/index", // Navigate to login page
        });
      },
    });
    throw e;
      
	}

}
	
export function getMemberId() {
	try {
	  const res = uni.getStorageSync('memberId');
	  return res;
	} catch (e) {
	  uni.showToast({
	    title: "认证失败，请重新登录",
	    icon: "none",
	    duration: 2000,
	    complete() {
	      wx.navigateTo({
	        url: "/pages/index/index", // Navigate to login page
	      });
	    },
	  });
	  throw e;
	   
	}
}
		


// async requestWithToken(url, method, data) {
//       try {
//         const token = await this.getToken();
//         const res = await uni.request({
//           url,
//           method,
//           data,
//           header: {
//             "Content-Type": "application/json",
//             Authorization: token,
//           },
//         });
//         return res.data;
//       } catch (e) {
//         this.handleAuthError();
//         throw e;
//       }
//     }