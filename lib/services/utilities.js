/**
 * Check if a string starts with the given preffix
 *
 * @param {string} str
 * @param {string} preffix
 * @return {bool} for the result  
 * @api public
 */
function startsWith(str, preffix) {
	if (str == null || preffix == null) {
		return false;
	}

	return str.substr(0, preffix.length) == preffix;
}

/**
 * Check if a string ends with the given suffix
 *
 * @param {string} str
 * @param {string} suffix
 * @return {bool} for the result  
 * @api public
 */
function endsWith(str, suffix) {
	if (str == null || suffix == null) {
		return false;
	}

	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * Expose public functions.
 */
module.exports = {
	startsWith: startsWith,
	endsWith: endsWith
};