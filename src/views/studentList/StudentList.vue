<template>
  <div class="student-list">
    <!--学生和小组tab切换-->
    <div class="tab-box flex alignCenter">
      <div class="tab-item flex_1 flex alignCenter justifyCenter">
        <span :class="{'active': tab_key == 0}" @click="tab_key=0">学生</span>
      </div>
      <div class="tab-item flex_1 flex alignCenter justifyCenter">
        <span :class="{'active': tab_key == 1}" @click="tab_key=1">小组</span>
      </div>
    </div>

    <transition name="fade">
      <!--学生tab-->
      <div class="stu-list-box" v-show="tab_key == 0">
        <div class="list-top flex alignCenter">
          <div class="flex_1">
            <v-search ref="search" :placeholder="'搜索学生'" @getSearch="getSearch"></v-search>
          </div>

          <!--按学号-->
          <div class="list-top-right stu_id" v-show="toggle_type == 'name'" @click="_toggleType('number')">
            <span class="icon_xuehao"></span>
            <span class="type_txt">按学号</span>
          </div>
          <!--按姓氏-->
          <div class="list-top-right sur_name" v-show="toggle_type == 'number'" @click="_toggleType('name')">
            <span class="icon_member"></span>
            <span class="type_txt">按姓氏</span>
          </div>
        </div>

        <!--全选按钮-->
        <div class="selected-all flex alignCenter" v-show="pjMultiPerson == 1 && isSelectedAll == false"
             @click="selectedAllFun(true)">
          <div class="check-circle" :class="{'checked': isSelectedAll}"></div>
          <span>全选</span>
        </div>
        <div class="selected-all flex alignCenter" v-show="pjMultiPerson == 1 && isSelectedAll == true"
             @click="selectedAllFun(false)">
          <div class="check-circle" :class="{'checked': isSelectedAll}"></div>
          <span>取消全选</span>
        </div>

        <div class="list-box" :class="{'list-box-height': pjMultiPerson == 1}">
          <!-- 按姓氏排列-->
          <div v-show="toggle_type == 'name'" style="height: 100%;position:relative;">
            <!-- left list -->
            <v-scroll
              class="listview"
              ref="listview"
              :listen-scroll="true"
              :probe-type="3"
              :data="data"
              @scroll="handleScroll"
            >
              <div>
                <ul>
                  <li class="list-group" v-for="(group, index) in data" :key="index" ref="listGroup">
                    <div class="list-group-title" :class="{'paddingTop10': index != 0 }">{{group.headLetter}}</div>
                    <ul class="clear">
                      <li
                        class="list-group-item fl"
                        :class="{'marginRight0': (i+1)%3 == 0 ,'checked': item.checked}"
                        v-for="(item, i) in group.evaluationClassList"
                        :key="i"
                        @click="handerLi(index,i)"
                      >
                        <img class="avatar" v-if="item.gender == 1" :src="item.icon || default_info.boy" @error="error($event)">
                        <img class="avatar" v-else :src="item.icon || default_info.girl" @error="error($event)">
                        <div class="name text-overflow">{{item.studentName}}</div>
                        <div class="check-circle" :class="{'checked': item.checked}" v-show="pjMultiPerson == 1"></div>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </v-scroll>
             <!-- right alphabet -->
            <div
              class="list-shortcut"
              ref="listShortcut"
              @touchstart.prevent="handleShortcutTouchStart"
              @touchmove.prevent="handleShortcutTouchMove"
              @touchend.prevent="handleShortcutTouchEnd"
            >
              <ul>
                <li class="item"
                    v-for="(item, index) in shortcutList"
                    :key="index"
                    :data-index="index"
                    :class="{'current': currentIndex === index}">
                  {{item}}
                </li>
              </ul>
            </div>
          </div>
         
          <!-- 按学号排列-->
          <div class="stuId-list scrollY" v-show="toggle_type == 'number'">
            <ul v-if="data.length > 0">
              <li class="flex alignCenter" @click="handerLi(0,index)" v-for="(item,index) in data[0].evaluationClassList" :key="index">
                <div class="li_left">
                  <img class="avatar" v-if="item.gender == 1" :src="item.icon || (default_info.boy)">
                  <img class="avatar" v-else :src="item.icon || default_info.girl">
                </div>
                <div class="li_right flex_1">
                  <div class="li_top">{{item.studentName}}</div>
                  <div class="li_bottom">{{item.classNumber ? item.classNumber + '号' : '暂无编号'}}</div>
                </div>
                <div class="check-circle" :class="{'checked': item.checked}" v-show="pjMultiPerson == 1"></div>
              </li>
            </ul>
          </div>
        </div>

        <div class="list-bottom" v-show="pjMultiPerson != 1">
          <div class="flex alignCenter justifyCenter" style="height: 100%;" @click="pjMultiPersonFun(1)" v-if="!residualGiving.enable || (!config.medalLimit && !config.scoreLimit)">
            <img src="./img/icon_pj@2x.png">
            <span>评价多人</span>
          </div>
          <div style="height: 100%;" v-else>
            <div class="flex alignCenter justifySpaceBetween" style="height: 100%;" v-if="(residualGiving.type == 2) || (residualGiving.type == 1 && isHeadmaster)">
              <div class="left">
                <div v-if="jlk == 'true'">
                  <p class="score" v-if="classAccountData.remainMedal">剩余卡片: <span>{{classAccountData.remainMedal}}</span></p>
                </div> 
                <div v-else>
                  <p class="score" v-if="config.scoreLimit">剩余分数: <span>{{classAccountData.remainScore || 0}}</span></p>
                  <p class="medal" v-if="config.medalLimit">剩余勋章: <span>{{classAccountData.remainMedal || 0}}</span></p>
                </div> 
              </div>
              <div class="right flex alignCenter">
                <div v-if="jlk == 'true'" class="btn send-btn" :class="{'disabled-send-btn': !classAccountData.remainMedal}" @click="_jumpTo">余额赠与</div> 
                <div v-else class="btn send-btn" :class="{'disabled-send-btn': !classAccountData.remainMedal && !classAccountData.remainScore}" @click="_jumpTo">余额赠与</div> 
                <div class="btn pj-btn" @click="pjMultiPersonFun(1)">评价多人</div> 
              </div>
            </div>
            <div class="flex alignCenter justifyCenter" style="height: 100%;" @click="pjMultiPersonFun(1)" v-else>
              <img src="./img/icon_pj@2x.png">
              <span>评价多人</span>
            </div>
          </div>
        </div>
        <div class="list-bottom-pj flex alignCenter" v-show="pjMultiPerson == 1">
          <div class="flex_1 btn gray-btn" @click="pjMultiPersonFun(0)">取消</div>
          <div class="flex_1 btn blue-btn" @click="pj">评价 ({{checkedList.length}})</div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <!--小组tab-->
      <div class="group-box scrollY" v-show="tab_key == 1">
        <!-- 添加小组+  isHeadmaster=true(班主任)  isTeacherGroup=true(后台开启“任课老师可以在关联班级创建小组”开关)  isTeacher=true(是任课教师)-->
        <div class="add-group" @click="_jump(1)" v-if="isHeadmaster"></div>
        <div class="add-group" @click="_jump(1)" v-else-if="isTeacherGroup == true && isTeacher"></div>

        <div class="show_my_create flex alignCenter">
          <div class="check-circle" :class="{'checked': isMyCreate}" @click="isMyCreate = !isMyCreate"></div>
          <span>只显示我创建的</span>
        </div>

        <ul v-if="group_list.length > 0">
          <li class="clear" v-for="(item,index) in group_list" :key="index" @click="_showDetail(index)">
            <div class="li-left fl"></div>
            <div class="li-right fl">
              <p class="name text-overflow">{{item.groupName}}</p>
              <div class="flex justifySpaceBetween li-right-bottom">
                <p>共{{item.count}}人</p>
                <p>创建人: {{item.groupOwnerName}}</p>
              </div>
            </div>
          </li>
        </ul>

        <div class="empty" v-else>
          <v-empty-list :text="'无数据'"></v-empty-list>
        </div>

      </div>
    </transition>

    <!--小组详情-->
    <v-group-detail ref="groupDetail" :isHeadmaster="isHeadmaster" @delGroup="_showDelGroup"></v-group-detail>

    <!--确认删除小组?-->
    <v-del-group ref="delGroup" @remove="remove"></v-del-group>

  </div>
