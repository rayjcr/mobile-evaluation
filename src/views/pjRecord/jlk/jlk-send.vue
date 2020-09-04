// type = 2 任务记录 显示“【班级】【学生姓名】，因【任务名称】获得【奖励维度】”
// type = 3 任务记录 显示“因【任务名称】获得【奖励维度】”
<template>
  <ul>
    <li
      v-for="(item,index) in list"
      :key="index"
      :class="{'border-bottom': index != list.length-1}"
    >
      <div class="li-top flex justifySpaceBetween">
        <div class="li-top-left text-overflow-clamp2">
          <span>
            <span class="className" v-if="type!=3">{{item.className}}</span>
            <span class="name" v-if="type!=3">{{item.name}}</span><span v-if="type!=3">,</span>
            <span class="content" v-if="item.type && item.type == 1 ">
              获得{{item.evaluationName}}
            </span>
            <span class="content" v-if="item.type && item.type == 2">
              因“{{item.evaluationName}}”{{item.medalDimensionIdName ? '获得' + item.medalDimensionIdName : ''}}
            </span>
          </span>
        </div>
        <div class="li-top-right flex alignCenter">
          <span
            class="medalIcon"
            :style="{'backgroundImage': `url(${item.medalDimensionIdIcon||require('../img/medal@2x.png')})`}"
          ></span>
          <span class="num-box clear add-box">
            <span class="fr">{{item.medal}}</span>
            <span class="fr add" >+</span>
          </span>
        </div>
      </div>
      <div class="li-content text-overflow">{{item.remark}}</div>
      <div class="li-bottom flex justifySpaceBetween">
        <div class="li-bottom-left">
          <span class="time">{{item.dayTab}}</span>
          <span v-show="item.deadLine && item.effectStatus == 0">{{item.deadLine | downTime}}后生效</span>
        </div>
        <div class="li-bottom-right" @click="_showDetail(item)">查看详情</div>
      </div>
    </li>

    <!--评价详情-->
    <v-detail ref="detail" :info="info"></v-detail>
  </ul>
</template>

<script>
  import Detail from '../modal/detail.vue'

  export default {
    name: "jlk-send",
    props: ['list','type'],
    data() {
      return {
        info: null, // 评价详情
      }
    },
    components: {
      'v-detail': Detail,
    },
    methods: {
      _showDetail(a) {
        this.info = a;
        this.$refs.detail.isShow = true;
      }
    }
  }
</script>

<style lang="less" scoped>
  ul {
    margin-bottom: 40px;
  }
  li {
    padding: 20px 0;
    border-bottom-color: #EFF1F3;

    .li-top {
      width: 100%;
      .li-top-left {
        width: 400px;
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
        .medalIcon {
          display: inline-block;
          width: 108px;
          height: 50px;
          margin-right: 8px;
          background-size: 108px auto;
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
