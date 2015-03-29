'use strict';

/**
 * Creates an empty instance of a DataBlock.
 *
 * @constructor
 * @param {Integer} blockNum
 * @returns {DataBlock}
 */
function DataBlock(blockNum) {
    this.data = "";
    this.blockNum = blockNum;
};

/**
 * Returns the Data of the DataBlock.
 *
 * @returns {String}
 */
DataBlock.prototype.getData = function() {
    return this.data;
};

/**
 * Returns the String Representation of the DataBlock.
 * 
 * @returns {String}
 */
DataBlock.prototype.toDisplay = function() {
    return this.data;
};

/**
 * Returns the hexdump for the datablock.
 * 
 * @returns {String}
 */
DataBlock.prototype.hexDump = function() {
    return this.data;
};
