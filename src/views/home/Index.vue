<template>
  <div class="zhsz-wrapper">
    <div class="content" :class="{'contentH': !show}">
      <keep-alive include="Home"> 
        <router-view />
      </keep-alive>
    </div>
    <div class="bottom" v-show="show">
      <ul class="flex alignCenter" style="height: 100%">
        <li class="flex_1" :class="{'active': path == '/zhsz/home'}" @click="jump('/zhsz/home')">
          <span class="icon-home"></span>
          <p>首页</p>
        </li>
        <li class="flex_1" :class="{'active': path == '/zhsz/task'}" @click="jump('/zhsz/task')">
          <span class="icon-task"></span>
          <p>任务</p>
        </li>
        <li class="flex_1" :class="{'active': path == '/zhsz/message'}" @click="jump('/zhsz/message')">
          <span class="tip-point" v-if="readVisible === false"></span>
          <span class="icon-message"></span>
          <p>消息</p>
        </li>
        <li class="flex_1" :class="{'active': path == '/zhsz/mine'}" @click="jump('/zhsz/mine')">
          <span class="tip-point" v-if='taskCount'></span>
          <span class="icon-mine"></span>
          <p>我的</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { MessageApi } from '@/utils/api';
import Bus from '../message/component/bus';

export default {
    name: "Index",
    data() {
      return {
        path: window.location.pathname.indexOf('?') > -1 ? window.location.pathname.substr(0,window.location.pathname.indexOf('?')) : window.location.pathname,
        show: true,
        readVisible: false, // 消息是否已读
        taskCount: 0,  
      }
    },
    mounted() {
        /*修复ios手机下底部导航会盖住遮罩层问题*/
        this.$root.eventHub.$on('hideFooter',(bool) => {
            this.show = bool;
        });
        this.getTaskCount()
    },
    // 监听message页面的alreadyRead事件
    mounted: function() {
        Bus.$on('read', function(val) {
            console.log("首页已读=", val);
            if (val === true) {
                // this.readVisible = val;
            }
        });
    },
    methods: {
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
        jump(path) {
            let query = {};
            this.path = path;
            if(this.$route.query.isLogin && this.$route.query.isLogin == 'true') {
                query['isLogin'] = this.$route.query.isLogin || '';
            } else if(this.$route.query.token) {
                query['token'] = this.$route.query.token || '';
            } else {
                query['username'] = this.$route.query.username || '';
                query['password'] = this.$route.query.password || '';
                if(this.getIsWxClient()) {
                //histroy模式下,调用微信扫一扫时初始化配置的地址要保持一致，否则无法再次调起扫一扫
                query['xxdm'] = this.$route.query.xxdm || '';
                query['type'] = this.$route.query.type || '';
                query['unix'] = this.$route.query.unix || '';
                }
            }
            this.$router.replace({
                path,
                query
            })
        },
      async getTaskCount(){
        let data = {
            schoolCode: this.$cookie.get('xxdm'),
            teacherId: this.$cookie.get('userId')
        }
        let res = await this.$req.get(teacherCheckTask.taskPendingList, data)
        console.log(res,'index')
        if(res.resultCode == 1){
            if(res.value && res.value.length){
                this.taskCount = res.value.length
            }else{
                this.taskCount = 0
            }
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .zhsz-wrapper {
    height: 100%;
    position: relative;
    background-color: #FFFFFF;

    .content {
      height: calc(100% - 116px);
      &.contentH {
        height: 100%;
      }
    }
    .bottom {
      position: fixed;
      z-index: 1000;
      width: 100%;
      height: 116px;
      bottom: 0;
      background-color: #FFFFFF;
      border-top: 1px solid #EFF1F3;
      li {
        text-align: center;
        font-size: 24px;
        color: #B6B8B8;
        margin-top: 10px;
        cursor: pointer;
        span {
          display: inline-block;
          width: 48px;
          height: 48px;
          background-repeat: no-repeat;
          background-size: 90%;
          background-position: center;
        }
        .icon-home {
          background-image: url(/static/img/icon_home@2x.png);
        }
        .icon-task {
          background-image: url(/static/img/icon-task@2x.png);
        }
        .icon-message {
          background-image: url(/static/img/icon-message@2x.png);
        }
        .icon-mine {
          background-image: url(/static/img/icon_mine@2x.png);
        }
        &.active {
            .icon-home {
                background-image: url(/static/img/icon_home_checked@2x.png);
            }
            .icon-task {
                background-image: url(/static/img/icon_task_checked@2x.png);
            }
            .icon-message {
                background-image: url(/static/img/icon-message-checked@2x.png);
            }
            .icon-mine {
                background-image: url(/static/img/icon_mine_checked@2x.png);
            }
            p {
                color: #262727;
            }
        }
      }

      .tip-point {
            width: .21rem;
            height: .21rem;
            background-color: #FF7B12;
            border-radius: 50%;
            position: fixed;
            margin-left: .5rem;
            z-index: 1000;
        }
    }
  }
</style>
