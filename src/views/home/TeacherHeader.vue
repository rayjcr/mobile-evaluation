<template>
  <div class="header-box">
    <!--页面滚动时显示的头部-->
    <div class="header-fixed flex alignCenter" :style="{'opacity': opacity >= 1 ? 1 : opacity}">
      <div class="name flex_1 text-overflow">{{timeZH}}，{{teacherName}}老师</div>
      <div class="icon-box">
        <span class="rank" v-if="jlk == 'true'" @click="_jump('/ranklist')">榜单</span>
        <span class="scan" @click="scan">扫一扫</span>
      </div>
    </div>
    <!--页面未发生滚动时显示的头部-->
    <div class="header-bg flex" :style="{'opacity': scrollTop == 0 ? 1 : (1 - opacity) <= 0 ? 0 : (1 - opacity)}">
      <div class="header-left flex_1 text-overflow">
        <div class="name">{{timeZH}}，{{teacherName}}老师</div>
        <div class="pj_cs" v-if="jlk == 'true'">今日已发卡{{todayEvaluationNum}}次</div>
        <div class="pj_cs" v-else>今日已评价{{todayEvaluationNum}}次</div>
        <div class="search-tj" @click="_toggle">
          {{text}}
          <i class="mintui mintui-back back-icon"></i>
        </div>
      </div>
      <div class="icon-box">
        <span class="rank" v-if="jlk == 'true'" @click="_jump('/ranklist')">榜单</span>
        <span class="scan" @click="scan">扫一扫</span>
      </div>
    </div>

    <!--年级选择器-->
    <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
      <mt-picker :slots="dataList" :visible-item-count="5" :show-toolbar="true"  ref="picker" value-key="gradeName" :itemHeight="40">
        <div class="flex">
          <div class="picker-btn picker-cancel" @click="popupVisible = false">取消</div>
          <div class="picker-title"></div>
          <div class="picker-btn picker-sure" @click="onConfirm">完成</div>
        </div>
      </mt-picker>
    </mt-popup>
    <u-scan v-if="isScanLogin"></u-scan>
  </div>
</template>

