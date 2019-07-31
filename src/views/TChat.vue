<template>
    <v-app id="tchat">
        <v-navigation-drawer
            v-model="drawer"
            app
            clipped
        >
            <v-list>
                <v-list-item class="pr-0">
                    <v-list-item-avatar class="my-0">
                        <img :src="currentUser ? currentUser.photoURL : '/empty_user.png'" alt="Profile">
                    </v-list-item-avatar>

                    <v-list-item-content>
                        <v-list-item-title>{{currentUser.displayName}}</v-list-item-title>
                        <v-list-item-subtitle :title="currentUser.email">{{currentUser.email}}</v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action
                        class="my-0"
                        @click="doLogout"
                    >
                        <v-tooltip right>
                            <template v-slot:activator="{ on }">
                                <v-btn icon ripple v-on="on">
                                    <v-icon color="darken-1">logout</v-icon>
                                </v-btn>
                            </template>
                            <span>로그아웃</span>
                        </v-tooltip>
                    </v-list-item-action>
                </v-list-item>
                <v-list-item>
                    <v-list-item-title class="cyan--text text--lighten-3">
                        <v-btn
                            style="width: 100%;"
                            @click="doAddChannals"
                        >
                            <v-icon left>add</v-icon> 채널 생성하기
                        </v-btn>
                    </v-list-item-title>
                </v-list-item>
            </v-list>
            <v-list dense>
                <v-list-item
                    v-for="channel in channels"
                    :key="channel.id"
                    @click="changeChannel(channel)"
                >
                    <v-list-item-action>
                        <v-icon :color="isChannelActive(channel) ? 'orange darken-1':''">lens</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title :class="{'orange--text text--darken-1': isChannelActive(channel)}">
                            {{ channel.name }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-subheader
                    class="mt-4 pl-4 grey--text"
                    style="font-size: 1rem;"
                >사용자</v-subheader>
                <Users/>

            </v-list>
        </v-navigation-drawer>

        <v-app-bar
            app
            clipped-left
            color="blue"
            dense
        >
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-icon class="mx-4">fab fa-youtube</v-icon>
            <v-toolbar-title class="mr-12 align-center">
                <span class="title">Holy Shiiiiiit</span>
            </v-toolbar-title>
            <!--<v-spacer></v-spacer>-->
            <!--<v-layout-->
            <!--align-center-->
            <!--style="max-width: 650px"-->
            <!--&gt;-->
            <!--<v-text-field-->
            <!--:append-icon-cb="() => {}"-->
            <!--placeholder="Search..."-->
            <!--single-line-->
            <!--append-icon="search"-->
            <!--color="white"-->
            <!--hide-details-->
            <!--&gt;</v-text-field>-->
            <!--</v-layout>-->
        </v-app-bar>

        <v-content class="fill-height">
            <v-container fluid fill-height>
                <v-fade-transition>
                    <router-view></router-view>
                </v-fade-transition>
            </v-container>
        </v-content>

        <ModalChannels ref="modalChannels"
                       @change="setChannelActive"
        />
    </v-app>
</template>

<script>
    import {mapGetters} from 'vuex';

    import Users from '@/components/sidebar/Users';
    import ModalChannels from '@/components/sidebar/Channels';

    export default {
        name: 'tchat',
        data() {
            return {
                drawer: null,
                channels: [],
                channelsRef: null,
                presenceRef: null
            }
        },
        computed: {
            ...mapGetters(['currentUser', 'currentChannel'])
        },
        components: {Users, ModalChannels},
        methods: {
            doLogout() {
                this.presenceRef.child(this.currentUser.uid).remove();

                this.$firebase.auth().signOut();
                this.$store.dispatch('setUser', null);
                this.$router.push('/login');
            },

            doAddChannals() {
                this.$refs.modalChannels.doOpen(this.channelsRef);
            },

            addListeners() {
                this.channelsRef.on('child_added', snap => {
                    this.channels.push(snap.val());

                    // if (this.firstLoad && this.channels.length > 0) {
                    //     this.$store.dispatch('setChannel', this.channels[0]);
                    // }
                    if (!this.currentChannel && this.$route.params.channelId) {
                        if (this.$route.params.channelId === snap.val().id) this.$store.dispatch('setChannel', snap.val());
                    }
                });
            },

            changeChannel(channel) {
                this.$store.dispatch('setChannel', channel);
                this.$router.push(`/channel/${channel.id}`);
            },
            setChannelActive(channelId) {
                this.channels.forEach(channel => {
                   if (channel.id === channelId) this.changeChannel(channel);
                });
            },
            isChannelActive(channel) {
                return channel.id === this.currentChannel?.id
            },
            detachListeners() {
                this.channelsRef.off();
            }
        },
        created() {
            this.channelsRef = this.$firebase.database().ref('channels');
            this.presenceRef = this.$firebase.database().ref('presence');
        },
        mounted() {
            this.addListeners();
        },
        beforeDestroy() {
            this.detachListeners();
        }
    };
</script>
