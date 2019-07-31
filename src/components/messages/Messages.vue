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
                                <span class="grey--text">{{message.timestamp | fromNow}}</span>
                            </v-list-item-title>
                            <v-list-item-subtitle v-html="message.content"></v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-content v-else>
                            <v-list-item-title class="d-flex justify-space-between mb-2">
                                <strong>{{message.user.name}}</strong>
                                <span class="grey--text">{{message.timestamp | fromNow}}</span>
                            </v-list-item-title>

                            <v-img :src="message.image"
                                   :lazy-src="message.image"
                                   max-width="500"
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

    import MessageForm from '@/components/messages/MessageForm';

    export default {
        name: 'messages',
        props: {
            channelId: {
                type: String,
                default: null
            }
        },
        data: () => ({
            messagesRef: null,

            messages: [],
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
                this.messages = [];
                this.detachListeners();
                this.addListeners();

                this.channel = newData;
            }
        },
        filters: {
            fromNow (value) {
                return moment(value).fromNow()
            }
        },
        methods: {
            selfMessage(user) {
                return this.currentUser.uid === user.id
            },
            addListeners() {
                this.messagesRef.child(this.channelId).on('child_added', snap => {
                    let message = snap.val();
                    message['id'] = snap.key;

                    this.messages.push(message);

                    this.$nextTick(() => {
                        this.moveToScroll();
                    });
                });
            },


            moveToScroll() {
                this.$refs.messageWrap.scrollTop = this.$refs.messageWrap.scrollHeight;
            },

            detachListeners() {
                if (this.channel !== null) {
                    this.messagesRef.child(this.channel.id).off('child_added');
                }
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
            this.messagesRef = this.$firebase.database().ref('messages');
        },
        mounted() {
            // this.addListeners();
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
    }
</style>
