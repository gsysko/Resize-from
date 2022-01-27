
const selection = figma.currentPage.selection
if (selection.length) {
  var width = selection[0].width
  var height = selection[0].height

  selection.forEach(selectItem => {
    if (selectItem.width != width){
      width = null
    }
    if (selectItem.height != height){
      height = null
    }
  })
}

figma.parameters.on('input', ({ parameters, key, query, result }: ParameterInputEvent) => {
  switch (key) {
    case 'width':
      const widths = [width + "l"]
      if (width) {
        result.setSuggestions(widths.filter(s => s.includes(query)))
      } else {
        result.setSuggestions(["Mixed"])
      }
      break
    case 'height':
      const heights = [height + "t"]
      if (height) {
        result.setSuggestions(heights.filter(s => s.includes(query)))
      } else {
        result.setSuggestions(["Mixed"])
      }
      break
    default:
      return
  }
})

figma.on('run', ({ command, parameters }: RunEvent) => {
  if (selection.length < 1) {
    figma.closePlugin("Select at least one item")
    return
  }
  switch (command) {
    case "":
      if (parameters) {
        let newWidth = parseInt(parameters.width, 10)
        let horizontalDirection = "l"
        if (parameters.width.search(/\d*c/i) == 0) {
          horizontalDirection = "c"
        } else if (parameters.width.search(/\d*r/i) == 0) {
          horizontalDirection = "r"
        }

        let newHeight = parseInt(parameters.height, 10)
        let verticalDirection = "t"
        if (parameters.height.search(/\d*c/i) == 0) {
          verticalDirection = "c"
        } else if (parameters.height.search(/\d*b/i) == 0) {
          verticalDirection = "b"
        }

        resize( newWidth, horizontalDirection, newHeight, verticalDirection )
      } else {
        figma.showUI(__html__)
        figma.ui.resize(300, 144)
        figma.ui.postMessage({ type: 'setSize' , width: width, height: height })
        break
      }
  }
})

figma.ui.onmessage = msg => {
  if (msg.type === 'resize') {
    resize(msg.width, msg.horizontalDirection, msg.height, msg.verticalDirection)
  }
}

//TODO need to account for when height/width is "Mixed" (or other NaN)
function resize(width: number, horizontalDirection: string, height: number, verticalDirection: string) {
  selection.forEach(selected => {
    let deltaH = selected.width - width
    let deltaV = selected.height - height
    switch(selected.type){
      case "BOOLEAN_OPERATION" :
      case "COMPONENT" :
      case "COMPONENT_SET" :
      case "ELLIPSE" :
      case "FRAME" :
      case "GROUP" :
      case "INSTANCE" :
      case "LINE" :
      case "POLYGON" :
      case "RECTANGLE" :
      case "SHAPE_WITH_TEXT" :
      case "SLICE" :
      case "STAMP" :
      case "STAR" :
      case "TEXT" :
      case "VECTOR":
        if (width) {
          selected.resize(width, selected.height)
          switch(horizontalDirection){
            case "c":
              selected.x = selected.x + deltaH/2
              break
            case "r":
              selected.x = selected.x + deltaH
              break
          }
        }
        if (height) {
          selected.resize(selected.width, height)
          switch(verticalDirection){
            case "c":
              selected.y = selected.y + deltaV/2
              break
            case "b":
              selected.y = selected.y + deltaV
              break
          }
        }
        break
    }
  })
  figma.closePlugin()
}