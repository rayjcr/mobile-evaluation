<template>
    <div class="add-group-box">
      <div class="group-box">
        <div class="group-top">
          <p class="title">小组名称</p>
          <input type="text" class="border1px" maxlength="18" placeholder="请输入小组名称,18字以内" v-model="groupName" />
        </div>

        <div class="stu-list">
          <p class="title">成员</p>
          <div class="list-box scrollY">
            <ul class="clear">
              <li class="icon-add fl" @click="addStudent"></li>
              <li class="stu-item fl" :class="{'marginLeft0': (index+1)%4 == 0}" v-for="(item,index) in selectedxsList" :key="index">
                <!--判断性别1男2女-->
                <div class="li-top" v-if="item.gender == 1">
                  <div class="avatar" v-if="item.icon" :style="{'backgroundImage': 'url('+item.icon+')'}"></div>
                  <div class="avatar boy" v-else></div>

                  <!--删除-->
                  <div class="icon-del" @click="_delStu(index)"></div>
                </div>
                <div class="li-top" v-else>
                  <div class="avatar" v-if="item.icon" :style="{'backgroundImage': 'url('+item.icon+')'}"></div>
                  <div class="avatar girl" v-else></div>

                  <!--删除-->
                  <div class="icon-del" @click="_delStu(index)"></div>
                </div>

                <div class="list-bottom text-overflow">{{item.name}}</div>
              </li>
            </ul>
          </div>
        </div>

        <!--保存按钮-->
        <div class="group-foot" v-preventReClick="1000" @click.prevent="save($event)">保存</div>
      </div>

      <!--保存成功提示-->
      <v-modal-success ref="success" :tip="'保存成功'" :type="1"></v-modal-success>
    </div>
</template>

<script>
  import {stuGroupApi} from '@/utils/api'

  import Modal from '@/components/modal/Modal.vue'

  export default {
    name: 'AddGroup',
    components: {
      'v-modal-success': Modal
    },
    data() {
      return {
        classCode: this.$route.query.classCode,
        gradeCode: this.$route.query.gradeCode,
        submitHttp: true, // 控制提交请求频率，防止网络异常造成多次地点击请求
        selectedxsList: [], // 存放被选中的学生列表
        groupName: '',
      }
    },
    activated() {
      Promise.all([this.initData(),this.getQuery()]).then((result) => {}).catch((error) => {
        console.log(error)      // 失败了，打出 '失败'
      })
    },
    methods: {
      async save(event) {
        if(!this.groupName || this.groupName == '') {
          this.$toast("请输入小组名称");
          return;
        }
        if(this.selectedxsList.length == 0) {
          this.$toast("请选择成员");
          return;
        }

        if (event.target.disabled) {
          this.$toast('请不要重复点击，耐心等待一秒哦')
          return
        }

        if(!this.submitHttp) {
          this.$toast('当前网络异常，请耐心等待')
          return
        }
        let members = [];
        this.selectedxsList.forEach((c) => {
          members.push({
            studentId: c.id,
            gradeId: this.gradeCode,
            classId: this.classCode
          })
        })
        this.$indicator.open("保存中，请稍后")

        let data = {
          classCode: this.classCode,
          groupName: this.groupName,
          count: this.selectedxsList.length,
          groupOwner: this.$cookie.get('userId'),
          members: members
        };
        this.submitHttp = false;

        const res = await this.$req.post(stuGroupApi.edit, data);
        this.submitHttp = true;
        if(res.resultCode == 1) {
          this.$refs.success.showModal();
          setTimeout(()=>{
            this._back()
          },2000)
        }
      },

      initData() {
        let selectedxsList = sessionStorage.getItem('selectedxsList') || '[]';
        // 获取选中学生列表
        this.selectedxsList = JSON.parse(selectedxsList);

        let groupName = sessionStorage.getItem('groupName');
        // 获取小组名称
        this.groupName = JSON.parse(groupName);
      },
      getQuery() {
        this.classCode = this.$route.query.classCode;
        this.gradeCode = this.$route.query.gradeCode;
      },
      addStudent() {
        sessionStorage.setItem('groupName',JSON.stringify(this.groupName)) // 存储小组名称
        sessionStorage.setItem('selectedxsList',JSON.stringify(this.selectedxsList)) // 存储选中学生列表

        this.$router.push({
          path: '/addstudent',
          query: {
            classCode: this.classCode
          }
        })
      },
      _delStu(key) {
        this.selectedxsList.splice(key,1)
      },
      _back() {
        this.$router.back();
      }
    }
  }
</script>

<style lang="less" scoped>
  .add-group-box {
    height: 100%;
    .group-box {
      padding: 0 32px;
      height: 100%;
      background-color: #ffffff;
    }

    .title {
      color: #262626;
      font-size: 28px;
      font-weight: 600;
    }

    .group-top {
      padding-top: 32px;
      input[type="text"] {
        width: 666px;
        height: 88px;
        outline: none;
        color: #262626;
        font-size: 28px;
        padding-left: 20px;
        margin-top: 20px;
        border-color: #EFF1F3;
        background-color: #EFF1F3;
      }
    }

    .stu-list {
      margin-top: 32px;
      height: calc(100% - 310px);
      .list-box {
        height: calc(100% - 60px);

        ul {
          padding-top: 20px;
        }
        .icon-add {
          width: 90px;
          height: 90px;
          background: url('/static/img/plusbtn.png') no-repeat center;
          background-size: 90px auto;
        }
        li {
          height: 162px;
          margin-bottom: 40px;
          &.stu-item {
            margin-left:60px;
          }
          &.marginLeft0 {
            margin-left: 0;
          }

          .li-top {
            position: relative;
            .avatar {
              width: 100px;
              height: 100px;
              border-radius: 50%;
              background-size: 100px auto;
              background-position: center;
              background-repeat: no-repeat;
            }
            .boy {
              background-image: url("/static/img/boy@2x.png");
            }
            .girl {
              background-image: url("/static/img/girl@2x.png");
            }

            .icon-del {
              position: absolute;
              top: -8px;
              right: -8px;
              width: 40px;
              height: 40px;
              background: url('./img/icon_del@2x.png') no-repeat center;
              background-size: 40px auto;
            }
          }

          .list-bottom {
            width: 100px;
            color: #262626;
            font-size: 28px;
            margin-top: 12px;
            text-align: center;
          }
        }
      }
    }

    .group-foot {
      position: fixed;
      left: 50%;
      bottom: 10px;
      margin-left: -160px;
      width: 320px;
      height: 88px;
      line-height: 88px;
      text-align: center;
      color: #ffffff;
      font-size: 30px;
      border-radius: 50px;
      background-color: #33A5FF;
    }
  }
</style>
