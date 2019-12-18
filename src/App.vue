<template>
    <v-app>
        <v-fade-transition>
            <router-view/>
        </v-fade-transition>

        <notifications group="active"
                       animation-type="velocity"
                       position="top right"></notifications>
    </v-app>
</template>

<script>
    import Vue from 'vue';
    import Notifications from 'vue-notification';
    import velocity      from 'velocity-animate';

    Vue.use(Notifications, { velocity });

    export default {
        name: 'App',
        data: () => ({
            //
        }),
    };
</script>
