import Vue from 'vue';
import _get from 'lodash/get';
import {RotateSquare2} from 'vue-loading-spinner';

let timer;
const common = {};

common.install = function (Vue) {
    /**
     * 전역 공통 함수
     */
    const common = {

        // resize callback
        debounce(func, time = 300) {
            (function (event) {
                if (timer) clearTimeout(timer);
                timer = setTimeout(func, time, event);
            })();
        },

        // 로딩 오버레이 리턴
        getLoader(self) {
            return self.$loading.show({
                container: self.$el,
                canCancel: false,
                backgroundColor: '#111',
            }, {
                default: self.$createElement(RotateSquare2)
            });
        },

        // obj 에서 id만 추출하여 새 객체 리턴
        getIdMapper(obj) {
            return {
                id: _get(obj, 'id', null)
            };
        },

        /**
         * 데이터, 프로퍼티 path 에 대하여 _get 을 이용 추출, numeraljs 을 이용하여 format 적용
         * @param data
         * @param propertyPath
         * @returns {*}
         */
        formatNumeral(data, propertyPath) {
            return Vue.prototype.$n(_get(data, propertyPath, null)).format();
        },

    };

    Vue.prototype.$common = common;
};

Vue.use(common);
