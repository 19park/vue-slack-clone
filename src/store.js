import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        currentUser: null,
        currentChannel: null,

        isPrivate: false
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
        }
    },
    actions: {
        setUser({commit}, user) {
            commit('SET_USER', user);
        },
        setChannel({commit}, channel) {
            commit('SET_CHANNEL', channel);
        }
    }
});
