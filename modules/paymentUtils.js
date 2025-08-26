export function sendPaymentTest(){
	wx.requestPayment({
	  timeStamp: '1615711611', // dummy timestamp
	  nonceStr: '5K8264ILTKCH16CQ2502SI8ZNMTM67VS', // dummy nonce string
	  package: 'prepay_id=dummy', // dummy prepay id
	  signType: 'MD5', // signType can be 'MD5' or 'HMAC-SHA256'
	  paySign: '5K8264ILTKCH16CQ2502SI8ZNMTM67VS', // dummy signature
	  success(res) {
	    console.log('Payment successful:', res);
	    wx.showToast({
	      title: 'Payment successful',
	      icon: 'success',
	      duration: 2000
	    });
	  },
	  fail(err) {
	    console.log('Payment failed:', err);
	    wx.showToast({
	      title: 'Payment failed',
	      icon: 'none',
	      duration: 2000
	    });
	  }
	});
}

export async function sendPayment(paymentInfo){
	return new Promise((resolve, reject) => {
		uni.requestPayment({
			"provider": "wxpay",
			"nonceStr": paymentInfo.nonceStr,
			"package": paymentInfo.prepayId,
			"timeStamp": paymentInfo.timeStamp,
			"signType": paymentInfo.signType,
			"paySign": paymentInfo.paySign,
			success(res) {
				console.log("支付成功")
				console.log(res)
				resolve(true)
			},
			fail(e) {
				console.log("支付失败")
				console.log(e)
				resolve(false)
			}
		})
	})
	// let paymentStatus = ""
	// uni.requestPayment({
	//     "provider": "wxpay",
	// 	"nonceStr": paymentInfo.nonceStr,
	// 	"package": paymentInfo.prepayId,
	// 	"timeStamp": paymentInfo.timeStamp,
	// 	"signType": paymentInfo.signType,
	// 	"paySign": paymentInfo.paySign,
	//     success(res) {
	// 		console.log("支付成功")
	// 		console.log(res)
	// 		paymentStatus = "success"
	// 	},
	//     fail(e) {
	// 		console.log("支付失败")
	// 		console.log(e)
	// 		paymentStatus = "fail"
	// 	}
	// })
	// return paymentStatus
}
