'use strict';

/**
 * Creates an instance of FileSystem.
 *
 * @constructor
 * @param {Integer} numInodes
 * @param {Integer} numDataBlocks
 * @returns {FileSystem}
 */
function FileSystem(numInodes, numDataBlocks) {
    this.inodeBitmap = new Bitmap(numInodes);
    this.blockBitmap = new Bitmap(numDataBlocks);

    this.inodes = [];
    for (var i = 0; i < numInodes; i++) {
        this.inodes[i] = new Inode(this);
    };

    this.dataBlock = [];
    for (var i = 0; i < numDataBlocks; i++) {
        this.dataBlock[i] = new DataBlock();
    };

    // Allocate reserved inodes (1 - 10)
    for (var i = 0; i < 10; i++) {
        this.inodeBitmap.allocateBit(i);
        if (i !== 1)
            this.inodes[i] = new ReservedInode(this);
    };


    // Allocate reserved datablocks (I'm not sure which ones are
    // reserved -- I'll edit this number later.)
    for (var i = 0; i < 10; i++) {
        this.blockBitmap.allocateBit(i);
    };

    // Initialize the root directory
    this.inodes[1].type = 2;
    this.inodes[1].addEntry(2, ".", 2);
    this.inodes[1].addEntry(2, "..", 2);
};

/**
 * Allocates an inode and returns the inode number.
 * * Inodes start counting at 1, so add 1 to the number provided.
 *
 * @returns {Integer}
 */
FileSystem.prototype.allocateInode = function() {
    var bit = this.inodeBitmap.findUnallocatedBit();
    this.inodeBitmap.allocateBit(bit);
    return bit + 1;
    // Update superblock
};

/**
 * Unallocates an inode.
 * @param {Integer} bit
 * @returns {undefined}
 */
FileSystem.prototype.unallocateInode = function(bit) {
    this.inodeBitmap.unallocateBit(bit - 1);
    // Update superblock
};

/**
 * Allocates a data block and returns the block number.
 *
 * @returns {Integer}
 */
FileSystem.prototype.allocateDataBlock = function() {
    var bit = this.blockBitmap.findUnallocatedBit();
    this.blockBitmap.allocateBit(bit);
    return bit;
    // Update superblock
};

/**
 * Unallocates a data block.
 *
 * @param {Integer} bit
 * @returns {undefined}
 */
FileSystem.prototype.unallocateDataBlock = function(bit) {
    this.blockBitmap.unallocateBit(bit);
    // Update superblock
};

/**
 * Given an inode number, returns the corresponding inode.
 *
 * @param {Integer} number
 * @returns {Inode}
 */
FileSystem.prototype.getInode = function(number) {
    return this.inodes[number - 1];
};

/**
 * Given an inode, returns the corresponding number.
 *
 * @param {Inode} inode
 * @returns {Integer}
 */
FileSystem.prototype.getNumber = function(inode) {
    return this.inodes.indexOf(inode) + 1;
};

/**
 * Given a block number, returns the corresponding data block.
 *
 * @param {Integer} number
 * @returns {Inode}
 */
FileSystem.prototype.getDataBlock = function(number) {
    return this.dataBlock[number];
};

/*
 * Given a block number and DataBlock, set the block number to point to the
 * DataBlock.
 *
 * @param {Integer} number
 * @param {DataBlock} dataBlock
 * @returns {undefined}
 */
FileSystem.prototype.setDataBlock = function(number, dataBlock) {
    this.dataBlock[number] = dataBlock;
};

/**
 * Return an inode number given a file path and starting inode number.
 * Returns -1 if no such file or directory exists.
 * If a file is found instead of a directory, -2 is returned.
 * (ex. 'a/b/c/' would mean c is a directory. If, however, c is a file,
 *  this function will return -2.)
 *
 * If currentDirectory is not specified, it defaults to 2 (the root directory).
 * If the given path is absolute, then currentDirectory is ignored.
 *
 * @param {String} path
 * @param {Integer} currentDirectory
 * @returns {Integer}
 */
