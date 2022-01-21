
const selection = figma.currentPage.selection
if (selection.length > 1){
  figma.closePlugin("Select only one item")
} else if (selection.length < 1){
  figma.closePlugin("Select at least one item")
}  else {
  const width = selection[0].width
  const height = selection[0].height

  figma.showUI(__html__)
  figma.ui.resize(300, 144)
  figma.ui.postMessage({ type: 'setSize' , width: width, height: height })
}

figma.ui.onmessage = msg => {
  if (msg.type === 'resize') {
    let deltaH = selection[0].width - msg.width
    let deltaV = selection[0].height - msg.height
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
        selection[0].resize(msg.width, msg.height)
        switch(msg.horizontalDirection){
          case "c":
            selection[0].x = selection[0].x + deltaH/2
            break
          case "r":
            selection[0].x = selection[0].x + deltaH
            break
        }
        switch(msg.verticalDirection){
          case "c":
            selection[0].y = selection[0].y + deltaV/2
            break
          case "b":
            selection[0].y = selection[0].y + deltaV
            break
        }
        break
    }
  }

  figma.closePlugin()
}