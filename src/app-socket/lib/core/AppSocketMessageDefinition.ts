import type { SubscribeOptions, PublishOptions } from '@/app-socket/lib/core/types';

type SocketSubscribeTypeDescriptor<T extends {
    destination: string;
    options: SubscribeOptions;
}> = {
    destination: T['destination'];
    options: T['options'];
}

type SocketSubscribeDefinition<T extends Record<string, any> = any> = {
    destination: string;
    payload: T;
    options: SubscribeOptions;
}

type SocketPublishDefinition<T extends Record<string, unknown> = Record<string, unknown>> = {
    destination: string;
    options: PublishOptions;
    payload: T;
}

type SocketSubscriptionCreatorFn<T extends SocketSubscribeDefinition> = ((payload: T['payload']) => T) & SocketSubscribeTypeDescriptor<T>;

function createSubscribeDefinition<P = void, T extends string = string>(destination: T, options: SubscribeOptions = {}) {
    const payloadWrapper = (payload: P) => ({ payload, options, destination });
    payloadWrapper.destination = destination;
    payloadWrapper.options = options;

    return payloadWrapper;
}

function createPublishDefinition<P = void, T extends string = string>(destination: T, options: PublishOptions = {}) {
    return (payload: P) => {
        return {
            payload,
            destination,
            options,
        };
    };
}

export {
    SocketSubscriptionCreatorFn,
    SocketSubscribeDefinition,
    SocketSubscribeTypeDescriptor,
    createSubscribeDefinition,
    createPublishDefinition,
    SocketPublishDefinition
};
