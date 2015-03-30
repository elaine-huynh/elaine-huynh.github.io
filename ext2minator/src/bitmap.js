'use strict';

var typeFile = 1;
var typeDirectory = 2;
var typeReserved = 3;
var pageSize = 1024;

/**
 * Creates an instance of a Bitmap given the number of bits.
 *
 * @constructor
 * @param {Integer} size
 * @returns {Bitmap}
 */
function Bitmap(size) {
    this.map = [];
    for (var i = 0; i < size; i++) {
        this.map[i] = 0;
    };
    this.available = size;
};

/**
 * Finds and returns the first unallocated bit in the Bitmap.
 *
 * @returns {Integer} i
 */
Bitmap.prototype.findUnallocatedBit = function() {
    for (var i = 0; i < this.map.length; i++) {
        if (this.map[i] === 0)
            return i;
    }
};

/**
 * Toggles the given bit in the Bitmap to 1 and modifies the SuperBlock.
 * @param {Integer} bit
 * @returns {undefined}
 */
Bitmap.prototype.allocateBit = function(bit) {
    this.map[bit] = 1;
    this.available--;
    // Modify the superblock
};

/**
 * Toggles the given bit in the Bitmap to 0 and modifies the SuperBlock.
 * @param {Integer} bit
 * @returns {undefined}
 */
Bitmap.prototype.unallocateBit = function(bit) {
    this.map[bit] = 0;
    // Modify the superblock
    this.available++;
};

Bitmap.prototype.display = function(){
    var returnString = "";

    for (var i = 0; i < this.map.length; i++) {
        if (i % 4 === 0)
            returnString += " ";
        returnString += this.map[i];
    }
    return returnString;
};
