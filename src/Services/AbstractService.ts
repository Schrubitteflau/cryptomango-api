import EventEmitter from "events";

export abstract class AbstractService extends EventEmitter
{
    protected constructor
    (
        protected readonly _serviceName: string
    )
    {
        super();
    }
}
