<template>
    <span
        class="fa fa-duotone fa-fw"
        title="Socket verbinding"
        style="font-size: 30px;"
        :class="{'text-success fa-signal': connected, 'text-danger fa-signal-slash': !connected}"
    />
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';
import useFastfoodSocket from '@/app-socket/implementation/fastfood/FastfoodSocket';
import { AppSocket } from '@/app-socket/lib/core/types';

@Component
export default class FastfoodSocketConnectedStatus extends Vue {
    connected = false;

    intervalId = 0;
    socket: AppSocket|null = null;

    mounted() {
        this.validateSocket();

        window.setInterval(() => this.validateSocket(), 2000);
    }

    async validateSocket() {
        if (!this.socket) {
            await useFastfoodSocket((socket) => {
                this.socket = socket;
                this.validateSocket();
            });

            this.connected = false;
            return;
        }

        try {
            this.connected = this.socket.isConnected();
        } catch (e) {
            this.connected = false;
        }
    }

    beforeDestroy() {
        window.clearInterval(this.intervalId);
    }
}
</script>
