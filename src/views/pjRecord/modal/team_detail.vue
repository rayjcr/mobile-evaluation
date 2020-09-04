<template>
<!--  v-roll:visible=isShow -->
  <mt-popup v-model="isShow" position="center" class="mint-popup">
    <div class="detail-box" v-if="info">
      <div class="head border-bottom">
        评价详情
        <span class="icon-close" @click="_hide"></span>
      </div>
      <div class="content scrollY">
        <div class="top">
          <img :src="info.icon || require('../img/medal@2x.png')">
        </div>
        <div class="item flex alignCenter justifySpaceBetween">
          <div class="item_name">团队评价</div>
          <div class="item_time">{{info.dayTab}}</div>
        </div>
        <div class="item flex justifySpaceBetween">
          <div class="item_title">维度:</div>
          <div class="item_content">{{info.dimensionName}}</div>
        </div>
        <div class="item flex justifySpaceBetween">
          <div class="item_title">奖惩:</div>
          <div class="item_content">{{info.rewardType == 3 ? '加分' : info.rewardType == 4 ? '减分' : info.rewardType == 5 ? '奖励勋章' : '扣除勋章'}}</div>
        </div>
        <div class="item flex justifySpaceBetween">
          <div class="item_title">评价老师:</div>
          <div class="item_content">{{info.evaluatorName}}</div>
        </div>
        <div class="member-box" v-if="new_mlist.length > 0">
          <div class="member_title">成员列表:</div>
          <div class="member_list scrollY" ref="member">
            <ul>
              <li class="flex alignCenter justifySpaceBetween" v-for="(item,index) in new_mlist" :key="index">
                <div class="name text-overflow-clamp2">{{item.name}}</div>
                <div class="class_name text-overflow-clamp2">{{item.className}}</div>
                <div class="num" v-if="item.rewardType == 3">+{{item.score}}</div>
                <div class="num" v-else-if="item.rewardType == 4">{{item.score}}</div>
                <div class="num" v-else-if="item.rewardType == 5">+{{item.medal}}</div>
                <div class="num" v-else>{{item.medal}}</div>
              </li>
            </ul>
          </div>
        </div>
        <div class="py_content">{{info.remarks}}</div>
        <div class="clear img-box" v-if="info.fileInfoVOS.length > 0">
          <div class="fl img" :class="{'marRight0': (index+1) %3 == 0}" v-for="(item,index) in info.fileInfoVOS"
               :key="item.absolutePath+index">
            <img v-gallery:group2 :src="item.absolutePath" alt="">
          </div>
        </div>
        <!-- 关联班级-->
        <div class="gl-class-box border-top" v-if="new_clist.length > 0">
          <div class="title">班级评价</div>
          <div class="class_pj_item flex justifySpaceBetween">
            <div class="class_pj_title">奖惩:</div>
            <div class="item_content">{{new_clist[0].rewardType == 3 ? '加分' : new_clist[0].rewardType == 4 ? '减分' : new_clist[0].rewardType == 5 ? '奖励勋章' : '扣除勋章'}}</div>
          </div>
          <div class="class-box">
            <div class="class_title">班级列表:</div>
            <div class="class_list scrollY" ref="class">
              <ul>
                <li class="flex alignCenter justifySpaceBetween" v-for="(item,index) in new_clist" :key="index">
                  <div class="class_name text-overflow-clamp2">{{item.className}}</div>
                  <div class="num" v-if="item.rewardType == 3">+{{item.score}}</div>
                  <div class="num" v-else-if="item.rewardType == 4">{{item.score}}</div>
                  <div class="num" v-else-if="item.rewardType == 5">+{{item.medal}}</div>
                  <div class="num" v-else>{{item.medal}}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </mt-popup>
</template>

