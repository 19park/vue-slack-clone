<template>
    <v-app id="register">
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
                                    <v-toolbar-title>가입하기</v-toolbar-title>
                                    <v-spacer></v-spacer>
                                </v-toolbar>
                                <v-card-text>
                                    <v-text-field
                                        label="이름"
                                        name="name"
                                        prepend-icon="person"
                                        type="email"
                                        v-model.trim="name"
                                        :counter="10"
                                        :rules="nameRules"
                                        required
                                    ></v-text-field>

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
                                        required
                                    ></v-text-field>

                                    <v-text-field
                                        label="비밀번호 확인"
                                        name="password_confirm"
                                        prepend-icon="lock"
                                        type="password"
                                        :counter="20"
                                        :rules="password_confirmRules"
                                        v-model="password_confirm"
                                        required
                                    ></v-text-field>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        to="/login"
                                    >
                                        취소
                                    </v-btn>
                                    <v-btn color="primary" @click="validate">가입</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-form>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    import md5 from 'md5';

    export default {
        name: 'register',
        data: () => ({
            valid: true,
            name: '',
            nameRules: [
                v => !!v || '이름은 필수 항목입니다.',
                v => (v && v.length <= 10) || '이름은 10자이하로 입력해주세요.',
            ],
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
            password_confirm: '',
            password_confirmRules: [
                v => !!v || '비밀번호확인은 필수 항목입니다.',
                v => (v && v.length >= 6) || '비밀번호확인은 6자이상 입력해주세요.',
            ],

            usersRef: null
        }),
        methods: {
            validate() {
                if (this.$refs.form.validate()) {
                    if (this.password !== this.password_confirm) {
                        this.$alert.showAlertToWarning('비밀번호 확인', '확인 비밀번호가 다릅니다');
                        return;
                    }
                    this.doRegister();
                }
            },
            doRegister() {
                const loader = this.$common.getLoader(this);
                this.$firebase.auth()
                    .createUserWithEmailAndPassword(this.email, this.password)
                    .then(({user}) => {
                        user.updateProfile({
                            displayName: this.name,
                            photoURL: `http://www.gravatar.com/avatar/${md5(user.email)}?d=identicon`
                        }).then(async () => {
                            await this.saveUserToUsersRef(user).then(() => {
                                this.$store.dispatch('setUser', user);
                                this.$notify({
                                    group: 'active',
                                    type: 'warn',
                                    title: '알림',
                                    text: '가입 완료되었습니다. 로그인 해주세요.'
                                });
                                this.$router.replace('/login');
                            });
                        }).catch(err => {
                            this.$alert.showAlertToWarning(err.message);
                        }).finally(() => {
                            loader.hide();
                        });
                    }).catch(err => {
                    this.$alert.showAlertToWarning(err.message);
                    loader.hide();
                });
            },

            saveUserToUsersRef(user) {
                return this.usersRef.child(user.uid).set({
                    name: user.displayName,
                    avatar: user.photoURL
                });
            }
        },
        created() {
            this.usersRef = this.$firebase.database().ref('users');
        }
    };
</script>
