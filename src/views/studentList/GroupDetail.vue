<template>
    <div class="edit-group-wrapper">
      <transition name="msgbox-bounce">
        <div class="edit-group-box" v-show="isShow">
          <div class="edit-group-top flex">
            <div class="btn del" v-if="isHeadmaster" @click="_delGroup">删除</div>
            <div class="name flex_1">{{info.groupName}}</div>
            <div class="btn edit" v-if="isHeadmaster" @click="_jump(0)">编辑</div>
          </div>

          <div class="edit-group-content">
            <div class="checkAll flex alignCenter" @click="_checkAll(true)" v-show="isCheckAll == false">
              <div class="check-circle" :class="{'checked': isCheckAll}"></div>
              <span>全选</span>
            </div>
            <div class="checkAll flex alignCenter" @click="_checkAll(false)" v-show="isCheckAll == true">
              <div class="check-circle" :class="{'checked': isCheckAll}"></div>
              <span>取消全选</span>
            </div>
            <div class="list-box scrollY">
              <ul class="clear">
                <li
                  class="fl"
                  :class="{'marginRight0': (index+1)%3 == 0}"
                  v-for="(item,index) in info.members"
                  :key="index"
                  @click="_checkFun(index)"
                >
                  <!--判断性别1男2女-->
                  <div class="li-top" v-if="item.gender == 1">
                    <div class="avatar" v-if="item.icon" :style="{'backgroundImage': 'url('+item.icon+')'}"></div>
                    <div class="avatar boy" v-else></div>

                    <div class="check-circle" :class="{'checked': item.checked}"></div>
                  </div>
                  <div class="li-top" v-else>
                    <div class="avatar" v-if="item.icon" :style="{'backgroundImage': 'url('+item.icon+')'}"></div>
                    <div class="avatar girl" v-else></div>

                    <div class="check-circle" :class="{'checked': item.checked}"></div>
                  </div>

                  <div class="list-bottom text-overflow">{{item.name}}</div>
                </li>
              </ul>
            </div>
          </div>

          <div class="edit-group-bottom" @click="_pj">评价</div>
        </div>
      </transition>

      <div class="edit-group-modal" v-if="isShow" @click="_hide"></div>
    </div>
</template>

<script>
  export default {
    name: 'GroupDetail',
    props: {
      isHeadmaster: {
        default: false
      }
    },
    data() {
      return {
        isShow: false, // 弹层的显示隐藏
        isCheckAll: true, // 默认全选
        info: {}, // 详情信息
        checkList: [], // 被选中的成员
        jlk: this.$cookie.get('jlk'), // 激励卡or常规
      }
    },
    watch: {
      isShow(nVal) {
        if(nVal) {
          this.checkList = this.info.members;
        }
      }
    },
    methods: {
      _pj() {
        if (this.checkList.length == 0) {
          this.$toast('请选择要评价的学生');
          return;
        }
        sessionStorage.setItem('studentInfo',JSON.stringify(this.checkList))
        this._jump(1)
      },
      _delGroup() {
        this.$emit('delGroup',this.info)
      },
      _jump(type) { // 0编辑小组1评价学生
        let query = {
          classCode: this.$route.query.classCode,
          gradeCode: this.$route.query.gradeCode
        };
        if(type == 0) {
          sessionStorage.setItem('groupInfo',JSON.stringify(this.info))
        } else {
          this.$set(query,'type',1)
          sessionStorage.setItem('isFromGroup',true)
        }

        this.$router.push({
          path: type == 0 ? '/editgroup' : (this.jlk == 'true' ? '/pjstudentjlk' : '/pjstudent') ,
          query: query,
        });
      },
      _checkAll(bool) {
        let members = this.info.members;
        this.checkList = []
        this.isCheckAll = bool;
        members.forEach((c) => {
          c.checked = bool;
          if(c.checked) {
            this.checkList.push(c)
          }
        })
      },
      _checkFun(key) {
        this.checkList = [];
        let members = this.info.members;
        members[key].checked = !members[key].checked;
        members.forEach((c) => {
          if(c.checked) {
            this.checkList.push(c)
          }
        })

        if(this.checkList.length == members.length) {
          this.isCheckAll = true;
        } else {
          this.isCheckAll = false;
        }
      },
      _show() {
        this.isShow = true;
      },
      _hide() {
        this.isShow = false;
      },
    }
  }
</script>

<style lang="less" scoped>
  .edit-group-wrapper {
    position: absolute;
    z-index: 2016;
    top: 0;
    left: 0;

    .edit-group-modal {
      position: fixed;
      z-index: 2017;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      opacity: .3;
      background: #000;
    }

    .edit-group-box {
      position: fixed;
      left: 50%;
      top: 50%;
      z-index: 2018;
      transform: translate3d(-50%,-50%,0);
      background-color: #ffffff;
      width: 686px;
      border-radius: 20px;
      transition: .2s;
      .edit-group-top {
        padding-top: 24px;
        .btn {
          width: 192px;
          font-size: 32px;
          text-align: center;
          margin-top: 4px;
        }
        .del {
          color: #B6B8B8;
        }
        .edit {
          color: #33A5FF;
        }
        .name {
          color: #262627;
          text-align: center;
          font-size: 36px;
          font-weight: 600;
        }
      }
      .edit-group-content {
        padding: 22px 40px 88px;
        .checkAll {
          width: 190px;
          .check-circle {
            position: relative;
            width: 40px;
            height: 40px;
            margin-right: 14px;
            background: url('/static/img/icon_radio@2x.png') no-repeat center;
            background-size: 40px auto;
            &.checked {
              background: url('/static/img/icon_radio_checked@2x.png') no-repeat center;
              background-size: 40px auto;
            }
          }
        }
        .list-box {
          height: 580px;
          ul {
            padding-top: 36px;
          }
          li {
            margin-bottom: 48px;
            margin-right: 98px;
            text-align: center;
            &.marginRight0 {
              margin-right: 0;
            }
            .li-top {
              position: relative;
              width: 100px;
              height: 100px;
              margin: 0 auto;
              .avatar {
                width: 100%;
                height: 100%;
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

              .check-circle {
                position: absolute;
                top: -8px;
                right: -8px;
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

            .list-bottom {
              width: 136px;
              color: #262626;
              font-size: 28px;
              margin-top: 20px;
              text-align: center;
            }
          }
        }
      }
      .edit-group-bottom {
        position: absolute;
        z-index: 2019;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 88px;
        line-height: 88px;
        text-align: center;
        color: #ffffff;
        font-size: 30px;
        background-color: #6EBFFF;
        border-radius: 0 0 20px 20px;
      }
    }

    .msgbox-bounce-enter {
      opacity: 0;
      transform: translate3d(-50%, -50%, 0) scale(0.7);
    }
    .msgbox-bounce-leave-active {
      opacity: 0;
      transform: translate3d(-50%, -50%, 0) scale(0.9);
    }
  }
</style>
