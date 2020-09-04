<template>
    <div class="u-scan">
        <div class="u-scan_con" v-if="scanLoginInfo.resultCode==1">
            <div class="imgbox">
                <img src="@/assets/img/pcIco.png">
            </div>
            <p>即将在电脑端登录综合素质评价<br>请确认是本人操作</p>
            <div class="m-btn" @click="submit">确认登录</div>
        </div>
        <div class="u-scan_con" v-else>
            <div class="imgbox">
                <img src="@/assets/img/pcIco_warn.png">
            </div>
            <p>登录超时<br>请重新扫描电脑端的二维码</p>
            <div class="m-btn_disable">确认登录</div>
        </div>
    </div>
</template>
<script>
import {scanLoginApi} from '@/utils/api'
export default {
    name:"scan",
    data(){
        return {
            scanLoginInfo: this.$parent.scanLoginInfo,
            scanLogin_qrCode: this.$parent.scanLogin_qrCode,
            userId:this.$cookie.get("xxtyhh"),
        }
    },
    mounted() {

    },
    methods:{
        async submit(){
            const res = await this.$req.get(scanLoginApi.confirmScan+this.scanLogin_qrCode+"/"+this.userId, {})
            this.$parent.isScanLogin = false
        },

    }
}
</script>
<style lang="less" scoped>
    .u-scan {
        position: fixed; top: 0; left: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        z-index: 2000;   
    }
    .u-scan_con{
        padding-top: 180px;
        .imgbox{
            width: 320px; height: 280px;
            margin: 0 auto;
            position: relative;
            img{
                display: block;
                width: 100%; height: 100%;
            }
        }
        p{
            padding: 40px 0 80px;
            font-size: 28px; color: #262727;
            line-height: 40px;
            text-align: center;
        }
        [class^="m-btn"]{
            width: 320px; height: 88px;
            background: #168DFF;
            border-radius: 88px;
            line-height: 88px;
            color: #fff;
            text-align: center;
            font-size: 32px;
            margin: 0 auto;
        }
        .m-btn_disable{
            background: #DADFE6;
        }
    }
</style>