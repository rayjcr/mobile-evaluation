<template>
  <div class="class-mate scrollY">
    <div class="title_bg"></div>
    <div class="list-box">
      <div class="title">{{title}}</div>
      <div class="list">
        <ul>
          <li class="li_item flex alignCenter" v-for="(item,index) in rankList" :key="index" @click="_jump('/studenthome',item)">
            <div class="li_left flex alignCenter flex_1">
              <div class="ranking guanjun" v-if="index == 0">1</div>
                <div class="ranking yajun" v-else-if="index == 1">2</div>
                <div class="ranking jijun" v-else-if="index == 2">3</div>
              <div class="ranking number" v-else>{{index+1}}</div>
              <div class="avatar">
                <img src="/static/img/avatar@2x.png">
              </div>
              <div class="name">{{item.studentName}}</div>
            </div>
            <div class="li_right">
              <span>{{item.medalCardNum}}</span>
              <i class="mintui mintui-back back-icon" v-if="xxdm != '133'"></i>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Classmate",
    data() {
      return {
        title: this.$route.query.title,
        xxdm: this.$cookie.get('xxdm'),
        rankList: [],
      }
    },
    activated() {
      this.title = this.$route.query.title;
      let list = JSON.parse(sessionStorage.getItem('rankList'));
      this.rankList = list;
    },
    methods: {
      _jump(path,a) {
        if(this.xxdm == '133') return;

        let query = {
          studentName: a.studentName,
          studentCode: a.studentCode,
          classCode: this.$route.query.classCode
        }

        this.$router.push({
          path,
          query,
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .class-mate {
    padding: 0 32px;
    height: 100%;
    background-color: #050B58;
    background-image: url(./img/ranking_bg@2x.png);
    background-size: 750px auto;
    background-position: top center;
    background-repeat: no-repeat;

    .title_bg {
      height: 170px;
      margin-top: 72px;
      background-image: url(./img/ranking_title@2x.png);
      background-size: 419px auto;
      background-position: center;
      background-repeat: no-repeat;
    }
    .list-box {
      margin-top: 34px;
    }
    .title {
      height: 88px;
      line-height: 88px;
      color: #ffffff;
      font-size: 36px;
      font-weight: 600;
      text-align: center;
      background: linear-gradient(90deg,rgba(158,46,255,1) 0%,rgba(255,95,57,1) 100%);
      box-shadow: 0 6px 18px rgba(255,167,47,0.15);
      border-radius: 20px 20px 0 0;
    }

    .list {
      padding: 0 32px 0 12px;
      border-radius: 0 0 20px 20px;
      background-color: #ffffff;

      .li_item {
        height: 120px;
        .ranking {
          width: 60px;
          height: 60px;
          line-height: 60px;
          font-size: 36px;
          text-align: center;
          background-size: 60px auto;
          background-repeat: no-repeat;
          background-position: center;
        }
        .guanjun {
          color: #ffffff;
          background-image: url('./img/icon_guanjun@2x.png');
        }
        .yajun {
          color: #ffffff;
          background-image: url('./img/icon_yajun@2x.png');
        }
        .jijun {
          color: #ffffff;
          background-image: url('./img/icon_jijun@2x.png');
        }
        .number {
          color: #262727;
          font-size: 36px;
          text-align: center;
        }
        .avatar {
          width: 80px;
          height: 80px;
          margin-left: 40px;
        }
        .name {
          color: #262727;
          font-size: 28px;
          margin-left: 20px;
        }
        .li_right {
          span {
            color: #33A5FF;
            font-size: 36px;
            margin-right: 10px;
          }
          .back-icon {
            display: inline-block;
            vertical-align: top;
            margin-top: 10px;
            color: #C7C7CC;
            transform: rotate(-180deg);
          }
        }
      }
      img {
        width: 100%;
        height: 100%;
      }
      .wait-list-loading {
        height: 80px;
        line-height: 80px;
        text-align: center;
      }
    }
  }
</style>
