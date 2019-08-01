<template>
    <v-container fluid
                 fill-height
                 class="justify-sm-start align-start"
    >
        <v-layout>
            <v-flex xs12 lg6>
                <v-card
                    tile
                    light
                    color="#fff"
                    max-width="800"
                >
                    <v-card-title>
                        <v-icon
                            large
                            left
                            color="black"
                        >
                            bug_report
                        </v-icon>
                        <span class="title">BUG LIST..</span>
                    </v-card-title>

                    <v-card-text class="headline font-weight-bold">
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title class="d-flex align-center">
                                    <v-chip color="deep-blue"
                                            class="mr-3 white--text"
                                    >1</v-chip>
                                    여러채널 클릭 시 로딩 중첩 됨.
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title class="d-flex align-center">
                                    <v-chip color="deep-blue"
                                            class="mr-3 white--text"
                                    >2</v-chip>
                                    호기) 채팅 2번 적용 됨.
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    export default {
        name: 'Home'
    };
</script>
