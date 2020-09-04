<!--
  评价项筛选，学生收到的任务筛选
-->
<template>
    <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
        <div class="choice-box">
            <div class="header flex alignCenter">
                <div class="btn cancel" @click="popupVisible=false">取消</div>
                <div class="title flex_1">筛选</div>
                <div class="btn sure" @click="_sure">确定</div>
            </div>
            <div class="tab-box border-bottom">
                <span v-for="(item,index) in tab_list" :key="index" :class="{'active': tab_key == index}" @click="tab_key=index">{{item.name}}</span>
            </div>
            <div class="list-box" ref="scrollView">
                <div style="height: 100%" v-show="tab_key == 0">
                    <ul>
                        <li class="flex alignCenter"
                            v-for="(item,index) in type_list" 
                            :key="index"
                        >
                            <span class="check-circle" 
                                :class="{'checked': item.checked == 'allChecked','hasChecked': item.checked == 'hasChecked'}"
                                @click="_check(index,type_list)"
                            ></span>
                            <div class="name flex_1" @click="_findChild(item.type,item.checked)">{{item.name}}</div>
                            <i class="mintui mintui-back back-icon" v-if="item.isShowIcon" @click="_findChild(item.type,item.checked)"></i>
                        </li>
                    </ul>
                </div>
                <!-- 教师评价 -->
                <div style="height: 100%" v-if="tab_key == 1 && type == 1" :style="moveStyle">
                    <ul @touchstart="_touchstart($event)" @touchmove="_touchmove($event)" @touchend="_touchend($event)">
                        <li class="flex alignCenter" ref="itemLi" 
                            v-for="(item,index) in tea_list" 
                            :key="index"
                        >
                            <span class="check-circle" 
                                :class="{'checked': item.checked == 'allChecked','hasChecked': item.checked == 'hasChecked'}"
                                @click="_check(index,tea_list)"
                            ></span>
                            <div class="name flex_1 flex alignCenter text-overflow">
                                {{item.dimensionName}}{{item.name == '全部' ? '' : '-'}}{{item.name}}
                                <span class="icon" :class="{'icon_add': item.rewardType == 3,'icon_reduce': item.rewardType == 4}"></span>
                            </div>
                        </li>
                    </ul>
                </div>
                <!-- 学生任务 -->
                <div style="height: 100%" v-if="tab_key == 1 && type == 2" :style="moveStyle">
                    <ul @touchstart="_touchstart($event)" @touchmove="_touchmove($event)" @touchend="_touchend($event)">
                        <li class="flex alignCenter" ref="itemLi" 
                            v-for="(item,index) in stu_list" 
                            :key="index"
                        >
                            <span class="check-circle" 
                                :class="{'checked': item.checked == 'allChecked','hasChecked': item.checked == 'hasChecked'}"
                                @click="_check(index,stu_list)"
                            ></span>
                            <div class="name flex_1">{{item.name}}</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </mt-popup>
</template>

