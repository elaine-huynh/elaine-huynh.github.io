'use strict';

/**
 * Creates an empty instance of an Inode.
 *
 * @constructor
 * @param {FileSystem} fileSystem
 * @returns {Inode}
 */
function Inode(fileSystem) {
    this.fileSystem = fileSystem;
    this.size = 0;
    this.type = 0;
    this.linkCount = 0;
    this.blockPointer = [];
    for (var i = 0; i < 15; i++) {
      this.blockPointer[i] = 0;
    };
};

/**
 * Adds an entry into the Inode, assuming the Inode is a directory. fileType is 1 for files, 2 for directories
 * @param {Integer} inodeNumber
 * @param {String} name
 * @param {Integer} fileType
 * @returns {undefined}
 */
Inode.prototype.addEntry = function(inodeNumber, name, fileType) {
	var prevSize = this.size;
    this.size += 8 + Math.max(4, name.length);
    var newPageNeeded = Math.ceil(this.size/pageSize) > 
    					Math.ceil(prevSize/pageSize);
	if (newPageNeeded){
		var newPage = this.fileSystem.allocateDataBlock();
		this.fileSystem.setDataBlock(newPage, new DirectoryData());
	}
		
    // Find the first datablock that can fit an entry
    var page = Math.floor(this.size/pageSize);
	if (newPageNeeded)
		this.setNthBlock(page, newPage);
    
    var blockNumber = this.getNthBlock(page);
    var block = this.fileSystem.getDataBlock(blockNumber);
    block.add(name, inodeNumber, fileType);
};

/**
 * Removes an entry from the Inode, assuming the Inode is a directory.
 * Returns 1 on success, -1 on failure.
 * @param {Integer} node
 * @returns {Integer}
 */
Inode.prototype.removeEntry = function(node) {
    // Find the first datablock that can fit an entry
	var maxNumberOfPages = Math.ceil(this.size / pageSize);
    for (var i = 0; i < maxNumberOfPages; i++){
        var dataBlock = this.fileSystem.getDataBlock(this.getNthBlock(i));
		if (dataBlock.remove(node) == 1)
			return 1;
	}
	return errorNotFound;
};

Inode.prototype.unallocateAll = function() {
    // Find the first datablock that can fit an entry
	var maxNumberOfPages = Math.ceil(this.size / pageSize);
    for (var i = 0; i < maxNumberOfPages; i++){
        var dataBlock = this.getNthBlock(i);
        this.fileSystem.unallocateDataBlock(dataBlock);
	}
    for (var i = 0; i < 15; i++) {
      var pointer = this.blockPointer[i];
      if (pointer != 0)
        this.fileSystem.unallocateDataBlock(pointer);
    };
	this.size = 0;
	return errorSuccess;
};

/**
 * Returns the block number of the nth data block used in the Inode.
 * 
 * @param {Integer} n
 * @returns {Integer}
 */
Inode.prototype.getNthBlock = function(n){
    if (n < 12)
        return this.blockPointer[n];
    else{
        var singleIndirectPages = pageSize / 4;
        var doubleIndirectPages = singleIndirectPages * pageSize / 4;
        // A page can hold 1024/4 = 256 entries.
        // Blocks 12 ~ 267 are in a singly indirect block pointer
        // Doubly indirect holds 256 indirect pointers for a total of
        // Triply
        if (n < singleIndirectPages + 12){
            // Get the corresponding entry in a singly indirect block pointer
            var singleIndirect = this.fileSystem.getDataBlock(this.blockPointer[12]);
            var entry = n - 12;
            
            // If we're looking for the 12th block of data, then we want the
            // 0th item in the page.
            return singleIndirect.getEntry(entry);
        }
        else if (n < doubleIndirectPages + 12){
            var doubleIndirect = this.fileSystem.getDataBlock(this.blockPointer[13]);
            
            // Find the single indirect block containing our target block
            var offset = n - 12 - singleIndirectPages;
            var doubleEntry = Math.floor(offset / singleIndirectPages);
            var single = doubleIndirect.getEntry(doubleEntry);
            var singleIndirect = this.fileSystem.getDataBlock(single);
            
            // Find the entry in the single indirect block that we want
            var singleEntry = offset - doubleEntry * singleIndirectPages;
            return singleIndirect.getEntry(singleEntry);
        }
        else{
            var tripleIndirect = this.fileSystem.getDataBlock(this.blockPointer[14]);

            // Find the double indirect block containing our target block
            var offset = n - 12 - singleIndirectPages - doubleIndirectPages;
            var tripleEntry = Math.floor(offset / doubleIndirectPages);
            var ddouble = tripleIndirect.getEntry(tripleEntry);
            var doubleIndirect = this.fileSystem.getDataBlock(ddouble);
            
            // Find the single indirect block containing our target block
            var offsetInDouble = offset - doubleIndirectPages * tripleEntry;
            var doubleEntry = Math.floor(offsetInDouble / singleIndirectPages);
            var single = doubleIndirect.getEntry(doubleEntry);
            var singleIndirect = this.fileSystem.getDataBlock(single);
            
            // Find the target block in our single indirect block
            var offsetInSingle = offsetInDouble - 
                                 singleIndirectPages * doubleEntry;
            return singleIndirect.getEntry(offsetInSingle);
        }
    }
};

