module.exports = function () {
    this.Given(/^global pending is defined$/, function() {
        pending();
    });
};