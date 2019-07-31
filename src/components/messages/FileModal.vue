<template>
    <v-layout justify-center>
        <v-dialog v-model="dialog" persistent max-width="400px">
            <v-form
                ref="form"
                v-model="valid"
                lazy-validation
                @submit.prevent=""
            >
                <v-card>
                    <v-card-title>
                        <span class="headline">파일 업로드</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex xs12>
                                    <input
                                        type="file"
                                        ref="inpFiles"
                                        class="deep-purple accent-4"
                                        :rules="fileRules"
                                        @change="addFile"
                                    >
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            type="button"
                            @click.prevent="doClose"
                        >
                            닫기
                        </v-btn>
                        <v-btn
                            type="button"
                            color="primary"
                            @click.prevent="validate"
                        >
                            확인
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </v-dialog>
    </v-layout>
</template>

<script>
    import mime from 'mime-types';

    export default {
        name: "FileModal",
        data: () => ({
            dialog: false,

            valid: true,
            file: null,
            fileRules: [
                v => !!v || '파일은 필수 항목입니다.',
            ],
            authorized: ['image/jpeg', 'image/png', 'image/peg', 'image/gif'],
        }),
        methods: {
            doOpen() {
                this.dialog = true;
                this.file = null;

                this.$nextTick(() => {
                    this.$refs.inpFiles.value = '';
                    this.$refs.form.reset();
                });
            },
            doClose() {
                this.dialog = false;
            },

            validate() {
                if (this.$refs.form.validate()) {
                    this.sendFile();
                }
            },

            addFile(e) {
                const file = e.target.files[0];
                this.file = file;
            },

            sendFile() {
                if (this.file !== null) {
                    if (this.isValid(this.file.name)) {
                        let metadata = { contentType: mime.lookup(this.file.name) };
                        this.$emit('upload', this.file, metadata);
                        this.doClose();
                    } else {
                        this.$alert.showAlertToWarning('파일확인', '사진 업로드는 jpg/png/gif 만 가능합니다. '+ mime.lookup(this.file.name));
                    }
                } else {
                    this.$alert.showAlertToWarning('파일확인', '파일을 선택해주세요.');
                }
            },

            isValid(filename) {
                let idx = this.authorized.indexOf(mime.lookup(filename));
                return idx !== -1;
            }
        }
    };
</script>

<style scoped>

</style>
