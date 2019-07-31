import Vue from 'vue';
import firebase from 'firebase';

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
