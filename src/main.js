// for suport ie11
import '@babel/polyfill';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import firebase from 'firebase/app';

import vuetify from './plugins/vuetify';
import './plugins';

const firebaseConfig = {
    apiKey: process.env.VUE_APP_FB_API_KEY,
    authDomain: process.env.VUE_APP_FB_AUTH_DOMAIN,
    databaseURL: process.env.VUE_APP_FB_DB_URL,
    projectId: process.env.VUE_APP_FB_PROJECT_ID,
    storageBucket: process.env.VUE_APP_FB_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_FB_MSG_SENDER_ID,
    appId: process.env.VUE_APP_FB_APP_ID
};
firebase.initializeApp(firebaseConfig);

Vue.prototype.$firebase = firebase;
Vue.config.productionTip = false;


import Notifications from 'vue-notification';
import velocity      from 'velocity-animate';

Vue.use(Notifications, { velocity });

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