</template>

<script>
  import {StudentApi, stuGroupApi, gobalAPi,CountApi} from '@/utils/api'

  import Search from '@/components/Search.vue'
  import Scroll from '@/components/Scroll.vue'
  import EmptyList from '@/components/EmptyList.vue'

  import GroupDetail from './GroupDetail.vue'
  import DelGroup from './messageBox/Confirm_del.vue'

  const ANCHOR_HEIGHT = 18; // 按姓氏排列---单个姓氏字母的高度

  export default {
    name: 'studentList',
    components: {
      'v-search': Search,
      'v-scroll': Scroll,
      'v-empty-list': EmptyList,
      'v-group-detail': GroupDetail,
      'v-del-group': DelGroup
    },
    data () {
      return {
        title: this.$route.query.title,
        classCode: this.$route.query.classCode,
        gradeCode: this.$route.query.gradeCode,
        studentNum: this.$route.query.studentNum, // 班级人数
        jlk: this.$cookie.get('jlk'), // 激励卡or常规
        config: JSON.parse(this.$cookie.get('config')), // 全局配置信息

        default_info: { // 默认头像
          boy: '/static/img/boy@2x.png',
          girl: '/static/img/girl@2x.png'
        },

        userId: '',
        data: [],
        copyArr: [],
        scrollY: -1,
        currentIndex: 0,
        pjMultiPerson: 0, // 0,默认单人评价，1，评价多人
        checkedList: [], // 存放选中人的id
        isSelectedAll: false,
        isMyCreate: false,
        isTeacherGroup: false, // 后台开启“任课老师可以在关联班级创建小组”开关
        residualGiving: {}, // 打开后同班教师间可相互赠与余额
        classAccountData: {},// 班级账户数据
        studentName: '',
        tab_key: 0,// 0学生1小组
        group_list: [], // 评价学生小组列表
        copy_list: [], // 拷贝评价学生小组列表
        toggle_type: 'name', // 按学号(number)，按姓氏(name)
      }
    },
    watch: {
      data () {
        this.$nextTick(() => {
          if(this.data.length == 0) return;
          this._calcGroupHeight()

          // 回到最顶部位置
          setTimeout(() => {
            this.$refs.listview.scrollToElement(this.$refs.listGroup[0], 0)
          }, 50)
        })
      },
      scrollY (newY) {
        const heightList = this.heightList
        // 当滚动到最顶部，newY > 0（对应操作：在最顶部向下拉）
        if (newY > 0) {
          newY = 0
          this.currentIndex = 0
          return
        }
        // 在中间部分滚动，正常情况
        for (let i = 0; i < heightList.length - 1; i++) {
          let heightTop = heightList[i]
          let heightBottom = heightList[i + 1]
          if (-newY >= heightTop && -newY < heightBottom) {
            this.currentIndex = i
            return
          }
        }
        // 当滚动到底部，且-newY 大于最后一个元素的上限
        this.currentIndex = heightList.length - 2
      },
      tab_key (nVal) {
        if (nVal == 1) { // 获取小组列表数据和后台开启“任课老师可以在关联班级创建小组”开关
          this.getStuGroupList();
        }
      },
      isMyCreate(nVal) {
        let userId = this.$cookie.get('userId');
        if(nVal) {
          let arr = this.group_list.filter((c) => {
            return c.groupOwner == userId
          })
          this.group_list = arr;
        }else {
          this.group_list = this.copy_list;
        }
      },
      $route (to, from) {
        if (to.path == '/studentlist') {
          if (from.path.indexOf('/zhsz/home')>=0 || from.path.indexOf('/pjstudentjlk')>=0 || from.path.indexOf('/pjstudent')>=0) {
            let isFromGroup = sessionStorage.getItem('isFromGroup')
            if (isFromGroup == 'true') {
              this._hideAllModal()
              this.getStuGroupList()
            } else {
              // 初始化数据
              Promise.all([
                this.initData(),
                this.getQuery(),
                this.setSelectedAll(false),
                this._hideAllModal(),
                this.getStudentList(),
                this.getGConfig(),
                this.getConfig2(),
                this.getClassAccountData()
              ]).then(() => {}).catch((error) => {
                console.log(error)      // 失败了，打出 '失败'
              })
            }
          } else if (from.path == '/addgroup' || from.path == '/editgroup') {
            // 清除缓存的选择学生列表
            sessionStorage.removeItem('selectedxsList')
            sessionStorage.removeItem('groupName')
            sessionStorage.removeItem('groupInfo')

            this._hideAllModal()
            this.getStuGroupList()
          }
        }
      }
    },
    computed: {
      shortcutList () {
        if(this.toggle_type == 'name') {
          return this.data.map(group => {
            return group.headLetter.slice(0, 1)
          })
        }
      },
      isHeadmaster () { // 班主任
        let role = this.$route.query.role;
        return (role > 1 && role < 12 || role > 13)
      },
      isTeacher () { // 任课教师
        let role = this.$route.query.role;
        return role >= 12
      }
    },
    created () {
      this.touch = {}
    },
    mounted () {
      document.title = this.title;
      Promise.all([
        this.getQuery(),
        this.setSelectedAll(false),
        this._hideAllModal(),
        this.getStudentList(),
        this.getConfig2(),
        this.getClassAccountData()
      ]).then(() => {}).catch((error) => {
        console.log(error)
      })
      setTimeout(() => {
				this.config = JSON.parse(this.$cookie.get('config'))
			},500)
    },
    methods: {
      /*
      * 获取学生列表
      * */
      async getStudentList (orderType) {
        let data = {
          classCode: this.classCode,
          orderType: orderType || null,
          teacherCode: this.$cookie.get('userId')
        }
        this.$indicator.open('加载中...');
        const res = await this.$req.get(StudentApi.getEvaluationClassStudentList, data)
        if (res.resultCode == 1) {
          this.data = res.value || [];
          this._defaultChecked();
          this.data.forEach((c) => {
            if(this.data.length == 1 && c.headLetter == 'all') { // 按学号排的
              this.toggle_type = 'number';
            } else {
              this.toggle_type = 'name';
            }
          })
          this.copyArr = JSON.parse(JSON.stringify(res.value))
        }
      },
      /*
      * 获取学校全局配置
      * */
      async getConfig2() {
        const res = await this.$req.get(gobalAPi.getConfig2);
        if (res.resultCode == 1) {
          this.isTeacherGroup = res.value.courseTeacherGroup.enable;
          this.residualGiving = res.value.residualGiving
        }
      },
      /*
			* 获取班级账户数据
			* */
			async getClassAccountData() {
				let data = {
					teacherCode: this.$cookie.get('userId'),
					classCode: this.classCode
				};
				const res = await this.$req.get(CountApi.getClassAccountData,data);
				if (res.resultCode == 1) {
					this.classAccountData = res.value;
				}
			},
      /*
      * 获取小组列表
      * */
      async getStuGroupList () {
        let data = {
          classCode: this.classCode,
        }
        const res = await this.$req.get(stuGroupApi.getStuGroupList, data)
        if (res.resultCode == 1) {
          this.group_list = res.value;
          this.copy_list = JSON.parse(JSON.stringify(this.group_list));
        }
      },
      /*
      * 移除小组
      * */
      async remove (groupId) {
        let data = {
          groupId: groupId,
          teacherId: this.$cookie.get('userId')
        }
        const res = await this.$req.get(stuGroupApi.remove, data)
        if (res.resultCode == 1) {
          this.$refs.delGroup._hide()
          this.getStuGroupList()
        }
      },

      /*
      * 搜索学生列表
      * */
      getSearch (value) {
        this.isSelectedAll = false
        this.checkedList = []
        let copyArr = JSON.parse(JSON.stringify(this.copyArr))
        this.data = copyArr

        let a = value.replace(/(^\s*)|(\s*$)/g, '')
        if (a == '') {
          return;
        }

        let arr = [], newArr = []
        this.data.forEach((value, index) => {
          arr[index] = value
          arr[index].evaluationClassList = value.evaluationClassList.filter(
            item => item.studentName.indexOf(a) >= 0)
        })
        arr.forEach((c) => {
          if (c.evaluationClassList.length > 0) {
            c.evaluationClassList.forEach((v) => {
              v.checked = false
            })
            newArr.push(c)
          }
        })
        this.data = newArr
      },
      /*
      * 当图片地址加载不出时，使用默认图片
      * */
      error(e) {
        e.target.src = '/static/img/boy@2x.png';
      },
      /*
      * 全选和取消全选
      * */
      selectedAllFun (bool) {
        this.isSelectedAll = bool;
        this.setSelectedAll(bool);
      },
      /*
      * 点击对应学生，当是评价多人时是进行多选操作，否则跳转评价学生（单人）页面
      * */
      handerLi (key, tarKey) {
        if (this.pjMultiPerson == 1) { // 评价多人
          this.checkbox(key, tarKey)
        } else {
          this.studentName = this.data[key].evaluationClassList[tarKey].studentName;
          this.userId = this.data[key].evaluationClassList[tarKey].studentCode;
          this._jump(0)
        }
      },
      /*
      * 多选操作
      * */
      checkbox (key, tarKey) {
        this.checkedList = [];
        let target = this.data[key].evaluationClassList[tarKey]
        let checked = target.checked
        this.$set(target, 'checked', !checked)
        this.data.forEach((c) => {
          c.evaluationClassList.forEach((v) => {
            if (v.checked) {
              this.checkedList.push(
                {
                  id: v.studentCode,
                  name: v.studentName
                }
              )
            }
          })
        })
        if (this.checkedList.length == this.studentNum) {
          this.isSelectedAll = true
        } else {
          this.isSelectedAll = false
        }
      },
      /*
      * 切换评价多人模式
      * */
      pjMultiPersonFun (type) {
        this.pjMultiPerson = type
        this.setSelectedAll(false)
        this.isSelectedAll = false
        this.studentName = ''
      },
      /*
      * 当点击全选按钮时处理学生列表数据选中
      * */
      setSelectedAll (bolean) {
        this.checkedList = []
        this.data.forEach((c) => {
          c.evaluationClassList.forEach((v) => {
            this.$set(v, 'checked', bolean)
            if (bolean) {
              this.checkedList.push({
                id: v.studentCode,
                name: v.studentName
              })
            }
          })
        })
      },
      getQuery () {
        this.title = this.$route.query.title
        this.classCode = this.$route.query.classCode
        this.gradeCode = this.$route.query.gradeCode
        this.studentNum = this.$route.query.studentNum
      },
      initData () {
        this.tab_key = 0
        this.pjMultiPerson = 0
        this.touch = {}
        this.heightList = []
        this.$refs.search.keyWord = ''
      },
      /*
      * 跳转到评价学生页面
      * */
      pj () {
        if (this.checkedList.length == 0) {
          this.$toast('请选择要评价的学生')
          return
        }
        sessionStorage.setItem('studentInfo', JSON.stringify(this.checkedList))
        this._jump(0)
      },
      /*
      * 隐藏小组详情弹窗
      * */
      _hideAllModal () {
        this.$refs.groupDetail._hide()
        this.$refs.delGroup._hide()
      },
      /*
      * 按学号按姓氏切换
      * */
      _toggleType (type) {
        this.toggle_type = type;
        this.data = [];
        this.copyArr = [];
        this.getStudentList(type);
      },
      /*
      * 处理默认选中
      * */
      _defaultChecked() {
        if(this.pjMultiPerson == 1) { // 多选
          this.data.forEach((c) => {
            c.evaluationClassList.forEach((v) => {
              this.checkedList.forEach((k) => {
                if(v.studentCode == k.id) {
                  this.$set(v,'checked',true)
                }
              })
            })
          })
        }
      },
      /*
      * 确认删除小组?
      * */
      _showDelGroup (info) {
        this.$refs.groupDetail._hide()

        this.$refs.delGroup.groupName = info.groupName
        this.$refs.delGroup.groupId = info.groupId
        this.$refs.delGroup._show()
      },
      /*
      * 显示小组详情
      * */
      _showDetail (key) {
        let _targetInfo = this.group_list[key]
        _targetInfo.members.forEach((c) => {
          c.id = c.studentId
          this.$set(c, 'checked', true)
        })
        this.$refs.groupDetail.info = _targetInfo
        this.$refs.groupDetail._show()
      },
      /*
      * 跳转评价学生页面
      * @param type 0，评价学生 1，添加小组
      * */
      _jump (type) {
        let query = {
          classCode: this.classCode,
          gradeCode: this.gradeCode,
        }
        if (type == 0) {
          this.$set(query, 'type', this.pjMultiPerson)

          if (this.pjMultiPerson == 0) {
            this.$set(query, 'title', this.studentName)
            this.$set(query, 'userId', this.userId)
          }

          sessionStorage.setItem('isFromGroup', false)
        }
        this.$router.push({
          path: type == 0 ? (this.jlk == 'true' ? '/pjstudentjlk' : '/pjstudent') : '/addgroup',
          query: query,
        })
      },
      /*
      * 跳转评余额赠与页面
      * */
      _jumpTo() {
        if(this.jlk == 'true') {
          if(!this.classAccountData.remainMedal) return;
        } else {
          if(!this.classAccountData.remainScore && !this.classAccountData.remainMedal) return;
        }
        this.$router.push({
          path: '/sendBalance',
          query: {
            classCode: this.classCode,
            role: this.$route.query.role
          }
        })
      },

      handleShortcutTouchStart (e) {
        // this.$refs.listShortcut.style.backgroundColor = 'rgba(0, 0, 0, .2)';
        const anchorIndex = +e.target.dataset['index']
        this.touch.y1 = e.touches[0].pageY
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      handleShortcutTouchMove (e) {
        this.touch.y2 = e.touches[0].pageY
        let deltaIndex = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT
        deltaIndex = Math.floor(deltaIndex)
        const anchorIndex = this.touch.anchorIndex + deltaIndex
        this._scrollTo(anchorIndex)
      },
      handleShortcutTouchEnd (e) {
        // this.$refs.listShortcut.style.backgroundColor = 'rgba(255, 255, 255, .3)'
      },
      handleScroll (pos) {
        this.scrollY = pos.y
      },
      // 按姓氏排列--每个姓氏一组计算每一组的累计高度
      _calcGroupHeight () {
        this.heightList = []
        const listEl = this.$refs.listGroup
        if (typeof listEl == 'undefined') return
        let height = 0
        this.heightList.push(height)
        for (let i = 0; i < listEl.length; i++) {
          let item = listEl[i]
          height += item.clientHeight
          this.heightList.push(height)
        }
      },
      _scrollTo (index) {
        // 点击上下多余部分
        if (Object.is(index, null) || Object.is(index, NaN)) {
          return
        }
        // 边界情况
        if (index < 0) {
          index = 0
        }
        if (index > this.heightList.length - 2) {
          index = this.heightList.length - 2
        }
        this.scrollY = -this.heightList[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      }
    }
  }
</script>

<style lang="less" scoped>
  .student-list {
    height: 100%;

    .tab-box {
      height: 88px;
      color: #B6B8B8;
      font-size: 30px;
      background-color: #ffffff;

      .tab-item {
        .active {
          position: relative;
          color: #262627;
          font-weight: 600;

          &:after {
            content: '';
            position: absolute;
            left: 50%;
            bottom: -20px;
            margin-left: -20px;
            width: 40px;
            height: 4px;
            background-color: #33A5FF;
            border-radius: 2px;
          }
        }
      }
    }

    .stu-list-box {
      height: calc(100% - 88px);

      .list-top {
        height: 88px;
        padding: 0 32px;
        background-color: #ffffff;

        .list-top-right {
          width: 92px;
          text-align: center;
          font-size: 0;
          margin-left: 32px;

          span {
            display: inline-block;
          }

          .icon_xuehao {
            width: 44px;
            height: 44px;
            background: url('./img/icon_xuehao@2x.png') no-repeat center;
            background-size: 44px auto;
          }

          .icon_member {
            width: 44px;
            height: 44px;
            background: url('./img/icon_member@2x.png') no-repeat center;
            background-size: 44px auto;
          }

          .type_txt {
            color: #262727;
            font-size: 20px;
          }
        }
      }

      .selected-all {
        width: 190px;
        height: 44px;
        margin-left: 32px;
        margin-top: 30px;

        span {
          color: #262727;
          margin-left: 20px;
        }

        .check-circle {
          position: relative;
          width: 40px;
          height: 40px;
          background: url('/static/img/icon_radio_white@2x.png') no-repeat center;
          background-size: 40px auto;

          &.checked {
            background: url('/static/img/icon_radio_checked@2x.png') no-repeat center;
            background-size: 40px auto;
          }
        }
      }

      .list-box {
        padding: 0 5px 0 34px;
        height: calc(100% - 196px);

        &.list-box-height {
          height: calc(100% - 270px);
        }

        .listview {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;

          .list-group {
            .list-group-title {
              padding-top: 40px;
              padding-bottom: 20px;
              color: #B6B8B8;
              font-size: 28px;

              &.paddingTop10 {
                padding-top: 10px;
              }
            }

            .list-group-item {
              position: relative;
              width: 190px;
              height: 200px;
              text-align: center;
              margin-right: 24px;
              margin-bottom: 30px;
              border-radius: 20px;
              background-color: #ffffff;
              box-sizing: border-box;

              &.marginRight0 {
                margin-right: 0;
              }

              &.checked {
                border: 2px solid #33A5FF;
              }

              .check-circle {
                position: absolute;
                right: 8px;
                top: 8px;
                width: 40px;
                height: 40px;
                background: url('/static/img/icon_radio@2x.png') no-repeat center;
                background-size: 40px auto;

                &.checked {
                  background: url('/static/img/icon_radio_checked@2x.png') no-repeat center;
                  background-size: 40px auto;
                }
              }

              .avatar {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                margin: 20px 0 20px 0;
              }

              .name {
                padding: 0 32px;
                color: #262627;
                font-size: 28px;
              }
            }
          }
        }

        /*right alphabet*/

        .list-shortcut {
          z-index: 1;
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          width: 40px;
          padding: 40px 0;
          border-radius: 10px;
          text-align: center;

          & .item {
            padding: 3px;
            line-height: 1;
            color: #B6B8B8;
            font-size: 28px;

            &.current {
              color: #33A5FF;
            }
          }
        }

        // 按学号
        .stuId-list {
          height: 100%;
          padding-right: 29px;
          li {
            position: relative;
            height: 140px;
            margin-top: 20px;
            background-color: rgba(255,255,255,.7);
            border-radius: 20px;
            .li_left {
              .avatar {
                width: 100px;
                height: 100px;
                margin-left: 20px;
                border-radius: 50%;
                background-repeat: no-repeat;
                background-size: 100px auto;
                background-position: center;
              }
            }
            .li_right {
              margin-left: 20px;
              .li_top {
                width: 400px;
                color: #262627;
                font-size: 36px;
                overflow: hidden;
              }
              .li_bottom {
                color: #B6B8B8;
                font-size: 28px;
                margin-top: 10px;
              }
            }
            .check-circle {
              position: absolute;
              right: 40px;
              top: 50%;
              margin-top: -20px;
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
        }
      }

      .list-bottom {
        height: 108px;
        padding: 0 32px 0 20px;
        background-color: #ffffff;
        img {
          width: 36px;
          height: 36px;
          margin-right: 16px;
        }

        span {
          font-size: 32px;
          color: #262627;
        }
        .left {
          p {
            color: #262626;
            font-size: 24px;
            span {
              color: #262727;
              margin-left: 20px;
            }
          }
          .medal {
            margin-top: 10px;
          }
        }
        .right {
          .btn {
            width: 208px;
            height: 88px;
            line-height: 88px;
            text-align: center;
            border-radius: 44px;
            color: #ffffff;
            font-size: 32px;
          }
          .send-btn {
            background-color: #00CD86;
          }
          .pj-btn {
            margin-left: 20px;
            background-color: #33A5FF;
          }
          .disabled-send-btn {
            color: #B6B8B8;
            background-color: #EFF1F3;
          }
        }
      }

      .list-bottom-pj {
        height: 110px;
        padding: 0 32px;
        background-color: #ffffff;

        .btn {
          height: 88px;
          line-height: 88px;
          text-align: center;
          font-size: 30px;
          cursor: pointer;
          margin-bottom: 10px;
          border-radius: 50px;
        }

        .gray-btn {
          margin-right: 46px;
        }
      }
    }

    .group-box {
      position: relative;
      height: calc(100% - 88px);
      padding: 0 32px;

      .add-group {
        position: absolute;
        z-index: 2004;
        right: 20px;
        bottom: 170px;
        width: 100px;
        height: 100px;
        background-image: url(/static/img/plusbtn.png);
        background-position: center;
        background-size: 100px auto;
        background-repeat: no-repeat;
      }
      .show_my_create {
        height: 104px;
        .check-circle {
          position: relative;
          width: 40px;
          height: 40px;
          background: url('/static/img/icon_radio_white@2x.png') no-repeat center;
          background-size: 40px auto;

          &.checked {
            background: url('/static/img/icon_radio_checked@2x.png') no-repeat center;
            background-size: 40px auto;
          }
        }
        span {
          color: #262627;
          font-size: 28px;
          margin-left: 12px;
        }
      }    

      li {
        padding: 32px;
        margin-bottom: 20px;
        border-radius: 20px;
        background-color: #ffffff;

        .li-left {
          width: 88px;
          height: 88px;
          margin-right: 20px;
          background: url('./img/icon_group@2x.png') no-repeat center;
          background-size: 88px auto;
        }

        .li-right {
          width: 410px;
          .name {
            width: 504px;
            color: #262627;
            font-size: 28px;
            margin-bottom: 12px;
          }

          .li-right-bottom {
            color: #969899;
            font-size: 24px;
          }
        }
      }

      .empty {
        position: relative;
        height: calc(100% - 100px);
      }
    }
  }
</style>