/**
 * Sets the nth data block in an inode to point to the given datablock number.
 * 
 * @param {Integer} n
 * @param {Integer} blockNumber
 * @returns {undefined}
 */
Inode.prototype.setNthBlock = function(n, blockNumber){
    if (n < 12)
        this.blockPointer[n] = blockNumber;
    else{
        var singleIndirectPages = pageSize / 4;
        var doubleIndirectPages = singleIndirectPages * pageSize / 4;
        // A page can hold 1024/4 = 256 entries.
        // Blocks 12 ~ 267 are in a singly indirect block pointer
        // Doubly indirect holds 256 indirect pointers for a total of
        // Triply
        if (n < singleIndirectPages + 12){
            // If no block pointer is assigned yet, create one
            if (this.blockPointer[12] === 0){
                var newPage = this.fileSystem.allocateDataBlock();
                this.blockPointer[12] = newPage;
		        this.fileSystem.setDataBlock(newPage, new IndirectData());
            }
            // Get the corresponding entry in a singly indirect block pointer
            var singleIndirect = this.fileSystem.getDataBlock(this.blockPointer[12]);
            var entry = n - 12;
            
            // If we're looking for the 12th block of data, then we want the
            // 0th item in the page.
            return singleIndirect.setEntry(entry, blockNumber);
        }
        else if (n < doubleIndirectPages + 12){
            if (this.blockPointer[13] === 0){
                var newPage = this.fileSystem.allocateDataBlock();
                this.blockPointer[13] = newPage;
		        this.fileSystem.setDataBlock(newPage, new IndirectData());
            }
            var doubleIndirect = this.fileSystem.getDataBlock(this.blockPointer[13]);
            
            // Find the single indirect block containing our target block
            var offset = n - 12 - singleIndirectPages;
            var doubleEntry = Math.floor(offset / singleIndirectPages);
            var single = doubleIndirect.getEntry(doubleEntry);
            if (!single){
                var newPage = this.fileSystem.allocateDataBlock();
                doubleIndirect.setEntry(doubleEntry, newPage);
                single = newPage;
		        this.fileSystem.setDataBlock(newPage, new IndirectData());
            }
            var singleIndirect = this.fileSystem.getDataBlock(single);
            // Find the entry in the single indirect block that we want
            var singleEntry = offset - doubleEntry * singleIndirectPages;
            return singleIndirect.setEntry(singleEntry, blockNumber);
        }
        else{
            if (this.blockPointer[14] === 0){
                var newPage = this.fileSystem.allocateDataBlock();
                console.log(newPage);
                console.log(this.fileSystem.allocateDataBlock());
                this.blockPointer[14] = newPage;
		        this.fileSystem.setDataBlock(newPage, new IndirectData());
            }
            var tripleIndirect = this.fileSystem.getDataBlock(this.blockPointer[14]);
            
            // Find the double indirect block containing our target block
            var offset = n - 12 - singleIndirectPages - doubleIndirectPages;
            var tripleEntry = Math.floor(offset / doubleIndirectPages);
            var ddouble = tripleIndirect.getEntry(tripleEntry);
            if (!ddouble){
                var newPage = this.fileSystem.allocateDataBlock();
                tripleIndirect.setEntry(tripleEntry, newPage);
                ddouble = newPage;
		        this.fileSystem.setDataBlock(newPage, new IndirectData());
            }
            var doubleIndirect = this.fileSystem.getDataBlock(ddouble);
            
            // Find the single indirect block containing our target block
            var offsetInDouble = offset - doubleIndirectPages * tripleEntry;
            var doubleEntry = Math.floor(offsetInDouble / singleIndirectPages);
            var single = doubleIndirect.getEntry(doubleEntry);
            if (!single){
                var newPage = this.fileSystem.allocateDataBlock();
                doubleIndirect.setEntry(doubleEntry, newPage);
                single = newPage;
		        this.fileSystem.setDataBlock(newPage, new IndirectData());
            }
            var singleIndirect = this.fileSystem.getDataBlock(single);
            
            // Find the target block in our single indirect block
            var offsetInSingle = offsetInDouble - 
                                 singleIndirectPages * doubleEntry;
            return singleIndirect.setEntry(offsetInSingle, blockNumber);
        }
    }
};

