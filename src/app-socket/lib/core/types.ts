import type {
    SocketSubscriptionCreatorFn,
    SocketSubscribeDefinition,
    SocketPublishDefinition,
    SocketSubscribeTypeDescriptor
} from '@/app-socket/lib/core/AppSocketMessageDefinition';
import type AppSocketConfigurator from '@/app-socket/lib/core/AppSocketConfigurator';

interface AppSocketImplementation<IN extends string = string, OUT extends string = string, ConRes = any> {
    connect(onConnected?: OnConnectSocketCallback<ConRes>): void
    disconnect(): Promise<void>
    isConnected: () => boolean;
    onDisconnect(callback: OnDisconnectSocketCallback): void
    unsubscribe(subscriptionId: string) : void;
    subscribe(destination: IN, callback: SocketSubscribeCallback, options?: SubscribeOptions) : SocketTransportSubscription
    publish(destination: OUT, body?: Record<string, unknown>, options?: PublishOptions): void
}

interface AppSocketTransport<ConRes> extends AppSocketImplementation<string, string, ConRes> {
    initializeClient(options: SocketTransportOptions): void
}

interface AppSocket<IN extends string = string, OUT extends string = string, ConRes = any> extends AppSocketImplementation<IN, OUT, ConRes> {
    connected: boolean;
    configure: (callback: (socket: AppSocketConfigurator<ConRes>) => void) => AppSocket<IN, OUT, ConRes>,
    onDisconnect: (callback: OnDisconnectSocketCallback) => void,
    assignId: (id: string) => void;
    getTransport(): AppSocketTransport<any>,
    connectAsync(): Promise<unknown>;
    useSocket: () => Promise<AppSocket<IN, OUT, ConRes>>;
    isConnected: () => boolean;
    getTransportOptions: () => SocketTransportOptions;
    subscribe(destination: IN, callback: SocketSubscribeCallback, options?: SubscribeOptions) : AppSocketSubscription;
    subscribe<T extends SocketSubscribeDefinition>(subscription: SocketSubscriptionCreatorFn<T>, handler: SocketSubscribeCallback<ReturnType<typeof subscription>['payload']>, options?: SubscribeOptions): AppSocketSubscription;
    publish(destination: OUT, body?: Record<string, unknown>, options?: PublishOptions): void;
    publish<T extends Record<string, unknown> = Record<string, unknown>>(message: SocketPublishDefinition<T>): void;
}

interface SocketTransportOptions {
    url: string,
    debug?: boolean,
    authenticationHeaders?: SocketHeaders
}

interface CreateAppSocketOptions<T = any> extends SocketTransportOptions {
    transport: AppSocketTransport<T>,
    connectTimeout: number|null,
}

interface UserProvidedAppSocketOptions<T extends AppSocketTransport<any> = AppSocketTransport<any>> extends SocketTransportOptions {
    transport: T,
    connectTimeout?: number|null,
}

interface SocketTransportSubscription {
    id: string;
    unsubscribe: (headers?: SocketHeaders) => void;
}

interface AppSocketSubscription extends SocketTransportSubscription {
    destination: string
}

interface SubscribeOptions {
    id?: string;
    unique?: boolean;
    headers?: SocketHeaders
}

interface PublishOptions {
    headers?: SocketHeaders
}

type SocketHeaders = Record<string, any>;

interface AppSocketSubscriptionResponse<T extends Record<string, unknown> = Record<string, unknown>> {
    ack: (headers?: SocketHeaders) => void;
    nack: (headers?: SocketHeaders) => void;
    headers: SocketHeaders;
    readonly body: T;
    readonly rawBody: string;
}

type SocketSubscribeCallback<T extends Record<string, unknown> = Record<string, unknown>> = (response: AppSocketSubscriptionResponse<T>) => void
type DisconnectSocketCallback = () => void
type OnConnectSocketCallback<C = any> = (response: C) => unknown
type OnDisconnectSocketCallback = () => unknown

export type {
    AppSocketImplementation,
    AppSocket,
    AppSocketTransport,
    SocketTransportOptions,
    CreateAppSocketOptions,
    SocketHeaders,
    AppSocketSubscriptionResponse,
    SocketSubscribeCallback,
    DisconnectSocketCallback,
    OnConnectSocketCallback,
    OnDisconnectSocketCallback,
    AppSocketSubscription,
    SocketTransportSubscription,
    UserProvidedAppSocketOptions,
    SubscribeOptions,
    PublishOptions
};
