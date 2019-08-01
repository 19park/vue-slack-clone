export default {
    methods: {
        handleNotifications(channelId, currentChannelId, notifCount, snap) {
            let lastTotal = 0;
            let idx = notifCount.findIndex(el => el.id === channelId);

            if (idx !== -1) {
                if (channelId !== currentChannelId) {
                    lastTotal = notifCount[idx].total;

                    if (snap.numChildren() - lastTotal > 0) {
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
}
