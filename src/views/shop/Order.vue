<template>
    <div class="order-box scrollY">
      <v-load-more ref="loadMore" :allLoaded="!allLoaded" @loaded="loaded" v-if="order_list.length > 0">
        <ul>
          <li class="flex" v-for="(item,index) in order_list" :key="index">
            <div class="li-left" :style="{'backgroundImage': 'url('+item.picture+')'}"></div>
            <div class="li_right flex_1">
              <div class="li_right_top flex justifySpaceBetween">
                <p class="name text-overflow-clamp2">{{item.goodsName}}</p>
                <!--0(待领取),1(已领取),-1(已退单)-->
                <p
                  class="status"
                  :class="{
                  'unclaimed': item.status == 0,
                  'haveReceived': item.status == 1,
                  'returnedOrder': item.status == -1
                  }">{{item.status == 0 ? '待领取' : item.status == 1 ? '已领取' : '已退单'}}</p>
              </div>
              <div class="flex alignCenter justifySpaceBetween">
                <div class="flex alignCenter">
                  <div class="icon-medal"></div>
                  <div class="price">{{item.price}}</div>
                </div>
                <div class="exchange-time">兑换时间: {{item.createTime}}</div>
              </div>
            </div>
          </li>
        </ul>
      </v-load-more>
      <div class="empty" v-else>
        <v-empty-list :text="'无数据'"></v-empty-list>
      </div>
    </div>
</template>

<script>
  import {goodsApi} from '@/utils/api'

  import LoadMore from '@/components/LoadMore.vue'
  import EmptyList from '@/components/EmptyList.vue'

  export default {
    name: 'Order',
    data() {
      return {
        userId: this.$cookie.get('userId'),
        allLoaded: true, // 控制分页加载的频率&&是否可以进行上拉
        order_list: [], // 订单列表
        page: 1,
        limit: 10
      }
    },
    components: {
      'v-load-more': LoadMore,
      'v-empty-list': EmptyList
    },
    activated() {
      Promise.all([this._initData(),this.getGoodsOrderList()]).then((result) => {
        // console.log("result---",result)
      }).catch((error) => {
        console.log(error)      // 失败了，打出 '失败'
      })
    },
    methods: {
      async getGoodsOrderList(page,type) {
        this.$indicator.open('正在加载中...')
        this.page = page || this.page
        let data = {
          page: this.page,
          limit: this.limit,
          userCode: this.userId
        };
        const res = await this.$req.post(goodsApi.getGoodsOrderList, data)

        if (res.resultCode == 1) {
          let list = res.value.dataList;
          this.order_list = [...this.order_list, ...list]

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
      loaded (page) {
        this.allLoaded = page ? true : this.allLoaded
        this.order_list = page ? [] : this.order_list
        let type = page ? 'loadTop' : 'loadBottom'
        this.getGoodsOrderList(page, type)
      },
      _initData() {
        this.page = 1;
        this.allLoaded = true;
        this.order_list = [];
      },
    }
  }
</script>

<style lang="less" scoped>
  .order-box {
    height: 100%;
    li {
      padding: 32px 32px 40px;
      background-color: #ffffff;
      margin-bottom: 20px;
      .li-left {
        width: 180px;
        height: 160px;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 180px auto;
      }
      .li_right {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-left: 20px;
        .li_right_top {
          margin-bottom: 40px;
          .name {
            width: 300px;
            color: #262626;
            font-size: 30px;
            font-weight: 600;
          }
          .status {
            font-size: 30px;
          }
          .unclaimed {
            color: #FFB600;
          }
          .haveReceived {
            color: #969899;
          }
          .returnedOrder {
            color: #B6B8B8;
          }
        }
        .icon-medal {
          width: 28px;
          height: 38px;
          background: url('./img/icon_medal@2x.png') no-repeat center;
          background-size: 28px auto;
        }
        .price {
          color: #262727;
          font-size: 36px;
          margin-left: 10px;
          font-weight: 600;
        }
        .exchange-time {
          color: #B6B8B8;
          font-size: 24px;
        }
      }
    }
  }
</style>
