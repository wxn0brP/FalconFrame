import type {
	ErrorHandler,
	FinalHandler,
	ValidationErrorFormatter,
} from "./types";

export class ErrorHandlers {
	_400_formatter: ValidationErrorFormatter = err => {
		return {
			err: true,
			msg: "Bad request",
			errors: err,
		};
	};
	_404: FinalHandler = (req, res) => {
		res.end("404: File had second thoughts");
	};
	_413: FinalHandler = (req, res) => {
		res.end("413: Cat is too fat");
	};
	_408: FinalHandler = (req, res) => {
		res.end("408: The request took a nap");
	};
	_500: ErrorHandler = (err, req, res) => {
		res.end("500: The code had an existential crisis");
	};
	_500Api: ErrorHandler = (err, req, res) => {
		res.json({
			err: true,
			msg: "Internal Server Error",
		});
	};
	_404Api: FinalHandler = (req, res) => {
		res.json({
			err: true,
			msg: "Not Found",
		});
	};
	_413Api: FinalHandler = (req, res) => {
		res.json({
			err: true,
			msg: "Payload Too Large",
		});
	};
	_408Api: FinalHandler = (req, res) => {
		res.json({
			err: true,
			msg: "Request Timeout",
		});
	};

	set400Formatter(formatter: ValidationErrorFormatter) {
		this._400_formatter = formatter;
	}

	set404(handler: FinalHandler) {
		this._404 = handler;
	}

	set413(handler: FinalHandler) {
		this._413 = handler;
	}

	set408(handler: FinalHandler) {
		this._408 = handler;
	}

	set500(handler: ErrorHandler) {
		this._500 = handler;
	}

	set500Api(handler: ErrorHandler) {
		this._500Api = handler;
	}

	set404Api(handler: FinalHandler) {
		this._404Api = handler;
	}

	set413Api(handler: FinalHandler) {
		this._413Api = handler;
	}

	set408Api(handler: FinalHandler) {
		this._408Api = handler;
	}
}
