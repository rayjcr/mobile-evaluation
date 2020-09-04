<template>
  <div class="pj-wrapper scrollY">
    <div>
      <!--评价维度-->
      <div class="pj-medal">
        <div class="pj-medal-top text-overflow" @click="showWd">
          {{dimensionName || '全部'}}
          <i class="mintui mintui-back back-icon"></i>
        </div>
        <div class="pj-medal-content">
          <v-pj-tab ref="pjTab" :rewardType="rewardType" :list="popupTab" :pjMultiPerson="0" :pjList="pjList" @getRewardType="getRewardType" @getPjInfo="getPjInfo"></v-pj-tab>
        </div>
      </div>
      <div class="pj-content">
        <div class="pj-header">
          <p class="pj-text">{{pjName}}</p>
          <p class="py">{{dimensionName}}</p>
        </div>
        <div class="pj-change-number">
          <div class="title">数值</div>
          <div class="input-box">
            <input type="number" placeholder="请输入1~99范围内的数字" @blur="blur" v-model="number" @input="checkNumber(number)">
          </div>
        </div>
        <div class="pj-bz">
          <div class="bz-top flex alignCenter">
            <div class="title flex_1">评语(选填)</div>
            <div class="input-number">{{content.length}}/100</div>
          </div>
          <div>
            <div class="py-box flex">
              <textarea class="flex_1 textarea" placeholder="请输入评语" @blur="$blur" v-model="content" maxlength="100"></textarea>
            </div>
            <div class="set-comment-btn" v-if="showCommentBtn && content != ''" v-preventReClick="1000" @click="setCommentList($event)">
              <span>+</span>设为常用评语
            </div>
            <ul class="py-list scrollY">
              <li class="flex alignCenter" v-for="(item,index) in commentList" :key="index">
                <div class="flex_1 flex alignCenter" @click="setPY(item.content,item.defaultReward)">
                  <div class="content text-overflow">{{item.content}}</div>
                  <!--<div class="default-reward" v-show="item.defaultReward">{{rewardType == 3 || rewardType == 5 ? '+' : '-'}}{{item.defaultReward}}</div>-->
                </div>
                <div class="del-comment-list" v-if="item.custom" @click="delCommentList(item.id)">×</div>
              </li>
            </ul>
          </div>
        </div>
        <div class="pj-img-box">
          <div class="title" style="margin-bottom: 0">图片(选填)</div>
          <div class="clear">
            <div class="fl img-item flex alignCenter justifyCenter" v-for="(item,index) in imgs" :key="index">
              <div class="del-img-btn" @click="delImg(index)" v-if="item.absolutePath">
                <img src="@/assets/img/del.png">
              </div>
              <img class="img" :src="item.absolutePath">
              <div class="progress-box" :style="{'height': item.progress}" v-show="item.progress != '100.00%'"></div>
              <div class="progress-num" v-show="item.progress != '100.00%'">{{item.progress}}</div>
            </div>
            <div class="fl upload" @click="upload" v-show="imgs.length < 9">
              <div class="jiahao"></div>
              <div class="tianjia-txt">添加照片</div>
            </div>
          </div>
        </div>
        <div class="pj-gl-student" v-show="dimensionId" v-if="jlk != 'true'">
          <div class="clear">
            <div class="title fl">关联学生</div>
            <div class="fl switch"><mt-switch v-model="glStudent"></mt-switch></div>
            <div class="add-student" @click="addStudent" v-show="glStudent">
              ＋ 添加学生
            </div>
          </div>
          <ul class="student-list scrollY">
            <li class="flex alignCenter" v-for="(item,index) in selectedxsList" :key="index">
              <div class="name text-overflow">{{item.name}}</div>
              <div class="step-box">
                <span class="span-border reduce" @click="changeMark('reduce', index)">-</span>
                <span class="content">{{item.number}}</span>
                <span class="span-border add" @click="changeMark('add', index)">+</span>
              </div>
              <div class="del-student" @click="delStudent(index)">
                <img src="@/assets/img/del.png">
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="flex pj-bottom-box">
        <div class="flex_1 btn gray-btn" @click="back">取消</div>
        <div class="flex_1 btn blue-btn" v-preventReClick="1000" @click.prevent="save($event)">提交</div>
      </div>
    </div>

    <!--上传图片-->
    <v-upload-img ref="upload" :imgs="imgs" :maxNumber="maxNumber" @getUplaodFile="getUplaodFile"></v-upload-img>

    <!--维度选择器-->
    <v-wd-select ref="wd" @getWdInfo="getWdInfo" @getWdName="getWdName"></v-wd-select>

    <!--确认删除评语项-->
    <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
      <div class="del-py-box">
        <div class="py-tip">确定删除该评语？</div>
        <div class="py-btn cancel" @click="popupVisible=false">取消</div>
        <div class="py-btn delete" @click="delCommentListSub">删除</div>
      </div>
    </mt-popup>

    <!--评价成功提示-->
    <v-modal-success ref="success" :tip="'评价成功'" :type="1"></v-modal-success>
  </div>
