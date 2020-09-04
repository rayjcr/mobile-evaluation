<template>
  <div class="pj-wrapper scrollY">
    <!--发卡，提醒-->
    <div class="pj-jlk">
      <div class="pj-jlk-content">
        <v-jlk-tab
          ref="jlkTab"
          :list="popupTab"
          :pjxList="pjxList"
          :type="type"
          @getjlkType="getjlkType"
          @getJLKInfo="getJLKInfo"
        ></v-jlk-tab>
      </div>
    </div>
    <div class="pj-content">
      <div class="pj-change-number" v-show="jlkType == 1 || jlkType == 3">
        <div class="title">数值</div>
        <div class="step-box">
          <span class="span-border reduce" @click="changeMark('reduce',1)">-</span>
          <input type="number" v-model="number" @blur="blur(1)" @focus="$focus" @input="input">
          <span class="span-border add" @click="changeMark('add',1)">+</span>
        </div>
      </div>
      <div class="pj-bz" v-show="jlkType == 1 || jlkType == 3">
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
                <div class="default-reward" v-show="item.defaultReward">{{rewardType == 3 || rewardType == 5 ? '+' : '-'}}{{item.defaultReward}}</div>
              </div>
              <div class="del-comment-list" v-if="item.custom" @click="delCommentList(item.id)">×</div>
            </li>
          </ul>
        </div>
      </div>
      <div class="pj-bz" v-show="jlkType == 2">
        <div class="bz-top flex alignCenter">
          <div class="title flex_1">提醒内容</div>
          <div class="input-number">{{tx.length}}/100</div>
        </div>
        <div class="py-box">
          <div class="flex">
            <textarea class="flex_1 textarea" placeholder="请输入内容" @blur="$blur" v-model="tx" maxlength="100"></textarea>
          </div>
        </div>
      </div>
      <div class="pj-img-box" :class="{'marginBottom40': jlkType == 2}">
        <div class="title">图片(选填)</div>
        <div class="clear">
          <div class="fl img-item flex alignCenter justifyCenter" v-for="(item,index) in imgs" :key="item.absolutePath+index">
            <div class="del-img-btn" @click="delImg(index)" v-if="item.absolutePath">
              <img src="@/assets/img/del.png">
            </div>
            <img class="img" v-if="item.absolutePath" :src="item.absolutePath">
            <div class="progress-box" :style="{'height': item.progress}" v-show="item.progress != '100.00%'"></div>
            <div class="progress-num" v-show="item.progress != '100.00%'">{{item.progress}}</div>
          </div>
          <div class="fl upload" @click="upload" v-show="imgs.length < 3">
            <div class="jiahao"></div>
            <div class="tianjia-txt">添加照片</div>
          </div>
        </div>
      </div>
      <!--惩罚-->
      <div class="punish-box" v-show="jlkType == 2" v-if="punishList.length>0">
        <div class="title">惩罚(选填)</div>
        <div class="punish-list scrollY">
          <vue-scroll :ops="scrollOps">
            <ul class="clear">
              <li class="fl" :class="{'marginRight0' : (index+1)%3 == 0}" v-for="(item,index) in punishList" :key="index" @click="selectPunish(index)">
                <img :class="{'checked': punishKey == index}" :src="item.icon">
                <p class="text-overflow">{{item.name}}</p>
              </li>
            </ul>
          </vue-scroll>
        </div>
      </div>
      <div class="switch-box" v-show="jlkType == 2">
        <!--短信通知，激励卡-->
        <div class="toggle-switch clear">
          <div class="title fl">短信通知家长</div>
          <div class="fl switch"><mt-switch v-model="sendMsg"></mt-switch></div>
        </div>
        <!--<div class="toggle-switch clear">-->
        <!--<div class="title fl">微信通知家长</div>-->
        <!--<div class="fl switch"><mt-switch v-model="sendMsg"></mt-switch></div>-->
        <!--</div>-->
        <div class="toggle-switch clear">
          <div class="title fl">电子班排显示</div>
          <div class="fl switch"><mt-switch v-model="syncEc"></mt-switch></div>
        </div>
      </div>
      <!--学生评分-->
      <div class="pf-list" v-if="type == 1 && (jlkType == 1 || jlkType == 3)">
        <div class="title">学生评分</div>
        <div class="student-list">
          <ul>
            <li class="flex alignCenter" v-for="(item,index) in studentList" :key="index">
              <div class="name text-overflow">{{item.name}}</div>
              <div class="step-box">
                <span class="span-border reduce" @click="changeMark('reduce',2,index)">-</span>
