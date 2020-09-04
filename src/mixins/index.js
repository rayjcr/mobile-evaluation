import {gobalAPi} from '@/utils/api'

let mixin = {
    methods: {
      /*
      * 获取学校全局配置
      * */
     async getGConfig() {
        const res = await this.$req.get(gobalAPi.getConfig);
        if (res.resultCode == 1) {
            this.$cookie.set('config', JSON.stringify(res.value));
            this.$cookie.set('jlk', res.value.cardMode);
            // this.$cookie.set('jlk', true);
        }
      },
    }
};
export default mixin;