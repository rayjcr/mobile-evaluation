<template>
  <div class="section record-list">
    <div class="list-top flex alignCenter">
      <div class="title flex_1">评价详情</div>
      <div class="tab-box1 clear" :class="{'tab-classDT': origin == 'classDT'}" v-if="showTab">
        <div class="tab-item1 fl" @click="_tab1(1)">学生</div>
        <div class="tab-item1 fl" @click="_tab1(2)">班级</div>
        <div class="tab-item1 fl" v-if="origin != 'classDT'" @click="_tab1(3)">团队</div>
        <span
          :class="{
          'span_left0': type == 1,
          'span_left100': type == 2,
          'span_left200': type == 3
          }"
        >{{type == 1 ? '学生' : type == 2 ?  '班级' : '团队'}}</span>
      </div>
    </div>
    <div class="show_my_create" v-show="userType<=3&&(showOnlySelf==false)">
      <input type="checkbox" v-model="onlySelfBtn" @change="changeOnlySelfBtn" id="showMySelf">
      <label for="showMySelf">只看我的评价</label>
    </div>
    <div class="list-content">
      <div class="tab-box2 flex alignCenter justifySpaceBetween" :style="{'width': type == 2 ? '60%' : '100%'}">
        <div
          class="tab-item2 "
          v-for="(item,index) in pjTabList"
          :key="index"
          @click="_tab2(index)"
        >
          <span :class="{'active': tab2_key == index}" v-if="type == 1 || type == 3">{{item.name}}</span>
          <span :class="{'active': tab2_key == index}" v-else>{{(item.type == 5 || item.type == 6) ? '' : item.name}}</span>
        </div>
      </div>

      <!--教师端-->
      <div class="tab-content teacher" v-if="recordList.length >0 && userType <= 3">
        <!--教师（学生）-->
        <v-tea-stu v-if="type == 1" :recordList="recordList" :onlySelfBtn='onlySelfBtn||showOnlySelf' :showOnlySelf="showOnlySelf" :recordType="recordType"></v-tea-stu>

        <!--教师（班级）-->
        <v-tea-class v-else-if="type == 2" :origin="origin" :recordList="recordList" :onlySelfBtn='onlySelfBtn||showOnlySelf' :showOnlySelf="showOnlySelf" :recordType="recordType"></v-tea-class>

        <!--教师（团队）-->
        <v-tea-team v-else :recordList="recordList" :onlySelfBtn='onlySelfBtn||showOnlySelf' :showOnlySelf="showOnlySelf" :recordType="recordType"></v-tea-team>
      </div>

      <!--学生端-->
      <div class="tab-content student" v-if="recordList.length >0 && userType > 3">
        <!--学生-->
        <v-student ref="student" :origin="origin" :recordList="recordList" :recordType="recordType"></v-student>
      </div>

      <div class="empty" v-if="recordList.length == 0">
        <v-empty-list :text="'无评价'"></v-empty-list>
      </div>
    </div>
  </div>
</template>