</template>

<script>
  import {PjApi,gobalAPi} from '@/utils/api'

  import WdSelect from '@/components/wdSelect/WdSelect.vue'
  import UploadImg from '@/components/UploadImg.vue'
  import PjTabList from '@/components/pjTab/PjTabList.vue'
  import Modal from '@/components/modal/Modal_longTime.vue'

  export default {
    name: "PjClass",
    components: {
      'v-wd-select': WdSelect,
      'v-modal-success': Modal,
      'v-pj-tab': PjTabList,
      'v-upload-img': UploadImg
    },
    data() {
      return {
        title: this.$route.query.title,
        classCode: this.$route.query.classCode,// 班级代码
        gradeCode: this.$route.query.gradeCode, // 年级代码
        jlk: this.$cookie.get('jlk'), // 激励卡模块展示
        xueNian: this.$cookie.get('schoolYear'), // 学年

        number: 1,
        maxNumber: 9, //最大支持上传多少张图片
        glStudent: false, // 是否关联学生
        popupVisible: false, // 控制删除评语弹层的显隐
        submitHttp: true, // 控制提交请求频率，防止网络异常造成多次地点击请求
        pjName: '', // 评价项名称
        dimensionId: '', // 维度编号
        dimensionName: '', // 维度名称
        evaluationId: '', // 评价项id
        rewardType: 3, // 默认显示加分
        rewardMax: 0, // 奖惩最大值
        rewardMin: 0, // 奖惩最小值
        content: '', // 评语内容
        commentId: '', // 被删除的评语id
        showCommentBtn: true, // 每人/每个评价项最多保存10个评语
        imgs: [],
        pjList: [],
        commentList: [], // 评语集合
        selectedxsList: [],
        popupTab: [],
      }
    },
    mounted() {
      Promise.all([
        this.getConfig(),
        this.getCountByRewardType()
      ]).then(() => {}).catch((error) => {
        console.log(error)
      })
    },
    watch: {
      $route (to, from) {
        if(to.path == '/pjclass') {
          if(from.path == '/addstudent') {
            let selectedxsList = sessionStorage.getItem('selectedxsList') || '[]';
            // 获取选中学生列表
            this.selectedxsList = JSON.parse(selectedxsList);

            this.selectedxsList.forEach((c) => {
              c.number = this.rewardMin
            })

          } else {
            Promise.all([
              this.getQuery(),
              this.initData(),
              this.getConfig(),
              this.getCountByRewardType()
            ]).then(() => {}).catch((error) => {
              console.log(error)
            })
          }
        }
      }
    },
    methods: {
      /*
      * 获取显示的奖惩类型（加分，减分）(未设置评价项的奖惩类型不显示)
      * */
      async getCountByRewardType() {
        let data = {
          scope: 2,
          type: 1,
          dimensionId: this.dimensionId,
          gradeCode: this.gradeCode,
          classCode: this.classCode,
          relevantUserNo: this.relevantUserNo
        };
        this.$indicator.open('数据请求中，请稍后....');
        const res = await this.$req.get(PjApi.getCountByRewardType, data);
        if (res.resultCode == 1) {
          if(res.value) {
            this.popupTab = [];
            Object.keys(res.value).forEach((c) => {
              if(c == 3 || c == 4) {
                this.popupTab.push({
                  type: c,
                  name: c == 3 ? '加分' : '减分'
                })
              }
            })
          }

          if(this.popupTab.length > 0) {
            this.rewardType = this.popupTab[0].type;
            this.getpjxList();
          } else {
            this.pjList = [];
            this.evaluationId = '';
            this.pjName = '';
            this.hideWd();
          }
        }
      },
      /*
      * 获取评价项列表
      * */
      async getpjxList() {
        let data = {
          scope: 2,
          type: 1,
          rewardType: this.rewardType,
          dimensionId: this.dimensionId,
          gradeCode: this.gradeCode,
          classCode: this.classCode,
          relevantUserNo: this.$cookie.get('userId')
        };
        const res = await this.$req.get(PjApi.list, data);
        if (res.resultCode == 1) {
          this.pjList = res.value;
          this.pjName = res.value.length > 0 ? res.value[0].name : '暂无评价项';
          if (res.value.length == 0) {
            this.evaluationId = '';
            return
          }
          this.$refs.pjTab.pjKey = 0;
          this.getpjDetail(res.value[0].id)
        }
      },
      /*
      * 根据评价项主键获取对应详情信息
      * */
      async getpjDetail(id,type) {
        const res = await this.$req.get_special(PjApi.getDetail, id);
        if (res.resultCode == 1) {
          this.commentList = res.value.commentList;
          this.checkCommentList(this.commentList); // 每人/每个评价项最多保存10个评语，达到上限后保存评语按钮消失；
          if(type && type == 'updateCommentList') return; // 更新评语列表时其他参数不需要变化

          this.dimensionId = res.value.dimensionId;
          this.evaluationId = res.value.id;
          this.rewardMax = res.value.rewardMax || 99;
          this.rewardMin = res.value.rewardMin || 1;
          this.number = this.rewardMin;
          this.content = '';
          this.imgs = [];
          this.selectedxsList = []
        }
      },
      /*
      * 获取全局配置--是否开启关联学生
      * */
      async getConfig() {
        const res = await this.$req.get(gobalAPi.getConfig);
        if (res.resultCode == 1) {
          this.glStudent = res.value.relationStudent
        }
      },
      /*
      * 添加自定义评语
      * */
      async setCommentList(event) {
        if (this.evaluationId == '') {
          this.$toast('请选择评价项');
          return;
        }
        if (this.content == '') {
          this.$toast('请输入评语内容');
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
        let data = {
          evaluationId: this.evaluationId,
          content: this.content,
          id: null,
        };
        this.submitHttp = false;
        const res = await this.$req.post(PjApi.comment, data);
        this.submitHttp = true;
        if (res.resultCode == 1) {
          this.getpjDetail(this.evaluationId,'updateCommentList')
        }
      },
      /*
      * 删除自定义评语
      * */
      async delCommentListSub() {
        const res = await this.$req.delete_special(PjApi.delComment, this.commentId);
        if (res.resultCode == 1) {
          this.getpjDetail(this.evaluationId,'updateCommentList')
          this.popupVisible = false;
        }
      },

      /*
      * 当自定义评语大于10不在添加
      * */
      checkCommentList(data) {
        let arr = [];
        data.forEach((c) => {
          if(c.custom) {
            arr.push(c)
          }
        })
        if(arr.length >= 10) {
          this.showCommentBtn = false;
        } else {
          this.showCommentBtn = true;
        }
      },
      delCommentList(id) {
        this.commentId = id;
        this.popupVisible = true;
      },
      getQuery() {
        this.title = this.$route.query.title;
        this.classCode = this.$route.query.classCode;
        this.gradeCode = this.$route.query.gradeCode;
        document.title = '评价' + this.title;
      },
      checkNumber(num) {
        // this.number= (num.match(/^\d*(\.?\d{0,1})/g)[0]) || null;
        this.number = this.number.slice(0, 2);
        // let reg = /^([1-9]\d{0,1}|[1-9]\d{0,1}\.\d)$/;

        //this.number = (this.number && this.number <= this.rewardMin) ? this.rewardMin : (this.number && this.number >= this.rewardMax) ? this.rewardMax : this.number;
      },
      blur() {
        this.$blur();
        this.number = this.number < this.rewardMin ? this.rewardMin : this.number > this.rewardMax ? this.rewardMax : this.number;
      },
      initData() {
        this.dimensionId = '';
        this.dimensionName = '';
        this.content = '';
        this.imgs = [];
        this.pjList = [];
        this.number = 1;
        this.selectedxsList = [];
        this.hideWd();
        this.$nextTick(() => {
          this.$refs.success.hideModal();
        })
      },
      /*
      * 获取选中的维度名称
      * */
      getWdName(data) {
        this.dimensionName = '';
        data.forEach((c) => {
          this.dimensionName += c.name + '-'
        });
        this.dimensionName = this.dimensionName.substring(0,this.dimensionName.length-1)
      },
      /*
      * 获取选中的维度信息
      * */
      getWdInfo(info) {
        this.dimensionId = info.id;
        // this.getpjxList()
        this.getCountByRewardType();
      },
      /*
      * 切换奖惩类型
      * */
      getRewardType(type) {
        if(this.rewardType != type) {
          this.rewardType = type;
          this.dimensionId = this.wdName ? this.dimensionId : ''; 
          this.$indicator.open("数据请求中，请稍后....");
          this.getpjxList()
        }
      },
      /*
      * 获取对应的评价项详情
      * */
      getPjInfo(key) {
        if(this.pjList.length > 0) {
          this.pjName = this.pjList[key].name;
          this.evaluationId = this.pjList[key].id;
          this.getpjDetail(this.evaluationId)
        }
      },
      changeMark(type,key) {
        let number = this.rewardMin;
        let target = this.selectedxsList[key];
        number = type == 'add' ? (target.number - 0)+(1 - 0) : (target.number - 0)-(1 - 0);
        number = number <= this.rewardMin ? this.rewardMin : number >= this.rewardMax ? this.rewardMax : number;
        target.number = number;
      },
      /*
      * 选中的评语
      * @param c，评语内容 n，评语默认值
      * */
      setPY(c,n) {
        this.content = c;
        // this.number = n || this.number;
      },
      showWd() {
        this.$refs.wd.show();
      },
      hideWd() {
        this.$refs.wd.hide();
      },
      upload() {
        this.$refs.upload.fileClick();
      },
      getUplaodFile(data) {
        this.imgs = data;
      },
      delImg(key) {
        this.imgs.splice(key,1)
      },
      /*
      * 添加学生
      * */
      addStudent() {
        sessionStorage.setItem('selectedxsList',JSON.stringify(this.selectedxsList)) // 存储选中学生列表

        this.$router.push({
          path: '/addstudent',
          query: {
            classCode: this.classCode
          }
        })
      },
      delStudent(key) {
        this.selectedxsList.splice(key,1)
      },
      async save(event) {
        if (this.evaluationId == '') {
          this.$toast('请选择评价项');
          return;
        }
        if (this.number < this.rewardMin) {
          this.$toast(`数值不能小于${this.rewardMin}`);
          return;
        }
        if (this.number > this.rewardMax) {
          this.$toast(`数值不能大于${this.rewardMax}`);
          return;
        }
        if(this.imgs.length > 0) { // 如果图片存在要判断图片是否已加载出来
          for(let i = 0,imgs = this.imgs;i<imgs.length;i++){
            if(imgs[i].absolutePath == '') {
              this.$toast('还有图片未加载，请耐心等待')
              return;
            }
            if(imgs[i].fileId == '') {
              this.$toast('数据异常')
              return;
            }
          }
        }
        if (event.target.disabled) {
          this.$toast('请不要重复点击，耐心等待一秒哦')
          return
        }
        if(!this.submitHttp) {
          this.$toast('当前网络异常，请耐心等待')
          return
        }
        this.$indicator.open('提交中，请稍后')
        let arr_number = [this.number],arr_name = [this.title],arr_id = [''];
        this.selectedxsList.forEach((c) => {
          arr_number.unshift(c.number);
          arr_name.unshift(c.name);
          arr_id.unshift(c.id)
        })
        let data = {
          classCode: this.classCode,
          dimensionId: this.dimensionId,
          content: this.content,
          evaluationId: this.evaluationId,
          gradeCode: this.gradeCode,
          score: arr_number,
          name: arr_name, // 被评人姓名
          userId: arr_id,
          type: 1, // 1.录入型 2.项目型 3.学生上传
          xueNian: this.xueNian,
          pictureIds: this.imgs,
        };
        this.submitHttp = false;
        const res = await this.$req.post(PjApi.save, data);
        this.submitHttp = true;
        if (res.resultCode == 1) {
          this.$refs.success.showModal();
        }
      },
      back() {
        this.$router.go(-1);
      }
    }
  }
</script>

<style lang="less" scoped>
  .pj-wrapper {
    height: 100%;
    background-color: #EFF1F3;
    &.scroll {
      overflow-x: hidden;
      overflow-y: scroll;
      -webkit-overflow-scrolling: touch;
    }

    .pj-medal {
      background-color: #ffffff;
      .pj-medal-top {
        width: 300px;
        height: 40px;
        line-height: 40px;
        margin: 0 auto;
        color: #262627;
        font-size: 28px;
        text-align: center;
        padding: 20px 32px 0;
        .back-icon {
          display: inline-block;
          color: #C7C7CC;
          font-size: 25px;
          width: 25px;
          transform: rotate(-90deg);
        }
      }
      .pj-medal-content {
        margin-top: 42px;
      }
    }
    .pj-content {
      margin-top: 20px;
      padding: 32px;
      padding-bottom: 118px;
      background-color: #ffffff;
    }
    .pj-header {
      padding-bottom: 34px;
      border-bottom: 1px solid #EFF1F3;
      .pj-text {
        color: #262627;
        font-size: 32px;
        margin-bottom: 8px;
        font-weight: 600;
      }
      .py {
        color: #B6B8B8;
        font-size: 24px;
      }
    }
    .title {
      margin-bottom: 16px;
      color: #262627;
      font-size: 28px;
      font-weight: 600;
    }
    .pj-change-number {
      margin-top: 34px;
      .input-box {
        height: 80px;
        border: 2px solid #EFF1F3;
        input {
          width: 90%;
          margin-left: 20px;
          font-size: 28px;
          line-height: 75px;
        }
      }
    }
    .pj-bz {
      margin-top: 34px;
      .input-number {
        width: 100px;
        color: #B6B8B8;
        font-size: 28px;
        text-align: right;
      }
      .py-box {
        border: 2px solid #EFF1F3;
        .textarea {
          outline: none;
          resize: none;
          border: none;
          width: 100%;
          height: 212px;
          font-size: 28px;
          padding: 14px 20px;
        }
      }
      .set-comment-btn {
        width: 220px;
        color: #33A5FF;
        font-size: 28px;
        margin-top: 20px;
        span {
          font-size: 35px;
          margin-right: 8px;
        }
      }
      .py-list {
        max-height: 600px;
        color: #262627;
        font-size: 28px;
        margin-top: 20px;
        li {
          height: 56px;
          line-height: 56px;
          margin-bottom: 20px;
          padding-left: 20px;
          border-radius: 28px;
          background-color: #EFF1F3;
          .content {
            width: 610px;
          }
          .del-comment-list {
            display: inline-block;
            width: 58px;
            color: #B6B8B8;
            font-size: 32px;
            text-align: center;
          }
          .default-reward {
            color: #B6B8B8;
          }
        }
      }
    }
    .pj-img-box {
      margin-top: 32px;
      .clear {
        padding-top: 20px;
      }
      .upload {
        width: 200px;
        height: 200px;
        cursor: pointer;
        text-align: center;
        border: 1px solid #EFF1F3;
        .jiahao {
          position: relative;
          width: 60px;
          height: 60px;
          top: 38px;
          left: 50%;
          margin-left: -30px;
          &:before {
            content: '';
            position: absolute;
            width: 60px;
            height: 4px;
            top: 50%;
            left: 0;
            margin-top: -2px;
            background-color: #EFF1F3;
          }
          &:after {
            content: '';
            position: absolute;
            height: 60px;
            width: 4px;
            top: 0;
            left: 50%;
            margin-left: -2px;
            background-color: #EFF1F3;
          }
        }
        .tianjia-txt {
          color: #B6B8B8;
          font-size: 24px;
          margin-top: 70px;
        }
      }
      .img-item {
        position: relative;
        z-index: 80;
        width: 200px;
        height: 200px;
        margin-right: 20px;
        margin-bottom: 20px;
        .img {
          position: absolute;
          max-height: 200px;
          max-width: 200px;
        }
        .del-img-btn {
          position: absolute;
          z-index: 100;
          width: 40px;
          height: 40px;
          right: -12px;
          top: -12px;
          cursor: pointer;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .progress-box {
          position: absolute;
          z-index: 90;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: rgba(0,0,0,0.5);
        }
        .progress-num {
          position: absolute;
          z-index: 90;
          width: 100px;
          height: 100px;
          line-height: 100px;
          text-align: center;
          top: 50%;
          left: 50%;
          margin-left: -50px;
          margin-top: -50px;
        }
      }
    }
    .pj-gl-student {
      position: relative;
      margin: 40px 0 20px 0;
      .switch {
        margin-left: 20px;
      }
      .add-student {
        position: absolute;
        right: 0;
        color: #33A5FF;
        font-size: 28px;
      }
      .student-list {
        max-height: 600px;
        border-radius: 16px;
        background-color: #F3F5F7;
        li {
          padding: 20px 0 20px 40px;
        }
        .name {
          width: 180px;
          color: #262727;
          font-size: 32px;
        }
        .step-box {
          span {
            display: inline-block;
          }
          .span-border {
            cursor: pointer;
            width: 60px;
            height: 60px;
            line-height: 55px;
            color: #B6B8B8;
            font-size: 40px;
            font-weight: 600;
            text-align: center;
            border-radius: 8px;
            border: 2px solid #B6B8B8;
            background-color: #ffffff;
          }
          .content {
            width: 104px;
            text-align: center;
            color: #262627;
            font-size: 28px;
          }
        }
        .del-student {
          margin-left: 20px;
        }
      }
    }
    .pj-bottom-box {
      position: fixed;
      z-index: 200;
      width: 100%;
      bottom: 0;
      left: 0;
      height: 100px;
      background-color: #ffffff;
      .btn {
        height: 88px;
        line-height: 88px;
        text-align: center;
        border-radius: 44px;
        font-size: 28px;
      }
      .gray-btn {
        margin-left: 32px;
        margin-right: 46px;
      }
      .blue-btn {
        margin-right: 32px;
      }
    }
    /*评语删除确认框*/
    .del-py-box {
      height: 366px;
      padding: 80px 38px 40px 42px;
      .py-tip {
        color: #262727;
        font-size: 48px;
        font-weight: 600;
        text-align: center;
      }
      .py-btn {
        height: 88px;
        line-height: 88px;
        text-align: center;
        font-size: 30px;
        border-radius: 44px;
      }
      .cancel {
        color: #262627;
        margin-top: 98px;
        background-color: #EFF1F3;
      }
      .delete {
        color: #FFFFFF;
        margin-top: 20px;
        background-color: #FF7B12;
      }
    }
  }
</style>
