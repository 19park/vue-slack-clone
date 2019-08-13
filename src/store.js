import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        currentUser: null,
        currentChannel: null,

        isPrivate: false,
        scrollOpt: {
            bar: {
                showDelay: 500,
                onlyShowBarOnScroll: false,
                keepShow: true,
                background: '#1dbdb7',
                opacity: 1,
                hoverStyle: false,
                specifyBorderRadius: false,
                minSize: 0,
                size: '6px',
                disable: false
            }
        }
    },
    getters: {
        currentUser: state => state.currentUser,
        currentChannel: state => state.currentChannel,
        isPrivate: state => state.isPrivate
    },
    mutations: {
        SET_USER(state, user) {
            state.currentUser = user;
        },
        SET_CHANNEL(state, channel) {
            state.currentChannel = channel;
        },
        SET_PRIVATE(state, isPrivate) {
            state.isPrivate = isPrivate;
        }
    },
    actions: {
        setUser({commit}, user) {
            commit('SET_USER', user);
        },
        setChannel({commit}, channel) {
            commit('SET_CHANNEL', channel);
        },
        setPrivate({commit}, isPrivate) {
            commit('SET_PRIVATE', isPrivate);
        }
    }
});
