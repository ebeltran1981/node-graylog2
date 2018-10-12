import { IGraylogConfigServer, GraylogConfigServer } from "../src/models/config.model";
let graylogConfigServer: IGraylogConfigServer;
const host = "127.0.0.1";
const port = 12201;

describe("Graylog Config Server object tests", () => {

    beforeEach(() => {
        graylogConfigServer = new GraylogConfigServer();
    });

    test("graylog config server instance should not be null", () => {
        expect(graylogConfigServer).not.toBeNull();
    });

    it("should have the default server values", () => {
        expect(graylogConfigServer.host).toBe(host);
        expect(graylogConfigServer.port).toBe(port);
    });
});