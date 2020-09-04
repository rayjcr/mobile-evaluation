<template>
  <div class="student">
    <v-stu-jlk ref="stu_jlk" v-if="jlk == 'true'"></v-stu-jlk>
    <v-stu ref="stu_cg" v-else></v-stu>
  </div>
</template>

<script>
  import Axios from 'axios'
  import wx from 'weixin-js-sdk'

  import {weixinAPi,scanExchangeApi,userInfoAPi} from '@/utils/api'

  import Student from './no-jlk/Student.vue'
  import Student_jlk from './jlk/Student_jlk.vue'

  export default {
    name: "StudentHome",
    components: {
      'v-stu': Student,
      'v-stu-jlk': Student_jlk
    },
    data() {
      return {
        jlk: this.$cookie.get('jlk')
      }
    },
    mounted() {
      this.getStudent();

      if (this.getIsWxClient()) {
        this.getConfig(); // 获取微信签名信息
      }

      this.$root.eventHub.$on('scan',() => {
        this.scan()
      })
    },
    activated() {
      // url地址发生改变时需要重新注册
      if (this.getIsWxClient()) {
        this.getConfig(); // 获取微信签名信息
      }
    },
    methods: {
      /*
      * 获取学生信息
      * */
      async getStudent() {
        let data = {
          schoolCode: this.$cookie.get('xxdm'),
          studentId: this.$cookie.get('userId')
        };
        this.$cookie.delete('userHeadImg');
        const res = await this.$req.get(userInfoAPi.getStudent,data);
        if (res.resultCode == 1) {
          if(res.value.photo) {
            this.$cookie.set('userHeadImg', res.value.photo);
          }
        }
      },
      /*
      * 获取到微信签名信息注册微信扫一扫功能
      * */
      getConfig() {
        let g_config = JSON.parse(this.$cookie.get('config'))
        let origin = this.$route.query.type || ''; // 是否来源于微信公众号 1,公众号；3，企业号

        Axios({
          method: 'get',
          timeout: 1000 * 30,
          withCredentials: false,
          url: weixinAPi.getSignature + '?url='+encodeURIComponent(window.location.href)+'&isPortal=true&school='+g_config.schoolCode+'&type='+origin,
        }).then((res) => {
          if(res.ResultCode == 1) {
            wx.config({
              debug: false,
              appId: res.Value.AppId, // 必填,公众号的唯一标识
              timestamp: res.Value.Timestamp, // 必填,生成签名的时间戳
              nonceStr: res.Value.Noce, // 必填,生成签名的随机串
              signature: res.Value.Signature, // 必填,签名
              jsApiList: ['scanQRCode'] // 必填,需要使用的JS接口列表
            })
            /* 处理失败验证 */
            wx.error(function (res) {
              // config 信息验证失败会执行error函数,如签名过期导致验证失败,具体错误信息可以打开config的debug模式查看,也可以在返回的res参数中查看,对于SPA可以在这里更新签名
              alert('配置验证失败: ' + res.errMsg)
            })
          }
        })
      },
      /*
      * 解密成功后进行添加兑换
      **/
      addInfo(qrId,qrNum,zgh) {
        let data = {
          classCode: this.$cookie.get('classCode'),
          gradeCode: this.$cookie.get('gradeId'),
          schoolCode: this.$cookie.get('xxdm'),
          userId: this.$cookie.get('userId'),
          userName: this.$cookie.get('name'),
          qrId : qrId, // 评价二维码主键
          qrNum : qrNum, // 预评价二维码序号
          zgh: zgh || null,
        };
        Axios.post(scanExchangeApi.addInfo, data).then((res) => {
          let content = '';
          if(res.resultCode == 1) {
            if(this.jlk == 'true' ) {
              content = `<p>您获得了“<span style="color:#33A5FF;">${res.value.dimensionName}</span>”* <span style="color:#FFB600;">${res.value.rewardNum}</span></p>`;

            } else {
              content = `<p>您在“<span style="color:#33A5FF;">${res.value.dimensionName}</span>” 获得<span style="color:#FFB600;">${res.value.rewardNum}</span>${res.value.rewardType == 1 ? '积分' : '勋章'}</p>`;

            }

            this.$my_message({
              tip: '兑换成功',
              content: content,
              type: 'success'
            });

            setTimeout(() => {
              this._jump('/exchange')
            },300)
          } else if(res.resultCode == -66) { // 兑换不成功(未到时间)
            content = `<p>请于<span style="color:#33A5FF;">${res.resultMessage}</span>后开始兑换</p>`;

            this.$my_message({
              tip: '兑换不成功',
              content: content,
              type: 'error'
            });
          } else if(res.resultCode == -67) { // 无法兑换(过期)
            content = `<p>该二维码已于<span style="color:#33A5FF;">${res.resultMessage}</span>过期</p>`;

            this.$my_message({
              tip: '无法兑换',
              content: content,
              type: 'error'
            });
          } else {
            this.$my_message({
              tip: `${res.resultMessage}`,
              type: 'error'
            });
          }
        })
      },
      /*
      * 对扫码返回的信息进行解密
      **/
      async getStudentQRCodeContent(encryptHex) {
        let data = { encryptHex };
        const res = await this.$req.get(scanExchangeApi.getQRContent, data)
        if (res.resultCode == 1) {
          let arr = res.value.split('&');
          this.addInfo(arr[0],arr[1],arr[2])
        }
      },
      /*
      * 调用微信扫一扫功能
      **/
      _wxScan() {
        let self = this;
        wx.ready(function () {
          wx.scanQRCode({ // 微信扫一扫接口
            desc: 'scanQRCode desc',
            needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
            scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
            success: function (res) {
              const getCode = res.resultStr // 当needResult 为 1 时，扫码返回的结果
              self.getStudentQRCodeContent(getCode)
            }
          })
        })
      },
      scan() {
        let self = this;
        try{
          if (typeof(nativeJS) != "undefined"){
            //走 app
            scanQRcode({},function (res) {
              if(res.ret == 1) {
                // self.$toast(JSON.stringify(res.info))
                self.getStudentQRCodeContent(res.info)
              }
            })
          } else if(self.getIsWxClient()) {
            self._wxScan();
          } else {
            self.$toast('当前环境不支持扫一扫')
          }
        } catch(e){
          console.log(e);
          self.$toast(JSON.stringify(e))
        }
      },
      /**
       * 判断是否是微信环境
       */
      getIsWxClient() {
        var ua = navigator.userAgent.toLowerCase();
        var origin = this.$route.query.type || ''; // 是否来源于微信公众号 1,公众号；3，企业号
        if (ua.match(/MicroMessenger/i) == "micromessenger" && origin && (origin == '1' || origin == '3')) {
          return true;
        }
        return false;
      },
      _jump(path) {
        this.$router.push({
          path
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .student {
    height: 100%;
  }
</style>
