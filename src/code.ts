
const selection = figma.currentPage.selection
if (selection.length > 1){
  figma.closePlugin("Select only one item")
} else if (selection.length < 1){
  figma.closePlugin("Select at least one item")
}  else {
  const width = selection[0].width
  const height = selection[0].height
  figma.parameters.on('input', ({ parameters, key, query, result }: ParameterInputEvent) => {
    switch (key) {
      case 'width':
        const widths = [width + "l"]
        result.setSuggestions(widths.filter(s => s.includes(query)))
        break
      case 'height':
        const heights = [height + "t"]
        result.setSuggestions(heights.filter(s => s.includes(query)))
        break
      default:
        return
    }
  })

  figma.on('run', ({ command, parameters }: RunEvent) => {
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
}

figma.ui.onmessage = msg => {
  if (msg.type === 'resize') {
    resize(msg.width, msg.horizontalDirection, msg.height, msg.verticalDirection)
  }
}

function resize(width: number, horizontalDirection: string, height: number, verticalDirection: string) {
  let deltaH = selection[0].width - width
  let deltaV = selection[0].height - height
  switch(selection[0].type){
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
      selection[0].resize(width, height)
      switch(horizontalDirection){
        case "c":
          selection[0].x = selection[0].x + deltaH/2
          break
        case "r":
          selection[0].x = selection[0].x + deltaH
          break
      }
      switch(verticalDirection){
        case "c":
          selection[0].y = selection[0].y + deltaV/2
          break
        case "b":
          selection[0].y = selection[0].y + deltaV
          break
      }
      break
  }

  figma.closePlugin()
}