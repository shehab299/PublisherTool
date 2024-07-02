const path = require("path");
const fs = require("fs");

class SrcTree {

    constructor(mainfile, author, version) {
        this.mainfile = mainfile;
        this.files = [];
        this.libfiles = [];
        this.inos = {};
        this.author = author;
        this.version = version;
    }

    parseProject() {
        this.parseProjectHelper(this.mainfile);
    }

    isPkg(file) {
        const pkgRegex = /^pkg:faust(?:\/([_a-zA-Z]\w*))?\/([_a-zA-Z]\w*\.lib)@((?:\d+)(?:\.(?:\d+)(?:\.(?:\d+))?)?)$/;
        return pkgRegex.test(file);
    }

    checkFile(file) {
        const realPath = fs.realpathSync(file);

        if (!fs.existsSync(realPath)) {
            throw new Error("File: " + file + " not found");
        }

        return realPath;
    }

    parseProjectHelper(file) {

        file = this.checkFile(file);
        this.files.push(file);
        const regex = /(import|library)\("([^"]+)"\)/g;

        while (this.files.length > 0) {
            const file = this.files.pop();

            const stats = fs.statSync(file);
            const ino = stats.ino;

            if (this.inos[ino]) {
                continue;
            } else {
                this.inos[ino] = true;
                this.libfiles.push(file);
            }

            const code = fs.readFileSync(file, "utf8");
            let match;

            let newcode = code.replace(regex, (match, p1, p2) => {
                if (this.isPkg(p2)) {
                    return match;
                }

                let temp = this.checkFile(p2);
                this.files.push(temp);

                return `${p1}("pkg:faust/${this.author}/${path.basename(temp, ".lib")}.lib@${this.version}")`;
            });

            fs.writeFileSync(file, newcode);
        }
    }

    printDependencies() {
        console.log(this.libfiles);
    }
}


module.exports = SrcTree;