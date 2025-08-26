import { requestWithToken } from '@/modules/requestUtils.js';

async function getToken() {
  try {
	const res = await uni.getStorageSync("token");
			// console.log(`token: ${res}`);
	return `Bearer ${res}`;
  } catch (e) {
	this.handleAuthError();
	throw e;
  }
}

export async function addPoints(op, subject, memberId, token){
	/* 
	增加积分的函数，需传入增加积分的活动类型，增加积分的对象，以及memberId和token
	如果活动类型不需要具体到对象的话，将subject传入为一个空字符串''即可
	如已执行过对应操作，返回0，否则返回所增加的积分数值
	*/
	
	
	/*登录验证*/
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
	
	/*后端验证该行动是否已计算过积分，传入memberId，op和subject*/
	/*如果已计算返回0，否则返回增加积分的数值，并提醒用户增加了xx积分*/

	var opId = op + subject;
	var points = 0;
	
	try {
		const res = await requestWithToken(
		  `https://seeutest.duckdns.org/seeuapp/userLog/add?opName=${opId}&memberId=${memberId}`,
		  'POST',
		  {},
		  await getToken()
		);
		if (res.code === 200) {
		  points = res.data
		} else if(res.code === 404){
			console.log('this operation has already rewarded points to the user');
			return points;
		}
		else {
		  console.error('API Error, error code: ', res.code);
		  console.error('API Error:', res.message);
		  return points;
		}
	} catch (e) {
		console.error('Request Failed:', e);
		return points;
	}
	
	console.log("用户可添加积分！")
	
	/*如果积分未被计算过，则获取并添加积分*/
	
	try {
		const res = await requestWithToken(
		  `https://seeutest.duckdns.org/seeuapp/operation/points/${op}`,
		  'GET',
		  {},
		  await getToken()
		);
		if (res.code === 200) {
		  points = res.data
		} else {
		  console.error('API Error:', res.message);
		  return 0;
		}
	} catch (e) {
		console.error('Request Failed:', e);
		return 0;
	}
	
	console.log("midway check:")
	
	try {
		const res = await requestWithToken(
		  `https://seeutest.duckdns.org/seeuapp/points/add?memberId=${memberId}&points=${points}`,
		  'POST',
		  {},
		  await getToken()
		);
		if (res.code === 200) {
		  console.log("增加积分成功！");
		  return points;
		} else {
		  console.error('API Error:', res.message);
		  return 0;
		}
	} catch (e) {
		console.error('Request Failed:', e);
		return 0;
	}
	
}

export async function getPoints(memberId, token){
	/* 获取积分的函数，需传入用户Id以及认证token，
	   返回该用户现有的积分数量*/
	
	/*登录验证*/
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
	console.log("获取积分中")
	try {
		const res = await requestWithToken(
		  `https://seeutest.duckdns.org/seeuapp/points/get?memberId=${memberId}`,
		  'GET',
		  {},
		  await getToken()
		);
		if (res.code === 200) {
		  console.log("获取积分成功！");
		  return res.data;
		} else {
		  console.error('API Error:', res.message);
		  return 0;
		}
	} catch (e) {
		console.error('Request Failed:', e);
		return 0;
	}
	
}

export async function addOps(opName, points, memberId, token){
	
	/* 
	
	仅管理员可用：
	
	增加新活动的函数，需传入增加积分的活动类型，增加积分的对象，以及memberId和token
	如添加成功，返回true，否则返回false
	*/
	
	
	/*登录验证, 需要添加是否为管理员验证*/
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
	
	/*后端request，如添加成功返回true，否则输出错误信息并返回false*/
	
	try {
		const res = await requestWithToken(
		  `https://seeutest.duckdns.org/seeuapp/operation/add?opName=${opName}&points=${points}`,
		  'POST',
		  {},
		  await getToken()
		);
		if (res.code === 200) {
		  console.log("增加积分成功！")
		} else {
		  console.log("API Error code: ", res.code);
		  console.error('API Error:', res.message);
		  return false;
		}
	} catch (e) {
		console.error('Request Failed:', e);
		return false;
	}
	
	return true;
	
}
