'use strict';

/**
 * Returns a dictionary containing all the programs that we support.
 * Each program is indexed by its name, and is represented by a function that
 * takes an array of string arguments.
 *
 * Each program will be configured to use the given fileSystem and
 * readLine/writeLine/display functions.
 *
 * - writeLine should print to the console.
 * - display should display its given block or inode contents.
 * - readLine should take a callback that should be called when input is available.
 */
function createPrograms(fileSystem, writeLine, readLine, display) {
    var currentInode = 2;
    var currentPath = '/';
    var programs = {};

    function split(path) {
        var parts = path.split("/").filter(function (x) { return x !== ""; });
        return { name: parts.pop(), path: parts.join("/") };
    }
    
    function normalize(path) {
        var stack = [];
        path.split('/').forEach(function (part) {
            if (part === '.' || part == '')
                return;
            if (part === '..')
                stack.pop();
            else
                stack.push(part);
        });
        return '/' + stack.join('/');
    }

    programs["pwd"] = function (args) {
        writeLine(currentPath);
    }

    programs["ls"] = function (args) {
        var directories = args.length === 0 ? ["."] : args;
        directories.forEach(function (directory) {
            try {
                var entries = fileSystem.listDirectory(directory + "/", currentInode);
                if (entries instanceof Array) {
                    writeLine(directory + ": ");
                    writeLine(entries.reduce(function (acc, entry) {
                        return acc + " " + entry;
                    }));
                } else {
                    writeLine(entries);
                }
            } catch (e) {
                writeLine("ls: " + e.message);
            }
        });
    };

    programs["cd"] = function (args) {
        if (args.length > 1) {
            writeLine("cd: too many arguments");
            return;
        }

        var name = args.length === 0 ? "/" : args[0];
        try {
            if (name[0] === "/") {
                currentInode = 2;
                currentPath = "/";
            }

            currentInode = fileSystem.getInodeFromPath(name + "/", currentInode);
            currentPath = normalize(currentPath + "/" + name);
        } catch (e) {
            writeLine("cd: " + e.message);
        }
    };

    programs["mkdir"] = function (args) {
        args.forEach(function (path) {
            var splitPath = split(path);
            try {
                writeLine(fileSystem.createDirectory(splitPath.name, splitPath.path, currentInode));
            } catch (e) {
                writeLine("mkdir: " + e.message);
            }
        });
    };

    programs["mkfile"] = function (args) {
        var path, size;

        switch (args.length) {
            case 0:
                writeLine("mkfile: missing file operand");
                return;
            case 1:
                path = args[0];
                size = 0;
                break;
            case 2:
                var size = parseInt(args[1]);
                if (isNaN(size) || size < 0) {
                    writeLine("mkfile: invalid size: " + args[1]);
                    return;
                } else {
                    path = args[0];
                    size = size;
                    break;
                }
            default:
                writeLine("mkfile: too many arguments");
                return;
        }

        var splitPath = split(path);
        try {
            writeLine("Success: file generated at inode " + fileSystem.createFile(splitPath.name, size, splitPath.path, currentInode));
        } catch (e) {
            writeLine("mkfile: " + e.message);
        }
    };

    programs["rm"] = function(args) {
        if (args.length === 0 || (args.length === 1 && args[0] === "-r")) {
            writeLine("rm: missing operand");
            return;
        }

        var paths = args;
        var recursive = args[0] === "-r";
        if (recursive)
            paths.shift(); // Remove the "-r" flag.

        paths.forEach(function (path) {
            try {
                var inodeNumber = fileSystem.getInodeFromPath(path, currentInode);
                var inode = fileSystem.getInode(inodeNumber);

                if (inode.type === typeReserved) {
                    writeLine("rm: cannot remove reserved file: " + path);
                    return;
                } else if (inode.type === typeDirectory && !recursive) {
                    writeLine("rm: cannot remove directory: " + path);
                    return;
                }

                fileSystem.remove(path, currentInode);
            } catch (e) {
                writeLine("rm: " + e.message);
            }
        });
    };

    programs["ln"] = function (args) {
        var sources, destination;

        if (args.length === 0) {
            writeLine("ln: missing operand");
            return;
        } else if (args.length === 1) {
            sources = [args[0]];
            destination = ".";
        } else if (args.length === 2) {
            sources = [args[0]];
            destination = args[1];
        } else {
            destination = args.pop();
            sources = args;
        }

        sources.forEach(function (source) {
            var parts = source
                .split("/")
                .filter(function (part) { return part !== ""; });
            if (parts.length === 0) {
                writeLine("ln: `" + source + "` does not refer to a valid filename");
                return;
            }

            var name = parts[parts.length - 1];
            try {
                fileSystem.createLink(name, source, destination + "/", currentInode);
            } catch (e) {
                writeLine("ln: " + e.message);
            }
        });
    };

    programs["display"] = function (args) {
        if (args.length === 0)
            writeLine('display: missing argument');
        else if (args[0] !== 'inode' && args[0] !== 'block')
            writeLine('display: unexpected `' + args[0] + '`, expected `inode` or `block`');
        else if (args.length === 1)
            writeLine('display: missing index');
        else if (args.length > 2)
            writeLine('display: too many arguments');
        else {
            var index = parseInt(args[1]);
            if (isNaN(index) || index < 1)
                writeLine('display: invalid index: ' + args[1]);
            else if (args[0] === 'inode')
                display(fileSystem.displayInode(index));
            else
                display(fileSystem.displayData(index));
        }
    };

    programs["terminate"] = function (args) {
        writeLine("Hello fool.");
        writeLine("ARE YOU READY TO BE EXT2MINATED? (y/n)");
        readLine(function (input) {
            if (input !== "y")
                writeLine("Too bad, death waits for no one.");

            writeLine("SYSTEM: Launching Nukes.");
        });
    };

    programs["shell"] = function (args) {
        readLine(function (value) {
            writeLine("> " + value);

            var parts = value.split(" ").filter(function (x) { return x.length !== 0; });
            var program = parts.shift();
            if (programs[program])
                programs[program](parts);
            else if (program)
                writeLine("ext2minator: command not found: " + program);

            programs["shell"](args);
        });
    }

    return programs;
}
