import type { AppSocket } from '@/app-socket/lib/core/types';

export default class AppSocketConfigurator<U> {
    constructor(private socket: AppSocket<string, string, U>) {
    }

    addConnectMiddleware(callback: (connectResponse: U, complete: () => void) => unknown) {
        const baseConnect = this.socket.connect;

        this.socket.connect = (onConnected) => {
            baseConnect((connectResponse) => {
                return new Promise((resolve) => {
                    callback(connectResponse, () => {
                        if (onConnected) onConnected(connectResponse);
                        resolve(connectResponse);
                    });
                });
            });
        };
    }

    enableAutomaticReconnecting() {
        this.socket.onDisconnect(async () => {
            if (this.socket.getTransportOptions().debug) {
                console.log('AppSocket : SOCKET DISCONNECTED! --- AUTOMATICALLY RECONNECTING...');
            }

            window.setTimeout(async () => {
                await this.socket.connectAsync();

                if (this.socket.getTransportOptions().debug) {
                    console.log('AppSocket : RECONNECTED!');
                }
            }, 400);
        });
    }
}
