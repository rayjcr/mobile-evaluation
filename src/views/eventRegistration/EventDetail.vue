<template>
  <div class="detail scrollY">
    <div class="img"></div>
    <div class="detaillist">
      <div class="eventinfo">
        <div class="detailtitle flex">
          <div class="title">{{currActiv.activityName}}</div>
          <div class="status unstart">{{statusStr[currActiv.activityStatus]}}</div>
        </div>
        <div class="time flex"><img src="./img/time.png" alt="">报名时间: {{currActiv.startTime + '~' + currActiv.endTime}}</div>
        <div class="limit" v-if="currActiv.activityCapacity != -1">
          名额限制:
          <div class="progress">
            <div class="progress-bar progress-bar-striped active" :style="{'width': parseInt(currActiv.alreadyApply / currActiv.activityCapacity *100) +'%'}" ref="progress"></div>
          </div>
          共{{currActiv.activityCapacity}}名，还剩<span class="last">{{currActiv.activityCapacity - currActiv.alreadyApply}}</span>名
        </div>
        <div class="limit" v-else>
          名额限制:
          <div class="progress">
            <div class="progress-bar progress-bar-striped active" :style="{'width': parseInt(currActiv.alreadyApply / currActiv.activityCapacity *100) +'%'}" ref="progress"></div>
          </div>
          不限名额
        </div>
      </div>
      <div class="condition">
        <div class="cond flex" @click="dialogshow=true"><div class="text-overflow">报名范围: {{currActiv.activityRange}}</div><img src="./img/arrowdown.png" alt=""></div>
        <div class="cond flex"><div class="text-overflow">报名条件: {{currActiv.activityCondition}}</div></div>
        <div class="cond flex"><div class="text-overflow">报名消耗: {{currActiv.activityConsume > 0 ? currActiv.consumerName + 'x' + currActiv.activityConsume : '不消耗'}}</div></div>
      </div>
      <div class="eventdetail">
        <div class="hdjs">活动介绍:</div>
        <p v-html="currActiv.activityDescribe">
        </p>
        <div class="img"><img src="./img/defaultbg.png" alt=""></div>
      </div>
    </div>
    <div class="bottom" v-if="currActiv.activityStatus == '0'">
      <div class="button" :class="{'disable': getRegistrationSatus,'active':!getRegistrationSatus}" v-preventReClick="1000" @click="handlerRegistration($event)">{{ registered ? '已报名':(currActiv.activityCapacity - currActiv.alreadyApply === 0 ? '名额已满' : '立即报名')}}</div>
    </div>
    <div class="dialog-bg flex" v-if="dialogshow">
      <div class="dialog flex flex-column">
        <div class="title">报名范围</div>
        <div class="content">{{currActiv.activityRange}}</div>
        <div class="footer" @click="dialogshow = false">知道了</div>
      </div>
    </div>
    <div class="dialog-bg flex"  v-if="emitInfo.message">
      <div class="dialog flex flex-column" style="width:260px;height:100px;border-radius:10px;box-shadow:0px 6px 24px rgba(0,0,0,0.16);align-items: center;justify-content: center;">
        <div class="content" style="margin-bottom:0"><i class="icon" :class="{'icon-errow':emitInfo.code === 0,'icon-success':emitInfo.code === 1}"></i>{{emitInfo.message}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Axios from 'axios'
import { activityApi } from '@/utils/api'
import { Toast } from 'mint-ui';
export default {
  name: 'eventDetail',
  data(){
    return {
      statusStr: ['进行中','未开始','已截止'],
      dialogshow: false,
      currActiv: {},
      emitInfo: {},
      registered: false,
    }
  },
  mounted() {
    // this.currActiv = JSON.parse(sessionStorage.getItem('currActiv'))
    
  },
  computed:{
    getRegistrationSatus() {
      return this.currActiv.activityCapacity - this.currActiv.alreadyApply === 0 || this.registered
    }
  },
  activated() {
    this.getInit()
  },
  methods: {
    getInit(){
      
      this.currActiv = null
      this.registered = false
      this.currActiv = JSON.parse(sessionStorage.getItem('currActiv'))
      this.$refs.progress.style.width = parseInt(this.currActiv.alreadyApply / this.currActiv.activityCapacity *100) +'%'
      if(this.currActiv.studentCodeList && this.currActiv.studentCodeList.length > 0) {
        this.currActiv.studentCodeList.forEach(element => {
          if(this.$cookie.get('userId') == element) {
            this.registered = true
          }
        });
      }
    },
    handlerRegistration(event) {
      
      
      if(this.currActiv.activityCapacity - this.currActiv.alreadyApply !== 0 && !this.registered){
        if (event.target.disabled) {
          this.$toast('请不要重复点击，耐心等待一秒哦')
          return
        }
        Axios.post(activityApi.activityRegistration+this.currActiv.activityId+'/'+this.$cookie.get('userId'),{}).then(res => {
          if(res.resultCode === 1) {
            this.$my_message({
              tip: `报名成功！`,
              type: 'success',
              time: 2000
            });
            this.currActiv.alreadyApply ++
            this.registered = true
            sessionStorage.setItem('currActiv',JSON.stringify(this.currActiv))
            // window.location.reload()
          }else {
            this.$my_message({
                tip: `${res.resultMessage}`,
                type: 'error',
                time: 2000
              });
            // setTimeout(() => {
            //   this.emitInfo = {}
            // },1500)
          }
          
        })
      }
    },
  }
}
</script>

<style lang="less" scoped>
.detail{
  height: 100%;
  background-color: #EFF1F3;
  .img{
    height: 366px;
    background: url('./img/defaultbg.png') no-repeat;
    background-size: contain;
  }
  .detaillist{
    margin-top: -40px;
    .eventinfo{
      height: 236px;
      padding: 0 32px;
      padding-top: 40px;
      background-color: #fff;
      border-radius:40px 40px 0 0;
      .detailtitle{
        font-size:32px;
        font-weight:800;
        justify-content: space-between;
        .title{
          color:rgba(38,38,38,1);
          width: 448px;
        }
      }
      .time{
        font-size:24px;
        font-weight:400;
        color:rgba(182,184,184,1);
        margin-top: 14px;
        align-items: center;
        img{
          height: 28px;
          width: 28px;
          margin-right: 12px;
        }
      }
      .limit{
        margin-top: 32px;
        font-size:28px;
        font-weight:400;
        color:rgba(38,39,39,1);
        .progress{
          display: inline-block;
          width: 200px;
          height: 20px;
          background-color: #EFF1F3;
          border-radius: 10px;

          .progress-bar {
            float: left;
            width: 0;
            height: 100%;
            border-radius: 10px;
            animation: animate-positive 2s;
            background-color: #FF7B12;
            -webkit-box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
            box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
            -webkit-transition: width .6s ease;
            -o-transition: width .6s ease;
            transition: width .6s ease;
          }
          .progress-bar-striped {
            background-image: -webkit-linear-gradient(-45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
            background-image: -o-linear-gradient(-45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
            background-image: linear-gradient(-45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
            -webkit-background-size: 20px 20px;
            background-size: 20px 20px;
          }
          @-webkit-keyframes animate-positive{
            0% { width: 0; }
          }
          @keyframes animate-positive{
            0% { width: 0; }
          }
        }

        .last{
          color: #FF7B12;
        }
      }
    }
    .condition{
      height: 242px;
      margin-top: 14px;
      background-color: #fff;
      .cond{
        font-size:28px;
        font-weight:400;
        color:rgba(150,152,153,1);
        height: 80px;
        line-height: 80px;
        border-bottom: 1px solid #EFF1F3;
        padding-left: 32px;
        padding-right: 30px;
        justify-content: space-between;
        align-items: center;
        img{
          margin-left: 34px;
          width:16px;
          height:26px;
        }
      }
    }
    .eventdetail{
      margin-top: 14px;
      background-color: #fff;
      font-size:28px;
      font-weight:400;
      padding: 20px 32px 90px;
      color:rgba(150,152,153,1);
      .hdjs{
        margin-bottom: 32px;
      }
      p{
        margin-bottom: 20px;
      }
      .img{
        width: 100%;
        img{
          width: inherit;
        }
      }
    }
  }
  .bottom{
    font-size:30px;
    font-weight:400;
    color:rgba(255,255,255,1);
    position: fixed;
    bottom: 6px;
    width: 100%;
    .button{
      height: 88px;
      width: 320px;
      border-radius:44px;
      margin: 0 auto;
      text-align: center;
      line-height: 88px;
    }
  }
  .active{
    background:rgba(255,182,0,1);
    &:active{
      background:rgba(230,167,9,1);
    }
  }
  .disable{
    background: #B6B8B8;
  }
  .abadon{
    background:rgba(182,184,184,1);
  }
  .dialog-bg{
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 9999;
    justify-content: center;
    align-items: center;
    .dialog{
      width:502px;
      background:rgba(255,255,255,1);
      border-radius:40px;
      text-align: center;
      padding: 0 60px;
      .title{
        font-size:36px;
        font-family:PingFang SC;
        font-weight:800;
        color:rgba(38,38,39,1);
        margin-top: 24px;
        margin-bottom: 20px;
      }
      .content{
        font-size:28px;
        font-family:PingFang SC;
        font-weight:400;
        color:rgba(38,38,38,1);
        text-align: left;
        margin-bottom: 22px;
      }
      .footer{
        font-size:32px;
        font-family:PingFang SC;
        font-weight:bold;
        color:rgba(51,165,255,1);
        margin: 22px 0;
      }
    }
  }
}
.icon{
  display: inline-block;
  margin-right: 10px;
  margin-top: -2px;
  width: 32px;
  height: 32px;
  background-repeat: no-repeat;
  background-size: contain;
  vertical-align: middle;
}
.icon-errow{
  background-image: url('./img/icon_error@2x.png');
}
.icon-success{
  background-image: url('./img/icon_seccess@2x.png');
}
.inProgress{
  color: #33A5FF;
}
.stop{
  color: #969899;
}
.unstart{
  color: #FFB600;
}
</style>
