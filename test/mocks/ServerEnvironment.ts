import ServerStorage from "../../src/storage/ServerStorage";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { fhirclient } from "../../src/types";

export default class ServerEnvironment implements fhirclient.Adapter
{
    request: any;

    response: any;

    storage: any;

    options: any;

    constructor(request?: any, response?: any, storage?: any)
    {
        this.request  = request;
        this.response = response;

        if (storage) {
            if (typeof storage == "function") {
                this.storage = storage(request, response);
            } else {
                this.storage = storage;
            }
        } else {
            this.storage = new ServerStorage(this.request);
        }
    }

    getUrl()
    {
        const req = this.request;
        const host = req.headers["x-forwarded-host"] || req.headers.host;
        const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
        // if (!host) {
        //     const addr = req.socket.address() as AddressInfo;
        //     host = addr.address.replace("::1", "localhost");
        //     if ((addr.port != 80  && req.protocol == "http") ||
        //         (addr.port != 443 && req.protocol == "https"))
        //     {
        //         host += ":" + addr.port;
        //     }
        // }
        return new URL(req.originalUrl || req.path || req.url, protocol + "://" + host);
    }

    redirect(location: string)
    {
        this.response.writeHead(302, { location });
        this.response.end();
    }

    getStorage()
    {
        return this.storage;
    }

    relative(url: string)
    {
        return new URL(url, this.getUrl()).href;
    }

    btoa(str: string): string
    {
        return Buffer.from(str).toString("base64");
    }

    atob(str: string): string
    {
        return Buffer.from(str, "base64").toString("ascii");
    }

    getAbortController()
    {
        return AbortController;
    }

    getSmartApi(): any
    {
        return false;
    }
}
