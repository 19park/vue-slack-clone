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
            >
                <v-list-item-avatar>
                    <img
                        :src="user.avatar"
                        alt=""
                    >
                </v-list-item-avatar>
                <v-list-item-title
                    v-text="user.name"
                    class="font-weight-bold"
                    :class="{
                    'green--text': isOnline(user),
                    'grey--text': !isOnline(user)
                }"
                ></v-list-item-title>
            </v-list-item>
        </template>
    </v-list>
</template>

<script>
    import {mapGetters} from 'vuex';

    export default {
        name: "Users",
        data() {
            return {
                users: [],
                usersRef: null,
                connectedRef: null,
                presenceRef: null
            };
        },
        computed: {
            ...mapGetters(['currentUser'])
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
                });

                this.presenceRef.on('child_added', snap => {
                    if (this.currentUser.uid !== snap.key) {
                        this.addStatusToUser(snap.key);
                    }
                });

                this.presenceRef.on('child_removed', snap => {
                    if (this.currentUser.uid !== snap.key) {
                        this.addStatusToUser(snap.key, false);
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

            detachListeners() {
                this.usersRef.off();
                this.presenceRef.off();
                this.connectedRef.off();
            }
        },
        created() {
            this.usersRef = this.$firebase.database().ref('users');
            this.connectedRef = this.$firebase.database().ref('.info/connected');
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

<style scoped>

</style>
