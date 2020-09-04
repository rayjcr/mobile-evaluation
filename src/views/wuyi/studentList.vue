<template>
    <div class="student-list">
        <div class="class-container">
            <div class="class-list" ref="tabScroll">
                <span
                    v-for="(item,index) in classList" 
                    :key="index" 
                    :class="{'active_span': classCode == item.classCode}"
                    @click="classCode = item.classCode"
                >{{item.className}}</span>
            </div>
        </div>
        <div class="search-container flex alignCenter">
            <div class="search-wrapper">
                <v-search ref="search" :placeholder="'搜索学生'" @getSearch="getSearch"></v-search>
            </div>
        </div>
        <div class="list-container scrollY">
            <ul class="clear">
                <li class="fl" 
                    v-for="(item,index) in list" 
                    :key="index" 
                    :class="{'marginRight0': (index+1)%3 == 0}"
                    @click="jump('/wuyi/stuhome',item)"
                >
                    <div class="avatar">
                        <img v-if="item.gender == 1" :src="item.icon || default_info.boy" @error="error($event)">
                        <img v-else :src="item.icon || default_info.girl" @error="error($event)">
                    </div>
                    <div class="name text-overflow">{{item.studentName}}</div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
     import Search from '@/components/Search.vue'
     import {StudentApi} from '@/utils/api'
     export default {
        name: 'wuyiStudentList',
        components: {
            'v-search': Search
        },
        data() {
            return {
                classList: [],
                list: [], // 学生列表
                copy_list: [], //拷贝学生列表用于搜索
                classCode: this.$route.query.classCode,
                default_info: { // 默认头像
                    boy: '/static/img/boy@2x.png',
                    girl: '/static/img/girl@2x.png'
                }
            }
        },
        watch: {
            classCode(nVal) {
                this.$refs.search.keyWord = '';
                this.getStudentList()
            }
        },
        activated() {
            this.classCode = this.$route.query.classCode;
            this.getClassList();
            this.getStudentList();
            this.autoScroll();
        },
        methods: {
            /*
            * 获取学生列表
            * */
            async getStudentList () {
                let data = {
                    classCode: this.classCode,
                    orderType: 'number', // 按学号显示学生列表
                    teacherCode: this.$cookie.get('userId')
                }
                this.$indicator.open('加载中...');
                const res = await this.$req.get(StudentApi.getEvaluationClassStudentList, data)
                if (res.resultCode == 1) {
                    this.list = (res.value && res.value.length > 0) ? res.value[0].evaluationClassList : [];
                    this.copy_list = JSON.parse(JSON.stringify(this.list))
                }
            },
            getClassList() {
                let classList = JSON.parse(sessionStorage.getItem('allClassList')); // 获取班级列表数据

                if (!classList || classList.length == 0) return;

                this.classList = classList;
            },
            /*
            * 当图片地址加载不出时，使用默认图片
            * */
            error(e) {
                e.target.src = '/static/img/boy@2x.png';
            },
            /*
            * 根据学生姓名检索
            * */
            getSearch(value) {
                let copyArr = JSON.parse(JSON.stringify(this.copy_list))
                this.list = copyArr;
                let a = value.replace(/(^\s*)|(\s*$)/g, '')
                if (a == '') {
                    return;
                }
                let arr = [], newArr = []
                newArr = this.list.filter(c => {
                    return c.studentName.indexOf(a) > -1
                })
                this.list = newArr
            },
            /*
            * 进入页面自动滚动到可视区
            * */
            autoScroll() {
                this.$nextTick(() =>{
                    let span_dom = document.querySelector('.active_span');
                    let left = span_dom.offsetLeft;
                    let scroll_dom = this.$refs.tabScroll;
                    scroll_dom.scrollLeft = left;
                })
            },
            jump(path,a) {
                let query = {
                    studentCode: a.studentCode,
                    studentName: a.studentName
                };
                this.$router.push({
                    path,
                    query
                })
            }
        }
    }
</script>

<style lang="less" scoped>
    .student-list {
        height: 100%;
        background-color: #EFF1F3;
        .class-container {
            overflow: hidden;
        }
        .class-list {
            height: 88px;
            padding-right: 40px;
            white-space: nowrap;
            overflow-x: auto;
            background-color: #ffffff;
            &::-webkit-scrollbar {
                width: 0;
                height: 0;
                display: none;
            }
            span {
                position: relative;
                display: inline-block;
                color: #B6B8B8;
                font-size: 32px;
                line-height: 88px;
                margin-left: 40px;
                &.active_span {
                    color: #262627;
                    font-weight: 600;
                }
            }
            .active_span::after {
                content: '';
                position: absolute;
                width: 40px;
                height: 4px;
                bottom: 0;
                left: 50%;
                margin-left: -20px;
                background-color: #33A5FF;
                border-radius: 2px;

            }
        }
        .search-container {
            height: 88px;
            background-color: #ffffff;
            .search-wrapper {
                width: 686px;
                height: 60px;
                margin: 0 auto;
            }
        }
        .list-container {
            padding: 20px 32px 0 34px;
            height: calc(100% - 176px);
            li {
                width: 200px;
                height: 200px;
                margin-right: 42px;
                margin-bottom: 40px;
                background-color: #ffffff;
                border-radius: 20px;
                text-align: center;
                .avatar {
                    width: 100px;
                    height: 100px;
                    margin: 20px auto;
                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }
                .name {
                    padding: 0 32px;
                    color: #262627;
                    font-size: 28px;
                }
            }
            .marginRight0 {
                margin-right: 0
            }
        }
    }
</style>