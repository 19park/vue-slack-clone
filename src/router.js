import Vue from 'vue';
import Router from 'vue-router';

import Login from './views/Login.vue';
import Register from './views/Register.vue';
import TChat from './views/TChat.vue';

import Home from './views/Home.vue';
import Privacy from './views/Privacy.vue';
import Messages from '@/components/messages/Messages';

import firebase from 'firebase';

Vue.use(Router);

const authChecker = (to, from, next) => {
    if (!firebase.auth().currentUser) {
        next('/login');
    } else {
        next();
    }
};

const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/privacy',
            name: 'privacy',
            component: Privacy
        },
        {
            path: '/register',
            name: 'register',
            component: Register
        },
        {
            path: '/',
            component: TChat,
            beforeEnter: authChecker,
            children: [
                {
                    path: '',
                    name: 'home',
                    component: Home
                }
            ]
        },
        {
            path: '/channel',
            name: 'channel',
            component: TChat,
            beforeEnter: authChecker,
            children: [
                {
                    path: ':channelId',
                    component: Messages,
                    props: true
                }
            ]
        },
        {
            path: '/private',
            name: 'private',
            component: TChat,
            beforeEnter: authChecker,
            children: [
                {
                    path: ':userId1/:userId2',
                    component: Messages,
                    props: {private: true}
                }
            ]
        }
    ]
});


router.beforeEach((to, from, next) => {
    // 로그인 화면 redirect query값에 따른 처리
    if (from.fullPath.includes('/login')) {
        const redirectPage = from.query?.redirect;
        if (redirectPage && redirectPage !== '/login') {
            delete from.query.redirect;
            next(redirectPage);
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;
