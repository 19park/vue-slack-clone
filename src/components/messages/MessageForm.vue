<template>
    <v-layout column>
        <v-flex
            mt-3
            layout
        >
            <v-textarea
                solo
                label="Messages"
                hide-details
                no-resize
                v-model="message"
                @keydown.enter="sendMessage"
            ></v-textarea>

            <v-flex
                layout
                column
                class="flex-grow-0"
            >
                <v-btn large
                       color="primary"
                       class="ml-3 mb-3 fill-height"
                       @click="sendMessage"
                >전송</v-btn>

                <v-btn large
                       dark
                       class="ml-3 fill-height"
                       @click="doOpenFile"
                ><v-icon color="grey lighten-1">add_photo_alternate</v-icon></v-btn>

                <FileModal ref="modalFile"
                           @upload="uploadFile"
                />
            </v-flex>
        </v-flex>

        <v-slide-y-transition leave-absolute>
            <v-flex v-if="progress" class="mt-3">
                <v-progress-linear :value="percent"></v-progress-linear>
                <p class="pa-3">{{ uploadLabel }}</p>
            </v-flex>
        </v-slide-y-transition>

    </v-layout>
</template>

<script>
    import FileModal from '@/components/messages/FileModal'
    import {mapGetters} from 'vuex';
    import uuidV4 from 'uuid/v4';

    export default {
        name: "MessageForm",
        data() {
            return {
                message: '',

                progress: false,
                percent: 0,

                storageRef: null,
                uploadTask: null,
                uploadState: null
            }
        },
        computed: {
            ...mapGetters(['currentChannel', 'currentUser', 'isPrivate']),
            uploadLabel() {
                switch (this.uploadState) {
                    case 'uploading': return '업로드 중.. 기다리셈';
                    case 'error': return '업로드 에러ㅠ';
                    case 'done': return '완료ㅋ';
                    default: return ''
                }
            }
        },
        components: {
            FileModal
        },
        methods: {
            sendMessage() {
                if (this.message.length > 0) {
                    this.$parent.getMessageRef().child(this.currentChannel.id).push().set(this.createMessage()).then(() => {
                    }).catch(err => {
                        this.$alert.showAlertToWarning(err.message);
                    }).finally(() => {
                        this.message = '';
                    });
                }
            },

            createMessage(fileUrl = null) {
                let message = {
                    timestamp: this.$firebase.database.ServerValue.TIMESTAMP,
                    user: {
                        name: this.currentUser.displayName,
                        avatar: this.currentUser.photoURL,
                        id: this.currentUser.uid
                    }
                }

                if (fileUrl == null) {
                    message['content'] = this.message;
                } else {
                    message['image'] = fileUrl;
                }

                return message;
            },

            doOpenFile() {
                this.$refs.modalFile.doOpen();
            },

            uploadFile(file, metadata) {
                if (file === null) return false;

                let pathToUpload = this.currentChannel.id;
                let ref = this.$parent.getMessageRef();

                let _lastDot = file.name.lastIndexOf('.');
                let _fileExt = file.name.substring(_lastDot, file.name.length).toLowerCase();
                let filePath = `${this.getPath()}/${uuidV4()}${_fileExt}`;

                this.progress = true;

                this.uploadTask = this.storageRef.child(filePath).put(file, metadata);
                this.uploadState = "uploading";

                this.uploadTask.on('state_changed', snap => {
                    let percent = (snap.bytesTransferred / snap.totalBytes) * 100;
                    this.percent = percent;
                }, err => {
                    this.$alert.showAlertToWarning(err.message);
                    this.progress = false;

                    this.uploadState = 'error';
                    this.uploadTask = null;
                }, () => {
                    // finish complete
                    this.progress = false;
                    this.uploadState = 'done';

                    this.uploadTask.snapshot.ref.getDownloadURL().then((fileUrl) => {
                        this.sendFileMessage(fileUrl, ref, pathToUpload);
                    });
                });
            },

            sendFileMessage(fileUrl, ref, pathToUpload) {
                ref.child(pathToUpload).push().set(this.createMessage(fileUrl)).then(() => {
                    this.$nextTick(() => {
                        this.$parent.moveToScroll();
                    });
                }).catch(err => {
                    this.$alert.showAlertToWarning(err.message);
                });
            },

            getPath() {
                if (this.isPrivate) {
                    return `tchat/private/${this.currentChannel.id}`
                } else {
                    return `tchat/public`
                }
            }
        },

        created() {
            this.storageRef = this.$firebase.storage().ref();
        },

        beforeDestroy() {
            if (this.uploadTask !== null) {
                this.uploadTask.cancel();
                this.uploadTask = null;
            }
        }
    };
</script>

<style scoped>

</style>
