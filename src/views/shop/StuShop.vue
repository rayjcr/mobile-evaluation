<template>
    <div class="stu-shop">
      <div class="shop-top flex justifySpaceBetween" ref="shopTop">
        <div class="shop-top-left">
          <!--无惩罚项显示可用勋章数量 -->
          <div class="medal-num-box flex alignCenter" v-if="punish_list.length == 0">
            <div>可用:</div>
            <div class="icon-medal"></div>
            <div>{{medal_num}}</div>
          </div>

          <!--有惩罚项限制兑换-->
          <div class="punish-list-box flex alignCenter" v-else>
            <div>惩罚卡</div>
            <div class="icon-punish" @click="_showPunishConfirm" :style="{'backgroundImage': 'url('+punish_list[0].icon+')'}"></div>
            <div class="icon-punish" @click="_showPunishConfirm" v-if="punish_list.length > 1" :style="{'backgroundImage': 'url('+punish_list[1].icon+')'}">></div>
            <div class="num">共{{punish_list.length}}张</div>
          </div>
        </div>
        <div class="shop-top-right" @click="_jump('/order')">
          <div class="icon-order"></div>
          <div>我的订单</div>
        </div>
      </div>

      <!--商品分类列表-->
      <div class="shop-type"  v-if="type_list.length > 0">
        <div class="type-list flex" :style="{'height': height}">
          <div class="flex_1">
            <ul class="clear" ref="typeList">
              <li class="fl" :class="{'active': type_key == -1}" @click="_tab(-1)">全部</li>
              <li
                class="fl"
                :class="{'active': type_key == index}"
                @click="_tab(index)"
                v-for="(item,index) in type_list"
                :key="index">{{item.name}}</li>
            </ul>
          </div>
          <div class="icon-down" :class="{'up': direction == 'up'}" @click="_toggle"></div>
        </div>
      </div>

      <!--商品列表-->
      <div class="list-box scrollY">

        <v-load-more ref="loadMore" :allLoaded="!allLoaded" @loaded="loaded" v-if="shop_list.length > 0">
          <ul class="shop-list">
            <li class="flex" v-for="(item,index) in shop_list" :key="index">
              <div class="li-left" :style="{'backgroundImage': 'url('+item.picture+')'}">
                <div class="li-left-modal flex alignCenter justifyCenter" v-if="punish_list.length > 0">限制<br />兑换</div>
              </div>
              <div class="li_right">
                <p class="name text-overflow">{{item.name}}</p>
                <div class="num-box">剩余<span>{{item.reserve}}</span>件</div>
                <div class="flex justifySpaceBetween">
                  <div class="flex alignCenter">
                    <div class="icon-medal"></div>
                    <div class="price">{{item.price}}</div>
                  </div>
                  <div class="btn exchange" @click="_showExchangeConfirm(index)" v-if="punish_list.length == 0">兑换</div>
                  <div class="btn disabled" v-else>兑换</div>
                </div>
              </div>
            </li>
          </ul>
        </v-load-more>

        <div class="empty" v-else>
          <v-empty-list :text="'无数据'"></v-empty-list>
        </div>

      </div>

      <!--兑换confirm-->
      <v-exchange ref="exchange" :info="goodsInfo" @sure="exchange"></v-exchange>

      <!--惩罚卡展示-->
      <v-punish ref="punish" :list="punish_list" @candeduction="_showCandeduction"></v-punish>

      <!--抵消惩罚卡-->
      <v-candeduction ref="candeduction" :info="punishInfo" @showPunishConfirm="_showPunishConfirm" @sure="deductionByEvaluation"></v-candeduction>

      <!--商品分类遮罩层-->
      <div class="shop-modal" v-show="direction == 'up'" :style="{'height': modal.height, 'opacity': modal.opacity,'top': modal.top}" @click="_toggle"></div>
    </div>
</template>

