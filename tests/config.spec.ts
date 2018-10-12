import os from "os";
import { GraylogConfig, IGraylogConfig } from "../src/models/config.model";
let graylogConfig: IGraylogConfig;
const hostname: string = os.hostname();
const bufferSize = 1400;

describe("Graylog Config object tests", () => {

    beforeEach(() => {
        graylogConfig = new GraylogConfig();
    });

    test("graylog config instance should not be null", () => {
        expect(graylogConfig).not.toBeNull();
    });

    it("should have the minimum valid servers list", () => {
        expect(graylogConfig.servers).not.toBeNull();
    });

    it("should have the default deflate option", () => {
        expect(graylogConfig.deflate).toBe("optimal");
    });

    it("should have the default hostname", () => {
        expect(graylogConfig.hostname).toBe(hostname);
    });

    it("should have the default bufferSize", () => {
        expect(graylogConfig.bufferSize).toBe(bufferSize);
    });
});