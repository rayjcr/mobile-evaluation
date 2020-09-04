<template>
  <div class="modal-box">
    <div class="popup-bg flex alignCenter justifyCenter" v-if="acceptflg">
      <div class="popup">
        <div class="popup-head border-bottom">
          <div class="title">
            {{info.name}}
            <div class="close" @click="acceptflg = false"></div>
          </div>
        </div>
        <div class="popup-info border-bottom">
          <p class="content">{{info.content}}</p>
          <div class="imglist clear scrollY">
            <div class="img fl a" v-for="(item,index) in info.fileInfoVOS" :key="item.absolutePath+index"><img v-gallery:group7 :src="item.absolutePath"></div>
          </div>
        </div>
        <div class="popup-bottom">
          <div v-if="info.status == 0">
            <div class="createTime">提交时间: {{info.createTime}}</div>
            <div class="btn-box flex">
              <div class="btn not-pass" v-preventReClick="1000" @click="audit($event,-1,info.id)">不通过</div>
              <div class="btn pass" v-preventReClick="1000" @click="audit($event,1,info.id)">通过</div>
            </div>
          </div>
          <div class="bottom-box" v-else>
            <div v-if="info.status == 1">
              <div class="wd" v-if="info.dimensionName">
                维度:
                <span>{{info.dimensionName}}</span>
              </div>
              <div class="jl">
                奖励:
                <span>{{info.score ? '分数+' + info.score : '勋章+' + info.medal}}</span>
              </div>
            </div>
            <div class="tjsj">提交时间: {{info.createTime}}</div>
            <div class="shsj">审核时间: {{info.auditTime}}</div>

            <!-- 是否通过 -->
            <div class="btn-bg pass-bg" v-if="info.status == 1"></div>
            <div class="btn-bg nopass-bg" v-else></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Audit",
    props: ['info','dimensionName','dimensionId'],
    data() {
      return {
        acceptflg: false,
        typeselected: '1',
        number: 1,
        recordItemId: '',
        rewardMin: 0,
        rewardMax: 100
      }
    },
    methods: {
      showModal() {
        this.acceptflg = true;
      },
      hideModal() {
        this.acceptflg = false;
      },
      audit(event,status,recordItemId) {
        let data = {
          status,
          recordItemId
        };
        if (event.target.disabled) {
          this.$toast('请不要重复点击，耐心等待一秒哦')
          return
        }
        this.$emit('audit',data)
      },
      showWd() {
        this.$emit('showWd')
      },
    }
  }
</script>

<style lang="less" scoped>
  .popup-bg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2000;
    width: 100%;
    height: 100vh;
    background: rgba(0,0,0,.5);

    .popup {
      width: 686px;
      border-radius: 40px;
      background-color: #ffffff;
      .popup-head {
        width: 100%;
        padding: 24px 0;
        border-bottom-color: #EFF1F3;
        .title {
          position: relative;
          color: #262627;
          font-size: 36px;
          font-weight: 600;
          text-align: center;
          .close {
            position: absolute;
            right: 0;
            top: 12px;
            width: 90px;
            height: 27px;
            background-image: url(/static/img/close.png);
            background-repeat: no-repeat;
            background-size: 26px auto;
            background-position: center;
          }
        }
      }
      .popup-info {
        padding: 30px 32px 32px;
        border-bottom-color: #EFF1F3;
        .content {
          color: #262627;
          font-size: 28px;
          line-height: 40px;
        }
        .imglist {
          max-height: 400px;
          margin-top: 32px;
          .img{
            height: 190px;
            width: 190px;
            overflow: hidden;
            margin-right: 10px;
            margin-bottom: 10px;
            background-color: #EFF1F3;
            img{
              height: 100%;
              width: 100%;
              object-fit: cover;
            }
          }
        }
      }

      .createTime {
        color: #B6B8B8;
        font-size: 28px;
        padding: 32px;
      }
      .btn-box {
        padding: 20px 72px;
        .btn {
          width: 200px;
          height: 64px;
          line-height: 64px;
          text-align: center;
          font-size: 30px;
          border-radius: 44px;
        }
        .not-pass {
          color: #FF7B12;
          background-color: #EFF1F3;
        }
        .pass {
          color: #FFFFFF;
          background-color: #33A5FF;
          margin-left: 142px;
        }
      }
      .bottom-box {
        position: relative;
        padding: 32px;
        color: #B6B8B8;
        font-size: 28px;
        .wd ,.jl {
          margin-bottom: 20px;
          span {
            display: inline-block;
            color: #262727;
            font-size: 28px;
            margin-left: 68px;
          }
        }
        .shsj {
          margin-top: 20px;
        }
        .btn-bg {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 140px;
          height: 140px;
          background-size: 140px auto;
          background-repeat: repeat;
          background-position: center;
        } 
        .pass-bg {
          background-image: url(../img/pass@2x.png);
        }
        .nopass-bg {
          background-image: url(../img/nopass@2x.png);
        }
      }
    }
  }
</style>
