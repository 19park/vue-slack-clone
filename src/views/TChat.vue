<template>
    <v-app id="tchat">
        <v-navigation-drawer
            v-model="drawer"
            app
        >
            <vue-scroll ref="vs"
                        :opt="$store.state.scrollOpt"
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
                                block
                                @click="doAddChannals"
                            >
                                <v-icon left>add</v-icon>
                                채널 생성하기
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
                            <v-list-item-title
                                class="d-flex justify-space-between align-center"
                                :class="{'orange--text text--darken-1': isChannelActive(channel)}"
                            >
                                <div>{{ channel.name }}</div>
                                <div v-if="getNotification(channel) > 0 && channel.id !== currentChannel.id">
                                    <v-chip :ripple="false"
                                            color="red"
                                    >
                                        {{ getNotification(channel) }}
                                    </v-chip>
                                </div>
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                    <v-subheader
                        class="mt-4 pl-4 grey--text"
                        style="font-size: 1rem;"
                    >사용자
                    </v-subheader>

                    <Users ref="userContainer"/>

                </v-list>
            </vue-scroll>
        </v-navigation-drawer>

        <v-app-bar
            app
            color="blue"
            dense
        >
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-icon class="mx-4">fab fa-youtube</v-icon>
            <v-toolbar-title class="mr-12 align-center">
                <span class="title" @click="$router.replace('/');">{{currentChannel ? `#${currentChannel.name}` : 'Play Chat'}}</span>
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
            <v-fade-transition>
                <router-view></router-view>
            </v-fade-transition>
        </v-content>

        <ModalChannels ref="modalChannels"
                       @change="setChannelActive"
        />
    </v-app>
</template>

<script>
    import {mapGetters} from 'vuex';
    import mixins from '@/components/mixins';

    import Users from '@/components/sidebar/Users';
    import ModalChannels from '@/components/sidebar/Channels';
    import vueScroll from 'vuescroll';

    export default {
        name: 'tchat',
        data() {
            return {
                drawer: null,
                channels: [],
                channelsRef: null,

                notifCount: [],
                channel: null
            };
        },
        mixins: [mixins],
        computed: {
            ...mapGetters(['currentUser', 'currentChannel', 'isPrivate'])
        },
        components: {Users, ModalChannels, vueScroll},
        watch: {
            isPrivate() {
                if (this.isPrivate) {
                    this.resetNotifications();
                }
            }
        },
        methods: {
            doLogout() {
                const loader = this.$common.getLoader(this);
                this.$firebase.database().ref('presence').child(this.currentUser.uid).remove();

                this.$firebase.auth().signOut().then(() => {
                    this.$store.dispatch('setUser', null);
                    this.$router.replace('/login');
                }).catch(err => {
                    this.$alert.showAlertToWarning(err.message);
                }).finally(() => {
                    loader.hide();
                });
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

                    this.addCountListener(snap.key);
                    if (!this.currentChannel && this.$route.params.channelId) {
                        if (this.$route.params.channelId === snap.val().id) {
                            // this.$store.dispatch('setChannel', snap.val());
                            this.changeChannel(snap.val());
                        }
                    }
                });
            },

            addCountListener(channelId) {
                this.$firebase.database().ref('messages').child(channelId).on('value', snap => {
                    this.handleNotifications(channelId, this.currentChannel?.id, this.notifCount, snap);
                });
            },

            getNotification(channel) {
                let notif = 0;
                this.notifCount.forEach(el => {
                    if (el.id === channel.id) {
                        notif = el.notif;
                    }
                });

                return notif;
            },

            changeChannel(channel) {
                this.resetNotifications();

                this.$store.dispatch('setPrivate', false);
                this.$store.dispatch('setChannel', channel);
                this.channel = channel;

                this.$router.push(`/channel/${channel.id}`);
            },

            resetNotifications() {
                let idx = this.notifCount.findIndex(el => el.id === this.channel?.id);
                if (idx !== -1) {
                    this.notifCount[idx].total = this.notifCount[idx].lastKnownTotal;
                    this.notifCount[idx].notif = 0;
                }
            },

            setChannelActive(channelId) {
                this.channels.forEach(channel => {
                    if (channel.id === channelId) this.changeChannel(channel);
                });
            },

            isChannelActive(channel) {
                return channel.id === this.currentChannel?.id;
            },

            detachListeners() {
                this.channelsRef.off();
                this.channels.forEach(el => {
                    this.$firebase.database().ref('messages').child(el.id).off();
                });
            }
        },
        created() {
            this.channelsRef = this.$firebase.database().ref('channels');
        },
        mounted() {
            this.addListeners();
        },
        beforeDestroy() {
            this.detachListeners();
        }
    };
</script>

<style lang="scss">
    .v-navigation-drawer {
        .__view {
            max-width: 100%;
        }
    }
</style>
