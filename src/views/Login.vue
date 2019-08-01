<template>
    <v-app id="login">
        <v-content>
            <v-container
                fluid
                fill-height
            >
                <v-layout
                    align-center
                    justify-center
                >
                    <v-flex
                        xs12
                        sm8
                        md4
                    >
                        <v-form
                            ref="form"
                            v-model="valid"
                            lazy-validation
                        >
                            <v-card class="elevation-12 mb-3">
                                <v-toolbar
                                    color="primary"
                                    dark
                                    flat
                                >
                                    <v-toolbar-title>로그인</v-toolbar-title>
                                    <v-spacer></v-spacer>
                                </v-toolbar>
                                <v-card-text>
                                    <v-text-field
                                        label="이메일"
                                        name="email"
                                        prepend-icon="person"
                                        type="email"
                                        :rules="emailRules"
                                        v-model.trim="email"
                                        required
                                    ></v-text-field>

                                    <v-text-field
                                        label="비밀번호"
                                        name="password"
                                        prepend-icon="lock"
                                        type="password"
                                        :rules="passwordRules"
                                        v-model="password"
                                        @keyup.enter="validate"
                                        required
                                    ></v-text-field>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="primary" @click="validate">로그인</v-btn>
                                </v-card-actions>
                            </v-card>

                            <v-btn
                                block
                                color="light-blue darken-4"
                                class="mt-5 white--text"
                                to="/register"
                            >
                                계정이 없니?
                            </v-btn>
                            <v-btn
                                block
                                color="blue-grey"
                                class="mt-3 white--text"
                                @click="doDownWinInstaller"
                            >
                                <v-icon class="mr-2"
                                        dark
                                >cloud_download</v-icon>
                                Download For Windows
                            </v-btn>
                        </v-form>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>

        <iframe name="hiddenframe" src="about:blank;" frameborder="0" width="0" height="0" style="display:none;"></iframe>
    </v-app>
</template>

<script>
    export default {
        name: 'login',
        data: () => ({
            valid: true,
            email: '',
            emailRules: [
                v => !!v || '이메일은 필수 항목입니다.',
                v => /.+@.+\..+/.test(v) || '이메일이 형식에 맞지 않습니다.',
            ],
            password: '',
            passwordRules: [
                v => !!v || '비밀번호는 필수 항목입니다.',
                v => (v && v.length >= 6) || '비밀번호는 6자이상 입력해주세요.',
            ],

            usersRef: null
        }),
        methods: {
            validate () {
                if (this.$refs.form.validate()) {
                    this.doLogin();
                }
            },
            doLogin() {
                const loader = this.$common.getLoader(this);
                this.$firebase.auth()
                    .signInWithEmailAndPassword(this.email, this.password)
                    .then(({user}) => {
                        this.$store.dispatch('setUser', user);
                        this.$snack['success']({
                            text: `${user.displayName}님 안녕하세요.`
                        });
                        this.$router.replace('/');
                    }).catch(err => {
                        const msg = err.code === "auth/user-not-found" ? "등록되지 않은 사용자입니다." : err.message;
                    this.$alert.showAlertToWarning("로그인 에러", msg);
                    loader.hide();
                });
            },

            doDownWinInstaller() {
                let link = document.createElement('a');
                link.href = 'https://firebasestorage.googleapis.com/v0/b/slack-d472b.appspot.com/o/%ED%8C%A4%EC%B1%97%EC%95%B1%20Setup%201.0.0.exe?alt=media&token=2a93308b-379c-4bb2-83ee-b5c49469001c';

                link.target = 'hiddenframe';
                document.body.append(link);
                link.click();
                document.body.removeChild(link);
            }
        },
        created() {
            this.usersRef = this.$firebase.database().ref('users');
        }
    };
</script>
