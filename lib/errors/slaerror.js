/**
 * `SlaError` error.
 *
 * @constructor
 * @api private
 */
function SlaError(message, status) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'SlaError';
  this.message = message;
  this.status = status || 401;
}

// Inherit from `Error`.
SlaError.prototype.__proto__ = Error.prototype;


// Expose constructor.
module.exports = SlaError;