<script>
    export default {
        name: "Choice",
        props: {
            teaList: {
                type: Array,
                default: () => []
            },
            stuList: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                popupVisible: false,
                tab_key: 0,
                type: 'all', // 默认显示分类tab
                tab_list: [
                    {'name': '分类',type:'all'}
                ],
                type_list: [
                    {'name': '全部', 'checked': 'allChecked',type: 'all'},
                    {'name': '教师评价', 'checked': 'allChecked','isShowIcon': true,'type': 1},
                    {'name': '学生任务', 'checked': 'allChecked','isShowIcon': true,'type': 2}
                ],
                tea_list: [],
                stu_list: [],
                startY: 0,
                endY: 0,
                disY: 0,
                moveStyle: {},
            }
        },
        activated() {
            this._initData();
            this._initPageY();
        },
        watch: {
            tab_key(nVal) {
                if(nVal == 0) { // 全部
                    this.tab_list = [{'name': '分类',type:'all'}];
                    this._handelChecked(this.type_list[1],this.tea_list);
                    this._handelChecked(this.type_list[2],this.stu_list);
                    this._handelChecked(this.type_list[0],this.type_list)
                }
            },
            teaList(nVal) {
               this.tea_list = this.getPjxList(nVal)
               this._setCheckedAll(1,'allChecked');
            },
            stuList(nVal) {
               this.stu_list = this.getPjxList(nVal)
               this._setCheckedAll(2,'allChecked');
            }
        },
        methods: {
            _show() {
                if(this.teaList.length == 0 && this.stuList.length == 0) {
                    this.$toast('暂无数据')
                    return;
                }
                this.popupVisible = true;
            },
            _hide() {
                this.popupVisible = false;
            },
             /*
            * 获取评价项列表
              @param arr
            * */
            getPjxList(arr) {
                if(arr.length == 0) return [];
                let list = JSON.parse(JSON.stringify(arr));
                list.unshift({
                    type: list[0].type,
                    name: '全部'
                })
                list.forEach(c => {
                    this.$set(c,'checked','')
                })
                return list;
            },
            /*
            * 多选操作
              @param target 目标数组
              @param key 选中索引
            * */
            _check(key,target) {
                let checked = target[key].checked == 'allChecked' ? '' : 'allChecked';
                if(target[key].name == '全部') { // 点击全部
                    target.forEach(c => {
                        c.checked = checked;
                    })
                    if(this.tab_key == 0) {
                        this._changeChecked()
                    }
                } else { // 点击教师评价或者学生任务
                    target[key].checked = checked;
                    if(this.tab_key == 0) {
                        this._setCheckedAll(this.type_list[key].type,checked);
                    }
                    let copy_arr = JSON.parse(JSON.stringify(target));
                    copy_arr.splice(0,1);
                    let some_bool = copy_arr.some(i => {
                        return i.checked == 'allChecked'
                    })
                    let every_bool = copy_arr.every(i => {
                        return i.checked == 'allChecked'
                    })
                    target[0].checked = every_bool ? 'allChecked' : some_bool ? 'hasChecked' : ''
                }
            },
            /*
            * 在分类tab下改变教师评价或学生任务的选中状态
            * */
            _changeChecked() {
                let checked = this.type_list[0].checked;
                this.tea_list.forEach(c => {
                    c.checked = checked;
                })
                this.stu_list.forEach(c => {
                    c.checked = checked;
                })
            },
            /*
            * 点击教师评价或者学生任务
              @param type 1教师评价 2学生任务
              @param checked 是否选中
            * */
            _findChild(type,checked) {
                if(type == 'all') return;
                this.tab_key = 1;
                this.type = type;
                this._initPageY();
                this._setTabList(type);
                this._setCheckedAll(type,checked)
            },
             /*
            * 更新tab
              @param type tea新增教师评价tab, stu新增学生任务tab，all分类tab
            * */
            _setTabList(type) {
                this.tab_list = [];
                let _target = {
                    '1': () => {
                        this.tab_list.push(
                            {'name': '分类',type:'all'},
                            {'name': '教师评价',type:'tea'}
                        )
                    },
                    '2': () => {
                        this.tab_list.push(
                            {'name': '分类',type:'all'},
                            {'name': '学生任务',type:'stu'}
                        )
                    },
                    'all': () => {
                        this.tab_list.push(
                            {'name': '分类',type:'all'}
                        )
                    }
                };
                _target[type]();
            },
             /*
            * 处理分类tab下教师评价或者学生任务的默认选中项
              @param arr 传教师评价或者学生任务的列表数组
              @param target 目标元素
            * */
            _handelChecked(target,arr) {
                if(arr.length == 0) return;
                let copy_arr = JSON.parse(JSON.stringify(arr));
                copy_arr.splice(0,1);
                let some_bool = copy_arr.some(i => {
                    return i.checked == 'allChecked'
                })
                let every_bool = copy_arr.every(i => {
                    return i.checked == 'allChecked'
                })
                target.checked = every_bool ? 'allChecked' : some_bool ? 'hasChecked' : ''
            },
            /*
            * 点击教师评价或者学生任务检查是否全选
              @param checked 是否选中
            * */
            _setCheckedAll(type,checked) {
                if(checked == 'hasChecked') return;
                let _target = type == 1 ? this.tea_list : this.stu_list;
                _target.forEach(c => {
                    c.checked = checked;
                })
            },
            _initData() {
                this.tab_key = 0;
                this.tab_list = [{'name': '分类',type:'all'}];
            },
            _initPageY() {
                this.startY = 0;
                this.endY = 0;
                this.disY = 0;
                this.moveStyle = {};
            },
            _touchstart(e) {
                this.startY = e.changedTouches[0].pageY
            },
            _touchmove(e) {
                let liHeight = this.$refs.itemLi[0].clientHeight;
                let liLen = this.type == 1 ? this.tea_list.length : this.stu_list.length;
                let boxH = this.$refs.scrollView.clientHeight
                let scrollHeight = liLen * liHeight;
                var disMaxY = (boxH - scrollHeight) >= 0 ? 0 : boxH - scrollHeight;
                let moveY = e.changedTouches[0].pageY
                this.disY = moveY - this.startY
                this.disY = (this.disY - 0) + (this.endY - 0)
                this.disY = this.disY >= 0 ? 0 : this.disY <= disMaxY ? disMaxY : this.disY
                this.moveStyle = {transform: `translate(0, ${this.disY}px)`}
            },
            _touchend(e) {
                this.endY = this.disY;
            },
            _sure() {
                let checked_arr = [];
                this.tea_list.forEach(c => {
                    if(c.checked == 'allChecked' && c.name != '全部') {
                        checked_arr.push(c)
                    }
                })
                this.stu_list.forEach(c => {
                    if(c.checked == 'allChecked' && c.name != '全部') {
                        checked_arr.push(c)
                    }
                })
                if(checked_arr.length == 0) {
                    this.$toast('请至少选中一项')
                    return;
                }
                // console.log(checked_arr)
                this._hide();
                this.$emit('surePopup',checked_arr);
                
            }
        }
     }
