import Logger from './Logger';
import Context from './Context';
import { OutputData } from './models';
declare type FileNameBuilder = (data: any, context: Context) => string;
/**
 * Saves the output data to JSON Files.
 */
export declare class JsonFileWriter {
    logger: Logger;
    private fileNameBuilder?;
    private outDirPath;
    /**
     * Creates are new JsonFileWriter.
     * @param outDir The path to the directory, relative to executed script, defaults to  `'output'`
     * @param logger An optional logger, which will log 'Saving file + path' in green color.
     * @param fileNameBuilder A custom callback for building the filename, which will be called during `saveFile()` - allows to implement dynamic filenames.
     */
    constructor(outDir?: string, logger?: Logger, fileNameBuilder?: FileNameBuilder);
    /**
     * Ensures that the output directory exists. Attempts to create it if lacking.
     */
    ensureOutDir(callback: any): void;
    setCrawlerMetainfo(data: OutputData): OutputData;
    /**
     * Saves to the data to a json file.
     * @param data output data to save
     * @param context
     * @param callback
     */
    saveFile(data: OutputData, context: Context, callback: any): void;
    protected buildFilename(data: OutputData, context: Context): string;
}
export {};
