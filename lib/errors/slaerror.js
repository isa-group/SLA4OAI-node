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
  this.message = 'Your SLA do not allow this action. Details: ' + message;
  this.status = status || 500;
}

// Inherit from `Error`.
SlaError.prototype.__proto__ = Error.prototype;


// Expose constructor.
module.exports = SlaError;