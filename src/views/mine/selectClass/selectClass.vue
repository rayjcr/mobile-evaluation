<!--
  选择班级
-->
<template>
    <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
        <div class="select-class-box">
            <div class="class-header flex alignCenter">
                <div class="btn cancel" @click="popupVisible=false">取消</div>
                <div class="title flex_1">选择班级</div>
                <div class="btn sure" @click="_sure">确定</div>
            </div>
            <div class="class-tab-box border-bottom">
                <span v-for="(item,index) in tab_list" :key="index" :class="{'active': tab_key == item.value}" @click="_setTab(item.value)">{{item.name}}</span>
            </div>
            <div class="tab-content" ref="scrollView">
                <div style="height: 100%" v-show="tab_key == 1" :style="moveStyle">
                    <ul @touchstart="_touchstart($event)" @touchmove="_touchmove($event)" @touchend="_touchend($event)">
                        <li class="flex alignCenter" ref="gradeLi" v-for="(item,index) in gradeList" :key="index" @click="_findClass(item.gradeCode)">
                            <div class="name flex_1">{{item.gradeName}}</div>
                            <i class="mintui mintui-back back-icon"></i>
                        </li>
                    </ul>
                </div>
                <div style="height: 100%" v-show="tab_key == 2" :style="moveStyle">
                    <ul @touchstart="_touchstart($event)" @touchmove="_touchmove($event)" @touchend="_touchend($event)">
                        <li class="flex alignCenter" ref="classLi" 
                            v-for="(item,index) in newClassList" 
                            :key="index"
                            :class="{'active': classCode == item.classCode}"
                            @click="classCode = item.classCode"
                        >
                            <div class="name flex_1">{{item.className}}</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </mt-popup>
</template>

<script>
    export default {
        name: "SelectClass",
        data() {
            return {
                popupVisible: false,
                tab_key: 1, // 默认显示年级
                tab_list: [
                    {'name': '年级','value': 1}
                ],
                classCode: '', // 当前选中班级代码
                startY: 0,
                endY: 0,
                disY: 0,
                moveStyle: {},
                classList: [],
                newClassList: [],
                gradeList: []
            }
        },
        watch: {
            tab_key() {
                this.moveStyle = {};
                this.endY = 0;
            },
            // classCode(nVal) {
            //     console.log(nVal)
            // }
        },
        mounted() {
            this.getGradeList();
            this.getClassList();
        },
        activated() {
            this.getGradeList();
            this.getClassList();
        },
        methods: {
            _show() {
                this.popupVisible = true;
            },
            _hide() {
                this.popupVisible = false;
            },
            getGradeList() {
                let gradeList = JSON.parse(sessionStorage.getItem('allGradeList')); // 获取年级列表数据

                if (!gradeList || gradeList.length == 0) return;

                this.gradeList = gradeList;
            },
            getClassList() {
                let classList = JSON.parse(sessionStorage.getItem('allClassList')); // 获取班级列表数据

                if (!classList || classList.length == 0) return;

                this.classList = classList;
            },
            _findClass(gradeCode) {
                let arr = [];
                this.classList.forEach(c => {
                    if(c.gradeCode == gradeCode) {
                        arr.push(c)
                    }
                })
                this.newClassList = arr;
                this._setTab(2)
            },
            _setTab(key) {
                if(key == 1) {
                    this.tab_list = [
                        {'name': '年级','value': 1}
                    ];
                } else {
                    this.tab_list = [
                        {'name': '年级','value': 1},
                        {'name': '班级','value': 2}
                    ];
                }
                this.tab_key = key
            },
            _touchstart(e) {
                this.startY = e.changedTouches[0].pageY
            },
            _touchmove(e) {
                let liHeight = this.tab_key == 1 ? this.$refs.gradeLi[0].clientHeight : this.$refs.classLi[0].clientHeight;
                let liLen = this.tab_key == 1 ? this.gradeList.length : this.newClassList.length;
                let boxH = this.$refs.scrollView.clientHeight
                let scrollHeight = liLen * liHeight;
                var disMaxY = (boxH - scrollHeight) >= 0 ? 0 : boxH - scrollHeight;
                let moveY = e.changedTouches[0].pageY
                this.disY = moveY - this.startY
                this.disY = (this.disY - 0) + (this.endY - 0)
                this.disY = this.disY >= 0 ? 0 : this.disY <= disMaxY ? disMaxY : this.disY
                this.moveStyle = {transform: `translate(0, ${this.disY}px)`}
            },
            _touchend() {
                this.endY = this.disY;
            },
            _sure() {
                if(this.tab_key == 1) {
                    this.$toast('请选择班级')
                    return;
                }
                if(this.classCode == '') {
                    this.$toast('请选择班级')
                    return;
                }
                this.$emit('sure',{classCode: this.classCode})
                this._hide();
            }
        }
    }
</script>

<style lang="less" scoped>
    .select-class-box {
        background-color: #ffffff;
        border-radius: 40px 40px 0 0;
        .class-header {
            height: 98px;
            color: #262627;
            font-size: 36px;
            .btn {
                width: 210px;
                font-size: 32px;
                text-align: center;
            }
            .cancel {
                color: #B6B8B8;
            }
            .sure {
                color: #33A5FF;
            }
            .title {
                font-weight: 600;
                text-align: center;
            }
        }
        .class-tab-box {
            width: 624px;
            margin: 0 auto;
            border-bottom-color: #EFF1F3;
            color: #B6B8B8;
            font-size: 28px;
            span {
                display: inline-block;
                width: 100px;
                height: 56px;
                line-height: 56px;
                text-align: center;
                &.active {
                    color: #292D33;
                    border-bottom: 4px solid #33A5FF;
                }
            }
        }
        .tab-content {
            padding: 0 64px;
            height: 520px;
            overflow: hidden;
            li {
                height: 95px;
            }
            .name {
                color: #262727;
                font-size: 40px;
            }
            li.active {
                .name {
                    color: #228FF8;
                }
            }
            .back-icon {
                width: 30px;
                color: #B6B8B8;
                transform: rotate(-180deg);
            }
        }
    }
</style>