<template>
    <v-layout
        justify-center
        column
        nowrap
    >
        <v-flex ref="messageWrap"
                class="message__wrap overflow-y-auto"
        >
            <v-list v-if="!messages.length">
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title>NO MESSAGE</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <v-slide-y-transition
                v-else
                three-line
                class="py-0"
                group
                tag="div"
            >
                <template v-for="(message, index) in messages">
                    <v-subheader
                        v-if="message.header"
                        :key="message.header"
                        v-text="message.header"
                    ></v-subheader>

                    <v-divider
                        v-if="index > 0"
                        :key="index"
                        :inset="message.inset"
                    ></v-divider>

                    <v-list-item
                        :key="message.id"
                        :class="{'comment__self': selfMessage(message.user)}"
                    >
                        <v-list-item-avatar class="align-self-start">
                            <v-img :src="message.user.avatar"></v-img>
                        </v-list-item-avatar>

                        <v-list-item-content v-if="!isFile(message)">
                            <v-list-item-title class="d-flex justify-space-between mb-2">
                                <strong>{{message.user.name}}</strong>
                                <span class="grey--text message__fromNow">{{message.timestamp | fromNow}}</span>
                            </v-list-item-title>
                            <v-list-item-subtitle v-html="message.content"></v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-content v-else>
                            <v-list-item-title class="d-flex justify-space-between mb-2">
                                <strong>{{message.user.name}}</strong>
                                <span class="grey--text message__fromNow">{{message.timestamp | fromNow}}</span>
                            </v-list-item-title>

                            <v-img :src="message.image"
                                   :lazy-src="message.image"
                                   max-width="600"
                                   style="flex: 0 1 auto;"
                                   contain>
                                <template v-slot:placeholder>
                                    <v-layout
                                        fill-height
                                        align-center
                                        justify-center
                                        ma-0
                                    >
                                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                    </v-layout>
                                </template>
                            </v-img>
                        </v-list-item-content>
                    </v-list-item>
                </template>
            </v-slide-y-transition>
        </v-flex>

        <v-flex style="flex-grow: 0;">
            <MessageForm/>
        </v-flex>
    </v-layout>
</template>

<script>
    import moment from 'moment';
    import {mapGetters} from 'vuex';

    import scrollTo from '@/plugins/scrollToBottom';
    import MessageForm from '@/components/messages/MessageForm';

    export default {
        name: 'messages',
        props: {
            channelId: {
                type: String,
                default: null
            },
            private: {
                type: Boolean,
                default: false
            }
        },
        data: () => ({
            privateMessagesRef: null,
            messagesRef: null,

            messages: [],
            listeners: [],
            channel: null
        }),
        computed: {
            ...mapGetters(['currentChannel', 'currentUser', 'isPrivate'])
        },
        components: {
            MessageForm
        },
        watch: {
            currentChannel(newData) {
                if (this.channel === newData) return;

                this.init();
            }
        },
        filters: {
            fromNow(value) {
                return moment(value).fromNow();
            }
        },
        methods: {
            init() {
                this.messages = [];
                this.detachListeners();
                this.addListeners();

                this.channel = this.currentChannel;
            },

            selfMessage(user) {
                return this.currentUser.uid === user.id;
            },

            addListeners() {
                let ref = this.getMessageRef();
                let routeParams = this.$route.params;
                let channelId = this.private ? `${routeParams.userId1}/${routeParams.userId2}` : this.channelId;

                ref.child(channelId).on('child_added', snap => {
                    let message = snap.val();
                    message['id'] = snap.key;

                    this.messages.push(message);
                    this.$nextTick(() => {
                        this.moveToScroll();
                    });
                });

                this.addToListeners(channelId, ref, 'child_added');
            },

            moveToScroll() {
                setTimeout(() => {
                    scrollTo(this.$refs.messageWrap, 500);
                }, 1000);
            },

            addToListeners(id, ref, event) {
                let idx = this.listeners.findIndex(el => {
                    return el.id === id && el.ref === ref && el.event === event;
                });

                if (idx === -1) {
                    this.listeners.push({id, ref, event});
                }
            },

            detachListeners() {
                this.listeners.forEach(listener => {
                    listener.ref.child(listener.id).off(listener.event);
                });

                this.listeners = [];
                this.messages = [];
            },

            getMessageRef() {
                if (this.isPrivate) {
                    return this.privateMessagesRef;
                } else {
                    return this.messagesRef;
                }
            },

            isFile(message) {
                return !message.content && message.image;
            }
        },
        created() {
            this.privateMessagesRef = this.$firebase.database().ref('privateMessages');
            this.messagesRef = this.$firebase.database().ref('messages');
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
    .comment__self {
        border-left: 3px solid #ff8e00;
    }

    .message__wrap {
        flex-basis: 0;
        -webkit-overflow-scrolling: touch;

        .message__fromNow {
            font-size: .9rem;
        }
    }
</style>
