/**
 * Consoler Constructor
 *
 * @param {Object} options
 * @api public
 */
function Consoler(message, color) {
  this.color = color || 'black';
  this.message = message;
}

/**
 * Start Consoler
 *
 * @param {Function} callback
 * @api public
 */
Consoler.prototype.start = function (callback) {
  console.log(this.message);
  callback();
};

/**
 * Stop Consoler
 *
 * @param {Function} callback
 * @api public
 */
Consoler.prototype.stop = function (callback) {
  callback();
};

/**
 * Interrupt Consoler
 *
 * @param {Function} callback
 * @api public
 */
Consoler.prototype.interrupt = function (callback) {
  callback();
};

module.exports = Consoler;
