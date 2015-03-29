'use strict';

/**
 * Creates an instance of a FileData type DataBlock.
 *
 * @constructor
 * @extends DataBlock
 * @param {Integer} blockNum
 * @param {String} data
 * @returns {FileData}
 */
function FileData(blockNum, data) {
    this.data = data;
    this.blockNum = blockNum;
};

FileData.prototype = Object.create(DataBlock.prototype);

/**
 * Returns the hexdump for the entire datablock.
 * 
 * @returns {String}
 */
FileData.prototype.hexDump = function() {
    var returnString = "";
	for(var i=0;i<this.data.length;i++) {
		returnString += '' + this.data.charCodeAt(i).toString(16);
	}
	while (returnString.length < 2048){
		returnString += '00';
	}
    return returnString;
};