import type {
    SocketPublishDefinition,
    SocketSubscribeDefinition,
    SocketSubscriptionCreatorFn,
} from '@/app-socket/lib/core/AppSocketMessageDefinition';
import type {
    SocketSubscribeCallback,
    AppSocket,
    AppSocketTransport,
    CreateAppSocketOptions,
    OnConnectSocketCallback,
    AppSocketSubscription,
    UserProvidedAppSocketOptions, SubscribeOptions, PublishOptions, OnDisconnectSocketCallback,
} from '@/app-socket/lib/core/types';
import AppSocketConfigurator from '@/app-socket/lib/core/AppSocketConfigurator';

const defaultCreateOptions: Pick<CreateAppSocketOptions, 'connectTimeout'|'authenticationHeaders'> = {
    connectTimeout: 15,
    authenticationHeaders: {},
};

type connectParameterTypeFromTransport<Type extends AppSocketTransport<any>> = Type extends AppSocketTransport<infer X> ? X : never

export default function createAppSocket<
    IN extends string = string,
    OUT extends string = string,
    T extends AppSocketTransport<any> = AppSocketTransport<any>
>(options: UserProvidedAppSocketOptions<T>): AppSocket<IN, OUT, connectParameterTypeFromTransport<typeof options['transport']>> {
    const transport = options.transport;

    const resolvedOptions: CreateAppSocketOptions = Object.assign({}, defaultCreateOptions, options);

    transport.initializeClient(resolvedOptions);

    return createSocketFromTransport(transport, resolvedOptions);
}

function createSocketFromTransport<
    IN extends string,
    OUT extends string,
    ConRes = any
>(transport: AppSocketTransport<any>, options: CreateAppSocketOptions): AppSocket<IN, OUT, ConRes> {
    let socketId: string | null = null;

    const socket: AppSocket<IN, OUT, ConRes> = {
        connected: false,
        assignId: (id) => {
            socketId = id;
        },
        getTransport: () => transport,
        useSocket: async () => {
            if (socket.connected) {
                return socket;
            }

            await socket.connectAsync();

            return socket;
        },
        onDisconnect: (callback: OnDisconnectSocketCallback) => {
            transport.onDisconnect(callback);
        },
        isConnected: () => transport.isConnected(),
        connect: (onConnected: OnConnectSocketCallback<ConRes> = () => {}) => {
            transport.connect(async (response) => {
                const callbackResponse = onConnected(response);
                if (callbackResponse instanceof Promise) await callbackResponse;

                socket.connected = true;
            });
        },
        configure: (callback: (socket: AppSocketConfigurator<ConRes>) => void) => {
            callback(new AppSocketConfigurator<ConRes>(socket));
            return socket;
        },
        connectAsync: () => {
            return new Promise((resolve, reject) => {
                let timeout: number | null;
                if (options.connectTimeout !== null) {
                    timeout = window.setTimeout(async () => {
                        reject();
                        await socket.disconnect();
                        throw new Error('Connecting to websocket failed.');
                    }, 15 * 1000);
                } else {
                    timeout = null;
                }

                socket.connect((resp) => {
                    if (timeout) window.clearTimeout(timeout);
                    resolve(resp);
                });
            });
        },
        disconnect: () => {
            socket.connected = false;
            return transport.disconnect();
        },
        subscribe<T extends SocketSubscribeDefinition>(subscription: SocketSubscriptionCreatorFn<T> | IN, handler: SocketSubscribeCallback, options: SubscribeOptions = {}) {
            const resolvedOptions = typeof subscription === 'string' ? options : Object.assign({}, subscription.options, options);

            let resolvedDestination = typeof subscription === 'string' ? subscription : subscription.destination;

            if (resolvedOptions.unique) {
                if (!socketId) console.error('Using a unique subscribe on a socket without an ID. Use [assignId] to assign one or disable the option');

                resolvedDestination = '/' + socketId + resolvedDestination;
            }

            const transportSubscribe: any = transport.subscribe(resolvedDestination, handler, resolvedOptions);
            transportSubscribe.destination = resolvedDestination;

            return transportSubscribe as AppSocketSubscription;
        },
        publish<T extends Record<string, unknown> = Record<string, unknown>>(destination: OUT | SocketPublishDefinition<T>, body?: Record<string, unknown>, options?: PublishOptions) {
            const resolvedOptions = typeof destination === 'string' ? options : Object.assign({}, destination.options, options);
            const dest = typeof destination === 'string' ? destination : destination.destination;
            const payload = typeof destination === 'string' ? body || {} : destination.payload;

            return transport.publish(dest, payload, resolvedOptions);
        },
        unsubscribe: transport.unsubscribe.bind(transport),
        getTransportOptions: () => {
            return options;
        }
    };

    return socket;
}


