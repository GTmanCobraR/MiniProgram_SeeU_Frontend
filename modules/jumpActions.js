import { addPoints } from '/modules/pointsUtils';

export function performOfficialAccountJump() {
  const featureName = 'officialAccount';
  const officialAccountUsername = 'gh_1a373808a9ca';
  
  return new Promise((resolve, reject) => {
    wx.openOfficialAccountProfile({
      username: officialAccountUsername,
      async success() {
        console.log('跳转公众号成功');
        try {
          const got = await award(featureName);
          got ? resolve() : reject('今日已通过公众号获取过积分');
        } catch (e) {
          reject(e);
        }
      },
      fail(err) {
        console.error('跳转公众号失败', err);
        uni.showToast({ title: '跳转公众号失败', icon: 'none', duration: 2000 });
        reject();
      }
    });
  });
}

export function performChannelsJump() {
  const featureName = 'channels';
  const channelsID = 'sphuM9hRxttKRC4';

  return new Promise((resolve, reject) => {
    wx.openChannelsUserProfile({
      finderUserName: channelsID,
      async success() {
        console.log('跳转视频号成功');
        try {
          const got = await award(featureName);
          got ? resolve() : reject('今日已通过视频号获取过积分');
        } catch (e) {
          reject(e);
        }
      },
      fail(err) {
        console.error('跳转视频号失败', err);
        uni.showToast({ title: '跳转视频号失败', icon: 'none', duration: 2000 });
        reject();
      }
    });
  });
}

// assist

async function points(subject) {
  const memberId = uni.getStorageSync('memberId');
  const token = uni.getStorageSync('token');
  const op = 'view';
  const sub = subject + ",at:" + Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  console.log(sub);
  // TODO: op和subject在后端什么逻辑 怎么用
  return await addPoints(op, sub, memberId, token); //import fc
}

async function award(featureName) {
  // 等待 addPoints 完成，获得积分值
  const pts = await points(featureName);

  if (pts > 0) {
    uni.showToast({ title: '积分成功', icon: 'none' });
    return true; // 加到积分
  } else {
    uni.showToast({ title: '今日已获取过积分', icon: 'none' });
    return false; // 今天已经领过
  }
}