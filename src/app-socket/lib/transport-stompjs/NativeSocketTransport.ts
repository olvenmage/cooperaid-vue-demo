import type {
    OnConnectSocketCallback,
    SocketSubscribeCallback,
    SocketTransportSubscription,
    AppSocketTransport,
    SocketTransportOptions, PublishOptions, SubscribeOptions, OnDisconnectSocketCallback
} from '@/app-socket/lib/core/types';

type Listener = {
    id: string,
    callback: (payload: any) => void
}

export default class NativeSocketTransport implements AppSocketTransport<Event> {
    private webSocket: WebSocket|null = null;
    private onNextConnectCallbacks: OnConnectSocketCallback[] = [];
    private onDisconnectSocketCallbacks: OnDisconnectSocketCallback[] = [];

    private listeners: Record<string, Listener[]> = {};
    private url: string|null = null

    initializeClient(options: SocketTransportOptions) {
        this.url = options.url
    }

    publish(destination: string, body = {}, options: PublishOptions = {}): void {
        this.webSocket?.send(
            `${destination}\t${JSON.stringify(body)}`
        )
    }

    connect(onConnected: OnConnectSocketCallback<Event> = () => {}): void {
        if (!this.url) {return}
        this.webSocket = new WebSocket(this.url);

        this.webSocket.onmessage = (ev: MessageEvent) => {
            const data = ev.data;

            const parts = data.split("\t");
            const name = parts[0];
            const payload = JSON.parse(parts[1]);

            if (this.listeners[name]) {
                this.listeners[name].forEach((listener) => listener.callback({
                    body: payload
                }))
            }
        }

        this.webSocket.onopen = (event: Event) => {
            this.onNextConnectCallbacks.forEach((cb) => cb(event));
            this.onNextConnectCallbacks = [];
        };

        this.webSocket.onclose = (frame: CloseEvent) => {
            this.onDisconnectSocketCallbacks.forEach((cb) => cb());
        };
    }

    onDisconnect(callback: () => void) {
        this.onDisconnectSocketCallbacks.push(callback);
    }

    isConnected(): boolean {
        return this.webSocket?.OPEN != 0 || false
    }

    async disconnect(): Promise<void> {
        await this.webSocket?.close()
    }

    unsubscribe(subscriptionId: string) {
        Object.values(this.listeners).forEach((destination: Listener[]) => {
            const index = destination.findIndex((it) => it.id == subscriptionId)

            if (index != -1) {
                destination.splice(index, 1)
            }
        })
      
    }

    subscribe(destination: string, callback: SocketSubscribeCallback, options: SubscribeOptions): SocketTransportSubscription {
        if (!this.listeners[destination]) {
            this.listeners[destination] = [];
        }

        const id = destination + Math.random().toString(16).slice(2);

        this.listeners[destination].push({
            id,
            callback
        })
        
        return {
            id: destination + Math.random().toString(16).slice(2),
            unsubscribe: () => {
                this.unsubscribe(id);
               
            }
        }
    }

}
