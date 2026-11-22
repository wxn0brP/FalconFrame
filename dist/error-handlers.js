export class ErrorHandlers {
    _400_formatter = err => {
        return {
            err: true,
            msg: "Bad request",
            errors: err,
        };
    };
    _404 = (req, res) => {
        res.end("404: File had second thoughts");
    };
    _413 = (req, res) => {
        res.end("413: Cat is too fat");
    };
    _408 = (req, res) => {
        res.end("408: The request took a nap");
    };
    _500 = (err, req, res) => {
        res.end("500: The code had an existential crisis");
    };
    _500Api = (err, req, res) => {
        res.json({
            err: true,
            msg: "Internal Server Error",
        });
    };
    _404Api = (req, res) => {
        res.json({
            err: true,
            msg: "Not Found",
        });
    };
    _413Api = (req, res) => {
        res.json({
            err: true,
            msg: "Payload Too Large",
        });
    };
    _408Api = (req, res) => {
        res.json({
            err: true,
            msg: "Request Timeout",
        });
    };
    set400Formatter(formatter) {
        this._400_formatter = formatter;
    }
    set404(handler) {
        this._404 = handler;
    }
    set413(handler) {
        this._413 = handler;
    }
    set408(handler) {
        this._408 = handler;
    }
    set500(handler) {
        this._500 = handler;
    }
    set500Api(handler) {
        this._500Api = handler;
    }
    set404Api(handler) {
        this._404Api = handler;
    }
    set413Api(handler) {
        this._413Api = handler;
    }
    set408Api(handler) {
        this._408Api = handler;
    }
}
