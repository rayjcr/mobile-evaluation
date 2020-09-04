<template>
  <div class="tea-shop">
    <div class="shop-top">
      <div class="ordinary flex alignCenter" v-if="!is_search">
        <div class="item flex_1 flex alignCenter justifyCenter border-right" @click="popupVisible=true">
          <div>{{text}}</div>
          <div class="icon-down"></div>
        </div>
        <div class="item flex_1 flex alignCenter justifyCenter border-right" @click="_showGrade">
          <div v-if="gcName.length == 0">全部</div>
          <div v-else class="gc-name text-overflow">
            <span v-for="(item,index) in gcName" :key="index">{{item}}{{(index + 1) == gcName.length ? '' : '、'}}</span>
          </div>
          <div class="icon-down"></div>
        </div>
        <div class="item flex_1 flex alignCenter justifyCenter" @click="is_search=true">
          <div>搜索</div>
          <div class="icon-search"></div>
        </div>
      </div>
      <div class="search-shop flex alignCenter" v-else>
        <div class="flex_1">
          <v-search ref="search" :placeholder="'搜索学生姓名'" :isClear="is_clear" @getSearch="_getSearch"></v-search>
        </div>
        <div class="cancel" @click="is_search=false">取消</div>
      </div>
    </div>

    <!--全选-->
    <div class="sub-top flex alignCenter justifySpaceBetween" v-if="totalCount > 0">
      <div class="sub-left flex alignCenter" @click="_checkAll(true)" v-show="is_selectedAll == false">
        <div class="check-circle" :class="{'checked': is_selectedAll}" v-if="orderState == 0"></div>
        <span v-if="orderState == 0">全选</span>
      </div>
      <div class="sub-left flex alignCenter" @click="_checkAll(false)" v-show="is_selectedAll == true">
        <div class="check-circle" :class="{'checked': is_selectedAll}" v-if="orderState == 0"></div>
        <span v-if="orderState == 0">取消全选</span>
      </div>
      <div class="sub-right">共{{totalCount}}个</div>
    </div>

    <!--列表-->
    <div class="list-box scrollY">

      <v-load-more ref="loadMore" :allLoaded="!allLoaded" @loaded="loaded" v-if="list.length > 0">
        <ul class="shop-list">
          <li class="clear flex" v-for="(item,index) in list" :key="index" @click="_checkFun(index)">
            <div class="li-left">
              <div class="check-circle" :class="{'checked': item.checked}" v-if="item.status == 0"></div>
            </div>
            <div class="li-right ">
              <div class="li-right-top clear flex">
                <div class="li-right-topleft fl" :style="{'backgroundImage': 'url('+item.picture+')'}"></div>
                <div class="li-right-topmid text-overflow-clamp2 fl">{{item.goodsName}}</div>
                <div
                  class="li-right-topright fl"
                  :class="{'yellow': item.status == 0,'gray': item.status == 1}"
                >{{item.status == 0 ? '待领取' : item.status == 1 ? '已领取' : ' 已退单 '}}</div>
              </div>
              <div class="li-right-bottom">
                <div class="exchange-name-box flex" >
                  <span class="exchange-title">兑换人：</span>
                  <span><span v-html="item.userName"></span> {{item.className}}</span>
                </div>
                <div class="exchange-time-box">
                  <span class="exchange-title">兑换时间：</span>
                  <span>{{item.createTime}}</span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </v-load-more>

      <div class="empty" v-else>
        <v-empty-list :text="'无数据'"></v-empty-list>
      </div>

    </div>

    <!--学生领取&退单操作按钮-->
    <div class="shop-foot flex alignCenter" :class="{'not-active': checkList.length == 0,'active': checkList.length > 0}">
      <div class="lq-btn" v-preventReClick="1000" @click.prevent="changeOrderStatusBatch($event,1)">学生领取</div>
      <div class="back-order-btn" v-preventReClick="1000" @click.prevent="changeOrderStatusBatch($event,-1)">退单</div>
    </div>

    <!--领取状态选择器-->
    <mt-popup v-model="popupVisible" v-roll:visible=[popupVisible] position="bottom" class="mint-popup">
      <mt-picker :slots="slotsList" :visible-item-count="5" :show-toolbar="true"  ref="picker" value-key="name" :itemHeight="40">
        <div class="flex">
          <div class="picker-btn picker-cancel" @click="popupVisible = false">取消</div>
          <div class="picker-title"></div>
          <div class="picker-btn picker-sure" @click="_onConfirm">完成</div>
        </div>
      </mt-picker>
    </mt-popup>

    <!--年级班级选择器-->
    <v-gc-select
      ref="gcSelect"
      :activityType="3"
      @getGCInfo="_getGCInfo"></v-gc-select>

  </div>
</template>

