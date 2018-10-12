import { IGraylogMessage, GraylogMessage } from "../src/models/message.model";
let graylogMessage: IGraylogMessage;
const testShortMessage = "Short Message";
const testFullMessage = "Full Message";
const testRandomField = "Hi There!";

describe("Graylog Message object tests", () => {

    beforeEach(() => {
        graylogMessage = new GraylogMessage({
            short_message: testShortMessage,
            full_message: testFullMessage,
            test_random_field: testRandomField
        });
    });

    test("graylog message instance should not be null", () => {
        expect(graylogMessage).not.toBeNull();
    });

    it("should have the short message", () => {
        expect(graylogMessage.short_message).toBe(testShortMessage);
    });

    it("should have the full message", () => {
        expect(graylogMessage.full_message).toBe(testFullMessage);
    });

    it("should have a random field", () => {
        expect(graylogMessage.test_random_field).toBe(testRandomField);
    });
});