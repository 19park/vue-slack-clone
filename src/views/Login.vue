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
                            <v-card class="elevation-12">
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
                                        :counter="50"
                                        :rules="emailRules"
                                        v-model.trim="email"
                                        required
                                    ></v-text-field>

                                    <v-text-field
                                        label="비밀번호"
                                        name="password"
                                        prepend-icon="lock"
                                        type="password"
                                        :counter="20"
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
                            <router-link class="d-block text-center mt-5" to="/register">
                                계정이 없니?
                            </router-link>
                        </v-form>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
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
            }
        },
        created() {
            this.usersRef = this.$firebase.database().ref('users');
        }
    };
</script>
