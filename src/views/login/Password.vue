<template>
  <div class="login-wrapper">
    <div class="head">
      <span>密码</span>登录
    </div>
    <div class="login-box">
      <div class="input-box marginBottom40">
        <input class="input" type="number" @input="mobile=mobile.slice(0,11)" v-model="mobile" @blur="$blur" placeholder="请输入您的手机号">
      </div>
      <div class="input-box flex alignCenter marginBottom40" v-if="!isPlaintext">
        <input class="input pwd_width"  type="password" maxlength="20" v-model="password" @blur="$blur" placeholder="请输入密码">
        <i class="icon icon-pwd"  @click="_togglePlaintext(true)"></i>
      </div>
      <div class="input-box flex alignCenter marginBottom40" v-else>
        <input class="input pwd_width" type="text" maxlength="20" v-model="password" @blur="$blur" placeholder="请输入密码">
        <i class="icon icon-hide-pwd" @click="_togglePlaintext(false)"></i>
      </div>
      <div class="sub noSub marginBottom40" v-if="mobile == '' || password == ''">登录</div>
      <div class="sub marginBottom40" v-else  @click="_pwdSub">登录</div>
      <div class="toggle-type" @click="_jump('/logincode')">
        使用<span>验证码</span>登录
      </div>
    </div>
  </div>
</template>

<script>
  import Axios from 'axios'
  import {loginAPi} from '@/utils/api'
  
  import {scanLoginApi} from '@/utils/api'
  const mobileReg= /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
  export default {
    name: 'Password',
    data() {
      return {
        mobile: '',
        password: '',
        isPlaintext: false, // 是否明文显示密码
        submitHttp: true
      }
    },
    mounted() {
      this._initData();

      let origin = this.$route.query.type || '';
      sessionStorage.setItem('origin',origin)
    },
    methods: {
      _togglePlaintext(bool) {
        this.isPlaintext = bool;
      },
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
      _pwdSub() {
        if(!mobileReg.test(this.mobile)){
          this.$toast('请输入正确的手机号!');
          return
        }
        if(!this.submitHttp) {
          this.$toast('当前网络异常，请耐心等待')
          return
        }
        this.$indicator.open('登录中，请稍后')
        this.submitHttp = false;
        Axios.get(loginAPi.getUserLogin+'?username='+this.mobile+'&password='+this.password+'&platform=2').then((res) => {
          this.submitHttp = true;
          if (res.resultCode == 1) {
            if (res.value instanceof Array && res.value.length > 0) {
              this._setAccountList(res.value);
              sessionStorage.setItem('password',this.password)
            
              setTimeout(() => {
                this._jump('/selectAccount','pwd')
                this.$indicator.close()
              },300)
            } else {
              if(res.value) {
                this.$cookie.set('authToken',res.value);
                setTimeout(() => {
                  window.location.href  = '/zhsz/home?isLogin=true'
                  this.$indicator.close()
                },300)
              } else {
                this.$indicator.close()
                this.$toast('手机号或密码错误');
              }
            }
          } else {
            this.$indicator.close()
            this.$toast(res.resultMessage)
          }
        })
      },
      _initData() {
        this.mobile = '';
        this.password = '';
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
    height: 100%;
    padding: 0 60px;
    background-color: #FFFFFF;
    .marginBottom40 {
      margin-bottom: @spacing;
    }
    .head {
      color: #262627;
      font-size: 48px;
      padding-top: 100px;
      span {
        position: relative;
        &:after {
          position: absolute;
          left: 0;
          bottom: -10px;
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
        .pwd_width {
          width: 500px;
        }
        .icon {
          display: inline-block;
          width: 53px;
          height: 36px;
        }
        .icon-pwd {
          background: url("./img/icon_pwd.png") no-repeat center;
          background-size: 53px auto;
        }
        .icon-hide-pwd {
          background: url("./img/icon_hide_pwd.png") no-repeat center;
          background-size: 53px auto;
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
