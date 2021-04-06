Resizes and centers any svg to specified viewBox (default is 0 0 32 32)

# Usage:

```
node transform-svg.js "svg-name.svg" --viewBox="0 0 32 32"


node transform-svg.js /home/svgs-to-convert --outFolder=/home/converted --toJsTemplate --viewBox="0 0 32 32"
```

# Params:

- first anonymous argument - either file or directory with svg files to process
- --file - specific file to convert, takes priority over --directory
- --directory - specify folder that contains svgs to convert
- --toJsTemplate - create js template files for human Icon component - default: true
  - this command will also strip colors and all other unneccessary attributes from svg paths
- --outFolder - specify folder where to output files - default is either folder of the converted file, or sibling directory (+converted) of selected dir
- --viewBox - specify new viewBox for svg file - default: 0 0 32 32
- --removeFills - remove all fills in svg - default: true
- --precision - number of decimal points for output values - default: 3

# ToDo:

- probable glitch when parsing options
- separate all functions to files
- find a way to conect "node transform-svg.js" to an alias on "npm i"
