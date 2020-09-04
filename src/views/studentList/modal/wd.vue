<template>
    <mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
        <div class="wd-box">
            <div class="wd-header flex alignCenter">
                <div class="btn cancel" @click="popupVisible=false"><i class="mintui mintui-back"></i>返回</div>
                <div class="title flex_1">选择维度</div>
                <div class="btn sure" @click="_sure">确定</div>
            </div>
            <div class="wd-content">
                <div class="tab-content" ref="scrollView">
                    <div style="height: 100%" :style="moveStyle">
                        <ul @touchstart="_touchstart($event)" @touchmove="_touchmove($event)" @touchend="_touchend($event)">
                            <li class="flex alignCenter" ref="wdLi" v-for="(item,index) in list" :key="index" @click="_check(index)">
                                <div class="radio" :class="{'checked': checkKey == index}"></div>
                                <div class="name flex_1">{{item.medalDimensionName}}</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
  </mt-popup>
</template>

<script>
    export default {
        name: "SelectWd",
        props: {
			arr: {
				type: Array,
				default: () => []
            },
            id: {
                type: String,
				default: ''
            }
		},
        data() {
            return {
                popupVisible: false,
                checkKey: 0, // 默认选中全部
                startY: 0,
                endY: 0,
                disY: 0,
                moveStyle: {},
                list: []
            }
        },
        watch: {
            arr(nVal) { // 直接更改数组可以监听到，如果改数组某一个元素的值需要开启深度监听
                let arr = JSON.parse(JSON.stringify(nVal));
                this.list = arr;
            },
            popupVisible(nVal) {
                if(nVal) {
                    this.list.forEach((c,i) => {
                        if(c.medalDimensionId == this.id) {
                            this.checkKey = i
                        }
                    })
                }
            }
        },
        methods: {
            _show() {
                this.popupVisible = true;
            },
            _hide() {
                this.popupVisible = false;
            },
            _touchstart(e) {
                this.startY = e.changedTouches[0].pageY
            },
            _touchmove(e) {
                let liHeight = this.$refs.wdLi[0].clientHeight;
                let boxH = this.$refs.scrollView.clientHeight
                let scrollHeight = this.wdList.length * liHeight;
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
            _check(key) {
                this.checkKey = key
            },
            _sure() {
                if(this.list.length == 0) return;
                this.$emit('getWdInfo',this.list[this.checkKey])
                this.popupVisible = false;
            }
        }
    }
</script>

<style lang="less" scoped>
    .mint-popup-bottom {
        border-radius: 40px 40px 0 0;
    }
    .wd-box {
        height: 674px;
        border-radius: 40px 40px 0 0;
        background-color: #ffffff;
        .wd-header {
            position: relative;
            height: 98px;
            line-height: 98px;
            color: #262627;
            font-size: 36px;
            .btn {
                width: 210px;
                font-size: 32px;
                text-align: center;
                color: #33A5FF;
            }
            .cancel {
                .mintui-back {

                }
            }
            .title {
                color: #262627;
                font-size: 36px;
                font-weight: 800;
                text-align: center;
            }
        }
        .wd-content {
            padding-left: 60px;
            padding-right: 66px;
            overflow-x: hidden;
            .tab-content {
                max-height: 520px;
                overflow: hidden;
                li {
                    height: 95px;
                    cursor: pointer;
                }
                .name {
                    color: #262727;
                    font-size: 40px;
                }
                .radio {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    transform: scale(0.5);
                    transform-origin: 0 center;
                    border-radius: 100%;
                    background-color: #EFF1F3;
                    &.checked {
                        background-color: #33A5FF;
                    }
                    &:after {
                        content: " ";
                        border-radius: 100%;
                        position: absolute;
                        width: 24px;
                        height: 24px;
                        top: 50%;
                        left: 50%;
                        margin-left: -12px;
                        margin-top: -12px;
                        background-color: #ffffff;
                    }
                }
            }
        }
    }
</style>