// type = 5 班级荣誉，显示文案“因【班级荣誉名称】获得**分/勋章”

// type = 2 任务记录 因【任务名称】获得【奖励维度】”

<template>
  <ul>
    <li
      v-for="(item,index) in recordList"
      :key="index"
      :class="{'border-bottom': index != recordList.length-1}"
    >
      <div class="li-top flex justifySpaceBetween">
        <div class="li-top-left text-overflow-clamp2" v-if="item.type && item.type == 1">
          <span>
            {{item.evaluatorName}}老师{{item.rewardType == 5 ? '发布' : item.rewardType == 6 ? '扣除' : '评价'}}
          </span>
          <span class="content">“{{item.evaluationName}}”</span>
        </div>
        <div class="li-top-left text-overflow-clamp2" v-if="item.type && item.type == 5">
          <span>因{{item.remark}}获得</span>
          <span class="content" v-if="item.dimensionName">“{{item.dimensionName}}”</span>
        </div>
        <div class="li-top-left text-overflow-clamp2" v-if="item.type && item.type == 2">
          <span>因{{item.evaluationName}}获得</span>
          <span class="content" v-if="item.dimensionName">“{{item.dimensionName}}”</span>
        </div>
        <div class="li-top-right flex alignCenter">
          <span
            class="medalIcon"
            v-show="item.rewardType == 5 || item.rewardType == 6"
            :style="{'backgroundImage': `url(${item.medalIcon||require('./img/medal@2x.png')})`}"
          ></span>
          <span
            class="num-box clear"
            :class="{'add-box': item.rewardType == 3 || item.rewardType == 5,'reduce-box': item.rewardType == 4 || item.rewardType == 6}"
          >
            <span class="fr">{{item.score ? item.score : item.medal}}</span>
            <span class="fr add" v-show="item.rewardType == 3 || item.rewardType == 5">{{item.score ? '+' : item.medal ? '+' : ''}}</span>
          </span>
        </div>
      </div>
      <div class="li-content text-overflow" v-if="item.type && item.type == 1">{{item.remark}}</div>
      <div class="li-bottom flex justifySpaceBetween">
        <div class="li-bottom-left">
          <span class="time">{{item.recordTimeStr}}</span>
          <span v-show="item.deadLine && item.effectStatus == 0">{{item.deadLine | downTime}}后生效</span>
        </div>
        <div class="li-bottom-right" @click="_showDetail(item, 'student')">查看详情</div>
      </div>
    </li>

    <!--评价详情-->
    <v-detail ref="detail" :info="info" :itemInfo="itemInfo"></v-detail>
  </ul>
</template>

<script>
  import Detail from './modal/detail.vue'
  import {PjApi} from '@/utils/api'
  export default {
    name: "Student",
    props: ['recordList','recordType'],
    components: {
      'v-detail': Detail,
    },
    data() {
      return {
        info: null, // 评价详情
        itemInfo: null, //评语和图片
        nowTime: new Date().getTime(),
      }
    },
    methods: {
      async _showDetail(a, type) {
        this.info = a;
        // if(a.type == 1) {
        //   this.$indicator.open('请稍后...');
        //   const res = await this.$req.post(PjApi.getList, {recordId: a.id});
        //   if(res.resultCode == 1) {
        //     this.itemInfo = res.value[0];
        //     this.$refs.detail.isShow = true;
        //   }
        // } else {
        //     this.itemInfo = {
        //         content: '',
        //         fileInfoVOS: []
        //     }
            if (this.recordType === 'message') {
                this.$router.push({
                    path: '/recordDetail',
                    query: {
                        id: this.info.id,
                        type: type,
                    }
                });
            } else {
                this.$refs.detail.isShow = true;
            }
        // }
      }
    }
  }
</script>

<style lang="less" scoped>
  li {
    padding: 32px 0 38px 0;
    border-bottom-color: #EFF1F3;

    .li-top {
      width: 100%;
      .li-top-left {
        width: 414px;
        font-size: 32px;
        font-weight: 600;
        color: #262727;
        .content {
          color: #33A5FF;
        }
      }
      .li-top-right {
        .medalIcon {
          display: inline-block;
          width: 40px;
          height: 40px;
          margin-right: 8px;
          background-size: 40px auto;
          background-position: center;
          background-repeat: no-repeat;
        }
        .num-box {
          display: inline-block;
          width: 80px;
          font-size: 40px;
          font-weight: 600;
        }
        .add-box {
          color: #33A5FF;
        }
        .reduce-box {
          color: #FFB600;
        }
      }
    }
    .li-content {
      width: 100%;
      color: #B6B8B8;
      font-size: 28px;
      margin: 20px 0;
    }
    .li-bottom {
      color: #B6B8B8;
      font-size: 24px;
      .time {
        margin-right: 20px;
      }
    }
  }
</style>
