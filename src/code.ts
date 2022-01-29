var stringMath = require('string-math');
const reLetters = /[A-Za-z]/g

//Get current selection
const selection = figma.currentPage.selection
//If anything is selected...
if (selection.length) {
  //...initialize width/height to first items width and height
  var width = selection[0].width
  var height = selection[0].height

  selection.forEach(selectItem => {
    //Then check if subsequent widths/heights match, otherwise set to null (meaning it is a mixed selection).
    if (selectItem.width != width){
      width = null
    }
    if (selectItem.height != height){
      height = null
    }
  })
}

//On quick action triggering...
figma.parameters.on('input', ({ parameters, key, query, result }: ParameterInputEvent) => {
  switch (key) {
    //For width parameter...
    case 'width':
      const widths = [width + "l"]
      //If not a mixed selection...
      if (width) {
        //Suggest current width
        result.setSuggestions(widths.filter(s => s.includes(query)))
      } else {
        //Else, suggest "Mixed"
        result.setSuggestions(["Mixed"].filter(s => s.includes(query)))
      }
      break
    //For height parameter...
    case 'height':
      const heights = [height + "t"]
      //If not a mixed selection...
      if (height) {
        //Suggest current height
        result.setSuggestions(heights.filter(s => s.includes(query)))
      } else {
        //Else, suggest "Mixed"
        result.setSuggestions(["Mixed"].filter(s => s.includes(query)))
      }
      break
    default:
      return
  }
})

//On plugin begins running...
figma.on('run', ({ command, parameters }: RunEvent) => {
  //If nothing selected...
  if (selection.length < 1) {
    //Prompt user to  select something.
    figma.closePlugin("Select at least one item")
    return
  }
  switch (command) {
    //Defaul command
    case "":
      //If command comes from quick action...
      if (parameters) {
        //Todo should probably refactor this to use the same logic as in ui.ts
        //Convert from string -> number
        try {
          var newWidth = stringMath(parameters.width.replaceAll(reLetters, ""))
        } catch (error) {
          newWidth = parseInt(parameters.width, 10)
        }
        //Initialize a horizontal resize direction
        let horizontalDirection = "l"
        //Change the direction if a different letter is found
        if (parameters.width.search(/\d*c/i) != -1) {
          horizontalDirection = "c"
        } else if (parameters.width.search(/\d*r/i) != -1) {
          horizontalDirection = "r"
        }
        //Convert from string -> number
        try {
          var newHeight = stringMath(parameters.height.replaceAll(reLetters, ""))
        } catch (error) {
          newHeight = parseInt(parameters.height, 10)
        }
        //Initialize a verical resize direction
        let verticalDirection = "t"
        //Change the direction if a different letter is found
        if (parameters.height.search(/\d*c/i) != -1) {
          verticalDirection = "c"
        } else if (parameters.height.search(/\d*b/i) != -1) {
          verticalDirection = "b"
        }

        //Do the resize
        resize( newWidth, horizontalDirection, newHeight, verticalDirection )
      } else {
        //Else, command comes from plugin menu; launch plugin...
        figma.showUI(__html__)
        figma.ui.resize(300, 144)
        //And populate with the appropriate size values.
        figma.ui.postMessage({ type: 'setSize' , width: width, height: height })
        break
      }
  }
})

figma.ui.onmessage = msg => {
  //Receive message from plugin UI...
  if (msg.type === 'resize') {
    //Pass on the values and do the resize
    resize(msg.width, msg.horizontalDirection, msg.height, msg.verticalDirection)
  }
}

function resize(width: number, horizontalDirection: string, height: number, verticalDirection: string) {
  //For each item selected...
  selection.forEach(selected => {
    //Record the amount each dimension grows/shrinks.
    let deltaH = selected.width - width
    let deltaV = selected.height - height
    //For all resizable node types...
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
        //If width is a number (i.e. not NaN because it is "Mixed")...
        if (width) {
          //Resize its width
          selected.resize(width, selected.height)
          switch(horizontalDirection){
            //If it should remain centered...
            case "c":
              //Shift its position to offset the width change.
              selected.x = selected.x + deltaH/2
              break
            //If it should remain right aligned...
            case "r":
              //Shift its position to offset the width change.
              selected.x = selected.x + deltaH
              break
          }
        }
        //If height is a number (i.e. not NaN because it is "Mixed")...
        if (height) {
          //Resize its height
          selected.resize(selected.width, height)
          switch(verticalDirection){
            //If it should remain centered...
            case "c":
              //Shift its position to offset the height change.
              selected.y = selected.y + deltaV/2
              break
            //If it should remain bottom aligned...
            case "b":
              //Shift its position to offset the height change.
              selected.y = selected.y + deltaV
              break
          }
        }
        break
    }
  })
  //Phew! We are done.
  figma.closePlugin()
}