<script>
  import {PjApi} from '@/utils/api'

  export default {
    name: 'team_detail',
    props: {
      info: {
        default: {}
      },
      batchId: {
        default: ''
      }
    },
    data () {
      return {
        isShow: false,
        isbool: true, // 滚动到底部加载数据并且防止触发多次
        limit: 15,

        m_info: { // 成员
          page: 1,
          allLoaded: false
        },
        c_info: { // 班级
          page: 1,
          allLoaded: false
        },

        new_mlist: [],
        new_clist: []
      }
    },
    watch: {
      isShow(nVal) {
        if(nVal) {
          this.new_mlist = [];
          this.new_clist = [];

          let p3 = setTimeout(() => {
            this.loadMore();
          },3500)
          Promise.all([
            this.getList(1),
            this.getList(2),
            p3
          ]).then(() => {}).catch((error) => {
            console.log(error)      // 失败了，打出 '失败'
          })
        }
      }
    },
    methods: {
      _hide () {
        this.isShow = false
      },
      async getList(evaluationObject) {
        this.$indicator.open('请稍后...');
        let data = {
          type: 4,
          page: this.m_info.page,
          limit: this.limit,
          batchId: this.batchId,
          evaluationObject
        }
        const res = await this.$req.post(PjApi.getPjxRecordList, data)
        let {resultCode, value} = res
        if (resultCode == 1) {
          this.isbool = true;
          let list = value.dataList;
          let get_list = {
            '1': () => {
              this.new_mlist = [...this.new_mlist, ...list]
            },
            '2': () => {
              this.new_clist = [...this.new_clist, ...list]
            }
          };
          let set_page = {
            '1': () => {
              this.m_info.page++
            },
            '2': () => {
              this.c_info.page++
            },
          };
          let set_allLoaded = {
            '1': () => {
              this.m_info.allLoaded = true;
            },
            '2': () => {
              this.c_info.allLoaded = true;
            },
          };

          if(list.length > 0) {

            get_list[evaluationObject]();

            if (list.length >= this.limit) {
              set_page[evaluationObject]();
            } else {
              set_allLoaded[evaluationObject]();
            }
          } else {
            set_allLoaded[evaluationObject]();
          }
        }
      },
      loadMore() {
        // 滚动加载成员列表
        this.$nextTick(() => {
          if(this.new_mlist.length > 0) {
            this.$refs.member.addEventListener('scroll', () => {
              var scrollTop = this.$refs.member.scrollTop;
              var windowHeight = this.$refs.member.clientHeight;
              var scrollHeight = this.$refs.member.scrollHeight;

              if (scrollTop + windowHeight >= scrollHeight && this.isbool) {
                this.isbool = false;
                if(this.m_info.allLoaded) return;
                this.getList(1)
              }
            })
          }

          if(this.new_clist.length > 0) {
            // 滚动加载班级列表
            this.$refs.class.addEventListener('scroll', () => {
              var scrollTop = this.$refs.class.scrollTop;
              var windowHeight = this.$refs.class.clientHeight;
              var scrollHeight = this.$refs.class.scrollHeight;
              if (scrollTop + windowHeight >= scrollHeight) {
                if(this.c_info.allLoaded) return;
                this.getList(2)
                console.log("加载到底部")
              }
            })
          }

        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .detail-box {
    .head {
      position: relative;
      height: 96px;
      line-height: 96px;
      text-align: center;
      color: #262627;
      font-weight: 600;
      font-size: 36px;
      border-bottom-color: #EFF1F3;

      .icon-close {
        position: absolute;
        right: 0;
        top: 0;
        width: 90px;
        height: 100%;
        background: url('/static/img/close.png') no-repeat center;
        background-size: 26px auto;
      }
    }

    .content {
      padding: 0 32px 18px;
      max-height: 800px;

      .top {
        margin-top: 38px;
        margin-bottom: 28px;
        text-align: center;
        img {
          display: inline-block;
          width: 130px;
          height: 60px;
          border-radius: 4px;
        }
      }

      .title {
        color: #262727;
        font-size: 36px;
        font-weight: 600;
        margin-top: 20px;
        margin-bottom: 8px;
      }

      .item {
        margin-top: 12px;
        font-size: 28px;

        .item_name  {
          color: #262727;
          font-size: 36px;
          font-weight: 600;
        }

        .item_time {
          color: #B6B8B8;
          font-size: 28px;
        }

        .item_title {
          color: #969899;
        }

        .item_content {
          color: #262727;
        }
      }

      .member-box {
        margin-top: 20px;
        font-size: 28px;

        .member_title {
          color: #969899;
        }

        .member_list {
          max-height: 400px;
          padding: 0 40px 20px;
          margin-top: 16px;
          background-color: #EFF1F3;
          border-radius: 20px;

          li {
            margin-top: 20px;

            .name {
              width: 140px;
              color: #262727;
            }

            .class_name {
              width: 290px;
              color: #969899;
              margin-left: 40px;
            }

            .num {
              color: #33A5FF;
              margin-left: 10px;
            }
          }
        }
      }

      .py_content {
        color: #262627;
        font-size: 28px;
        margin-top: 40px;
      }

      .img-box {
        margin-top: 20px;

        .img {
          position: relative;
          width: 190px;
          height: 190px;
          overflow: hidden;
          margin-right: 24px;
          background-color: #EFF1F3;

          &.marRight0 {
            margin-right: 0;
          }

          img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            min-width: 100%; /* 针对小图标 */
            min-height: 100%; /* 针对小图标 */
            max-width: 200%; /* 针对太宽的图 -可能变形 */
            max-height: 200%; /* 针对太高的图 -可能变形 */
          }
        }
      }

      .gl-class-box {
        margin-top: 20px;
        border-top-color: #EFF1F3;
        .title {
          color: #262727;
          font-size: 36px;
          font-weight: 600;
        }
        .class_pj_item {
          margin-top: 20px;
          font-size: 28px;
          .class_pj_title {
            color: #969899;
          }
          .class_pj_content {
            color: #262727;
          }
        }
        .class-box {
          margin-top: 20px;
          font-size: 28px;
          .class_title {
            color: #969899;
            margin-bottom: 16px;
          }
          .class_list {
            padding: 20px 40px;
            max-height: 400px;
            background-color: #EFF1F3;
            border-radius: 20px;
            li {
              margin-top: 20px;
            }
            .class_name {
              width: 480px;
              color: #262727;
            }
            .num {
              color: #33A5FF;
              margin-left: 20px;
            }
          }
        }
      }

    }
  }
</style>
