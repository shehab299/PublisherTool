const { spawn } = require('child_process');

class FaustCompiler
{

    constructor(filePath = "faust"){
        this.faustPath = filePath; 
    }

    compileAsync(file){

        return new Promise((resolve, reject) => {
            const faust = spawn(this.faustPath, [file]);

            faust.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            faust.on("error", (err) => {
                reject("Can't Find Faust Compiler");
            });

            faust.on('close', (code) => {
                if(code === 0){
                    resolve("Testing Completed Successfully");
                }else{
                    reject("Testing Failed");
                }
            });
        });
    }

};


module.exports = FaustCompiler;