<script>
  import Axios from 'axios'
  import wx from 'weixin-js-sdk'
  import {userInfoAPi,weixinAPi,scanLoginApi} from '@/utils/api'
  import UScan from './scan.vue'

  export default {
    name: "TeacherHeader",
    components: {
      UScan,
    },
    props: {
      scrollTop: {
        default: 0
      },
      teacherName: {
        default: ''
      },
      todayEvaluationNum: {
        default: 0
      },
      teacherGradeList: {
        default: []
      }
    },
    data() {
      return {
        jlk: this.$cookie.get('jlk'),

        popupVisible: false,
        gradeCode: '',
        text: '全部年级',
        nowHours: new Date().getHours(),
        dataList: [],
        
        isScanLogin: false,
        scanLoginInfo:{},
        scanLogin_qrCode:'',
      }
    },
    computed: {
      opacity() {
        let new_opacity = 0;
        new_opacity = ((this.scrollTop > 40 ? this.scrollTop - 40 : 0) / 100).toFixed(2);
        return new_opacity;
      },
      timeZH() {
        let text = '';
        if (this.nowHours >= 5 && this.nowHours < 9) {
          text = '早安'
        }else if (this.nowHours >= 9 && this.nowHours < 12) {
          text = '上午好'
        } else if (this.nowHours >= 12 && this.nowHours < 18) {
          text = '下午好'
        } else {
          text = '晚上好'
        }
        if(this.$cookie.get("xxdm")=='133'){
          text = '欢迎您'
        }
        return text;
      }
    },
    watch: {
      teacherGradeList(nVal) {
        let arr = [{
          gradeCode: '',
          gradeName: '全部年级'
        }]
        arr = arr.concat(nVal)
        let dateSlots = [
          {
            flex: 1,
            values: arr,
            className: 'slot1',
            textAlign: 'center'
          }
        ];
        this.dataList = dateSlots;
      },
      popupVisible(nVal) {
        this.$root.eventHub.$emit('hideFooter', !nVal)
      }
    },
    activated() {
      // url地址发生改变时需要重新注册
      if (this.getIsWxClient()) {
        this.getConfig(); // 获取微信签名信息
      }
      if(this.getIsDingClient()){
      }

    },
    mounted() {
      if (this.getIsWxClient()) {
        this.getConfig(); // 获取微信签名信息
      }
      if(this.getIsDingClient()){
        window.sessionStorage.setItem('origin',2);
        // alert(window.sessionStorage.getItem('origin'));
      }
    },
    methods: {
      /*
      * 对扫码返回的信息进行解密
      **/
      async getStudentQRCodeContent(encryptHex) {
        let rex = "qlc=(.*?)&";
        if(encryptHex.match(rex)){
          let arr = encryptHex.match(rex)
          let data = arr[1];
          this.scanLogin_qrCode = data
          const res = await this.$req.get_special(scanLoginApi.getInfo, data)
          this.isScanLogin = true
          this.scanLoginInfo = res
        }else{
          let data = { encryptHex };
          const res = await this.$req.get(userInfoAPi.getStudentQRCodeContent, data)
          if (res.resultCode == 1) {
            this.getStudentDetail(res.value)
          }
        }
      },
      /*
      * 获取学生信息
      * */
      async getStudentDetail(info) {
        let g_config = JSON.parse(this.$cookie.get('config'))
        let data = {
          schoolCode: g_config.schoolCode,
          studentId: info.xh
        };
        const res = await this.$req.get(userInfoAPi.getStudentDetail, data)
        
        if (res.resultCode == 1) {
          this.checkClassList(res.value)
        }
      },
      /*
      * 检查扫码返回的学生信息是否为该教师所带学生
      **/
      checkClassList(info) {
        let classList = JSON.parse(sessionStorage.getItem('allClassList')) || [];
        if(classList.length > 0) {
          for(let i=0;i<classList.length;i++){
            if(classList[i].classCode == info.classId) {
              this._jump(this.jlk == 'true' ? '/pjstudentjlk' : '/pjstudent',info)
              return;
            }
          }
          this.$toast('请确定是不是您的学生哦')
        } else {
          this.$toast('您还没有班级信息')
        }
      },
      /*
      * 获取到微信签名信息注册微信扫一扫功能
      **/
      getConfig() {
        let g_config = JSON.parse(this.$cookie.get('config'))
        // let origin = this.$route.query.type || ''; // 是否来源于微信公众号 1,公众号；3，企业号
        let origin = this.$route.query.type || this.$cookie.get('origin') || ''
        Axios({
          method: 'get',
          timeout: 1000 * 30,
          withCredentials: false,
          // histroy (encodeURIComponent(window.location.href));; hash (window.location.href.split('#')[0])
          // url: '//weixin.91sst.com/WeiInterface/GetSignature?url='+window.location.href.split('#')[0]+'&school=1163',
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
              // alert('配置验证失败: ' + res.errMsg)
              console.log('配置验证失败: ' + res.errMsg)
            })
          }
        })
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
      /*
      * 调用钉钉扫一扫功能
      **/
      _ddScan() {
        let self = this;
        dd.ready(function() {
          dd.biz.util.scan({
              type: 'all' , // type 为 all、qrCode、barCode，默认是all。
              onSuccess: function(data) {
                  //onSuccess将在扫码成功之后回调
                  /* data结构
                    { 'text': String}
                    */
                  const getCode = data.text;
                  self.getStudentQRCodeContent(getCode)
              },
              onFail : function(err) {
              }
          })
        });
      },
      scan() {
        let self = this;
        let origin = this.$route.query.type || window.sessionStorage.getItem('origin') || ''; // 是否来源于微信公众号 1,公众号；3，企业号 2钉钉
        
        try{
          if (typeof(nativeJS) != "undefined"){
            //走 app
            scanQRcode({},function (res) {
              if(res.ret == 1) {
                self.getStudentQRCodeContent(res.info)
              }
            })
          } else if(self.getIsWxClient()) { // 微信公众号，企业号
            self._wxScan();
          } else if(origin && origin == 2) { // 钉钉
            self._ddScan();
          }else {
            self.$toast('当前环境不支持扫一扫')
          }
        } catch(e){
          self.$toast(JSON.stringify(e))
        }
      },

      /**
       * 判断是否是微信环境
       */
      getIsWxClient() {
        var ua = navigator.userAgent.toLowerCase();
        // var origin = this.$route.query.type || ''; // 是否来源于微信公众号 1,公众号；3，企业号
        var origin = this.$route.query.type || this.$cookie.get('origin') || ''
        if (ua.match(/MicroMessenger/i) == "micromessenger" && origin && (origin == '1' || origin == '3')) {
          return true;
        }
        return false;
      },
      getIsDingClient(){
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/dingtalk/i) == "dingtalk") {
          return true;
        }
        return false;
      },

      _toggle() {
        this.popupVisible = true;
      },
      onConfirm() {
        let subjectSelected = this.$refs.picker.getValues()[0];
        this.text = subjectSelected.gradeName;
        this.gradeCode = subjectSelected.gradeCode;
        this.$emit('getGradeCode',subjectSelected.gradeCode);
        this.popupVisible = false
      },
      _jump(path,info) {
        let query = {};
        if(path == '/ranklist') { // 跳转到榜单
          query = {
            type: 'teacher',
            gradeCode: this.gradeCode
          }
        } else {
          query = {
            type: 0,
            title: info.name,
            classCode: info.classId,
            gradeCode: info.gradeId,
            userId: info.studentId
          }
        }

        this.$router.push({
          path,
          query
        })
      }
    },
  }