</script>

<style lang="less" scoped>
    .choice-box {
        background-color: #ffffff;
        border-radius: 40px 40px 0 0;
        .header {
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
        .tab-box {
            width: 620px;
            margin: 0 auto;
            color: #B6B8B8;
            font-size: 28px;
            border-color: #EFF1F3;
            span {
                position: relative;
                display: inline-block;
                width: 120px;
                height: 60px;
                line-height: 60px;
                text-align: center;
                margin-right: 30px;
            }
            .active {
                color: #262727;
            }
            .active:after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                margin-left: -50px;
                width: 100px;
                height: 4px;
                background-color: #33A5FF;
                border-radius: 30px;
            }
        }
        .list-box {
            padding-left: 60px;
            padding-right: 66px;
            height: 520px;
            overflow: hidden;
            li {
                height: 95px;
            }
            .name {
                color: #262727;
                font-size: 40px;
            }
            .icon {
                display: inline-block;
                width: 60px;
                height: 40px;
                margin-left: 20px;
                background-size: 60px auto;
                background-position: center;
                background-repeat: no-repeat;
            }
            .icon_add {
                background-image: url(../img/icon_add@2x.png);
            }
            .icon_add {
                background-image: url(../img/icon_reduce@2x.png);
            }
            .check-circle {
                position: relative;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                margin-right: 20px;
                background-color: #EFF1F3;
                &.checked {
                    border-color: #33A5FF;
                    background-color: #33A5FF;
                    &:after {
                        content: '';
                        width: 5px;
                        height: 11px;
                        position: absolute;
                        left: 17px;
                        top: 10px;
                        border: 2px solid transparent;
                        border-top: 0;
                        border-left: 0;
                        border-color: #EFF1F3;
                        transform: rotate(45deg) scale(1.5);
                        transition: transform .2s;
                    }
                }
                &.hasChecked {
                    border-color: #33A5FF;
                    background-color: #33A5FF;
                    &:after {
                        content: '';
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        width: 30px;
                        height: 4px;
                        margin-left: -15px;
                        margin-top: -2px;
                        background-color: #EFF1F3;
                    }
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