<!--                <span class="content">{{item.number}}</span>-->
                <input type="number" v-model="item.number" @blur="blur(2,index)" @focus="$focus" oninput="if(value.length>2)value=value.slice(0,2)">
                <span class="span-border add" @click="changeMark('add',2,index)">+</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="flex alignCenter pj-bottom-box">
      <div class="flex_1 btn gray-btn" @click="back">取消</div>
      <div class="flex_1 btn blue-btn" v-preventReClick="1000" @click="save($event)">提交</div>
    </div>
    <!--上传图片-->
    <v-upload-img ref="upload" :imgs="imgs" :maxNumber="maxNumber" @getUplaodFile="getUplaodFile"></v-upload-img>

    <!--确认删除评语项-->
    <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
      <div class="del-py-box">
        <div class="py-tip">确定删除该评语？</div>
        <div class="py-btn cancel" @click="popupVisible=false">取消</div>
        <div class="py-btn delete" @click="delCommentListSub">删除</div>
      </div>
    </mt-popup>

    <!--评价成功提示-->
    <v-modal-success ref="success" :tip="'评价成功'"></v-modal-success>
  </div>
</template>

<script>
  import {PjApi,RemindApi} from '@/utils/api'

  import UploadImg from '@/components/UploadImg.vue'
  import jlkTab from '@/components/pjTab/PjTabListjlk.vue'
  import Modal from '@/components/modal/Modal_longTime.vue'

  export default {
    name: "PjStudent-jlk",
    components: {
      'v-jlk-tab': jlkTab,
      'v-upload-img': UploadImg,
      'v-modal-success': Modal,
    },
    data() {
      return {
        title: this.$route.query.title,
        type: this.$route.query.type, // 1,多人评价,0单人
        classCode: this.$route.query.classCode,// 班级代码
        gradeCode: this.$route.query.gradeCode, // 年级代码
        userId: this.$route.query.userId, // 被评人编号
        xueNian: this.$cookie.get('schoolYear'), // 学年
        teacherId: this.$cookie.get('userId'), // 职工号

        popupVisible: false, // 控制删除评语弹层的显隐
        submitHttp: true, // 控制提交请求频率，防止网络异常造成多次地点击请求
        fkName: '', // 卡片名称
        number: 1,
        cardNumber: 0, // 卡片剩余数目(数目为0不能进行提交)
        maxNumber: 3, //最大支持上传多少张图片
        jlkType: 1, // 激励卡默认发卡
        rewardType: 5,
        dimensionId: '',
        evaluationId: '', // 评价项id
        rewardMax: 99, // 默认奖惩最大值
        rewardMin: 1, // 默认奖惩最小值
        stepType: '', // 加减数值(add,reduce)或者直接输入(input)
        sendMsg: false, // 送否发送短信通知
        syncEc: false, // 电子班排显示
        content: '', // 评语内容
        commentId: '', // 被删除的评语id
        showCommentBtn: true, // 每人/每个评价项最多保存10个评语
        tx: '', // 提醒内容
        punishKey: 0, // 惩罚列表默认选中第一项
        imgs: [],
        pjxList: [], // 一级勋章列表
        punishList: [], // 惩罚列表
        studentList: [],
        commentList: [], // 评语集合
        popupTab: [
          {type: 1,name: '发卡'},
          {type: 2,name: '提醒'},
        ],
        scrollOps: {
          bar: {
            background: '#B6B8B8',
            keepShow: true,//是否一直显示
          },
        },
      }
    },
    activated() {
      this.$refs.jlkTab.popupKey = 1; // 默认显示发卡tab
      this.$refs.jlkTab.pjKey = 0; // 默认选中第一项

      Promise.all([
        this.getQuery(),
        this.setTitle(),
        this.initData(),
        this.getpjxList()
      ]).then(() => {}).catch((error) => {
        console.log(error)
      })
    },
    watch: {
      number() {
        this.changeNumber()
      }
    },
    methods: {
      /*
      * 获取对应奖惩类型的评价项列表
      * */
      async getpjxList(scope,type) {
        this.$indicator.open("数据请求中，请稍后....");
        let data = {
          scope: scope || 1,
          type: type || 1,
        };

        if (!scope) {
          data['rewardType'] = this.rewardType;
          data['dimensionId'] = this.dimensionId;
          data['gradeCode'] = this.gradeCode;
          data['classCode'] = this.classCode;
          data['studentNo'] = this.type == 1 ? null : this.userId;
          data['relevantUserNo'] = this.teacherId;
        }

        const res = await this.$req.get(PjApi.list, data);

        if (res.resultCode == 1) {
          let list = res.value || [];
          if (list.length == 0) {
            this.evaluationId = '';
            this.pjxList = this.punishList = [];
            return
          }

          if (scope) { // scope存在是获取惩罚项列表
            this.punishList = list;
            this.punishList.unshift({
              name: '不惩罚',
              id: '',
              icon: require('./img/default_card@2x.png')
            })
          } else {
            this.pjxList = list;
            this.cardNumber = list[0].number
            this.getpjDetail(list[0].id)
          }
        }
      },
      /*
      * 获取对应评价项的详情信息
      * */
      async getpjDetail(id,type) {
        const res = await this.$req.get_special(PjApi.getDetail, id);
        if (res.resultCode == 1) {
          this.commentList = res.value.commentList || [];
          this.checkCommentList(this.commentList); // 每人/每个评价项最多保存10个评语，达到上限后保存评语按钮消失；
          if(type && type == 'updateCommentList') return; // 更新评语列表时其他参数不需要变化

          this.dimensionId = res.value.dimensionId;
          this.evaluationId = res.value.id;
          this.rewardMax = res.value.rewardMax || 99;
          this.rewardMin = res.value.rewardMin || 1;
          this.number = this.rewardMin;
          this.content = '';
          this.imgs = [];
          this.studentList.forEach((c) => {
            c.number = this.number;
          })
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
      * 判断如果自定义评语数量大于10则不在显示添加按钮
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
      selectPunish(key) {
        this.punishKey = key
      },
      getQuery() {
        this.title = this.$route.query.title;
        this.type = this.$route.query.type;
        this.classCode = this.$route.query.classCode;
        this.gradeCode = this.$route.query.gradeCode;
        this.userId = this.$route.query.userId;
      },
      /*
      *批量设置学生的数值
      * */
      changeNumber() {
        if(this.stepType != 'input') { // 限定区间
          this.number = this.number < this.rewardMin ? this.rewardMin : this.number > this.rewardMax ? this.rewardMax : this.number;
        }
        let number = this.rewardMin;
        this.studentList.forEach((c) => {
          if(this.stepType == 'input') {
            number = this.number;
          } else {
            number = this.stepType == 'add' ? (c.number - 0) + (1 - 0) : (c.number - 0) - (1 - 0);
          }
          c.number =  number <= this.rewardMin ? this.rewardMin : number >= this.rewardMax ? this.rewardMax : number;
        })
      },
      /*
      * 数值的加减
      * @param lb 1，批量设置数值，2，单个设置
      * @param type add 加数值 reduce减数值
      * */
      changeMark(type,lb,key) {
        if (lb == 1) {
          this.stepType = type;
          this.number = type == 'add' ? (this.number - 0)+(1 - 0) : (this.number - 0)-(1 - 0);
        } else {
          let number = type == 'add' ? (this.studentList[key].number - 0)+(1 - 0) : (this.studentList[key].number - 0)-(1 - 0);
          number = number <= this.rewardMin ? this.rewardMin : number >= this.rewardMax ? this.rewardMax : number;
          this.studentList[key].number = number;
        }
      },
      /*
      * 输入数值限制输入长度
      * */
      input() {
        this.stepType = 'input';
        this.number = this.number.slice(0,2);
      },
      /*
      * 数值输入框失去焦点
      * @param type 1 批量 2 单个设置
      * */
      blur(type,key) {
        this.$blur();
        if(type == 1) {
          this.number = this.number < this.rewardMin ? this.rewardMin : this.number > this.rewardMax ? this.rewardMax : this.number;
        } else {
          let target_num = this.studentList[key].number;
          let number = target_num <= this.rewardMin ? this.rewardMin : target_num >= this.rewardMax ? this.rewardMax : target_num;
          this.studentList[key].number = number;
        }
      },
      initData() {
        this.dimensionId = '';
        this.content = '';
        this.imgs = [];
        this.pjxList = [];
        this.tx = '';
        this.number = 1;
        this.rewardType = 5;
        this.rewardMax = 99;
        this.rewardMin = 1;
        this.punishKey = 0;
        this.sendMsg = false;
        this.syncEc = false;
        this.popupVisible = false;
        this.submitHttp = true;
        this.studentList.forEach((c) => {
          c.number = this.number;
        })
        this.$nextTick(() => {
          this.$refs.success.hideModal();
        })
      },
      /*
      * 选中的评语
      * @param c，评语内容 n，评语默认值
      * */
      setPY(c,n) {
        this.content = c;
        this.stepType = "input";
        this.number = n || this.rewardMin;
      },
      /*
      * 设置页面标题title
      * @param type 1 评价多人 2 评价单人
      * */
      setTitle() {
        if (this.type == 1) {
          this.studentList = JSON.parse(sessionStorage.getItem('studentInfo'));
          this.title = '';
          this.studentList.forEach((c) => {
            this.title += c.name + '、' ;
          });
          this.title = this.title.substring(0,this.title.length-1);
          this.setStudentList(this.studentList);
        }
        document.title = '评价' + this.title;
      },
      /*
      * 评价多人时初始化设置每个学生的数值
      * */
      setStudentList(list) {
        list.forEach((c) => {
          this.$set(c,'number',1)
        })
      },
      /*
      * 获取选中的tab类型
      * @param type 1，发卡 2，提醒 3，扣卡
      * */
      getjlkType(type) {
        this.jlkType = type;
        this.initData();

        if(type == 2) {
          this.getpjxList(4,3)
        } else {
          this.$refs.jlkTab.pjKey = 0; // 默认选中第一项

          if(type == 1) {
            this.rewardType = 5;
            this.$refs.jlkTab.popupKey = 1;
          } else {
            this.rewardType = 6;
            this.$refs.jlkTab.popupKey = 3;
          }
          this.getpjxList()
        }
      },
      /*
      * 获取对应卡片的详情信息
      * */
      getJLKInfo(key) {
        if(this.pjxList.length > 0) {
          this.evaluationId = this.pjxList[key].id;
          this.cardNumber = this.pjxList[key].number;
          this.getpjDetail(this.evaluationId)
        }
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
      async save(event) {
        if (this.evaluationId == '' && (this.jlkType == 1 || this.jlkType == 3)) {
          this.$toast('请选择评价项');
          return;
        }
        if (this.cardNumber == 0 && (this.jlkType == 1 || this.jlkType == 3)) {
          this.$toast('该卡片已发完');
          return;
        }
        if (this.tx == '' && this.jlkType == 2) {
          this.$toast('请输入提醒内容');
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
        let arr_number = [],arr_name = [],arr_id = [],arr_stu = [];
        if (this.type == 1) { // 评价多人
          this.studentList.forEach((c) => {
            arr_number.push(c.number);
            arr_name.push(c.name);
            arr_id.push(c.id)
            arr_stu.push({
              classId: this.classCode,
              gradeId: this.gradeCode,
              studentId: c.id
            })
          })
        } else {
          arr_number.push(this.number);
          arr_name.push(this.title);
          arr_id.push(this.userId)
          arr_stu.push({
            classId: this.classCode,
            gradeId: this.gradeCode,
            studentId: this.userId
          })
        }
        let res,url;
        let data = {
          content: (this.jlkType == 1 || this.jlkType == 3) ? this.content : this.tx,
        };
        if((this.jlkType == 1 || this.jlkType == 3)) { // 发卡或者扣卡
          data['type'] = 1; // 1.录入型 2.项目型 3.学生上传
          data['name'] = arr_name;
          data['userId'] = arr_id;
          data['medal'] = arr_number;
          data['xueNian'] = this.xueNian;
          data['evaluationId'] = this.evaluationId;
          data['dimensionId'] = this.dimensionId;
          data['classCode'] = this.classCode;
          data['gradeCode'] = this.gradeCode;
          data['pictureIds'] = this.imgs;
          url = PjApi.save
        } else { // 提醒
          data['sendMsg'] = this.sendMsg ? 1 : 0;
          data['syncEc'] = this.syncEc ? 1 : 0;
          data['teacherId'] = this.teacherId;
          data['evaluationItemId'] = this.punishList.length > 0 ? this.punishList[this.punishKey].id : '';
          data['students'] = arr_stu
          data['meteDatas'] = this.imgs;
          url = RemindApi.save
        }
        this.submitHttp = false;
        res = await this.$req.post(url, data);
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

<style type="text/css">
  .punish-list .__vuescroll{
    height: 350px!important;
  }
</style>
<style lang="less" scoped>
  .pj-wrapper {
    height: 100%;
    background-color: #EFF1F3;

    .pj-jlk {
      padding-top: 20px;
      background-color: #ffffff;
    }
    .pj-content {
      margin-top: 10px;
      padding: 32px 32px 118px 32px;
      background-color: #ffffff;
      &.tx-content {
        height: calc(100% - 320px);
      }
    }
    .title {
      margin-bottom: 16px;
      color: #262627;
      font-size: 28px;
      font-weight: 600;
    }
    .pj-kc-select {
      margin-top: 34px;
      .kcmc {
        position: relative;
        height: 88px;
        line-height: 88px;
        color: #B6B8B8;
        font-size: 28px;
        padding-left: 20px;
        border: 1px solid #EFF1F3;
        .back-icon {
          position: absolute;
          right: 32px;
          top: 0;
          font-size: 25px;
          display: inline-block;
          transform: rotate(-90deg);
        }
      }
    }
    .pj-change-number {
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
        }
        .content {
          width: 104px;
          text-align: center;
          color: #262627;
          font-size: 28px;
        }
        input[type='number'] {
          width: 104px;
          text-align: center;
          color: #262627;
          font-size: 28px;
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
          width: 100%;
          height: 212px;
          padding: 14px 20px;
          font-size: 28px;
          color: #262727;
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
            width: 600px;
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
      margin-bottom: 80px;
      &.marginBottom40 {
        margin-bottom: 40px
      }
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
        width: 190px;
        height: 190px;
        margin-right: 30px;
        text-align: center;
        .img {
          max-height: 190px;
          max-width: 190px;
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
    .switch-box{
      padding-top: 40px;
      border-top: 2px solid #EFF1F3;
      .toggle-switch {
        margin-top: 38px;
        .switch {
          margin-left: 20px;
        }
      }
    }
    .pf-list {
      margin-top: 40px;
      padding-top: 34px;
      border-top: 2px solid #EFF1F3;
      .student-list {
        padding: 28px 40px;
        background-color: #F3F5F7;
        li {
          margin-bottom: 40px;
          &.marginBottom0 {
            margin-bottom: 0;
          }
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
          }
          .content {
            width: 104px;
            text-align: center;
            color: #262627;
            font-size: 28px;
          }
          input[type='number'] {
            width: 104px;
            text-align: center;
            color: #262627;
            font-size: 28px;
            background-color: transparent;
          }
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
    /*惩罚项*/
    .punish-box {
      margin-bottom: 40px;
      .punish-list {
        max-height: 350px;
      }

      li {
        margin-right: 12px;
        margin-bottom: 20px;
        height: 150px;
        &.marginRight0 {
          margin-right: 0;
        }
        img {
          width: 216px;
          height: 100px;
          box-sizing: border-box;
          &.checked {
            border-radius: 8px;
            border: 4px solid #33A5FF;
            box-shadow: 0 10px 40px #33A5FF;
          }
        }
        p {
          width: 216px;
          color: #262627;
          font-size: 24px;
          text-align: center;
          margin-top: 20px;
        }
      }
    }
  }
</style>
