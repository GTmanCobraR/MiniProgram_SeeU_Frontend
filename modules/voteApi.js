/**
 * 投票API调用工具模块
 */
import { requestWithToken } from '@/modules/requestUtils.js';

// 开发环境配置 - 手动切换
const DEV_CONFIG = {
  useLocalhost: true, // 改为true，使用localhost进行开发
  localhostUrl: 'https://seeutest.duckdns.org/seeuapp',
  productionUrl: 'https://seeu-applets.seeu-edu.com/seeuapp'
};

// API基础配置
const API_CONFIG = {
  // 根据开发配置选择API地址
  baseUrl: DEV_CONFIG.useLocalhost ? DEV_CONFIG.localhostUrl : DEV_CONFIG.productionUrl,
  timeout: 10000
};

/**
 * 获取token
 */
function getToken() {
  try {
    const token = uni.getStorageSync('token');
    return token;
  } catch (e) {
    console.error('获取token失败:', e);
    return null;
  }
}

/**
 * 通用请求方法
 * @param {string} url - 请求URL
 * @param {string} method - 请求方法
 * @param {object} data - 请求数据
 * @returns {Promise}
 */
function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    // 暂时不发送token，让投票API匿名访问
    const headers = {
      'Content-Type': 'application/json'
    };

    uni.request({
      url: `${API_CONFIG.baseUrl}${url}`,
      method: method,
      data: data,
      header: headers,
      timeout: API_CONFIG.timeout,
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 投票API类
 */
class VoteAPI {
  /**
   * 提交投票
   * @param {string} voteid - 投票ID
   * @param {number} selectedIndex - 选中的选项索引 (0, 1, 2)
   * @returns {Promise}
   */
  static submitVote(voteid, selectedIndex) {
    const voteParams = {
      voteid: voteid,
      a: selectedIndex === 0 ? 1 : 0,
      b: selectedIndex === 1 ? 1 : 0,
      c: selectedIndex === 2 ? 1 : 0
    };
	
	var url = '/vote/process';
	
	await requestWithToken(
    	`${API_CONFIG.baseUrl}${url}`, 
	    'POST', 
	    voteParams, 
	    await getToken()
	);
  }

  /**
   * 获取投票结果
   * @param {string} voteid - 投票ID
   * @returns {Promise}
   */
  static getVoteResult(voteid) {
	
	var url = '/vote/getResult';
	
	await requestWithToken(
		`${API_CONFIG.baseUrl}${url}`, 
	    'GET', 
	    { voteid }, 
	    await getToken()
	);
  }

  /**
   * 获取投票信息
   * @param {string} voteid - 投票ID
   * @returns {Promise}
   */
  static getVoteInformation(voteid) {
	  
	var url = '/vote/getResult';
	
	await requestWithToken(
		`${API_CONFIG.baseUrl}${url}`, 
	    'GET', 
	    { voteid }, 
	    await getToken()
	);
  }

  /**
   * 更新投票信息
   * @param {string} voteid - 投票ID
   * @param {string} title - 标题
   * @param {string} description - 描述
   * @param {string} date - 日期
   * @returns {Promise}
   */
  static updateVoteInformation(voteid, title, description, date) {
	  
	var url = '/vote/updateInformation';
	
	await requestWithToken(
		`${API_CONFIG.baseUrl}${url}`, 
	    'GET', 
	    {
	      voteid,
	      title,
	      description,
	      date
	    }, 
	    await getToken()
	);
  }
}

/**
 * 使用示例：
 * 
 * // 提交投票
 * VoteAPI.submitVote('abc123', 0)
 *   .then(result => {
 *     console.log('投票成功:', result);
 *   })
 *   .catch(error => {
 *     console.error('投票失败:', error);
 *   });
 * 
 * // 获取投票结果
 * VoteAPI.getVoteResult('abc123')
 *   .then(result => {
 *     console.log('投票结果:', result);
 *   })
 *   .catch(error => {
 *     console.error('获取结果失败:', error);
 *   });
 */

export default VoteAPI; 