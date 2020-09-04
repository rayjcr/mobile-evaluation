<template>
    <div class="role-list scrollY">
      <ul>
        <li class="flex" v-for="(item,index) in accountList" :key="index" @click="_selectAccount(item,index)">
          <div class="li_left">
            <img src="/static/img/avatar@2x.png" alt="">
          </div>
          <div class="li_right flex flex_1 alignCenter">
            <div class="li_right_l">
              <div class="li-top flex alignCenter">
                <div class="name">{{item.name}}</div>
                <div class="role tea" v-if="item.type == 3">教师</div>
                <div class="role stu" v-if="item.type == 4">学生</div>
              </div>
              <div class="li_bottom">{{item.description}}</div>
            </div>
            <div class="li_right_r" v-if="item.checked"></div>
          </div>
        </li>
      </ul>
    </div>
</template>

<script>
  import Axios from 'axios'
  import {loginAPi} from '@/utils/api'
  export default {
    name: 'SelectAccount',
    data() {
      return {
        type: this.$route.query.type,
        accountList: []
      }
    },
    mounted() {
      this._initData()
    },
    methods: {
      _selectAccount(a,i) {
        let data = {
          userId: a.id,
          username: a.mobilePhone,
          password: a.password,
          platform: 2, // 2综合素质移动端
        }
        this.$indicator.open('登录中，请稍后')
        this.accountList.forEach((c) => {
          c.checked = false;
        })
        this.accountList[i].checked = true
        if(this.type == 'pwd') {
          this._getUserLogin(data)
        } else {
          this._mobileToken(data)
        }
      },
      _getUserLogin(data) {
        Axios.get(loginAPi.getUserLogin+'?userId='+data.userId+'&username='+data.username+'&password='+sessionStorage.getItem('password')+'&platform='+data.platform).then((res) => {
          if(res.resultCode == 1) {
            // this.$cookie.set('isLogin',true)
            this.$cookie.set('authToken',res.value);
            setTimeout(() => {
              window.location.href = '/zhsz/home?isLogin=true'
              this.$indicator.close()
            },300)
          } else {
            this.$indicator.close()
            this.$toast(res.message);
          }
        })
      },
      _mobileToken(data) {
        Axios.post(loginAPi.mobileToken,data).then((res) => {
          if(res.status == 200) {
            this.$cookie.set('authToken',res.data);
            setTimeout(() => {
              window.location.href  = '/zhsz/home?isLogin=true'
              this.$indicator.close()
            },300)
          } else {
            this.$indicator.close()
            this.$toast(res.message);
          }
        })
      },
      _initData() {
        this.type = this.$route.query.type;
        this.accountList = JSON.parse(sessionStorage.getItem('accountList')) || []
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
  .role-list {
    height: 100%;
    padding: 0 32px;
    background-color: #EFF1F3;

    ul {
      padding-top: 40px;
    }
    li {
      cursor: pointer;
      margin-bottom: 40px;
      border-radius: 20px;
      padding: 30px 40px 30px 32px;
      background-color: #ffffff;
      border: 1px solid #EFF1F3;
      .li_left {
        width: 100px;
        height: 100px;
        margin-right: 20px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .li_right {
        .li_right_l {
          width: 445px;
          .li-top {
            margin-bottom: 6px;
            .name {
              color: #262727;
              font-weight: 600;
              font-size: 36px;
              margin-right: 20px;
            }
            .role {
              padding: 4px 20px;
              color: #ffffff;
              font-size: 24px;
              text-align: center;
              border-radius: 30px;
            }
            .stu {
              background-color: #33A5FF;
            }
            .tea {
              background-color: #FF7B12;
            }
          }
          .li_bottom {
            color: #262627;
            font-size: 24px;
          }
        }
        .li_right_r {
          width: 48px;
          height: 48px;
          background: url('./img/gou@2x.png') no-repeat center;
          background-size: 48px auto;
        }
      }
    }
  }
</style>
