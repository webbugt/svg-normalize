#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const fs = require("fs")
const path = require('path')
const argv = yargs(hideBin(process.argv)).argv

const checkParam = (param) => param!==undefined && param !==null

const settings = {
    targetViewport : checkParam(argv.viewport) ? argv.viewport : '0 0 32 32',
    target : path.normalize(checkParam(argv.file) ? argv.file : checkParam(argv.directory)? argv.directory : checkParam(argv._[0]) ? argv._[0]:  undefined),
    createJsTemplate : checkParam(argv.toJsTemplate)? Boolean(argv.toJsTemplate) : true,
    saveTransformedSvg : checkParam(argv.saveSvg) ? Boolean(argv.saveSvg) : false,
    outputFolder: checkParam(argv.outFolder) ? argv.outFolder : __dirname 
}
console.log(settings)

if(!settings.target) throw `target file or folder not specified`
if (!fs.existsSync(settings.target)) throw 'target file or directory doesn\'t exist' 


if(fs.lstatSync(settings.target).isDirectory() ){
    console.log("target is folder")
    const files = fs.readdirSync(settings.target).filter(file => file.match(/.svg$/gim));
    console.log("svg files",files)
}