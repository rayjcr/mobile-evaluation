<template>
  <div class="home">
    <component :is="cmpName" v-if="cmpName"></component>
    <div class="empty" v-else>
      <v-empty-list :text="'还没有内容哦~'"></v-empty-list>
    </div>
  </div>
</template>

<script>
  import Axios from 'axios'

  import TeacherHome from './TeacherHome.vue'
  import StudentHome from './StudentHome.vue'
  import EmptyList from '@/components/EmptyList.vue'
  import {gobalAPi,tokenAPi,userInfoAPi} from '@/utils/api'
  export default {
    name: "Home",
    data() {
      return {
        cmpName: ''
      }
    },
    created() {
      // 如果从登录入口进入 /loginpwd,/logincode,/selectAccount
      if (this.$route.query.isLogin && this.$route.query.isLogin == 'true') {
        let token = this.$cookie.get('authToken');
        // this.getGConfig();
        this.getUserInfo(token)
      } else if(this.$route.query.token) {
        this.simulateLogin(this.$route.query.token)
      } else {
        this.$cookie.set('origin', this.$route.query.type || ''); // 是否来源于微信公众号,企业号
        this.getToKen()
      }
    },
    components: {
      TeacherHome,
      StudentHome,
      'v-empty-list': EmptyList
    },
    methods: {
      /*
      * 如果地址栏直传token，则免登陆
      * */
      simulateLogin(token) {
        this.$cookie.set('authToken',token);
        this.getGConfig();
        this.getUserInfo(token)
      },
      /*
      * 获取token
      * */
      getToKen() {
        let data = {
          username: this.$route.query.username || '',
          password: this.$route.query.password || '',
          platform: 2, // 2综合素质移动端
          kaptcha: 'kaptcha_name' // 图片标识码
        };
        Axios.post(tokenAPi.getAuthToken,data).then((res) => {
          if(res.status == 200) {
            if (res.data instanceof Array && res.data.length > 0) {
              this.$router.replace({path: '/loginpwd'})
            } else {
              this.$cookie.set('authToken',res.data);
              this.getGConfig();
              this.getUserInfo(res.data)
            }
          } else {
            this.$router.replace({path: '/loginpwd'})
          }
        })
      },
      /*
      * 获取用户信息
      * */
      getUserInfo(token) {
        Axios.get(userInfoAPi.getInfo+'?token='+token).then((res) => {
          this.$cookie.set('userType', res.type); // 用户类型3,老师,4学生
          this.$cookie.set('xxdm', res.xxdm);//res.xxdm
          this.$cookie.set('xxmc', res.xxmc);
          this.$cookie.set('userId', res.username.replace(res.xxdm,''));
          this.$cookie.set('name', res.name);
          this.$cookie.set('sex', res.sex);
          this.$cookie.set('xxtyhh', res.xxtyhh); // 校讯通

          this.getCurrentXnxq(res.xxdm);

          if (res.type <= 3) {
            this.cmpName = 'TeacherHome'
          } else {
            this.getStudentDetail(res.xxdm,res.usercode)
          }
        })
      },
      /*
      * 获取学生信息
      * */
      async getStudentDetail(schoolCode,studentId) {
        let data = { schoolCode, studentId };
        const res = await this.$req.get(userInfoAPi.getStudentDetail,data);
        if (res.resultCode == 1) {
          this.$cookie.set('classCode', res.value.classId);
          this.$cookie.set('className', res.value.className);
          this.$cookie.set('gradeId', res.value.gradeId);
          this.cmpName = 'StudentHome'
        }
      },
      /*
      * 获取学年学期信息
      * */
      getCurrentXnxq(xxdm) {
        Axios.get(userInfoAPi.getCurrentXnxq+'?xxdm='+xxdm).then((res) => {
          this.$cookie.set('schoolYear', res.data.xn);
          this.$cookie.set('term', res.data.xq);
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .home,.empty {
    height: 100%;
    position: relative;
  }
</style>
