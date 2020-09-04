<template>
  <div class="task-wrapper">
    <div class="navbar">
      <mt-navbar v-model="status" class="mtnavbar">
        <mt-tab-item id=""><span class="selectbar">全部</span></mt-tab-item>
        <mt-tab-item id="0"><span class="selectbar">待审核</span></mt-tab-item>
        <mt-tab-item id="1"><span class="selectbar">已通过</span></mt-tab-item>
        <mt-tab-item id="-1"><span class="selectbar">未通过</span></mt-tab-item>
      </mt-navbar>
    </div>

    <div class="list-box scrollY">
      <v-load-more ref="loadMore" :allLoaded="!allLoaded" @loaded="loaded" v-if="list.length > 0">
        <ul>
          <li v-for="(item,index) in list" :key="index" @click="_showDetail(index)">
            <div class="li_top flex justifySpaceBetween alignCenter">
              <div class="li_top_left">{{item.createTime}}</div>
              <div class="li_top_right" :class="{'yellow_status': item.status == 0,'gray_status': item.status != 0}">{{item.status == 0 ? '待审核' : item.status == 1 ? '已通过' : '未通过'}}</div>
            </div>
            <div class="li_content">
              <p class="text-overflow-clamp2">{{item.content}}</p>
              <div class="imglist clear" v-if="item.fileInfoVOS.length > 0" >
                <div class="img fl" :class="{'marginRight0': (i+1)%3==0}" v-for="(v,i) in item.fileInfoVOS" :key="i"><img :src="v.absolutePath"></div>
              </div>
              <!-- <div class="img-mask" >
                <div class="imglist clear">
                  
                </div>
              </div> -->
            </div>
            <div class="li_bottom">{{item.className}}-{{item.name}}</div>
          </li>
        </ul>
      </v-load-more>

      <div v-else class="empty">
        <v-empty-list :text="'无数据'"></v-empty-list>
      </div>
    </div>

    <!--详情弹窗-->
    <v-detail-modal ref="detail" :info="info"></v-detail-modal>
  </div>
</template>

<script>
  import {TaskApi} from '@/utils/api'

  import EmptyList from '@/components/EmptyList.vue'
  import LoadMore from '@/components/LoadMore.vue'

  import Detail from '../../modal/OtherStuTaskDetail.vue'

  export default {
    name: 'OtherStuTask',
    data() {
      return {
        id: this.$route.query.id,
        userId: this.$cookie.get('userId'),
        status: '',
        list: [],
        copy_list: [],
        page: 1,
        limit: 10,
        allLoaded: true, // 控制分页加载的频率&&是否可以进行上拉
        info: {}, // 详情信息
      }
    },
    components: {
      'v-load-more': LoadMore,
      'v-empty-list': EmptyList,
      'v-detail-modal': Detail
    },
    watch: {
      status(nVal) {
        this._initData();
        this.switchTab(nVal);
      }
    },
    activated() {
      this.id = this.$route.query.id;

      if (this.status == '') {
        Promise.all([
          this._initData(),
          this.getList()
          ]).then((result) => {}).catch((error) => {
          console.log(error)      // 失败了，打出 '失败'
        })
      }

      this.status = ''
    },
    methods: {
      /*
        获取其他同学上传的任务列表
      */
      async getList(page,type) {
        this.$indicator.open('正在加载中...')
        this.page = page || this.page;
        let data = {
          evaluationId: this.id,
          userId: this.userId,
          classCode: this.$cookie.get('classCode'),
          page: this.page,
          limit: this.limit,
          status: this.status || null,
          inAddition : true // 除被评用户以外的用户
        }
        const res = await this.$req.post(TaskApi.getStuTaskList, data)

        if(res.resultCode == 1) {
          let dataList = res.value.dataList;
          this.list = [...this.list, ... this.setList(dataList)]
          this.copy_list = JSON.parse(JSON.stringify(this.list));

          if (dataList.length >= this.limit) {
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
      /*
        对后端返回数据进行处理(item,index) in list  item.itemInfoList得到前端需要的数据格式
      */
      setList(list) {
        let arr = [];
        list.forEach(e => {
          e.itemInfoList.forEach((c,i) => {
            arr.push(c)
            c.name = e.name;
            this.$set(c,'className',e.className)
          })
        });
        return arr;
      },
      /*
        tab切换，更新数据
        @params status ''全部 0待审核 1，已通过，-1未通过
      */
      switchTab(status) {
        if(status == '') {
          this.list = this.copy_list;
          return;
        }
        this.list = this.copy_list.filter(c => {
          return c.status == status;
        })
      },
      loaded(page) {
        this.allLoaded = page ? true : this.allLoaded
        this.list = page ? [] : this.list
        let type = page ? 'loadTop' : 'loadBottom'
        this.getList(page, type)
      },
      _initData() {
        this.page = 1;
        this.allLoaded = true;
        this.list = [];
        this.$refs.detail.hideModal();
      },
      _showDetail(key) {
        this.info = this.list[key];
        setTimeout(() => {
          this.$refs.detail.showModal()
        },50)
      }
    }
  }
</script>

<style lang="less" scoped>
  .task-wrapper {
    height: 100%;

    .navbar {
      width: 100%;
      height: 88px;
      margin: 0 auto;
      background-color: #FFFFFF;
      .mtnavbar{
        width: 100%;
        height: 88px;
        margin: 0 auto;
        border-top: 1px solid rgba(239,241,243,1);
        .selectbar{
          font-size: 30px;
          line-height: 64px;
          color: rgba(182,184,184,1);
        }
        .mint-tab-item{
          margin: 0;
          line-height: 34px;
        }
        .is-selected{
          border: 0;
          &::after{
            content: '';
            display: inline-block;
            width: 40px;
            height: 4px;
            background: rgba(51,165,255,1);
            border-radius: 2px;
            position: relative;
            top: -18px;
          }
          .selectbar{
            font-size: 30px;
            font-weight: 600;
            line-height: 64px;
            color: rgba(38,38,39,1);
          }
        }
      }
    }

    .list-box {
      height: calc(100% - 88px);
      padding: 20px 32px;
      li {
        border-radius: 16px;
        background-color: #FFFFFF;
        margin-bottom: 46px;
        .li_top {
          height: 78px;
          padding: 0 28px 0 20px;
          .li_top_left {
            color: #B6B8B8;
            font-size: 28px;
          }
          .li_top_right {
            font-size: 30px;
          }
          .yellow_status {
            color: rgba(255,182,0,1);
          }
          .gray_status {
            color: #B6B8B8;
          }
        }
        .li_content {
          padding: 0 22px 20px 20px;
          p {
            color: #262627;
            font-size: 28px;
            line-height: 40px;
          }
          .imglist {
            height: 200px;
            margin-top: 20px;
            .img {
              width: 200px;
              height: 200px;
              margin-right: 20px;
            }
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
          }
        }
        .li_bottom {
          padding: 0 20px 14px 20px;
          color: #262626;
          font-size: 24px;
          font-weight: 600;
        }
      }
    }
    
    .empty {
      position: relative;
      height: 100%;
    }
  }
</style>