</script>

<style lang="less" scoped>
  .header-box {
    position: relative;

    .header-bg {
      height: 349px;
      padding: 0 32px;
      background-image: url("./img/header_bg@2x.png");
      background-repeat: no-repeat;
      background-size: 100%;

      .header-left {
        padding-top: 32px;
      }
      .name {
        font-size: 36px;
        color: #fff;
        font-weight: 600;
      }
      .pj_cs {
        font-size: 28px;
        color: #fff;
        margin-top: 12px;
      }
      .search-tj {
        margin-top: 12px;
        font-size: 28px;
        color: #ffffff;

        .back-icon {
          font-size: 25px;
          display: inline-block;
          width: 25px;
          margin-left: 10px;
          transform: rotate(-90deg);
          transform-origin: center;
          transition: all .5s;
        }
        .up {
          transform: rotate(90deg);
        }
      }
    }
    .icon-box {
      padding-top: 32px;
      span {
        display: inline-block;
        width: 90px;
        color: #ffffff;
        font-size: 20px;
        padding-top: 60px;
        text-align: center;
        &.scan {
          background: url('./img/icon_scan@2x.png') no-repeat center top;
          background-size: 58px auto;
        }
        &.rank {
          background: url('./img/icon_medal@2x.png') no-repeat center top;
          background-size: 58px auto;
        }
      }
    }
    .header-fixed {
      position: fixed;
      z-index: 1005;
      top: 0;
      left: 0;
      width: 100%;
      height: 138px;
      background-color: #ffffff;

      .icon-box {
        padding-top: 0;
        margin-right: 32px;
        .scan {
          color: #262727;
          background: url('./img/icon_scan2@2x.png') no-repeat center top;
          background-size: 58px auto;
        }
        .rank {
          color: #262727;
          background: url('./img/icon_medal2@2x.png') no-repeat center top;
          background-size: 58px auto;
        }
      }
      .name{
        color: #262727;
        font-size: 40px;
        font-weight: 600;
        margin-left: 32px;
      }
    }

  }
</style>
