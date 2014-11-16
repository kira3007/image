// composite

var exec = require('child_process').exec;
var utils = require('gm/lib/utils');

/**
 * Composite images together using the `composite` command in graphicsmagick.
 *
 * gm('/path/to/image.jpg')
 * .composite('/path/to/second_image.jpg')
 * .geometry('+100+150')
 * .write('/path/to/composite.png', function(err) {
 *   if(!err) console.log("Written composite image.");
 * });
 *
 * @param {String} other  Path to the image that contains the changes.
 * @param {String} [operator] Path to the image with opacity informtion. Grayscale.
 */

module.exports = exports = function(proto) {
    proto.sub = function(other) {
        this.in(other);

        // If the operator is defined, add it to the output.
        //if(typeof operator !== "undefined"){
            this.out('-compose');
            this.out('Subtract');
        //}

        this.subCommand("composite");

        return this;
    }
}
