<template>
  <div class="pj-wrapper" :class="{'scrollY': allowScroll}" ref="view">
    <!--评价维度-->
    <div class="pj-medal">
      <div class="wd-box">
        <div class="pj-medal-top text-overflow" @click="showWd">
          {{wdName ? wdName : "全部评价"}}
          <i class="mintui mintui-back back-icon"></i>
        </div>

        <!--切换模式-->
        <div class="toggle-mode" @click="toggleMode(2)" v-if="pyMode == 1">评语模式</div>
        <div class="toggle-mode" @click="toggleMode(1)" v-else>评价项模式</div>
      </div>
      <div class="pj-medal-content">
        <!--评价项模式和评语模式-->
        <v-pj-tab
          ref="pjTab"
          v-show="pyMode == 1"
          :key="1"
          :rewardType="rewardType"
          :list="popupTab"
          :pjList="pjList"
          @getRewardType="getRewardType"
          @getPjInfo="getPjInfo"
        ></v-pj-tab>

        <v-py-mode
          ref="pyMode"
          v-show="pyMode == 2"
          :key="2"
          :rewardMin="rewardMin"
          :rewardType="rewardType"
          :rewardList="popupTab"
          :list="pjList"
          @getPyInfo="getPyInfo"
          @getFoldShow="getFoldShow"
          @getRewardType="getRewardType"
        ></v-py-mode>
      </div>
    </div>

    <div class="pj-content" v-show="isFoldShow || pyMode == 1">
      <div class="pj-header border-bottom" v-if="pyMode == 1">
        <p class="pj-text">{{pjName}}</p>
        <p class="py">{{dimensionName}}</p>
        <!-- 基准分 -->
        <!-- <div class="jzfen" v-if="evaluationItemRuleBenchmarkLimit">{{total}}</div> -->
      </div>

      <!--评语模式下，（评语内容仅供展示）-->
      <div v-show="pyMode == 2">
        <div class="py-title">评语内容</div>
        <p class="py-content">{{content}}</p>
      </div>

      <!--评语模式（pyMode == 2）和评价项模式（pyMode == 1）下分别对应两种数值操作-->
      <div class="pj-change-number" v-show="pyMode == 1">
        <div class="title">{{xxdm == '754' ? '币值 (元)' : '数值'}}</div>
        <div class="step-box">
          <span class="span-border reduce" @click="changeMark('reduce',1)">-</span>
          <input type="number" v-model="number" @blur="blur(1)" @focus="$focus" @input="input">
          <span class="span-border add" @click="changeMark('add',1)">+</span>
        </div>
      </div>
      <div class="pj-change-number" v-show="pyMode == 2">
        <div class="title">{{xxdm == '754' ? '币值 (元)' : '数值'}}</div>
        <div class="number-list flex alignCenter">
          <div class="number-left" @click="scrollToNum('left')"></div>
          <ul class="border-top border-bottom scrollX" ref="numberList">
            <li
              v-for="(item,index) in numberList"
              :key="index"
              class="border-right"
              :class="{'border-left': index == 0,'activeNum': number == item}"
              @click="number = item;stepType = 'input'"
            >{{item}}</li>
          </ul>
          <div class="number-right" @click="scrollToNum('right')"></div>
        </div>
      </div>

      <div class="pj-bz" v-show="pyMode == 1">
        <div class="bz-top flex alignCenter">
          <div class="title flex_1">评语(选填)</div>
          <div class="input-number">{{content.length}}/100</div>
        </div>
        <div>
          <div class="py-box flex">
            <textarea class="flex_1 textarea" placeholder="请输入评语" @blur="$blur" @focus="$focus" v-model="content"
                      maxlength="100"></textarea>
          </div>
          <div class="set-comment-btn" v-if="showCommentBtn && content != ''" v-preventReClick="1000"
               @click="setCommentList($event)">
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
      <div class="pj-img-box">
        <div class="title">上传资料(选填)</div>
        <div class="clear">
          <div class="fl img-item flex alignCenter justifyCenter" v-for="(item,index) in imgs"
               :key="item.absolutePath+index">
            <div class="del-img-btn" @click="delImg(index)" v-if="item.absolutePath">
              <img src="@/assets/img/del.png">
            </div>
            <img v-if="item.absolutePath" class="img" :src="item.absolutePath">
            <div class="progress-box" :style="{'height': item.progress}" v-show="item.progress != '100.00%'"></div>
            <div class="progress-num" v-show="item.progress != '100.00%'">{{item.progress}}</div>
          </div>
          <div class="voice" v-if="audios && audios[0] && !isAmr"> 
            <div class="del-img-btn del-audio" @click="delAudio">
                <img src="@/assets/img/del.png">
            </div>
            <audio-component 
                :audioInfo="audios[0]" 
                :index="0" 
                :audioPlay="audioPlay" 
                @audioclick="handlerAudioClick">
            </audio-component>
          </div>
          <amr-audio v-if="audios && audios[0] && isAmr" :urls='audios[0].absolutePath' :clear="true" :text="audioWord" @show='showAudioWord' @delete="delAudio"></amr-audio>
          <div class="fl mediabox flex alignCenter justifyCenter" v-for="(item,index) in videos" :key="index+9">
            <div class="del-img-btn" @click="delVideo">
                <img src="@/assets/img/del.png">
            </div>
            <div class="play-btn" v-if="item.progress == '100.00%' || typeof(item.progress)=='undefined'" @click="toVideo(item.absolutePath)"></div>
            <video :controls="false" ref="myVideo" v-show="(item.progress == '100.00%' || typeof(item.progress)=='undefined' )&& item.absolutePath!=''">
                <source :src="item.absolutePath"></source>
            </video>
            <div class="progress-box" :style="{'height': item.progress}" v-show="item.progress != '100.00%' && typeof(item.progress)!='undefined'"></div>
            <div class="progress-num" v-show="item.progress != '100.00%' && typeof(item.progress)!='undefined'">{{item.progress}}</div>
          </div>
          <div class="fl upload" @click="upload" v-show="imgs.length < 3">
            <div class="jiahao"></div>
            <div class="tianjia-txt">添加照片</div>
          </div>
          <div class="fl upload" @click="showAudio" v-show="audios.length != 1">
            <div class="jiahao"></div>
            <div class="tianjia-txt">添加语音</div>
          </div>
          <div class="fl upload" @click="showVideo" v-show="videos.length != 1">
            <div class="jiahao"></div>
            <div class="tianjia-txt">添加视频</div>
          </div>
        </div>
      </div>
      <!--学生评分(多人)-->
      <div class="pf-list" v-if="type == 1">
        <div class="title">学生评分</div>
        <div class="student-list">
          <ul>
            <li class="flex alignCenter" v-for="(item,index) in studentList" :key="index">
              <div class="name text-overflow">{{item.name}}</div>
              <div class="step-box">
                <span class="span-border reduce" @click="changeMark('reduce',2,index)">-</span>
                <input type="number" v-model="item.number" @blur="blur(2,index)" @focus="$focus"
                       oninput="if(value.length>2)value=value.slice(0,2)">
                <span class="span-border add" @click="changeMark('add',2,index)">+</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="flex alignCenter pj-bottom-box">
        <div class="flex_1 btn gray-btn" @click="back">取消</div>
        <div class="flex_1 btn blue-btn" v-preventReClick="1000" @click.prevent="save($event)">提交</div>
      </div>
    </div>
    
    <!-- 上传视频提示 -->
    <confirm ref="tipConfirm" title="提示" msg="仅支持1分钟(50MB)以内视频" :showClose="true">
      <template v-slot:footer>
        <div class="confirmBtn" @click="uploadVideo">已知晓，继续上传</div>
      </template>
    </confirm>

    <!--上传图片-->
    <v-upload-img ref="upload" :imgs="imgs" :maxNumber="maxNumber" @getUplaodFile="getUplaodFile"></v-upload-img>

    <!-- 上传视频 -->
    <v-upload-video ref="uploadVideo" :videos="videos" @getUplaodFile="getUplaodVideo" :maxNumber="1"></v-upload-video>
    <!-- 上传音频 -->
    <v-upload-audio ref="uploadAudio" @getUplaodFile="getUplaodAudio" :maxNumber="1"></v-upload-audio>
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
    <v-modal-success ref="success" :tip="'评价成功'"></v-modal-success>
  </div>
