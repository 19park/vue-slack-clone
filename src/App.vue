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
    export default {
        name: 'App',
        data: () => ({
            //
        }),
    };
</script>
