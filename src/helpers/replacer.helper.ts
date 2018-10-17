export class ReplacerHelper {
    static replaceError(key: string, value: any) {
        if (value instanceof Error) {
            const error: any = {};

            Object.getOwnPropertyNames(value).forEach((k) => {
                error[k] = (<any>value)[k];
            });

            return error;
        }

        return value;
    }
}