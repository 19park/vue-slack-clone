// for suport ie11
import 'babel-polyfill';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import firebase from 'firebase';

import vuetify from './plugins/vuetify';
import './plugins';

const firebaseConfig = {
    apiKey: "AIzaSyB4PRIxuchbrRPGITh9HonN_A0D7yhwwYM",
    authDomain: "slack-d472b.firebaseapp.com",
    databaseURL: "https://slack-d472b.firebaseio.com",
    projectId: "slack-d472b",
    storageBucket: "slack-d472b.appspot.com",
    messagingSenderId: "1063887636953",
    appId: "1:1063887636953:web:3aa54c61b9d83451"
};
firebase.initializeApp(firebaseConfig);

Vue.prototype.$firebase = firebase;
Vue.config.productionTip = false;

import VueNativeNotification from 'vue-native-notification';

Vue.use(VueNativeNotification, {
    // Automatic permission request before
    // showing notification (default: true)
    requestOnNotify: true
});

const unsuscribe = firebase.auth().onAuthStateChanged(user => {
    store.dispatch('setUser', user);

    new Vue({
        router,
        store,
        vuetify,
        render: h => h(App)
    }).$mount('#app');

    unsuscribe();
});
