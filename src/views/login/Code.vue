<template>
  <div class="login-wrapper">
    <div class="head">
      <span>验证码</span>登录
    </div>
    <div class="login-box">
      <div class="input-box marginBottom40">
        <input class="input" type="number" @input="mobile=mobile.slice(0,11)" v-model="mobile" @blur="$blur" placeholder="请输入您的手机号">
      </div>
      <div class="input-box marginBottom40">
        <input class="input input_code" type="text" maxlength="6" v-model="code" @blur="$blur" placeholder="请输入验证码">
        <div v-if="repeatText" class="code" :class="{'noClick' : waitTime != 60}" @click="_codeSend">{{repeatText}}</div>
        <div v-else class="code" :class="{'noClick' : waitTime != 60}" @click="_codeSend">{{waitTime == 60 ? '获取验证码' : `${waitTime}s`}}</div>
      </div>
      <div class="sub noSub marginBottom40" v-if="mobile == '' || code == ''">登录</div>
      <div class="sub marginBottom40" v-else  @click="_codeSub">登录</div>
      <div class="toggle-type" @click="_jump('/loginpwd')">
        使用<span>密码</span>登录
      </div>
    </div>
  </div>
</template>

<script>
  import Axios from 'axios'
  import {loginAPi} from '@/utils/api'
  const mobileReg= /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
  export default {
    name: 'Code',
    data() {
      return {
        mobile: '',
        code: '',
        timer: null,
        waitTime: 60,
        repeatText: '',
        submitHttp: true, // 控制提交请求频率，防止网络异常造成多次地点击请求
      }
    },
    beforeRouteLeave(to, from, next) {
      !!this.timer && clearInterval(this.timer);
      next()
    },
    mounted() {
      this._initData();
      
    },
    methods: {
      _setAccountList(list) {
        let accountList = [];
        list.forEach((c) => {
          this.$set(c,'checked',false)
          if(c.type == 3) {
            accountList.push(c)
          } else if(c.type == 4){
            accountList.unshift(c)
          }
        })
        sessionStorage.setItem('accountList',JSON.stringify(accountList))// 存储用户列表
      },
      _codeSub() {
        if(!mobileReg.test(this.mobile)){
          this.$toast('请输入正确的手机号!');
          return;
        }
        if(!this.submitHttp) {
          this.$toast('当前网络异常，请耐心等待')
          return
        }
        let data = {
          username: this.mobile,
          password: this.code,
          platform: 2, // 2综合素质移动端
        };
        this.$indicator.open('登录中，请稍后')
        this.submitHttp = false;
        //手机验证码登录 如果查询用户为多个则返回用户列表，否则返回token
        Axios.post(loginAPi.mobileToken,data).then((res) => {
          this.submitHttp = true;
          if(res.status == 200) {
            if (res.data instanceof Array && res.data.length > 0) {
              this._setAccountList(res.data);
              
              setTimeout(() => {
                this._jump('/selectAccount','code')
                this.$indicator.close()
              },300)
            } else {
              this.$cookie.set('authToken',res.data);
              setTimeout(() => {
                window.location.href  = '/zhsz/home?isLogin=true'
                this.$indicator.close()
              },300)
            }
          } else {
            this.$indicator.close()
            this.$toast(res.message);
          }
        })
      },
      _codeSend() {
        if(this.waitTime != 60){
          return false;
        }
        if(!mobileReg.test(this.mobile)){
          this.$toast('请输入正确的手机号!');
          return false;
        }
        !!this.timer && clearInterval(this.timer);
        this.waitTime --;
        this.repeatText = ''
        this.timer = setInterval(() => {
          this.waitTime --
          if(this.waitTime <= 0){
            clearInterval(this.timer);
            this.waitTime = 60;
            this.repeatText = '重新发送'
          }
        },1000);
        let data = {
          username: this.mobile
        };
        Axios.post(loginAPi.mobileKaptcha,data).then((res) => {
          if(res.status == 200) {
            this.$toast('验证码发送成功');
          } else {
            clearInterval(this.timer);
            this.waitTime = 60;
            this.$toast(res.message);
          }
        })
      },
      _initData() {
        this.mobile = '';
        this.code = '';
        this.waitTime = 60;
      },
      _jump(path,type) {
        this.$router.push({
          path,
          query: {
            type
          }
        })
      },
      clearAllCookie() {
        let keys = document.cookie.match(/[^ =;]+(?=\=)/g);
        if(keys) {
          for(let i = keys.length; i--;)
            document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  @spacing: 40px;
  .login-wrapper {
    position: relative;
    height: 100%;
    padding: 0 60px;
    background-color: #FFFFFF;
    .marginBottom40 {
      margin-bottom: @spacing;
    }
    .head {
      color: #262627;
      font-size: 52px;
      padding-top: 100px;
      span {
        position: relative;
        &:after {
          position: absolute;
          left: 0;
          bottom: 0;
          content: '';
          width: 100%;
          height: 8px;
          background-color: #33A5FF;
        }
      }
    }
    .login-box {
      margin-top: 160px;
      .input-box {
        position: relative;
        background-color: #EFF1F3;
        border-radius: 20px;
        padding: 22px 40px;
        .input {
          color: #262727;
          font-size: 40px;
          background-color: transparent;
        }
        input[type="number"] {
           width: 100%;
        }
        .input_code {
          width: 60%;
        }
        .code {
          position: absolute;
          right: 0;
          top: 0;
          width: 200px;
          height: 95px;
          line-height: 95px;
          text-align: center;
          color: #ffffff;
          font-size: 28px;
          background-color: rgba(51,165,255,1);
          border-radius: 20px;
          &.noClick {
            background-color: rgba(51,165,255,.5);
          }
        }
      }
      .sub {
        height: 88px;
        line-height: 88px;
        color: #FFFFFF;
        font-size: 36px;
        text-align: center;
        border-radius: 44px;
        cursor: pointer;
        background-color: rgba(51,165,255,1);
        &.noSub {
          background-color: rgba(51,165,255,.5);
        }
      }
      .toggle-type {
        color: #262727;
        font-size: 28px;
        text-align: center;
        cursor: pointer;
        span {
          color: #33A5FF;
        }
      }
    }
  }
</style>
