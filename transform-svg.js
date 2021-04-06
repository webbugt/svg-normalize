#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const fs = require("fs")
const path = require('path')
const argv = yargs(hideBin(process.argv)).argv
const parseSVG = require('svg-parser').parse
const parsePath = require('parse-svg-path')
const checkParam = (param) => param!==undefined && param !==null

const settings = {
    targetViewBox : checkParam(argv.viewBox) ? argv.viewBox : '0 0 32 32',
    target : path.normalize(checkParam(argv.file) ? argv.file : checkParam(argv.directory)? argv.directory : checkParam(argv._[0]) ? argv._[0]:  undefined),
    createJsTemplate : checkParam(argv.toJsTemplate)? Boolean(argv.toJsTemplate) : true,
    saveTransformedSvg : checkParam(argv.saveSvg) ? Boolean(argv.saveSvg) : false,
    outputFolder: checkParam(argv.outFolder) ? argv.outFolder : __dirname,
    removeFills: checkParam(argv.removeFills) ? Boolean(argv.removeFills == "true"): true,
    precision: Math.pow(10,checkParam(argv.precision)?argv.precision:5)
}
//console.log(argv,settings)

if(!settings.target) throw `target SVG string, file or folder not specified`

const jsTemplateIndent = '            '

const round = (number) => {
    const radix = settings.precision || 1000
    return Math.round(number*radix)/radix
}

const parseTransformations = (sourceviewBox,targetViewBox) => {
    console.log(sourceviewBox,targetViewBox)
    const [srcX,srcY,srcWidth,srcHeight] = sourceviewBox.split(" ").map(parseFloat)
    const [targetX,targetY,targetWidth,targetHeight] = targetViewBox.split(" ").map(parseFloat)

    //console.log([srcX,srcY,srcWidth,srcHeight],[targetX,targetY,targetWidth,targetHeight])

    const output = {
        scale: 1,
        translateX: 0,
        translateY: 0,
    }
    if(srcX>=srcY){
        // landscape source
        output.scale = targetWidth/srcWidth
        output.translateY = (targetHeight - srcHeight*output.scale)/2
        } else {
        output.scale = targetHeight/srcHeight
        output.translateX = (targetWidth - srcWidth*output.scale)/2

    }

    output.translateX+= srcX*output.scale - targetX
    output.translateY+= srcY*output.scale - targetY


    return output
}

const getAllPaths = parsedSvg => {
    const paths = []
    parsedSvg.children.filter(child=>child.tagName==="path").forEach(path=>paths.push(path))
    parsedSvg.children.filter(child => child.children.length>0).reduce((acc,curr)=>acc.concat(getAllPaths(curr)),[]).forEach(path=>paths.push(path))
    return paths
    }

const translatePathPoints = (pathObject,transformations) => {
    const translateX = transformations && transformations.translateX || 0
    const translateY = transformations && transformations.translateY || 0
    const scale = transformations && transformations.scale || 1
    pathObject.properties.d = pathObject.properties.d.map(point=>{
        // point is in format ["command",x?,y?,x?,y?,x?,y?]
        return point.map((pointProperty,index)=>{
            if(index===0) return pointProperty
            return round(pointProperty*scale+(index%2==0?translateY:translateX))
        })
    })
    return pathObject
}

const transformSVG = (rawSvg, targetViewBox) => {
    //console.log(rawSvg)
    try{

    const parsedRawSvg = parseSVG(rawSvg).children[0]
    //console.log(JSON.stringify(parsedRawSvg,null,2))
    const transformations = parseTransformations(parsedRawSvg.properties.viewBox,targetViewBox || settings.targetViewBox)
    const paths = getAllPaths(parsedRawSvg).map(path=>{path.properties.d = parsePath(path.properties.d); return path})
    const translatedPaths = paths.map(path=>translatePathPoints(path,transformations))

    const pathStringForJs = translatedPaths.reduce((string,path)=>{
        return string + `${jsTemplateIndent}<path d="${path.properties.d.map(point=>point.join(" ")).join(" ")}"${!settings.removeFills? ` fill="${path.properties.fill}"`:''} />\n`
    },`${jsTemplateIndent}// viewBox=${settings.targetViewBox}\n`)
    //console.log(pathStringForJs)

    return [pathStringForJs]
    }catch(err){
        console.error(`invalid svg`,err)
        return null
    }
    
}
if (fs.existsSync(settings.target)){
    if(fs.lstatSync(settings.target).isDirectory() ){
        const files = fs.readdirSync(settings.target).filter(file => file.match(/.svg$/gim)).map(file=>fs.readFileSync(path.join(settings.target,file),'utf-8'))
        const results = files.map(transformSVG).filter(Boolean)
    }else{
        const results = transformSVG(fs.readFileSync(path.join(settings.target,svg),'utf-8'))
    }
}else{
    //input is probably svg string
    const result = transformSVG(settings.target)
    console.log(result[0])
}
