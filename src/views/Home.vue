<template>
    <v-card
        class="mx-auto"
        max-width="500"
    >
        <v-card-title>
            <v-icon
                large
                left
            >
                insert_emoticon
            </v-icon>
            <span class="title font-weight-light">TODO..</span>
        </v-card-title>

        <v-card-text class="headline font-weight-bold">
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>1. 여러채널 클릭 시 로딩 중첩 됨.</v-list-item-title>
                    <v-list-item-title>2. 호기) 채팅 2번 적용 됨.</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'Home'
    };
</script>
