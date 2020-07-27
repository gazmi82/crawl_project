import { Logger } from './Logger';
export default class ConfigValidator {
    private schema;
    private schemaStore;
    private ajv;
    private validator;
    logger: Logger;
    constructor(schema: any, logger?: Logger);
    private loadSpecs;
    validate(config: any): void;
    private derefSchema;
    private checkForUnkownKeys;
    private logErrors;
    private getErrorMessage;
    private logSubErrors;
}