/**
 * Returns an array of arrays of the directory's data in the format:
 * [[name, inode], [name, inode]]
 * If the Inode is not a directory, return -1.
 * (Use typeof to detect the error, please.)
 *
 * @returns {Array}
 */
Inode.prototype.getDirectoryEntries = function() {
    // Go through and parse the hex dump in next Phase.
    // Go to each block in the inode
    // getDirectoryData() in each
    // add to list
    var maxNumberOfPages = Math.ceil(this.size / pageSize);
    var returnArray = [];
    for (var i = 0; i < maxNumberOfPages; i++){
        var data = this.fileSystem.getDataBlock(this.getNthBlock(i)).getDirectoryData();
        returnArray.push.apply(returnArray, data);
    };
    return returnArray;
};

/**
 * Returns the inode number corresponding to the name of an item in the
 * directory. If no such item exists, -1 is returned.
 * If no such Inode exists, return -2.
 *
 * @param {String} name
 * @returns {Integer}
 */
Inode.prototype.getInodeInDirectory = function(name) {
    var entries = this.getDirectoryEntries();
    for (var i = 0; i < entries.length; i++){
        if (entries[i][0] === name)
            return entries[i][1];
    }
    return errorInodeDoesNotExist;
};

/**
 * Returns an array of items to display from an inode.
 * [0] = metadata
 * [1 - 15] = block pointer strings
 * 
 * @returns {Array}
 */
 
/**
Inode.prototype.toDisplay = function(){
    var returnArray = [];
    var metaData = "Type: ";
    if (this.type === typeFile)
        metaData += "File\n";
    else
        metaData += "Directory\n";
    metaData += "Size: " + this.size +
                "\nLinks: "+ this.linkCount;
    returnArray[0] = metaData;
    
    for (var i = 0; i < 15; i++) {
        returnArray[i+1] = "Direct Block Pointer " + i +
                           "\n Block " + this.blockPointer[i];
    };
    
    return returnArray;
};
*/

Inode.prototype.toDisplay = function(){
    var metaData = "<div class='metadata'>";
    metaData += "Type: ";
    if (this.type === typeFile)
        metaData += "File\n";
    else
        metaData += "Directory\n";
    metaData += "Size: " + this.size +
                "\nLinks: "+ this.linkCount;
    metaData += "</div>"
    var returnArray = metaData;
    
    for (var i = 0; i < 15; i++) {
        var type = (i%2) ? "odd" : "even";
        returnArray += "<div class='blockpointer "+type+"' id='blockpointer'>"
        if (i < 12){
            returnArray += "Direct Block Pointer " + i;
        }else if (i === 12){
            returnArray += "Single Indirect Block Pointer";
        }else if (i === 13){
            returnArray += "Double Indirect Block Pointer";
        }else{
            returnArray += "Triple Indirect Block Pointer";
        }
        returnArray += "\n Block " + this.blockPointer[i];
        returnArray += "</div>"
    };
    
    return returnArray;
};

Inode.prototype.toString = function(){
    var metaData = "Type: ";
    if (this.type === typeFile)
        metaData += "File\n";
    else
        metaData += "Directory\n";
    metaData += "Size: " + this.size +
                "\nLinks: "+ this.linkCount;
    var returnArray = metaData;
    
    for (var i = 0; i < 15; i++) {
        returnArray += "\nDirect Block Pointer " + i +
                           "\n Block " + this.blockPointer[i];
    };
    
    return returnArray;
};

/**
 * Returns a little-endian string that represents a hexdump of the inode
 *
 * @returns {String}
 */
Inode.prototype.toHex = function() {
	var returnString =  "0" + this.type.toString() + "00";
	var size = (this.size).toString(16);
	var firstHalf = size.substring(size.length - 8, size.length);
	var secondHalf = size.substring(0, size.length - 8);
	//Amount of 512 blocks needed to store all Inode data
	var iBlocks = Math.ceil(this.size / 512).toString(16);
	returnString += "0000";
	returnString += hexNumFour(firstHalf);
	for (var i = 0; i < 36; i++) {
		returnString += "0";
	}
	returnString += hexNum(this.linkCount.toString(16));
	returnString += hexNumFour(iBlocks);
	for (var i = 0; i < 16; i++) {
		returnString += "0";
	}
	for (var i = 0; i < 15; i++) {
		if (this.blockPointer[i] != 0)
			var newString = (this.getNthBlock(i)).toString(16);
		else
			var newString = "0000";
		returnString += hexNumFour(newString);
	}
	for (var i = 0; i < 16; i++) {
		returnString += "0";
	}
	secondHalf = hexNumFour(secondHalf);
	if (secondHalf == 8)
		returnString += secondHalf;
	else
		returnString += "00000000";
		
	for (var i = 0; i < 32; i++) {
		returnString += "0";
	}
	return returnString;
};