FileSystem.prototype.getInodeFromPath = function(path, currentDirectory) {
    // Split on slashes, walk through each part.
    // Return -1 if it does not exist.
    var parts = path.split('/');
    var type = typeDirectory;
    if (parts[parts.length - 1] !== '') {
        type = typeFile;
    }

    // Get the current directory's inode
    var curDir = this.getInode(currentDirectory);
    var inodeNumber = currentDirectory;

    // Loop until the end of the path, getting the next inode on each
    // iteration.
    for (var i = 0; i < parts.length; i++) {
        // Accounting for the case of /a/b/c as being the same as a/b/c
        // Side-effect: /////a is still valid. Whoops.
        if (parts[i] !== '') {
            inodeNumber = curDir.getInodeInDirectory(parts[i]);
            if (inodeNumber < 0) {
                // In the case of -1 or -2 being returned, the file 'was not
                // successfully found.'
                throw new FileNotFoundError(path);
            }
            curDir = this.getInode(inodeNumber);
        }
    }

    // Check the type of our last inode and make sure it matches type.
    if (curDir.type !== typeDirectory && type === typeDirectory)
        throw new NotADirectoryError(path);

    return inodeNumber;
};

/**
 * Creates a new directory Inode at the given path. Returns the inode of the
 * new directory.
 *
 * If currentDirectory is not specified, it defaults to 2 (the root directory).
 *
 * @param {String} name
 * @param {String} path
 * @param {Integer} currentDirectory
 * @returns {Integer} newInodeNumber
 */
FileSystem.prototype.createDirectory = function(name, path, currentDirectory) {
    var currentInodeNumber = this.getInodeFromPath(path, currentDirectory);
    var currentInode = this.getInode(currentInodeNumber);
    if (currentInode.type !== 2)
        throw new NotADirectoryError(path);

    if (currentInode.getInodeInDirectory(name) !== errorInodeDoesNotExist)
        throw new AlreadyExistsError(name);

    // Allocate an inode for the new directory
    var newInodeNumber = this.allocateInode();
    var newInode = this.getInode(newInodeNumber);

    // Allocate a new data block for the new directory
    newInode.addEntry(newInodeNumber, ".", 2);
    newInode.addEntry(currentInodeNumber, "..", 2);
    newInode.linkCount = 1;
    newInode.type = typeDirectory;

    // Add a new entry to the current directory
    currentInode.addEntry(newInodeNumber, name, 2);
    currentInode.linkCount += 1;

    return newInodeNumber;
};

/**
 * Creates a link named `name` in `directory` to `target`.
 *
 * @param {string} name
 * @param {string} directory
 * @param {string} target
 * @param {number} currentDirectory
 * @returns {number} A negative number on failure, and 0 otherwise.
 */
FileSystem.prototype.createLink = function (name, directory, target, currentDirectory) {
    var directoryInodeNumber = this.getInodeFromPath(target, currentDirectory);
    var directoryInode = this.getInode(directoryInodeNumber);
    if (directoryInode.type !== typeDirectory)
        throw new NotADirectoryError(target);

    var targetInodeNumber = this.getInodeFromPath(directory, currentDirectory);
    var targetInode = this.getInode(targetInodeNumber);

    targetInode.linkCount++;
    directoryInode.addEntry(targetInodeNumber, name, 2);

    return 0;
};

/**
 * Creates a new file Inode with 'size' blocks, at the given path.
 *
 * If currentDirectory is not specified, it defaults to 2 (the root directory).
 *
 * @param {String} name
 * @param {String} size
 * @param {String} path
 * @param {Integer} currentDirectory
 * @returns {Integer} newInodeNumber
 */
FileSystem.prototype.createFile = function(name, size, path, currentDirectory) {
    // Get the path of the current directory
    var currentInodeNumber = this.getInodeFromPath(path, currentDirectory);
    var currentInode = this.getInode(currentInodeNumber);
    if (currentInode.getInodeInDirectory(name) !== errorInodeDoesNotExist)
        throw new AlreadyExistsError(name);

    var newInodeNumber = this.allocateInode();
    var newInode = this.getInode(newInodeNumber);

    // Allocate datablocks for the new file
    var numberBlocks = Math.ceil(size / pageSize);
    var remainingAmount = size;
    var fillerData = generateString(size);
    for (var i = 0; i < numberBlocks; i++) {
        var newBit = this.allocateDataBlock();
        var amount = Math.min(remainingAmount, pageSize);
        remainingAmount -= amount;

        var data = fillerData.substring(i * pageSize, i * pageSize + amount);
        var fileBlock = new FileData(newBit, data);
        this.setDataBlock(newBit, fileBlock);
        newInode.setNthBlock(i, newBit);
    };

    newInode.linkCount = 1;
    newInode.type = typeFile;
    newInode.size = size;
    currentInode.addEntry(newInodeNumber, name, 1);

    return newInodeNumber;
};

