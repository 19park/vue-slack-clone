<template>
    <v-list>
        <template v-if="!users.length">
            <v-list-item>
                <v-list-item-subtitle class="grey--text">사용자 없음</v-list-item-subtitle>
            </v-list-item>
        </template>
        <template v-else>
            <v-list-item
                v-for="user in users"
                :key="user.uid"
                :class="{'grey darken-2': isActive(user.uid)}"
                @click.prevent="changeChannel(user)"
            >
                <v-list-item-avatar>
                    <img
                        :src="user.avatar"
                        alt=""
                    >
                </v-list-item-avatar>
                <v-list-item-title
                    class="d-flex justify-space-between align-center"
                    :class="{
                    'green--text': isOnline(user),
                    'grey--text': !isOnline(user)
                }">
                    <div class="font-weight-bold">{{ user.name }}</div>
                    <div v-if="getNotification(user) >= 1">
                        <v-chip :ripple="false"
                                color="red"
                        >
                            {{ getNotification(user) }}
                        </v-chip>
                    </div>
                </v-list-item-title>
            </v-list-item>
        </template>
    </v-list>
</template>

<script>
    import {mapGetters} from 'vuex';
    import mixins from '@/components/mixins'

    export default {
        name: "Users",
        data() {
            return {
                users: [],
                usersRef: null,
                connectedRef: null,
                presenceRef: null,
                privateMessagesRef: null,

                notifCount: [],
                channel: null
            };
        },
        mixins: [mixins],
        computed: {
            ...mapGetters(['currentUser', 'currentChannel', 'isPrivate'])
        },
        watch: {
            isPrivate() {
                if (!this.isPrivate) {
                    this.resetNotifications();
                }
            }
        },
        methods: {
            addListeners() {
                this.usersRef.on('child_added', snap => {
                    if (this.currentUser.uid !== snap.key) {
                        let user = snap.val();
                        user['uid'] = snap.key;
                        user['status'] = 'offline';

                        this.users.push(user);
                    }

                    if (!this.currentChannel && this.$route.params?.userId1 && this.$route.params?.userId2) {
                        const {userId1, userId2} = this.$route.params;
                        if (userId1 === snap.key) {
                            this.$store.dispatch('setPrivate', true);
                            this.$store.dispatch('setChannel', {
                                id: `${userId1}/${userId2}`,
                                name: snap.val().name
                            });
                        }
                    }
                });

                this.presenceRef.on('child_added', snap => {
                    if (this.currentUser.uid !== snap.key) {
                        this.addStatusToUser(snap.key);

                        let channelId = this.getChannelId(snap.key);
                        this.privateMessagesRef.child(channelId).on('value', snap => {
                            this.handleNotifications(channelId, this.currentChannel?.id, this.notifCount, snap);
                        })
                    }
                });

                this.presenceRef.on('child_removed', snap => {
                    if (this.currentUser.uid !== snap.key) {
                        this.addStatusToUser(snap.key, false);

                        this.privateMessagesRef.child(this.getChannelId(snap.key)).off();
                    }
                });

                this.connectedRef.on('value', snap => {
                   if (snap.val() === true) {
                       let ref = this.presenceRef.child(this.currentUser.uid);

                       ref.set(true);
                       ref.onDisconnect().remove(err => {
                          if (err) this.$alert.showAlertToWarning(err);
                       });
                   }
                });
            },

            addStatusToUser(userId, connected = true) {
                let idx = this.users.findIndex( user => user.uid === userId);
                if (idx !== -1) {
                    connected === true ? this.users[idx].status = 'online' : this.users[idx].status = 'offline';
                }
            },

            isOnline(user) {
                return user.status == 'online';
            },

            changeChannel(user) {
                if (this.channel === null) {
                    this.resetNotifications(user);
                } else {
                    this.resetNotifications();
                }

                let channelId = this.getChannelId(user.uid);
                let channel = {id: channelId, name: user.name};

                this.channel = channel;
                this.$store.dispatch('setPrivate', true);
                this.$store.dispatch('setChannel', channel);

                this.$router.push(`/private/${channelId}`);
            },

            isActive(userId) {
                let channelId = this.getChannelId(userId);
                return this.currentChannel?.id === channelId;
            },

            getChannelId(userId) {
                return userId < this.currentUser.uid ? `${userId}/${this.currentUser.uid}` : `${this.currentUser.uid}/${userId}`
            },

            getNotification(user) {
                let channelId = this.getChannelId(user.uid);
                let notif = 0;
                this.notifCount.forEach(el => {
                    if (el.id === channelId) {
                        notif = el.notif;
                    }
                });

                return notif;
            },

            resetNotifications(user = null) {
                let channelId = null;
                if (user) {
                    channelId = this.getChannelId(user.uid);
                } else {
                    channelId = this.channel?.id;
                }
                let idx = this.notifCount.findIndex(el => el.id === channelId);
                if (idx !== -1) {
                    this.notifCount[idx].total = this.notifCount[idx].lastKnownTotal;
                    this.notifCount[idx].notif = 0;
                }
            },

            detachListeners() {
                this.usersRef.off();
                this.presenceRef.off();
                this.connectedRef.off();
                this.privateMessagesRef.off();
            }
        },
        created() {
            this.usersRef = this.$firebase.database().ref('users');
            this.connectedRef = this.$firebase.database().ref('.info/connected');
            this.presenceRef = this.$firebase.database().ref('presence');
            this.privateMessagesRef = this.$firebase.database().ref('privateMessages');
        },
        mounted() {
            this.addListeners();
        },
        beforeDestroy() {
            this.detachListeners();
        }
    };
</script>

<style scoped>

</style>
