'use strict';

var errorNotFound = -404;
var errorSuccess = 0;
var errorInodeDoesNotExist = -1;
var errorFileNotFound = -2;
var errorNotADirectory = -3;
var errorRemovingReserved = -4;
var errorAlreadyExists = -5;

function InodeDoesNotExistError(name) {
    this.message = name + ": no such file or directory";
}

function FileNotFoundError(name) {
    this.message = name + ": no such file or directory";
}

function NotADirectoryError(name) {
    this.message = name + ": the path does not refer to a directory";
}

function RemovingReservedError(name) {
    this.message = name + ": the file or directory is reserved";
}

function AlreadyExistsError(name) {
    this.message = name + ": the file or directory already exists";
}