<script>
  import {goodsApi} from '@/utils/api'

  import LoadMore from '@/components/LoadMore.vue'
  import EmptyList from '@/components/EmptyList.vue'
  import ConfirmExchange from './messageBox/Confirm_exchange'
  import ConfirmPunish from './messageBox/Confirm_punish'
  import ConfirmCanDeduction from './messageBox/Confirm_canDeduction'

  export default {
    name: 'StuShop',
    data() {
      return {
        userId: this.$cookie.get('userId'),
        schoolCode: this.$cookie.get('xxdm'),
        allLoaded: true, // 控制分页加载的频率&&是否可以进行上拉
        shop_list: [], // 商品列表
        type_list: [], // 商品分类
        punish_list: [], // 惩罚列表
        medal_num: 0, // 可用勋章数量
        type_key: -1, // 商品分类，默认显示全部-1
        typeId: null, // 商品分类Id
        height: '100%',
        modal: { // 遮罩层
          height: 0,
          top: 0,
          opacity: 0
        },
        goodsInfo: {},
        goodsKey: 0,
        punishInfo: {},
        direction: 'down',
        page: 1,
        limit: 10
      }
    },
    components: {
      'v-load-more': LoadMore,
      'v-empty-list': EmptyList,
      'v-exchange': ConfirmExchange,
      'v-punish': ConfirmPunish,
      'v-candeduction': ConfirmCanDeduction
    },
    watch: {
      type_key(nVal) {
        this.typeId = nVal == -1 ? null : this.type_list[this.type_key].id;

        this.page = 1;
        this.allLoaded = true;
        this.shop_list = [];

        this.getGoodsList()
      }
    },
    activated() {
      document.title = '商城';
      Promise.all([
        this._initData(),
        this.getMedalNum(),
        this.getPunishList(),
        this.getShopTypeList(),
        this.getGoodsList()
        ]).then((result) => {}).catch((error) => {
        console.log(error)
      })
    },
    mounted() {
      document.title = '商城';
      Promise.all([
        this.getMedalNum(),
        this.getPunishList(),
        this.getShopTypeList(),
        this.getGoodsList()
        ]).then((result) => {}).catch((error) => {
        console.log(error)
      })
    },
    methods: {
      async getMedalNum() {
        const res = await this.$req.get(goodsApi.getMedalNum, {userId: this.userId})
        if (res.resultCode == 1) {
          this.medal_num = res.value.copyMedalNum || 0;
        }
      },
      async getPunishList() {
        const res = await this.$req.get(goodsApi.getEvaluationRemindVO, {studentId: this.userId})
        if (res.resultCode == 1) {
          this.punish_list = res.value || []
        }
      },
      async getShopTypeList() {
        const res = await this.$req.get(goodsApi.getGoodsTypeList, {schoolCode: this.schoolCode})
        if (res.resultCode == 1) {
          this.type_list = res.value || []
        }
      },
      async getGoodsList(page,type) {
        this.$indicator.open('正在加载中...')
        this.page = page || this.page;
        let data = {
          page: this.page,
          limit: this.limit,
          schoolCode: this.schoolCode,
          typeId: this.typeId,
        };
        const res = await this.$req.post(goodsApi.getGoodsList, data)

        if (res.resultCode == 1) {
          let list = res.value.dataList;
          this.shop_list = [...this.shop_list, ...list]

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
      async exchange() {
        this.$indicator.open('兑换中,请稍后...')
        let data = {
          goodsId: this.goodsInfo.id,
          number: 1,
          schoolCode: this.schoolCode,
          stuNo: this.userId
        };
        const res = await this.$req.post(goodsApi.exchange, data)
        if (res.resultCode == 1) {
          this.$refs.exchange._hide();
          this.$my_message({
            tip: '兑换成功',
            type: 'success'
          });

          //  重新更新数据
          this._updateData();
        }
      },
      async deductionByEvaluation(info,num) {
        this.$indicator.open('抵消中,请稍后...')
        let data = {
          studentId: this.userId,
          num: num,
          evaluationId: info.id
        };
        const res = await this.$req.get(goodsApi.deductionByEvaluation, data)
        if (res.resultCode == 1) {
          this.$toast('抵消成功');
          this.$refs.candeduction._hide();

          this.getPunishList();
        }
      },

      loaded (page) {
        this.allLoaded = page ? true : this.allLoaded
        this.shop_list = page ? [] : this.shop_list
        let type = page ? 'loadTop' : 'loadBottom'
        this.getGoodsList(page, type)
      },

      _updateData() {
        this.medal_num = this.medal_num - this.shop_list[this.goodsKey].price;
        this.shop_list[this.goodsKey].reserve = this.shop_list[this.goodsKey].reserve - 1;
      },
      _initData() {
        this.type_key = -1;
        this.typeId = null;

        this.page = 1;
        this.allLoaded = true;
        this.shop_list = [];

        this._hideModalAll();
      },
      //进入页面时默认关闭所有弹窗
      _hideModalAll() {
        this.$refs.candeduction._hide();
        this.$refs.exchange._hide();
        this.$refs.punish._hide();
      },
      _tab(key) {
        this.type_key = key;
      },
      _toggle() {
        let window_height = document.documentElement.clientHeight;
        let ul_height = this.$refs.typeList.clientHeight;
        let head_height = this.$refs.shopTop.clientHeight;

        this.height = this.direction == 'down' ? ul_height + 'px' : '100%';

        this.modal['height'] = this.direction == 'down' ? (window_height - ul_height - head_height) + 'px' : 0
        this.modal['top'] = this.direction == 'down' ? (ul_height + head_height) + 'px' : 0
        this.modal['opacity'] = this.direction == 'down' ? 1 : 0

        this.direction = this.direction == 'down' ? 'up' : 'down';
      },
      _showCandeduction(info) {
        this.punishInfo = info;
        this.$refs.candeduction._show();
      },
      _showPunishConfirm() {
        this.$refs.punish._show();
      },
      _showExchangeConfirm(key) {
        this.$refs.exchange._show();
        this.goodsInfo = this.shop_list[key];
        this.goodsKey = key;
      },
      _jump(path) {
        this.$router.push({
          path
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .stu-shop {
    position: relative;
    height: 100%;

    .shop-top {
      height: 88px;
      padding: 0 32px;
      background-color: #ffffff;
      .shop-top-left {
        height: 100%;
        .medal-num-box {
          height: 100%;
          color: #B6B8B8;
          font-size: 28px;
          .icon-medal {
            width: 28px;
            height: 38px;
            margin-left: 16px;
            margin-right: 8px;
            background: url('./img/icon_medal@2x.png') no-repeat center;
            background-size: 28px auto;
          }
        }
        .punish-list-box {
          height: 100%;
          color: #B6B8B8;
          font-size: 28px;
          .num {
            font-size: 24px;
            margin-left: 16px;
          }
          .icon-punish {
            width: 88px;
            height: 40px;
            margin-left: 16px;
            border-radius: 4px;
            background-position: center;
            background-repeat: no-repeat;
            background-size: 88px auto;
          }
        }
      }
      .shop-top-right {
        color: #262727;
        font-size: 20px;
        .icon-order {
          width: 44px;
          height: 44px;
          margin: 6px auto;
          margin-bottom: 4px;
          background: url('./img/icon_order@2x.png') no-repeat center;
          background-size: 44px auto;
        }
      }
    }

    .shop-type {
      height: 88px;
      .icon-down {
        width: 78px;
        height: 88px;
        background: url('./img/icon_right@2x.png') no-repeat center;
        background-size: 16px auto;
        transform: rotate(90deg);
        &.up {
          transform: rotate(-90deg);
        }
      }
      .type-list {
        position: relative;
        z-index: 2001;
        overflow: hidden;
        background-color: #EFF1F3;
        transition: all .2s ease-in-out;
      }
      ul {
        padding-left: 32px;
        padding-top: 20px;
        color: #969899;
        font-size: 28px;
        li {
          padding: 4px 18px;
          border-radius: 24px;
          margin-right: 20px;
          margin-bottom: 24px;
          background-color: #ffffff;
          &.active {
            color: #ffffff;
            background-color: #33A5FF;
          }
        }
      }
    }

    .list-box {
      width: 100%;
      height: calc(100% - 176px);
      .shop-list {
        min-height: calc(100vh - 200px);
      }
      li {
        padding: 32px 32px 40px;
        margin-bottom: 20px;
        background-color: #ffffff;
        .li-left {
          position: relative;
          width: 180px;
          height: 160px;
          background-repeat: no-repeat;
          background-position: center;
          background-size: 180px auto;
          .li-left-modal {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            top: 0;
            color: #ffffff;
            font-size: 28px;
            background-color: rgba(0,0,0,.35);
          }
        }
        .li_right {
          margin-left: 20px;
          .name {
            width: 470px;
            color: #262626;
            font-size: 30px;
            font-weight: 600;
          }
          .num-box {
            color: #969899;
            font-size: 28px;
            margin-top: 16px;
            span {
              color: #FFB600;
            }
          }
          .justifySpaceBetween {
            margin-top: 24px;
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
          .btn {
            width: 120px;
            height: 48px;
            line-height: 48px;
            text-align: center;
            color: #ffffff;
            font-size: 28px;
            border-radius: 24px;
          }
          .exchange {
            background-color: #FFB600;
          }
          .disabled {
            background-color: #D6D9D9;
          }
        }
      }
      .empty {
        position: relative;
        height: 100%;
      }
    }

    .shop-modal {
      position: absolute;
      z-index: 2002;
      width: 100%;
      background-color: rgba(0,0,0,.29);
      transition: all .2s;
    }
  }
</style>
