'use strict';

/**
 * Creates an instance of a DirectoryData type DataBlock.
 *
 * @constructor
 * @extends DataBlock
 * @param {Integer} blockNum
 * @returns {DirectoryData}
 */
function DirectoryData(blockNum) {
    this.data = [];
	this.hexData = [];
    this.blockNum = blockNum;
};

DirectoryData.prototype = Object.create(DataBlock.prototype);

/**
 * Returns the data of a directory.
 *
 * @returns {Array}
 */
DirectoryData.prototype.getData = function() {
    return this.data;
};

/**
 * Returns the data of a directory in the form of nested arrays.
 *
 * @returns {Array}
 */
DirectoryData.prototype.getDirectoryData = function(){
    return this.data;
};

/**
 * Adds an entry to the directory datablock. FileType is 2 for directory, 1 for file.
 *
 * @param {String} name
 * @param {Integer} node
  * @param {Integer} fileType
 * @returns {null}
 */
DirectoryData.prototype.add = function(name, node, fileType) {
    this.data.push([name, node]);
	var len = 1024 - this.hexLength();
	var hexForm = this.toHex(name, node, fileType, len);
	this.hexData.push([name, node, hexForm, true]);
	//Now decrease the length of the first undeleted entry before the new one.
	if (this.hexData.length > 1){
		var prevLength = 0;
		var i = this.hexData.length - 2;
		while (this.hexData[i][3] == false){
			prevLength += (this.hexData[i][3].length)/2;
			i-= 1;
		}
		this.hexData[i][2] = this.toHex(this.hexData[i][0], this.hexData[i][1], parseInt(this.hexData[i][2].charAt(15)), ((this.hexData[i][2].length)/2) + prevLength);
	}

};

/**
 * Creates a little-endian hexDump datablock entry with a length "len" to the next entry.
 *
 * @param {String} name
 * @param {Integer} node
  * @param {Integer} fileType
 * @returns {String}
 */
DirectoryData.prototype.toHex = function(name, node, fileType, len) {

	var hexNode = "";
	if (node < 16)
		hexNode = "0" + hexNode;
	hexNode += node.toString(16) + "000000";
	var hexLen =  len.toString(16);
	if (hexLen.length == 1 || hexLen.length == 3)
        hexLen = "0" + hexLen;
	if (hexLen.length < 4)
		hexLen = "00" + hexLen;
	hexLen = hexLen.substring(2, 4) + hexLen.substring(0, 2);
	var hexNameLen = name.length.toString(16);
	if (hexNameLen.length == 1)
		hexNameLen = "0" + hexNameLen
	var hexFileType = 	"0" + fileType.toString();
	var hexName = "";
	for(var i=0;i<name.length;i++) {
		hexName += '' + name.charCodeAt(i).toString(16);
	}
	while(hexName.length < 8){
		hexName = hexName + "00";
	}
	return (hexNode +  hexLen + hexNameLen + hexFileType + hexName);


};

/**
 * Removes an entry from the directory datablock. Returns 1 on success, -1 on failure.
 *
 * @param {Integer} node
 * @returns {Integer}
 */
DirectoryData.prototype.remove = function(node) {
    for(var i = this.data.length - 1; i >= 0; i--) {
        if(this.data[i][1] == node) {
            this.data.splice(i, 1);
        }
    }
	for(var i = this.hexData.length - 1; i >= 0; i--) {
        if(this.hexData[i][1] == node && this.hexData[i][3] == true) {
			var k = i  - 1;
			//We find the first undeleted node behind i
			while (this.hexData[k] && this.hexData[k][3] == false){
				k -= 1;
			}
			//Checks if the first entry was deleted, not sure what to do here
			//File says I create a "blank directory record", no idea what format that is
			//Will finish this if statement later, must talk to Karen or other ext2 expert.
			if (!this.hexData[k]){
				return -1;
			}
			//Finds the length from k to the value after i.
			var lengthToFront = this.lengthToNext(k) + this.lengthToNext(i);
			//Now we can delete i
			this.hexData[i][3] = false;
			this.hexData[k][2] = this.toHex(this.hexData[k][0], this.hexData[k][1], parseInt(this.hexData[k][2].charAt(15)), lengthToFront);
			return 1;
        }
    }





    return errorNotFound;
};

/**
 * Returns the Data of the DataBlock.
 *
 * @returns {String}
 */
DirectoryData.prototype.toDisplay = function() {
    var returnString = "";
    for (var i = 0; i < this.data.length; i++){
        returnString += this.data[i][0] + "\t\t" + this.data[i][1] + "\n";
    };
    return returnString;
};

/**
 * Returns hex-based length of a directory
 *
 * @returns {Integer}
 */
DirectoryData.prototype.hexLength = function() {
    var returnLength = 0;
    for (var i = 0; i < this.hexData.length; i++){
        returnLength += (this.hexData[i][2].length) / 2;
    };
    return returnLength;
};

/**
 * Returns hex-based length from the kth directory entry to the next undeleted one
 *
 * @param {Integer} k
 * @returns {Integer}
 */
DirectoryData.prototype.lengthToNext = function(k) {
    var returnLength = (this.hexData[k][2].length) / 2;
	var i = k;
	i += 1;
    while (this.hexData[i] && this.hexData[i][3] == false){
        returnLength += (this.hexData[i][2].length) / 2;
		i += 1;
    };
	if (!this.hexData[i]){
		returnLength = (1024 - this.hexLength() + returnLength);
	}
    return returnLength;
};

/**
 * Returns the hexdump for the entire datablock.
 *
 * @returns {String}
 */
DirectoryData.prototype.hexDump = function() {
    var returnString = "";
    for (var i = 0; i < this.hexData.length; i++){
        returnString += this.hexData[i][2];
    };
	while (returnString.length < 2048){
		returnString += '00';
	}
    return returnString;
};