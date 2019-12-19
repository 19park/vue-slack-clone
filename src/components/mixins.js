export default {
    methods: {
        doNotify(text = '') {
            this.$notify({
                group: 'active',
                type: 'success',
                title: '알림',
                text: text
            });
        },

        doPushSubmit(body = "알림") {
            const token = window.localStorage.getItem('myToken');
            if (!token) return;
            const message = {
                notification: {
                    title: "하니챗",
                    body,
                    icon: "favicon.ico",
                    click_action: `${location.protocol}//${location.host}`,
                },
                to: token
            };
            fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                body: JSON.stringify(message),
                headers: new Headers({
                    'Content-type': 'application/json',
                    'Authorization': `key=${process.env.VUE_APP_FB_API_KEY}`
                })
            }).then(response => {
                if (response.status < 200 || response.status >= 400) {
                    // console.log('Error subscribing to topic: ' + response.status + ' - ' + response.text());
                }
            }).catch((err) => {
                if (err) this.$alert.showCommonAlert(JSON.stringify(err));
            })
        },

        handleNotifications(channelId, currentChannelId, notifCount, snap) {
            let lastTotal = 0;
            let idx = notifCount.findIndex(el => el.id === channelId);

            if (idx !== -1) {
                if (channelId !== currentChannelId) {
                    lastTotal = notifCount[idx].total;

                    if (snap.numChildren() - lastTotal > 0) {
                        if (notifCount[idx].notif !== snap.numChildren() - lastTotal) {
                            this.doNotify(`메시지가 도착했습니다. [[${snap.numChildren() - lastTotal}]]`);
                            this.doPushSubmit('메시지가 도착했습니다.');
                        }
                        notifCount[idx].notif = snap.numChildren() - lastTotal;
                    }
                }
                notifCount[idx].lastKnownTotal = snap.numChildren();
            } else {
                notifCount.push({
                    id: channelId,
                    total: snap.numChildren(),
                    lastKnownTotal: snap.numChildren(),
                    notif: 0
                });
            }
        },
    }
};
