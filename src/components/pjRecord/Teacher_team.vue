<template>
  <ul>
    <li
      v-for="(item,index) in recordList"
      :key="index"
      :class="{'border-bottom': index != recordList.length-1}"
    >
      <div class="li-top flex justifySpaceBetween">
        <div class="li-top-left text-overflow-clamp2">
          <span>
            <span class="groupName">{{item.groupName}}</span>
            <span class="content">
              <span v-if="item.dimensionName">在{{item.dimensionName}}中</span>
              {{item.rewardType == 3 ? '加分' : item.rewardType == 4 ? '减分' : item.rewardType == 5 ? '奖励勋章' : '扣除勋章'}}
            </span>
          </span>
        </div>
      </div>
      <div class="li-content text-overflow">{{item.remarks}}</div>
      <div class="li-bottom flex justifySpaceBetween">
        <div class="li-bottom-left">
          <span class="time">{{item.dayTab}}</span>
          <span v-show="item.deadLine && item.effectStatus == 0">{{item.deadLine | downTime}}后生效</span>
          <span v-if="onlySelfBtn==false">{{teacherName==item.evaluatorName?'我的评价':('由'+item.evaluatorName+'老师评价')}}</span>
          <span v-else-if="showOnlySelf==false">我的评价</span>
        </div>
        <div class="li-bottom-right" @click="_showDetail(item, 'teacher')">查看详情</div>
      </div>
    </li>

    <!--评价详情-->
    <v-detail ref="detail" :info="info" :batchId="batchId"></v-detail>
  </ul>
</template>

<script>
  import {PjApi} from '@/utils/api'

  import Detail from './modal/team_detail.vue'

  export default {
    name: "Teacher_team",
    props: {
      recordList: {
        default: []
      },
      onlySelfBtn:{
        default:undefined
      },
      showOnlySelf:{
        default: undefined
      },
      recordType: String
    },
    data() {
      return {
        info: null, // 评价详情
        batchId: '',
        nowTime: new Date().getTime(),
        teacherName: this.$cookie.get('name'),
      }
    },
    components: {
      'v-detail': Detail,
    },
    methods: {
      async _showDetail(a, type) {
        this.batchId = a.batchId;
        this.info = a;
        if (this.recordType === 'message') {
            this.$router.push({
                path: '/recordDetail',
                query: {
                    detail: JSON.stringify(a),//对象转为字符串
                    type: type,
                }
            });
        } else {
            this.$refs.detail.isShow = true;
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  li {
    padding: 20px 0;
    border-bottom-color: #EFF1F3;

    .li-top {
      width: 100%;
      .li-top-left {
        width: 100%;
        font-size: 32px;
        font-weight: 600;
        color: #262727;
        word-break: break-all;
        .groupName {
          color: #FFB600;
        }
        .content {
          margin-left: 10px;
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
