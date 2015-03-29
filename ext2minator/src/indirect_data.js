'use strict';

/**
 * Creates an instance of a IndirectData type DataBlock.
 *
 * @constructor
 * @extends DataBlock
 * @param {Integer} blockNum
 * @returns {IndirectData}
 */
function IndirectData(blockNum) {
    this.data = [];
    this.blockNum = blockNum;
};

IndirectData.prototype = Object.create(DataBlock.prototype);

/**
 * Returns the data of a directory.
 *
 * @returns {Array}
 */
IndirectData.prototype.getData = function() {
    return this.data;
};

/**
 * Sets the nth  entry in the indirect pointer to blockNumber
 *
 * @param {Integer} n
 * @param {Integer} blockNumber
 * @returns {null}
 */
IndirectData.prototype.setEntry = function(n, blockNumber) {
    this.data[n] = blockNumber;
};

/**
 * Gets the nth entry in the indirect pointer.
 *
 * @param {Integer} n
 * @returns {null}
 */
IndirectData.prototype.getEntry = function(n) {
    return this.data[n];
};

/*
 * From: http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
 * (I was too lazy to write my own padding function.)
 * 
 * @param {type} number
 * @param {type} digits
 * @returns {String}
 */
function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

/**
 * Returns the Data of the DataBlock.
 * 
 * @returns {String}
 */
IndirectData.prototype.toDisplay = function() {
    var returnString = "";
    for (var i = 0; i < this.data.length; i++){
        returnString += padDigits(this.getEntry(i), 4) + " ";
    };
    return returnString;
};

IndirectData.prototype.hexDump = function() {
    var returnString = "";
	for(var i=0; i<this.data.length; i++) {
		returnString += hexNumFour(this.data[i].toString(16));
	}
	while (returnString.length < 2048){
		returnString += '00';
	}
    return returnString;
};
