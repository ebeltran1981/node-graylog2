import { Graylog } from "../src";
import { GraylogMessage } from "../src/models/message.model";
let graylog: Graylog;

/**
 * Since Graylog communication is UDP there is not real way to confirm
 * a message was received, besides making sure is not throwing an error
 */
describe("Graylog object tests", () => {

    beforeEach(() => {
        graylog = new Graylog();
    });

    test("graylog instance should not be null", () => {
        expect(graylog).not.toBeNull();
    });

    it("should have a valid config file", () => {
        expect(graylog.config).not.toBeNull();
    });

    it("should have at least one server", () => {
        expect(graylog.config.servers).not.toBeNull();
    });

    it("should send an emergency log", () => {
        const message = new GraylogMessage({
            short_message: "Sup!",
            full_message: "What's it is up?"
        });
        const error = new Error("Hi, I am an error");
        expect(graylog.emergency(message, error)).toBeUndefined();
    });

    it("should send an info log", () => {
        const message = new GraylogMessage({
            short_message: "Sup!",
            full_message: "What's it is up?"
        });
        expect(graylog.info(message)).toBeUndefined();
    });

    it("should send an debug log with additional info", () => {
        const message = new GraylogMessage({
            short_message: "Sup!",
            full_message: "What's it is up?"
        });
        const error = new Error("Hi, I am an error");
        expect(graylog.debug(message, error, { _test: "hi, I am an additional field" })).toBeUndefined();
    });
});