<script>
  import {goodsApi} from '@/utils/api'

  import GCSelect from './gcSelect/GCSelect.vue'
  import Search from '@/components/Search.vue'
  import LoadMore from '@/components/LoadMore.vue'
  import EmptyList from '@/components/EmptyList.vue'

  export default {
    name: 'TeaShop',
    data() {
      return {
        popupVisible: false,
        is_search: false, // 是否搜索
        is_clear: true, // 清除输入内容
        is_selectedAll: false, // 是否全选
        allLoaded: true, // 控制分页加载的频率&&是否可以进行上拉
        submitHttp: true, // 控制提交请求频率，防止网络异常造成多次地点击请求
        stuName: '', // 搜索学生姓名
        list: [],
        slotsList: [{
          flex: 1,
          values: [
            {name: '全部', value: null},
            {name: '待领取', value: 0},
            {name: '已领取', value: 1},
          ],
          defaultIndex: 1,
          className: 'slot1',
          textAlign: 'center'
        }],
        gcName: [],
        classCode: [],
        checkList: [], // 存放选中的订单流水号
        text: '待领取',
        orderState: 0, // 0 待领取 1 已领取 -1 已退单
        page: 1,
        limit: 10,
        totalCount: 0
      }
    },
    components: {
      'v-gc-select': GCSelect,
      'v-search': Search,
      'v-load-more': LoadMore,
      'v-empty-list': EmptyList,
    },
    computed: {
      newList() {
        let list = [];
        this.list.forEach((c) => {
          if(c.status == 0) {
            list.push(c)
          }
        })
        return list;
      }
    },
    activated() {
      this._hideGrade();

      this.text = '待领取';
      this.orderState = 0;
      this.gcName = [];
      this.is_search = false;

      Promise.all([this._initData(),this.getGoodsOrderList()]).then((result) => {
        // console.log("result---",result)
      }).catch((error) => {
        console.log(error)      // 失败了，打出 '失败'
      })
    },
    mounted() {
      this.$nextTick(() => {
        this.is_search = false;

        Promise.all([this._initData(),this.getGoodsOrderList()]).then((result) => {
          // console.log("result---",result)
        }).catch((error) => {
          console.log(error)      // 失败了，打出 '失败'
        })
      })
    },
    methods: {
      async getGoodsOrderList(page,type) {
        this.$indicator.open('正在加载中...')
        this.page = page || this.page;
        let data = {
          page: this.page,
          limit: this.limit,
          stuName: this.stuName,
          orderState: this.orderState,
          classCode: this.classCode.length > 0 ? this.classCode : null
        };
        const res = await this.$req.post(goodsApi.getGoodsOrderList, data)
        if(res.resultCode == 1) {
          let list = res.value.dataList;
          let highlight_span = null;
          list.forEach((c) => {
            this.$set(c,'checked',false);
            if(this.stuName != ''){
              // 搜索的文本显示高亮
              highlight_span = this._highlightKeyword(this.stuName,c.userName);
              c.userName = highlight_span;
            }
          })
          this.list = [...this.list, ...list];
          this.totalCount = res.value.totalCount;

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
      async changeOrderStatusBatch(event,status) {
        if(this.checkList.length == 0) return;

        if (event.target.disabled) {
          this.$toast('请不要重复点击，耐心等待一秒哦')
          return
        }

        if(!this.submitHttp) {
          this.$toast('当前网络异常，请耐心等待')
          return
        }

        let orderArr = [];
        this.checkList.forEach((c) => {
          orderArr.push({
            orderNo: c.orderNo,
            status: status
          })
        })

        this.submitHttp = false;
        const res = await this.$req.post(goodsApi.changeOrderStatusBatch, orderArr)
        this.submitHttp = true;
        if(res.resultCode == 1) {
          this.$toast('修改成功');

          Promise.all([this._initData(),this.getGoodsOrderList()])
        }
      },

      loaded (page) {
        this.allLoaded = page ? true : this.allLoaded
        this.list = page ? [] : this.list
        let type = page ? 'loadTop' : 'loadBottom'
        this.getGoodsOrderList(page, type)
      },
      _checkAll(bool) {
        this.checkList = []
        this.is_selectedAll = bool;
        this.list.forEach((c) => {
          if(c.status == 0) { // 待领取
            c.checked = bool;
          }
          if(c.checked) {
            this.checkList.push(c)
          }
        })
      },
      _checkFun(key) {
        if(this.list[key].status == 1 || this.list[key].status == -1) return;

        this.checkList = []
        this.list[key].checked = !this.list[key].checked;

        this.list.forEach((c) => {
          if(c.checked) {
            this.checkList.push(c)
          }
        })

        if(this.totalCount != 0 && this.checkList.length == this.newList.length) {
          this.is_selectedAll = true;
        } else {
          this.is_selectedAll = false;
        }
      },
      _getSearch(keywords) {
        this.stuName = keywords;
        Promise.all([this._initData(),this.getGoodsOrderList()])
      },
      _highlightKeyword(keyword,name) {
        let highlight_span = name;
        highlight_span = name.replace(keyword, '<span style="color:#FF7B12">'+keyword+'</span>');
        return highlight_span;
      },
      _initData() {
        this.popupVisible = false;
        this.is_selectedAll = false;


        this.page = 1;
        this.list = [];
        this.checkList = [];
      },
      _showGrade() {
        this.$refs.gcSelect.show();
      },
      _hideGrade() {
        this.$refs.gcSelect.hide()
      },
      _getGCInfo(data,gradeData) {
        this.gcName = [];
        this.classCode = [];
        this.checkList = [];

        if(gradeData.length > 0) {
          data.forEach((c) => {
            this.classCode.push(c.classCode)
          })
          gradeData.forEach((c) => {
            this.gcName.push(c.name)
          })
        } else {
          data.forEach((c) => {
            this.gcName.push(c.name)
            this.classCode.push(c.classCode)
          })
        }

        //根据班级代码更新数据
        Promise.all([this._initData(),this.getGoodsOrderList()])
      },
      _onConfirm() {
        let subjectSelected = this.$refs.picker.getValues()[0];
        this.text = subjectSelected.name;
        this.orderState = subjectSelected.value;
        this.popupVisible = false;
        this.checkList = []
        //根据领取状态更新数据
        Promise.all([this._initData(),this.getGoodsOrderList()])
      }
    }
  }
</script>

<style lang="less" scoped>
  .tea-shop {
    position: relative;
    height: 100%;

    .shop-top {
      height: 88px;
      background-color: #ffffff;
      .ordinary {
        height: 100%;
        color: #B6B8B8;
        font-size: 28px;
        .item {
          height: 40px;
          border-color: #EFF1F3;
          .gc-name {
            max-width: 170px;
          }
          .icon-down {
            width: 18px;
            height: 12px;
            margin-left: 8px;
            background: url('./img/icon_down@2x.png') no-repeat center;
            background-size: 18px auto;
          }
          .icon-search {
            width: 32px;
            height: 32px;
            margin-left: 8px;
            background: url('./img/icon_search@2x.png') no-repeat center;
            background-size: 32px auto;
          }
        }
      }
      .search-shop {
        height: 100%;
        margin-left: 32px;
        .cancel {
          width: 120px;
          color: #B6B8B8;
          font-size: 28px;
          text-align: center;
        }
      }
    }

    .sub-top {
      height: 80px;
      color: #969899;
      font-size: 28px;
      .sub-left {
        width: 170px;
        margin-left: 32px;

        .check-circle {
          position: relative;
          width: 40px;
          height: 40px;
          margin-right: 14px;
          background: url('/static/img/icon_radio_white@2x.png') no-repeat center;
          background-size: 40px auto;
          &.checked {
            background: url('/static/img/icon_radio_checked@2x.png') no-repeat center;
            background-size: 40px auto;
          }
        }
      }
      .sub-right {
        margin-right: 32px;
      }
    }

    .list-box {
      height: calc(100% - 276px);
      .shop-list {
        min-height: calc(100vh - 200px);
      }
      li {
        padding: 32px;
        margin-bottom: 20px;
        background-color: #ffffff;
        .li-left {
          margin-top: 40px;
          margin-right: 28px;
          .check-circle {
            position: relative;
            width: 40px;
            height: 40px;
            background: url('/static/img/icon_radio@2x.png') no-repeat center;
            background-size: 40px auto;
            &.checked {
              background: url('/static/img/icon_radio_checked@2x.png') no-repeat center;
              background-size: 40px auto;
            }
          }
        }
        .li-right {
          .li-right-top {
            .li-right-topleft {
              width: 180px;
              height: 120px;
              margin-right: 20px;
              background-repeat: no-repeat;
              background-position: center;
              background-size: 180px auto;
              /*background-color: #C4C4C4;*/
            }
            .li-right-topmid {
              width: 230px;
              font-weight: 600;
              font-size: 30px;
            }
            .li-right-topright {
              font-size: 30px;
              &.yellow {
                color: #FFB600;
              }
              &.gray {
                color: #969899;
              }
            }
          }
          .li-right-bottom {
            margin-top: 20px;
            color: #969899;
            font-size: 28px;
            .exchange-name-box {
              margin-bottom: 20px;
            }
            span {
              display: inline-block;
            }
            .exchange-title {
              width: 140px;
              margin-right: 6px;
            }
          }
        }
      }
      .empty {
        position: relative;
        height: 100%;
      }
    }

    .shop-foot {
      position: fixed;
      bottom: 0;
      left: 0;
      height: 108px;
      font-size: 30px;
      padding: 0 32px;
      background-color: #ffffff;

      .lq-btn {
        width: 418px;
        height: 88px;
        line-height: 88px;
        color: #ffffff;
        border-radius: 8px;
        text-align: center;
      }
      .back-order-btn {
        width: 236px;
        height: 88px;
        line-height: 88px;
        text-align: center;
        margin-left: 32px;
      }

      &.not-active {
        .lq-btn {
          background-color: #B6B8B8;
        }
        .back-order-btn {
          color: #B6B8B8;
        }
      }
      &.active {
        .lq-btn {
          background-color: #33A5FF;
          &:active {
            background-color: #3094E2;
          }
        }
        .back-order-btn {
          color: #262727;
          &:active {
            color: #262727;
            background-color: #EFF1F3;
          }
        }
      }
    }
  }
</style>