</template>

<script>
  import { PjApi as API } from "@/utils/api";
  import WdSelect from "@/components/wdSelect/WdSelect.vue";
  import UploadImg from "@/components/UploadImg.vue";
  import PjTabList from "@/components/pjTab/PjTabList.vue";
  import Modal from "@/components/modal/Modal_longTime.vue";
  import uploadVideo from '@/components/UploadVideo.vue'
  import uploadAudio from '@/components/UploadAudio.vue'
  import playAmr from '@/components/playAmr.vue'
  import audioComponent from '@/components/audioComponent'
  import confirm from '../task/modal/Confirm.vue'
  import PyMode from "./PyMode.vue";
  export default {
    name: "PjStudent",
    components: {
      confirm,
      audioComponent,
      "v-wd-select": WdSelect,
      "v-modal-success": Modal,
      "v-pj-tab": PjTabList,
      "v-py-mode": PyMode,
      "v-upload-img": UploadImg,
      'v-upload-video': uploadVideo,
      'v-upload-audio': uploadAudio,
      'amr-audio': playAmr,
    },
    data() {
      return {
        title: this.$route.query.title,
        type: this.$route.query.type, // 1,多人评价,0单人
        classCode: this.$route.query.classCode,// 班级代码
        gradeCode: this.$route.query.gradeCode, // 年级代码
        userId: this.$route.query.userId, // 被评人编号
        relevantUserNo: this.$cookie.get("userId"), // 当前登录人
        xueNian: this.$cookie.get("schoolYear"), // 学年
        xxdm: this.$cookie.get("xxdm"), // 学校代码

        pyMode: 1, // 评语模式1，评价项模式 2，评语模式
        py_info: null, // 评语模式下选中的评语详情
        allowScroll: true, // 是否允许页面滚动
        isFoldShow: false, // 折叠显示,默认展开
        popupVisible: false, // 控制删除评语弹层的显隐
        submitHttp: true, // 控制提交请求频率，防止网络异常造成多次地点击请求
        number: 1,
        maxNumber: 3, //最大支持上传多少张图片
        pjName: "", // 评价项名称
        dimensionId: "", // 维度编号
        wdName: "", // 维度名称(最上方选择对应的维度名称)
        dimensionName: "", // 维度名称(下方评价项关联的维度名称)
        evaluationId: "", // 评价项id
        rewardType: 3, // 默认显示加分
        rewardMax: 99, // 默认奖惩最大值
        rewardMin: 1, // 默认奖惩最小值
        stepType: "", // 加减数值(add,reduce)或者直接输入(input)
        content: "", // 评语内容
        commentId: "", // 被删除的评语id
        showCommentBtn: true, // 每人/每个评价项最多保存10个评语
        imgs: [], // 上传图片
        pjList: [],
        studentList: [],
        commentList: [], // 评语集合
        popupTab: [],
        numberList: [], // 评语模式下的数值集合，根据奖惩区间求得数值集合0~99
        isRecord: false,   //录音弹框是否显示
        isVideo: false,   //视频弹框
        videos: [],
        audios: [],
        isAmr: false,       //判断是不是amr格式的音频
        audioWord: '',       //钉钉语音转文字,
        isUploadAudioWord: false,  //判断是否上传audioword,
        audioPlay: false,
      };
    },
    activated() {
      this.pyMode = 1; // 默认显示评价项模式

      this.$refs.success.hideModal();

      Promise.all([
        this.getQuery(),
        this.setTitle(),
        this.initData(),
        this.getCountByRewardType()
      ]).then(() => {
      }).catch((error) => {
        console.log(error);
      });
    },
    watch: {
      number() {
        this.changeNumber();
      },
    },
    methods: {
      /*
      * 获取不同奖励类型的评价项数量(未设置评价项的奖惩类型不显示)
      * */
      async getCountByRewardType() {
        let data = {
          scope: 1,
          type: 1,
          dimensionId: this.dimensionId,
          gradeCode: this.gradeCode,
          classCode: this.classCode,
          relevantUserNo: this.relevantUserNo
        };
        let arr = [];
        if(this.xxdm == '754'){
          arr = ["发币","扣币","发章","扣章"];
        } else {
          arr = ["加分","减分","奖励勋章","扣除勋章"];
        }

        this.$indicator.open("数据请求中，请稍后....");
        const res = await this.$req.get(API.getCountByRewardType, data);
        if (res.resultCode == 1) {
          if (res.value) {
            this.popupTab = [];
            Object.keys(res.value).forEach((c) => {
              this.popupTab.push({
                type: c,
                name: c == 3 ? arr[0] : c == 4 ? arr[1] : c == 5 ? arr[2] : arr[3]
              });
            });
          }

          if (this.popupTab.length > 0) {
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
      * 获取对应奖惩类型的评价项列表
      * */
      async getpjxList() {
        let data = {
          scope: 1,
          type: 1,
          rewardType: this.rewardType,
          dimensionId: this.dimensionId,
          gradeCode: this.gradeCode,
          classCode: this.classCode,
          relevantUserNo: this.relevantUserNo
        };
        const res = await this.$req.get(API.list, data);
        if (res.resultCode == 1) {
          this.pjList = res.value;
          if(res.value.length == 0) {
            this.dimensionName = '';
            this.evaluationId = '';
            this.pjName = '';
            this.number = 1;
            this.content = "";
            this.imgs = [];
            this.studentList.forEach((c) => {
              c.number = this.number;
            });
            return;
          };
          if(this.pyMode == 1) { // 评价项模式
            this.$refs.pjTab.pjKey = 0;
            this.getpjDetail(res.value[0].id);
          } else { // 评语模式
            for(let i = 0,data = res.value;i < data.length;i++){
              if(data[i].commentList.length > 0) {
                this.getpjDetail(data[i].id);
                return;
              }
            }
          }
        }
      },
      /*
      * 获取对应评价项的详情信息
      * */
      async getpjDetail(id, type) {
        const res = await this.$req.get_special(API.getDetail, id);
        if (res.resultCode == 1) {
          this.commentList = res.value.commentList || [];
          this.checkCommentList(this.commentList); // 每人/每个评价项最多保存10个评语，达到上限后保存评语按钮消失；
          if (type && type == "updateCommentList") return; // 更新评语列表时其他参数不需要变化

          this.dimensionId = res.value.dimensionId;
          this.dimensionName = res.value.dimensionName;
          this.evaluationId = res.value.id;
          this.pjName = res.value.name;
          this.rewardMax = res.value.rewardMax || 99;
          this.rewardMin = res.value.rewardMin || 1;
          this.number = this.py_info ? this.py_info.defaultReward : this.rewardMin;
          this.content = this.py_info ? this.py_info.content : "";
          this.imgs = [];
          this.studentList.forEach((c) => {
            c.number = this.number;
          });
          this.setNumberList();
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
        const res = await this.$req.post(API.comment, data);
        this.submitHttp = true;
        if (res.resultCode == 1) {
          this.getpjDetail(this.evaluationId,'updateCommentList')
        }
      },
      /*
      * 删除自定义评语
      * */
      async delCommentListSub() {
        const res = await this.$req.delete_special(API.delComment, this.commentId);
        if (res.resultCode == 1) {
          this.getpjDetail(this.evaluationId, "updateCommentList");
          this.popupVisible = false;
        }
      },

      /*
      * 切换模式
      * @param mode 1，评价项模式 2，评语模式
      * */
      toggleMode(mode) {
        this.pyMode = mode;
        if(mode == 2) {
          this.allowScroll = false; // 切换到评语模式禁止外层发生滚动
        } else {
          this.allowScroll = true;
        }
      },
      /*
      * 评语模式下是否折叠
      * */
      getFoldShow(bool) {
        this.isFoldShow = bool;
      },
      /*
      * 判断如果自定义评语数量大于10则不在显示添加按钮
      * */
      checkCommentList(data) {
        let arr = [];
        data.forEach((c) => {
          if (c.custom) {
            arr.push(c);
          }
        });
        if (arr.length >= 10) {
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
        this.type = this.$route.query.type;
        this.classCode = this.$route.query.classCode;
        this.gradeCode = this.$route.query.gradeCode;
        this.userId = this.$route.query.userId;
      },
      /*
      * 获取选择的维度名称列表
      * */
      getWdName(data) {
        this.wdName = "";
        data.forEach((c) => {
          this.wdName += c.name + "-";
        });
        this.wdName = this.wdName.substring(0, this.wdName.length - 1);
      },
      /*
      * 获取选中的维度信息
      * */
      getWdInfo(info) {
        this.dimensionId = info.id;
        // this.getpjxList();
        this.getCountByRewardType();
      },
      /*
      * 当前奖惩类型（加分，减分...）
      * @param type 选中的奖惩类型(number)
      * */
      getRewardType(type) {
        if (this.rewardType != type) {
          this.rewardType = type;
          this.dimensionId = this.wdName ? this.dimensionId : ''; 
          this.$indicator.open("数据请求中，请稍后....");
          this.getpjxList()
        }
      },
      /*
      * 获取选择评语的默认值
      * */
      getPyInfo(info) {
        this.allowScroll = info ? true : false; // 允许页面滚动?

        if(info && info.id == this.evaluationId) {
          this.number = info.defaultReward;
          this.content = info.content;
          this.evaluationId = info.id;
          this.scrollVisualArea(info.defaultReward);
          return;
        }
        this.py_info = info;
        this.scrollVisualArea(info.defaultReward);
        this.pjList.forEach((c,i) => {
          if(info && info.id == c.id) {
            this.$refs.pjTab.pjKey = i;
          }
        })
      },
      /*
      * 设置数值集合
      * */
      setNumberList() {
        this.numberList = [];
        for(let i = this.rewardMin;i <= this.rewardMax;i++){
          this.numberList.push(i)
        }
      },
      /*
      * 按“〈”和“〉”可以直接到达奖惩区间最小/最大值
      * @param type left向左滚动，right向右滚动
      * */
      scrollToNum(type) {
        let scrollDom = this.$refs.numberList,
            scrollLeft = scrollDom.scrollWidth;
        if(type == 'left') {
          scrollDom.scrollLeft = 0
        } else {
          scrollDom.scrollLeft = scrollLeft
        }
      },
      /*
      * 选中数值定位到可视区
        @param number 选中的数值
      * */
      scrollVisualArea(number) {
        setTimeout(() => {
          let activeLi = document.querySelector("li.activeNum");
          let key = this.numberList.indexOf(number);
          let width = activeLi.getBoundingClientRect().width;
          let offsetLeft = width * key;
          this.$refs.numberList.scrollLeft = offsetLeft;
        },500)
      },
      initData() {
        this.dimensionId = "";
        this.wdName = "";
        this.content = "";
        this.py_info = null;
        this.imgs = [];
        this.pjList = [];
        this.number = 1;
        this.rewardMax = 99;
        this.rewardMin = 1;
        this.popupVisible = false;
        this.submitHttp = true;
        this.allowScroll = true;
        this.studentList.forEach((c) => {
          c.number = this.rewardMin;
        });
        this.hideWd();
      },
      /*
      * 更新选中的评价项详情
      * */
      getPjInfo(key) {
        if(this.pjList.length > 0) {
          this.pjName = this.pjList[key].name;
          this.evaluationId = this.pjList[key].id;
          this.getpjDetail(this.evaluationId);
        }
      },
      /*
      *限定数值区间&&批量设置学生的数值
      * */
      changeNumber() {
        if (this.stepType != "input") { 
          this.number = this.number < this.rewardMin ? this.rewardMin : this.number > this.rewardMax ? this.rewardMax : this.number;
        }
        let number = this.rewardMin;
        this.studentList.forEach((c) => {
          if (this.stepType == "input") {
            number = this.number;
          } else {
            number = this.stepType == "add" ? (c.number - 0) + (1 - 0) : (c.number - 0) - (1 - 0);
          }
          c.number = number <= this.rewardMin ? this.rewardMin : number >= this.rewardMax ? this.rewardMax : number;
        });
      },
      /*
      * 数值的加减
      * @param lb 1，批量设置数值，2，单个设置
      * @param type add 加数值 reduce减数值
      * */
      changeMark(type, lb, key) {
        if (lb == 1) {
          this.stepType = type;
          this.number = type == "add" ? (this.number - 0) + (1 - 0) : this.number - 1;
        } else {
          let number = type == "add" ? (this.studentList[key].number - 0) + (1 - 0) : this.studentList[key].number - 1;
          number = number <= this.rewardMin ? this.rewardMin : number >= this.rewardMax ? this.rewardMax : number;
          this.studentList[key].number = number;
        }
      },
      /*
      * 输入数值限制输入长度
      * */
      input() {
        this.stepType = "input";
        this.number = this.number.slice(0, 2);
      },
      /*
      * 数值输入框失去焦点
      * @param type 1 批量 2 单个设置
      * */
      blur(type, key) {
        this.$blur();
        if (type == 1) {
          this.number = this.number < this.rewardMin ? this.rewardMin : this.number > this.rewardMax ? this.rewardMax : this.number;
        } else {
          let target_num = this.studentList[key].number;
          let number = target_num <= this.rewardMin ? this.rewardMin : target_num >= this.rewardMax ? this.rewardMax : target_num;
          this.studentList[key].number = number;
        }
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
      showWd() {
        this.$refs.wd.show();
      },
      hideWd() {
        this.$refs.wd.hide();
      },
      /*
      * 设置页面标题title
      * @param type 1 评价多人 2 评价单人
      * */
      setTitle() {
        if (this.type == 1) {
          this.studentList = JSON.parse(sessionStorage.getItem("studentInfo"));
          this.title = "";
          this.studentList.forEach((c) => {
            this.title += c.name + "、";
          });
          this.title = this.title.substring(0, this.title.length - 1);
          this.setStudentList(this.studentList);
        }
        document.title = "评价" + this.title;
      },
      /*
      * 评价多人时初始化设置每个学生的数值
      * */
      setStudentList(list) {
        list.forEach((c) => {
          this.$set(c, "number", 1);
        });
      },
      upload() {
        this.$refs.upload.fileClick();
      },
      getUplaodFile(data) {
        this.imgs = data;
      },
      delImg(key) {
        this.imgs.splice(key, 1);
      },
      async save(event) {
        if (this.evaluationId == "") {
          this.$toast("请选择评价项");
          return;
        }
        if (this.imgs.length > 0) { // 如果图片存在要判断图片是否已加载出来
          for (let i = 0, imgs = this.imgs; i < imgs.length; i++) {
            if (imgs[i].absolutePath == "") {
              this.$toast("还有图片未加载，请耐心等待");
              return;
            }
            if (imgs[i].fileId == "") {
              this.$toast("数据异常");
              return;
            }
          }
        }
        if (event.target.disabled) {
          this.$toast("请不要重复点击，耐心等待一秒哦");
          return;
        }
        if (!this.submitHttp) {
          this.$toast("当前网络异常，请耐心等待");
          return;
        }
        this.$indicator.open("提交中，请稍后");
        let arr_number = [], arr_name = [], arr_id = [];
        if (this.type == 1) { // 评价多人
          this.studentList.forEach((c) => {
            arr_number.push(c.number);
            arr_name.push(c.name);
            arr_id.push(c.id);
          });
        } else {
          arr_number.push(this.number);
          arr_name.push(this.title);
          arr_id.push(this.userId);
        }
        let pictureIds = this.imgs.concat(this.videos);
        pictureIds = pictureIds.concat(this.audios);
        console.log(pictureIds)
        let data = {
          classCode: this.classCode,
          dimensionId: this.dimensionId,
          content: this.content,
          evaluationId: this.evaluationId,
          gradeCode: this.gradeCode,
          type: 1, // 1.录入型 2.项目型 3.学生上传
          name: arr_name,
          userId: arr_id,
          xueNian: this.xueNian,
          pictureIds: pictureIds   //上传所有的附件全部放在这里面
        };
        //根据后台的要求，当选择转文字的时候才进行传递给后台
        if(this.isUploadAudioWord){
            data.audioWord = this.audioWord;
        }
        if (this.rewardType == 3 || this.rewardType == 4) {
          data["score"] = arr_number;
        } else {
          data["medal"] = arr_number;
        }

        this.submitHttp = false;
        const res = await this.$req.post(API.save, data);
        this.submitHttp = true;
        if (res.resultCode == 1) {
          this.$refs.success.showModal();
        }
      },
      back() {
        this.$router.go(-1);
      },
      uploadVideo () {
        this.$refs.tipConfirm.hideModal();
        this.$refs.uploadVideo.fileClick()
      },
      showVideo () {
        this.$refs.tipConfirm.showModal();
      },
      getUplaodVideo (data) {
        this.videos = data;
        console.log(this.videos,'videos')
        console.log(data[0].progress,350)
        if(data[0].progress=='100.00%'){
          this.$nextTick(()=>{
            if(this.is_weixn()){
              // 微信浏览器新上传的视频需要调用微信的加载视频方法
              this.$refs.uploadVideo.autoLoadVideo(this.$refs.myVideo[0])
            } else {
              this.$refs.myVideo[0].load();
            }            
          })          
        }
      },
      is_weixn(){  
          var ua = navigator.userAgent.toLowerCase();  
          if(ua.match(/MicroMessenger/i)=="micromessenger") {  
              return true;  
          } else {  
              return false;  
          }  
      },
      //删除视频
      delVideo() {
        this.videos.splice(0,1);
      },
      //全屏播放视频
      toVideo(src){
        console.log('tovideo')
        this.$router.push({
          path: '/fullScreenVideo',
          query:{
            src
          }
        })
      },
      //展示音频上传组件
      showAudio(){
        this.$refs.uploadAudio.isRecord = true;
      },
      //amr音频组件中的删除音频事件 $emit
      delAudio(){
          this.audios.splice(0,1);
      },
      /**
       * 组件音频播放
       */
      handlerAudioClick(item,index) {
        console.log(item,index,'audio')
        this.audioPlay =! this.audioPlay
      },
      //是否上传翻译后的文字
      showAudioWord(data){
        console.log(data)
        this.isUploadAudioWord = data;
      },
      //获取上传音频组件中的音频，$emit事件
      getUplaodAudio(data){
          console.log(data)
          if(data[0].absolutePath && data[0].absolutePath.substr(-3,3) == 'amr'){
            //上传音频中传来的语音转文字的文字，用完记得删掉
            this.audioWord = data[0].audioContent
            delete data[0].audioContent
            this.isAmr = true
          }else{
            this.isAmr = false;
          }
          this.audios = data;
          
      },
    },
    mounted(){
    }
  };
</script>

<style lang="less" scoped>
  .pj-wrapper {
    height: 100%;
    background-color: #EFF1F3;

    .pj-medal {
      background-color: #ffffff;
      .wd-box {
        position: relative;
      }
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
      .toggle-mode {
        position: absolute;
        right: 32px;
        top: 20px;
        color: #33A5FF;
        font-size: 28px;
        cursor: pointer;
      }
    }
    .pj-content {
      margin-top: 20px;
      padding: 32px;
      padding-bottom: 118px;
      background-color: #ffffff;
    }
    .pj-header {
      position: relative;
      padding-bottom: 34px;
      margin-bottom: 34px;
      border-bottom-color: #EFF1F3;
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
      .jzfen {
        position: absolute;
        top: 0;
        right: 16px;
        color: #262727;
        font-size: 56px;
        font-weight: 600;
      }
    }
    .title {
      margin-bottom: 16px;
      color: #262627;
      font-size: 28px;
      font-weight: 600;
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
      .number-list {
        .number-left ,.number-right{
          width: 48px;
          height: 26px;
          background: url('./img/icon_right@2x.png') no-repeat right center;
          background-size: 16px auto;
        }
        .number-left {
          transform: rotateY(-180deg);
        }
        .scrollX {
          width: 590px;
          display: -webkit-box;
        }
        ul {
          height: 80px;
          border-top-color: #EFF1F3;
          border-bottom-color: #EFF1F3;
        }
        li {
          width: 80px;
          height: 80px;
          line-height: 80px;
          text-align: center;
          color: #262627;
          font-size: 28px;
          border-right-color: #EFF1F3;
        }
        li:nth-child(1) {
          border-left-color: #EFF1F3;
        }
        li.activeNum {
          color: #FFFFFF;
          background-color: #33A5FF;
        }
      }
    }
    .py-title {
      color: #262627;
      font-size: 32px;
      font-weight: 600;
    }
    .py-content {
      color: #262627;
      font-size: 28px;
      margin: 15px 0 30px 0;
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
      .clear {
        padding-top: 20px;
      }
      .upload {
        width: 200px;
        height: 200px;
        cursor: pointer;
        text-align: center;
        border: 1px solid #EFF1F3;
        margin-right: 16px;
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
          background-color: rgba(0, 0, 0, 0.5);
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
      .voice {
        display: block;
        .audio {
            width: 100%;
            height: 1.17rem;
        }
        .dd-voice{
            height: 76px;
            line-height: 76px;
            margin-bottom: 20px;
            padding-left: 20px;
            border-radius: 28px;
            background-color: #EFF1F3;
            .dd-play{
                width: 0;
                height: 0;
                border-top: 12px solid transparent;
                border-left: 18px solid #999;
                border-bottom: 12px solid transparent;
                margin-left: 20px;
            }
            .del-img-btn{
                margin-right: 20px;
            }
        }
        .del-audio{
            position: relative;
            float: right;
            margin-bottom: -20px;
            z-index: 1;
        }
      }
      .mediabox{
        height: 200px;
        width: 200px;
        margin: 0 20px;
        margin-bottom: 20px;
        position: relative;
        img.img {
          position: absolute;
          max-height: 200px;
          max-width: 200px;
          border-radius: 8px;
          vertical-align: middle;
          margin: 0;
          padding: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          display: block;
        }
        .play-btn{
          height: 100px;
          width: 100px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          background-image: url(./img/playbtn.png);
          background-repeat: no-repeat;
          background-size: 100% auto;
          background-position: 0 0;
          z-index: 1;
        }
        video{          
          max-height: 200px;
          max-width: 200px;
          border-radius: 8px;
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
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: rgba(0, 0, 0, 0.5);
        }
        .progress-num {
          position: absolute;
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
    .video{
        height: 30%;
        .video-head{
            width: 95%;
            margin: 20px auto 0;
            text-align: center;
            color: #262627;
            font-size: 30px;
        }
        .video-body{
            width: 95%;
            margin: 60px auto;
            text-align: center;
            .btn{
                width: 45%;
                margin: 40px auto;
                color: #fff;
                padding: 20px 0;
                background: #168DFF;
                border-radius: 50px;
            }
        }
    }
  }
</style>
