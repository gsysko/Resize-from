
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
      case 'dimension':
        const dimensions = ['width', 'height']
        result.setSuggestions(dimensions.filter(s => s.includes(query)))
        break
      case 'value':
        const values = [width.toString(), height.toString()]
        result.setSuggestions(values.filter(s => s.includes(query)))
        break
      case 'direction':
        const horizontalDirections = [
          {name: 'left', metadata: "l"},
          {name: 'center', metadata: "c"},
          {name: 'right', metadata: "r"}
        ]
        const verticalDirections = [
          {name: 'top', metadata: "t"},
          {name: 'center', metadata: "c"},
          {name: 'bottom', metadata: "b"}
        ]
        result.setSuggestions((parameters.dimension == "width" ? horizontalDirections : verticalDirections).filter(s => s.name.includes(query)))
        break
      default:
        return
    }
  })

  figma.on('run', ({ command, parameters }: RunEvent) => {
    switch (command) {
      case "":
        if (parameters) {
          let horizontalDirection = "l"
          let verticalDirection = "t"
          parameters.dimension == 
          resize( width, horizontalDirection, height, verticalDirection )
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