/**
 * Remove all data in the given path.
 *
 * If currentDirectory is not specified, it defaults to 2 (the root directory).
 *
 * @param {String} path
 * @param {Integer} currentDirectory
 * @returns {null}
 */
FileSystem.prototype.remove = function(path, currentDirectory) {
    // 1. Get inode of target
    // 2. Reduce link counter by 1
    // If the number of links is 0, deallocate everything
    // rm only handles files at the moment-- not directories
    // 3. Get inode of parent
    // 4. Remove entry from parent
    var removeNumber = this.getInodeFromPath(path, currentDirectory);
    var removeInode = this.getInode(removeNumber);

    if (removeInode.type === typeDirectory){
        var removeDir = removeInode.getDirectoryEntries();
        if (removeDir.length === 2){
            removeInode.linkCount -= 1;
            if (removeInode.linkCount === 0)
                removeInode.unallocateAll();

            this.unallocateInode(removeNumber);

            var parentPath = path.split('/');
            var popped = "";
            while (popped === "" && parentPath.length > 0)
                parentPath.pop();

            var parentNode = this.getInodeFromPath(parentPath.join('/') + "/", currentDirectory);
            var parent = this.getInode(parentNode);
            parent.removeEntry(removeNumber);
            return 0;
        }

        this.remove(removeDir[2][0], removeNumber);
    }

    if (removeInode.type === typeReserved)
        throw new RemovingReservedError(path);

    removeInode.linkCount -= 1;
    if (removeInode.linkCount === 0)
        removeInode.unallocateAll();

    this.unallocateInode(removeNumber);

    var parentPath = path.split('/');
    var popped = "";
    while (popped === "" && parentPath.length > 0)
        parentPath.pop();

    var parentNode = this.getInodeFromPath(parentPath.join('/') + "/", currentDirectory);
    var parent = this.getInode(parentNode);
    parent.removeEntry(removeNumber);

    return 0;
}


/**
 * Returns a string with all the items in a directory.
 *
 * @param {Path} path
 * @param {Integer} currentDirectory
 * @returns {String}
 */
FileSystem.prototype.listDirectory = function(path, currentDirectory) {
    try {
        var inode = this.getInodeFromPath(path, currentDirectory);
    } catch (e) {
        if (e instanceof NotADirectoryError)
            return path;
        else
            throw e;
    }

    return this
        .getInode(inode)
        .getDirectoryEntries()
        .map(function (entry) { return entry[0]; });
}

/**
 * Returns an array of items to display from an inode.
 * [0] = metadata
 * [1 - 15] = block pointer strings
 *
 * @param {type} n
 * @returns {Array}
 */
FileSystem.prototype.displayInode = function(n) {
    var content = "<div class='hexbutton'>HEX</div><center><b>inode "+n+"</b></center>\
                        <div class='boxcontent' id='inode-"+n+"'>";
    content += this.getInode(n).toDisplay();
    content += "</div>";
    return content;
}

/**
 * Returns data from a datablock.
 *
 * @param {type} n
 * @returns {String}
 */
FileSystem.prototype.displayData = function(n) {
    var content = "<div class='hexbutton'>HEX</div><center><b>block "+n+"</b></center>\
                        <div class='boxcontent data' id='data-"+n+"'>";
    content += this.getDataBlock(n).toDisplay();
    content += "</div>";
    return content;
}


function hexNum(number) {

		if (number.length == 1 || number.length == 3)
			number = "0" + number;
		if (number.length < 4)
			number = "00" + number;
		number = number.substring(2, 4) + number.substring(0, 2);
		return number;

}
