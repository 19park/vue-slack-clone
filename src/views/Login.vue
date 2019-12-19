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

                            <v-spacer></v-spacer>
                            <v-spacer></v-spacer>

                            <v-btn
                                block
                                color="light-blue darken-4"
                                class="mt-3 white--text"
                                to="/register"
                            >
                                계정이 없니?
                            </v-btn>

                            <v-btn
                                light
                                block
                                class="mt-3"
                                @click="doRegisterGoogle"
                            >
                                <img src="/google.png" width="20" height="20" class="mr-3"/>
                                Google 계정으로 로그인
                            </v-btn>

                            <v-btn
                                block
                                color="blue-grey"
                                class="mt-3 white--text"
                                @click="doDownWinInstaller"
                            >
                                <v-icon class="mr-2"
                                        dark
                                >cloud_download
                                </v-icon>
                                Download For Windows
                            </v-btn>
                        </v-form>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>

        <div class="d-flex justify-space-between align-center pa-2">
            <!--<v-btn outlined color="grey" to="/privacy">개인정보 처리방침</v-btn>-->
            <span></span>
            <span>{{version}}</span>
        </div>

        <iframe name="hiddenframe" src="about:blank;" frameborder="0" width="0" height="0"
                style="display:none;"></iframe>
    </v-app>
</template>

<script>
    import firebase from 'firebase/app';
    import {version} from '@/../package.json';

    export default {
        name: 'login',
        data: () => ({
            version: `v${version}`,

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
            ]
        }),
        methods: {
            validate() {
                if (this.$refs.form.validate()) {
                    this.doLogin();
                }
            },
            doLogin() {
                const loader = this.$common.getLoader(this);
                this.$firebase.auth()
                    .signInWithEmailAndPassword(this.email, this.password)
                    .then(({user}) => {
                        this.doLoginComplete(user);
                    }).catch(err => {
                    const msg = err.code === "auth/user-not-found" ? "등록되지 않은 사용자입니다." : err.message;
                    this.$alert.showAlertToWarning("로그인 에러", msg);
                    loader.hide();
                });
            },

            doLoginComplete(user) {
                this.$store.dispatch('setUser', user);
                this.$notify({
                    group: 'active',
                    type: 'warn',
                    title: '알림',
                    text: `${user.displayName}님 안녕하세요.`
                });
                this.$router.replace('/');
            },

            doRegisterGoogle() {
                let provider = new firebase.auth.GoogleAuthProvider();
                // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
                // this.$firebase.auth().signInWithPopup(provider)

                this.$firebase.auth().signInWithRedirect(provider);
            },

            doDownWinInstaller() {
                let link = document.createElement('a');
                link.href = 'https://firebasestorage.googleapis.com/v0/b/slack-d472b.appspot.com/o/%ED%95%98%EB%8B%88%EC%B1%97%20Setup%201.0.0.exe?alt=media&token=b961f180-0a9b-43f1-912a-6fe42cde7d9a';

                link.target = 'hiddenframe';
                document.body.append(link);
                link.click();
                document.body.removeChild(link);
            },

            saveUserToUsersRef(user) {
                return this.$firebase.database().ref('users').child(user.uid).set({
                    name: user.displayName,
                    avatar: user.photoURL
                });
            }
        },
        beforeRouteEnter (to, from, next) {
            from.name === 'home' ? next() : next(vm => {
                vm.$firebase.auth().getRedirectResult().then(async ({user}) => {
                    if (user && user.uid) {
                        vm.$firebase.database().ref('users').child(user.uid).on('value', snap => {
                            if (snap.val()) {
                                vm.doLoginComplete(user);
                            } else {
                                vm.saveUserToUsersRef(user).then(() => {
                                    vm.doLoginComplete(user);
                                });
                            }
                        });
                    }
                }).catch(err => {
                    const msg = err.code === "auth/user-not-found" ? "등록되지 않은 사용자입니다." : err.message;
                    vm.$alert.showAlertToWarning("로그인 에러[1]", msg);
                });
            })
        }
    };
</script>