<script>
  import EmptyList from '@/components/EmptyList.vue'

  import TClass from './Teacher_class'
  import TStudent from './Teacher_stu'
  import TTeam from './Teacher_team'
  import Student from './Student'

  export default {
    name: "RecordList",
    props: ['showTab','origin','pjTabList','recordList','showOnlySelf','showOnlySelfBtn', 'recordType'],
    components: {
      'v-student': Student,
      'v-tea-class': TClass,
      'v-tea-stu': TStudent,
      'v-tea-team': TTeam,
      'v-empty-list': EmptyList
    },
    data() {
      return {
        prevent: false,
        type: 1, // 1,学生，2，班级, 3, 团队
        tab2_key: 0,
        userType: Number(this.$cookie.get('userType')),
        onlySelfBtn: false,
      }
    },
    watch: {
      type(nVal) {
        this.$emit('getEvaluationObject',nVal)
      },
      showOnlySelfBtn(val){
        if(val!=this.onlySelfBtn){
          this.onlySelfBtn = val || false;
        }
      },
      tab2_key(nVal) {
        if (this.prevent) return;
        this.$emit('getRewardType',nVal)
      }
    },
    methods: {
      _tab1(type) {
        this.prevent = true
        this.tab2_key = 0;
        this.type = type;
        // 学生--撤销评价提示语（撤销后该记录在教师端/学生端都不显示，学生增加/减少的分数原路返回）
        // 班级--撤销评价提示语（撤销后该记录在教师端/学生端都不显示，班级增加/减少的分数原路返回）
        this.$root.eventHub.$emit('getClassRevokeTip',type);
      },
      _tab2(key) {
        this.prevent = false
        this.tab2_key = key
      },
      changeOnlySelfBtn(val){
        console.log(this.onlySelfBtn)
        this.$emit('changeShowSelf',this.onlySelfBtn)       
      },
    }
  }
</script>

<style lang="less" scoped>
  .section {
    background-color: #FFFFFF;
    border-radius: 20px;
  }
  .record-list {
    margin-top: 40px;
    padding: 0 32px;
    box-shadow: 0 6px 18px rgba(86,104,119,0.15);
    .list-top {
      height: 84px;
      border-bottom: 1px solid #EFF1F3;

      .title {
        color: #262727;
        font-size: 34px;
        font-weight: 600;
      }
      .tab-box1 {
        position: relative;
        width: 300px;
        height: 48px;
        border-radius: 24px;
        cursor: pointer;
        background-color: #EFF1F3;
        &.tab-classDT {
          width: 200px;
        }
        .tab-item1 {
          width: 100px;
          line-height: 48px;
          text-align: center;
          color: #262727;
          font-size: 28px;
        }
        .active {
          color: #ffffff;
        }
        span {
          position: absolute;
          top: 0;
          width: 100px;
          height: 48px;
          line-height: 48px;
          color: #ffffff;
          font-size: 28px;
          text-align: center;
          border-radius: 24px;
          background-color: #33A5FF;
          transition: all .2s;
        }
        .span_left0 {
          left: 0;
        }
        .span_left100 {
          left: 100px;
        }
        .span_left200 {
          left: 200px;
        }
      }
    }
    .list-content {
      .tab-box2 {
        height: 80px;
        color: #B6B8B8;
        font-size: 30px;
        .tab-item2 {
          text-align: center;
          height: 80px;
          line-height: 80px;
          position: relative;
          cursor: pointer;
          span.active {
            position: relative;
            color: #262727;
            font-size: 30px;
            font-weight: 600;
            display: inline-block;
            height: 80px;
          }
          span.active:after {
            content: '';
            width: 100%;
            height: 4px;
            background-color: #33A5FF;
            position: absolute;
            left: 0;
            bottom: 0px;
          }
        }
      }
      .empty {
        position: relative;
        height: 410px;
      }
    }
    .show_my_create{
      height: 80px;
      background-color: #f7f7f7;
      #showMySelf{
        display: none;
      }
      label[for='showMySelf']{
        font-size: 28px;
        line-height: 80px;
        color: #bfbfbf;
        position: relative;
        &::before{
          content: ' ';
          height: 40px;
          width: 40px;
          box-sizing: border-box;
          border: 2px solid #ccc;
          border-radius: 50%;
          position: relative;
          display: inline-block;
          top: 10px;
          margin-left: 20px;
          margin-right: 18px;
        }
      }
      input:checked+label{
        &::before{
          border: 0;
          background-color: #168dff;
        }
        &::after{
          border: 2px solid #fff;
          border-left: 0;
          border-top: 0;
          content: " ";
          top: 6px;
          left: 35px;
          position: absolute;
          width: 8px;
          height: 20px;
          transform: rotate(45deg) scale(1);
        }
      }
    }
  }
</style>
