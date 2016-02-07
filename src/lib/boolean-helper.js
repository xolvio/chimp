module.exports = {
  isTruthy(variable) {
    return variable && variable !== 'false' && variable !== '';
  },
  isFalsey(variable) {
    return !variable || variable === 'false' || variable === '';
  },
};
