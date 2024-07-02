#!/usr/bin/env node

const {intro , text , outro} = require('@clack/prompts');
const path = require("path");
const fs = require("fs");
const SrcTree = require("./SrcTree");
const FaustCompiler = require("./FaustCompiler");
const Semver = require('semver');


async function program() {
    intro("Faust Publisher");

    const mainfile = await text({
        message: "Enter The Main Library File",
        default: "faust",
        required: true,
        validate: (input) => {
            const filePath = path.join(process.cwd(), input);
            if (!fs.existsSync(filePath)) {
                return `File '${input}' not found in the current directory (${process.cwd()}).`;
            }
        }
    });

    // Validate author input (optional)
    const author = await text({
        message: "Enter The Author",
        required: true,
        validate: (input) => {
            if (input.trim() === '') {
                return "Author name cannot be empty.";
            }
        }
    });

    // Validate version input (optional)
    const version = await text({
        message: "Enter The Version",
        required: true,
        validate: (input) => {
            if (!Semver.valid(input)) {
                return "Invalid version format. Please use x.y.z format (e.g., 1.0.0).";
            }
        }
    });

    try{
        await new FaustCompiler().compileAsync(mainfile);
    }catch{
        outro("Can't Find Faust Compiler\nExiting...");
        process.exit(1);
    }

    const tree = new SrcTree(mainfile, author, version);
    tree.parseProject();
    tree.printDependencies();

    outro("You are all set");
}

program();
