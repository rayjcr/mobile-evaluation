// 1.分数 2.勋章 3.加分 4.减分 5.奖励勋章 6.扣除勋章 7.禁止兑换商品 ,99 由评价项规则来确定


<template>
  <ul class="list-box">
    <li class="li-item" v-for="(item,index) in list" :key="index">
      <div class="item-top flex justifySpaceBetween alignCenter">
        <div class="timetag">{{info.evaluationItemRuleFrequency.type == 1 ? item.dayTab : info.evaluationItemRuleFrequency.type == 2 ? item.dayTab : info.evaluationItemRuleFrequency.type == 3 ? item.weekTab : item.monthTab}}</div>

        <div class="score" v-if="item.rewardType === 1 || item.rewardType === 3 || item.rewardType === 4">
          <span class="add" v-if="item.score > 0">+{{item.score}}</span>
          <span class="reduce" v-else>{{item.score || '0'}}</span>
        </div>
        <div class="score" v-else-if="item.rewardType === 2 || item.rewardType === 5 || item.rewardType === 6">
          <span class="add" v-if="item.medal > 0">+{{item.medal}}</span>
          <span class="reduce" v-else>{{item.medal || ''}}</span>
        </div>
      </div>

      <ul>
        <li class="detail border1px" v-for="(v,i) in item.itemInfoList" :key="i" @click="showDetail(index,i)">
          <div class="detail-top flex justifySpaceBetween alignCenter">
            <div class="left">{{v.createTime}}</div>
            <div class="right" v-if="item.status == 1">
              <div v-if="item.rewardType === 1 || item.rewardType === 3 || item.rewardType === 4">
                <span class="add" v-if="v.score > 0">+{{v.score}}</span>
                <span class="reduce" v-else>{{v.score}}</span>
              </div>
              <div v-else-if="item.rewardType === 2 || item.rewardType === 5 || item.rewardType === 6">
                <span class="add" v-if="v.medal > 0">+{{v.medal}}</span>
                <span class="reduce" v-else>{{v.medal}}</span>
              </div>
            </div>
          </div>
          <div class="task-info">
            <p class="text-overflow-clamp2">{{v.content}}</p>
            <div class="imglist clear" v-if="v.fileInfoVOS && v.fileInfoVOS.length > 0">
              <div class="img fl" :class="{'marginRight0': (n+1)%3==0}" v-for="(c,n) in v.fileInfoVOS" :key="n"><img :src="c.absolutePath" ></div>
            </div>
          </div>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
  export default {
    name: "RecordList",
    props: {
      list: {
        type: Array,
        default: () => []
      },
      info: {
        type: Object,
        default: () => ({})
      },
    },
    methods: {
      showDetail(index,i) {
        this.$emit('showDetail',{index,i})
      }
    }
  }
</script>

<style lang="less" scoped>
  .list-box {
    padding-bottom: 120px;
  }
  .li-item {
    position: relative;
    margin-bottom: 40px;

    .item-top {
      .timetag {
        color: #ffffff;
        font-size: 24px;
        padding: 12px 20px;
        background: linear-gradient(270deg,rgba(255,194,52,1) 0%,rgba(250,127,3,1) 100%);
        box-shadow: 0 6px 18px rgba(255,145,0,0.15);
        border-radius: 8px 30px 30px 8px;
      }
      .score {
        padding-right: 52px;
        .add {
          color: #33A5FF
        }
        .reduce {
          color: #FFB600;
        }
      }
    }
    ul {
      padding: 0 32px;
      li.detail {
        margin-top: 20px;
        border-radius: 20px;
        border-color: #EFF1F3;
        .detail-top {
          padding: 0 20px;
          height: 64px;
          .left {
            color: #262627;
            font-size: 36px;
            font-weight: 600;
          }
          .right {
            .add {
              color: #33A5FF
            }
            .reduce {
              color: #FFB600;
            }
          }
        }
        .task-info {
          padding: 0 20px 22px 20px;
          p {
            width: 582px;
            color: #262627;
            font-size: 28px;
            line-height: 40px;
            margin-bottom: 8px;
          }
          .imglist {
            .img {
              width: 180px;
              height: 180px;
              margin-right: 17px;
              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }
            .marginRight0 {
              margin-right: 0;
            }
          }
        }
      }
    }
  }
</style>
