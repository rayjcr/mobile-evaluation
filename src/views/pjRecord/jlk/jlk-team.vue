<template>
  <ul>
    <li :class="{'border-bottom': index != list.length-1}"  v-for="(item,index) in list" :key="index" @click="_showDetail(item)">
      <div class="li_top flex alignCenter">
        <div class="name text-overflow">{{item.groupName}}</div>
        <div class="content text-overflow" v-if="item.dimensionName">获得{{item.dimensionName}}</div>
      </div>
      <div class="li_bottom">{{item.dayTab}}</div>
    </li>

    <!--评价详情-->
    <v-detail ref="detail" :info="info" :batchId="batchId"></v-detail>
  </ul>
</template>

<script>
  import {PjApi} from '@/utils/api'

  import Detail from '../modal/team_detail.vue'

  export default {
    name: "jlk_team",
    props: {
      list: {
        default: [],
      }
    },
    data() {
      return {
        info: null, // 评价详情
        batchId: '',
        nowTime: new Date().getTime(),
      }
    },
    components: {
      'v-detail': Detail,
    },
    methods: {
      async _showDetail(a) {
        this.batchId = a.batchId;
        this.info = a;
        this.$refs.detail.isShow = true;
      },
    }
  }
</script>

<style lang="less" scoped>
  li {
    padding: 20px 0;
    border-bottom-color: #EFF1F3;

    .li_top {
      height: 40px;
      div {
        font-size: 30px;
      }
      .name {
        font-weight: 600;
        max-width: 250px;
        color: #FFB600;
        margin-right: 16px;
        &.marginRight0 {
          margin-right: 0;
        }
      }
      .content {
        color: #262727;
        max-width: 250px;
      }
    }
    .li_bottom {
      color: #B6B8B8;
      font-size: 24px;
      margin-top: 18px;
    }

    .li_right {
      .fs-box {
        height: 100%;
        font-size: 64px;
        font-weight: 600;

        .num-box {
          width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-align: right;
          .add {
            font-size: 40px;
            margin-top: 20px;
          }
        }
      }
      .add-fs {
        color: #33A5FF;
      }
      .reduce-fs {
        color: #FFB600;
      }
    }
  }
</style>
