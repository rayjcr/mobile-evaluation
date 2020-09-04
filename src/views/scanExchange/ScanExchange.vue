<template>
    <div class="scan-exchange-wrapper">
      <div class="head">兑换记录</div>

      <div class="list-box scrollY">
        <v-load-more ref="loadMore" :allLoaded="!allLoaded" @loaded="loaded" v-if="list.length > 0">
          <ul class="exchange-list">
            <li v-for="(item,index) in list" :key="index">
              <div class="li-top border-bottom">{{item.createTime || ''}}</div>
              <div class="li-content flex justifySpaceBetween">
                <div class="li-content-left">
                  <div class="title text-overflow-clamp2">获得奖励“<span>{{item.dimensionName}}</span>”</div>
                  <p>由{{item.teacherName}}老师奖励</p>
                </div>
                <div class="li-content-right">
                  <span
                    :class="{
                    'icon-medal-jlk': jlk == 'true',
                    'icon-medal': jlk != 'true'
                    }"
                    v-if="item.rewardType == 2"
                    :style="{'backgroundImage': 'url('+item.icon+')'}"
                  ></span>
                  <span class="number add">{{item.rewardNum}}</span>
                </div>
              </div>
            </li>
          </ul>
        </v-load-more>

        <div class="empty" v-else>
          <v-empty-list :text="'无数据'"></v-empty-list>
        </div>
      </div>

    </div>
</template>

<script>
  import {weixinAPi,scanExchangeApi} from '@/utils/api'

  import LoadMore from '@/components/LoadMore.vue'
  import EmptyList from '@/components/EmptyList.vue'

  export default {
    name: 'ScanExchange',
    data() {
      return {
        schoolCode: this.$cookie.get('xxdm'),
        classCode: this.$cookie.get('classCode'),
        userId: this.$cookie.get('userId'),
        jlk: this.$cookie.get('jlk'),
        allLoaded: true, // 控制分页加载的频率&&是否可以进行上拉
        list: [],
        page: 1,
        limit: 10
      }
    },
    components: {
      'v-load-more': LoadMore,
      'v-empty-list': EmptyList
    },
    activated() {
      Promise.all([this.initData(),this.getPageList()]).then((result) => {
      }).catch((error) => {
        console.log(error)
      })
    },
    methods: {
      async getPageList(page,type) {
        this.$indicator.open('正在加载中...')
        this.page = page || this.page;
        let data = {
          page: this.page,
          limit: this.limit,
          classCode: this.classCode,
          schoolCode: this.schoolCode,
          userId: this.userId
        };

        const res = await this.$req.post(scanExchangeApi.getPageList, data)
        if (res.resultCode == 1) {
          let list = res.value.dataList;
          this.list = [...this.list, ...list]

          if (list.length >= this.limit) {
            this.page++
            this.allLoaded = true
          } else {
            this.allLoaded = false
          }
          // 控制上拉刷新下拉加载回弹效果
          if (type == 'loadTop') {
            setTimeout(() => {
              this.$refs.loadMore.onTopLoaded()
            }, 300)
          } else if (type == 'loadBottom') {
            this.$refs.loadMore.onBottomLoaded()
          }
        }
      },
      initData() {
        this.page = 1;
        this.allLoaded = true;
        this.list = [];
      },
      loaded (page) {
        this.allLoaded = page ? true : this.allLoaded
        this.list = page ? [] : this.list
        let type = page ? 'loadTop' : 'loadBottom'
        this.getPageList(page, type)
      }
    }
  }
</script>

<style lang="less" scoped>
  .scan-exchange-wrapper {
    height: 100%;
    .head {
      height: 80px;
      line-height: 80px;
      padding-left: 32px;
      color: #B6B8B8;
      font-size: 28px;
    }
    .list-box {
      height: calc(100% - 98px);
      .exchange-list {
        min-height: calc(100vh - 180px);
      }
      li {
        margin-bottom: 20px;
        background-color: #ffffff;
        .li-top {
          height: 60px;
          line-height: 60px;
          color: #B6B8B8;
          font-size: 24px;
          padding-left: 32px;
          border-color: #EFF1F3;
        }
        .li-content {
          padding: 32px;
          .li-content-left {
            .title {
              width: 422px;
              color: #262727;
              font-size: 32px;
              font-weight: 600;
              margin-bottom: 16px;
              span {
                color: #33A5FF;
              }
            }
            p {
              color: #B6B8B8;
              font-size: 28px;
            }
          }
          .li-content-right {
            margin-top: 8px;
            span {
              display: inline-block;
              vertical-align: middle;
            }
            .icon-medal {
              width: 80px;
              height: 80px;
              background-repeat: no-repeat;
              background-position: center;
              background-size: 80px auto;
            }
            .icon-medal-jlk {
              width: 110px;
              height: 50px;
              background-repeat: no-repeat;
              background-position: center;
              background-size: 110px auto;
            }
            .number {
              position: relative;
              margin-left: 40px;
              color: #FFB600;
              font-size: 48px;
              font-weight: 600;
              &.add:before {
                content: '+';
                position: absolute;
                left: -30px;
                bottom: 0;
                font-size: 45px;
                font-weight: 600;
              }
            }
          }
        }
      }
    }
  }
</style>
