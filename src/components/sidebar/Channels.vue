<template>
    <v-layout justify-center>
        <v-dialog v-model="dialog" persistent max-width="600px">
            <v-form
                ref="form"
                v-model="valid"
                lazy-validation
                @submit.prevent=""
            >
                <v-card>
                    <v-card-title>
                        <span class="headline">채널 생성</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex xs12>
                                    <v-text-field label="새로운 채널"
                                                  hint="만드실 채널명을 입력해주세요."
                                                  v-model="new_channel"
                                                  :counter="20"
                                                  :rules="new_channelRules"
                                                  @keyup.enter="validate"
                                                  required>
                                    </v-text-field>
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
                            생성
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </v-dialog>
    </v-layout>
</template>

<script>
    export default {
        name: "Channals",
        data: () => ({
            dialog: false,

            valid: true,
            new_channel: '',
            new_channelRules: [
                v => !!v || '채널명은 필수 항목입니다.',
                v => (v && v.length <= 20) || '채널은 20자이하로 입력해주세요.',
            ],
            channelsRef: null
        }),
        methods: {
            doOpen(channelsRef) {
                this.dialog = true;
                this.new_channel = '';
                this.channelsRef = channelsRef;
            },
            doClose() {
                this.dialog = false;
            },

            validate() {
                if (this.$refs.form.validate()) {
                    this.addChannels();
                }
            },

            addChannels() {
                let key = this.channelsRef.push().key;
                let newChannel = {id: key, name: this.new_channel};

                this.channelsRef.child(key).update(newChannel).then(() => {
                    this.$alert.showCommonAlert(
                        '생성되었습니다.',
                        () => {
                            this.new_channel = '';
                            this.doClose();

                            this.$emit('change', key);
                        }
                    );
                }).catch((err) => {
                    this.$alert.showAlertToWarning(err.message);
                });
            }
        }
    };
</script>

<style scoped>

</style>
