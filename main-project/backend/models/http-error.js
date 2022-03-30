class HttpError extends Error {
    constructor(message, errorCode) {
        super(message); // super() calls constructor of the base class and adds a message property
        this.code = errorCode; // adds code property
    }
}

module.exports = HttpError;