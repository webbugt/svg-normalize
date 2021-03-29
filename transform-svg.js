#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

console.log(argv)

const checkParam = (param) => param!==undefined && param !==null


const settings = {
    stripColors : checkParam(argv.stripColors) ? Boolean(argv.stripColors) : true,
    targetViewport : checkParam(argv.viewport) ? argv.viewport : '0 0 32 32',
    target : checkParam(argv._[0]) ? argv._[0]: checkParam(argv.file) ? argv.file : checkParam(argv.directory)? argv.directory : undefined,
    createJsTemplate : checkParam(argv.toJsTemplate)? Boolean(argv.toJsTemplate) : true,
    saveTransformedSvg : checkParam(argv.saveSvg) ? Boolean(argv.saveSvg) : false,
    outputFolder: checkParam(argv.outFolder) ? argv.outFolder : __dirname 
}

if(!settings.target) throw `target file or folder not specified`


console.log(settings)