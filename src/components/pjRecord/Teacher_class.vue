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
            <span class="className">{{item.className}}</span>
            <span class="content">
              因{{item.evaluationName}}
            </span>
          </span>
        </div>
        <div class="li-top-right flex alignCenter">
          <span
            class="num-box clear"
            :class="{'add-box': item.rewardType == 3,'reduce-box': item.rewardType == 4 }"
          >
            <span class="fr">{{item.score}}</span>
            <span class="fr add" v-show="item.rewardType == 3">{{item.score ? '+' : ''}}</span>
          </span>
        </div>
      </div>
      <div class="li-content text-overflow">{{item.remark}}</div>
      <div class="li-bottom flex justifySpaceBetween">
        <div class="li-bottom-left">
          <span class="time">{{item.recordTimeStr}}</span>
          <span v-show="item.deadLine && item.effectStatus == 0">{{item.deadLine | downTime}}后生效</span>
          <span v-if="onlySelfBtn==false">{{teacherName==item.evaluatorName?'我的评价':('由'+item.evaluatorName+'老师评价')}}</span>
          <span v-else-if="showOnlySelf==false">我的评价</span>
        </div>
        <div class="li-bottom-right" @click="_showDetail(item, 'teacher')">查看详情</div>
      </div>
    </li>

    <!--评价详情-->
    <v-detail ref="detail" :origin="'class'" :info="info" :itemInfo="itemInfo"></v-detail>
  </ul>
</template>

<script>
  import Detail from './modal/detail.vue'
  import {PjApi} from '@/utils/api'
  export default {
    name: "Class",
    props: ['origin','recordList','onlySelfBtn','showOnlySelf','recordType'],
    data() {
      return {
        info: null, // 评价详情
        itemInfo: null, //评语和图片
        nowTime: new Date().getTime(),
        teacherName: this.$cookie.get('name'),
      }
    },
    components: {
      'v-detail': Detail,
    },
    methods: {
      async _showDetail(a, type) {
        this.$indicator.open('请稍后...')
        const res = await this.$req.post(PjApi.getList, {recordId: a.id})
        if(res.resultCode == 1) {
            this.itemInfo = res.value[0]
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
  }
</script>

<style lang="less" scoped>
  li {
    padding: 20px 0;
    border-bottom-color: #EFF1F3;

    .li-top {
      width: 100%;
      .li-top-left {
        width: 600px;
        font-size: 32px;
        font-weight: 600;
        color: #262727;
        word-break: break-all;
        .name {
          color: #FFB600;
        }
        .content {
          margin-left: 10px;
        }
      }
      .li-top-right {
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
