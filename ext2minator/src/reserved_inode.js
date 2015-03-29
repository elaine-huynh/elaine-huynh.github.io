'use strict';

/**
 * Creates a reserved Inode.
 *
 * @constructor
 * @extends Inode
 * @param {FileSystem} fileSystem
 * @returns {ReservedInode}
 */
function ReservedInode(fileSystem) {
    Inode.call(this, fileSystem);
    // The 'type' of a reserved inode will be type 2 - for now, anyways.
    // I need to see how they're set up in the filesystem.
    this.type = typeReserved;
};

ReservedInode.prototype = Object.create(Inode.prototype);
ReservedInode.prototype.constructor = ReservedInode;

ReservedInode.prototype.toDisplay = function(){
    var metaData = "<div class='metadata'>";
    metaData += "Type: Reserved</div>";
    return metaData;
};
