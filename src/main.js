// for suport ie11
import 'babel-polyfill';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import firebase from 'firebase/app';
import 'firebase/messaging';

import Notifications from 'vue-notification';
import velocity      from 'velocity-animate';

Vue.use(Notifications, { velocity });

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

try {
    const messaging = firebase.messaging();
    const FIREBASE_PUSH_KEY = "BLae72mufQjF732CFzVq8_z2py31FCb7g7KtR0j-InobofyP4qC2VbSiX5vH4wKr4DYCeFP1R9XHSkpIm9DAa1I";
    messaging.usePublicVapidKey(FIREBASE_PUSH_KEY);

    if (lsTest()) {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                getMyToken();
            } else {
                // console.log('Unable to get permission to notify.');
                setTokenSentToServer(false);
            }
        });

        messaging.onTokenRefresh(() => {
            messaging.getToken().then(() => {
                setTokenSentToServer(false);
            }).catch(() => {
                // console.log('Unable to retrieve refreshed token ', err);
            });
        });

        messaging.onMessage((payload) => {
            // console.log('onMessage: ', payload);
            const title = payload.notification.title;
            const options = {
                body: payload.notification.body,
                icon: payload.notification.icon
            };
            const notification = new Notification(title, options);
            notification.onclick = function (event) {
                event.preventDefault();
                alert(payload.notification.body);
            }
        });
    }

    const getMyToken = () => {
        messaging.getToken().then((currentToken) => {
            if (currentToken) {
                saveToken(currentToken);
                setTokenSentToServer(true);
            } else {
                setTokenSentToServer(false);
            }
        }).catch(() => {
            setTokenSentToServer(false);
        });
    }
} catch(e) {
    /* eslint-disable */
    console.debug(e);
}

function lsTest() {
    const test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentTokenToServer', (sent ? 1 : 0).toString());
}

function saveToken(token) {
    window.localStorage.setItem('myToken', token);
}

Vue.prototype.$firebase = firebase;
Vue.config.productionTip = false;

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
