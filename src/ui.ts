import 'figma-plugin-ds/dist/figma-plugin-ds.css'
import './ui.css'

var stringMath = require('string-math');
const reLetters = /[A-Za-z]/g

//Focus the first input. Select text in inputs when focused, and submit on "Enter" key.
let inputwidth = document.getElementById("input_width") as HTMLInputElement
inputwidth.onfocus = event => inputwidth.select()
inputwidth.oninput = () => checkSelection();
inputwidth.onkeydown = event => {if(event.key == "Enter")resize()}
let inputheight = document.getElementById("input_height") as HTMLInputElement
inputheight.onfocus = event => inputheight.select()
inputheight.oninput = () => checkSelection();
inputheight.onkeydown = event => {if(event.key == "Enter")resize()}

//Set click listeners on all the buttons
document.getElementById('button_resize').onclick = () => resize()
let buttonWL = document.getElementById('button_w_l')
buttonWL.onclick = () => setHorizontalAnchor("l")
let buttonWC = document.getElementById('button_w_c')
buttonWC.onclick = () => setHorizontalAnchor("c")
let buttonWR = document.getElementById('button_w_r')
buttonWR.onclick = () => setHorizontalAnchor("r")
let buttonHT = document.getElementById('button_h_t')
buttonHT.onclick = () => setVerticalAnchor("t")
let buttonHC = document.getElementById('button_h_c')
buttonHC.onclick = () => setVerticalAnchor("c")
let buttonHB = document.getElementById('button_h_b')
buttonHB.onclick = () => setVerticalAnchor("b")

//On receiving an event from code.ts...
window.onmessage = async (event) => {
  //...if it is a request to populate the dimension fields...
  if (event.data.pluginMessage.type === 'setSize') {
    const widthTextbox = document.getElementById('input_width') as HTMLInputElement
    widthTextbox.value = event.data.pluginMessage.width ? event.data.pluginMessage.width : "Mixed"
    widthTextbox.select()
    const heightTextbox = document.getElementById('input_height') as HTMLInputElement
    heightTextbox.value = event.data.pluginMessage.height ? event.data.pluginMessage.height : "Mixed"
  }
}

function checkSelection() {
  buttonWL.className = "icon-button"
  buttonWC.className = "icon-button"
  buttonWR.className = "icon-button"
  buttonHT.className = "icon-button"
  buttonHC.className = "icon-button"
  buttonHB.className = "icon-button"
  if (inputwidth.value.search(/\d*c/i) != -1) {
    buttonWC.className = "icon-button icon-button--selected"
  } else if (inputwidth.value.search(/\d*r/i) != -1) {
    buttonWR.className = "icon-button icon-button--selected"
  } else {
    buttonWL.className = "icon-button icon-button--selected"
  }
  if (inputheight.value.search(/\d*c/i) != -1) {
    buttonHC.className = "icon-button icon-button--selected"
  } else if (inputheight.value.search(/\d*b/i) != -1) {
    buttonHB.className = "icon-button icon-button--selected"
  } else {
    buttonHT.className = "icon-button icon-button--selected"
  }
}

function resize() {
  const widthTextbox = document.getElementById('input_width') as HTMLInputElement
  try {
    var width = stringMath(widthTextbox.value.replaceAll(reLetters, ""))
  } catch (error) {
    width = NaN
  }
  let horizontalDirection = "l"
  if (widthTextbox.value.search(/\d*c/i) != -1) {
    horizontalDirection = "c"
  } else if (widthTextbox.value.search(/\d*r/i) != -1) {
    horizontalDirection = "r"
  }
  
  const heightTextbox = document.getElementById('input_height') as HTMLInputElement
  try {
    var height = stringMath(heightTextbox.value.replaceAll(reLetters, ""))
  } catch (error) {
    height = NaN
  }
  let verticalDirection = "t"
  if (heightTextbox.value.search(/\d*c/i) != -1) {
    verticalDirection = "c"
  } else if (heightTextbox.value.search(/\d*b/i) != -1) {
    verticalDirection = "b"
  }
  parent.postMessage({ pluginMessage: { type: 'resize', width, horizontalDirection, height, verticalDirection } }, '*')
}

function setHorizontalAnchor(anchorPoint: string) {
  inputwidth.value = inputwidth.value.replaceAll(reLetters, "") + anchorPoint
  checkSelection()
}

function setVerticalAnchor(anchorPoint: string) {
  inputheight.value = inputheight.value.replaceAll(reLetters, "") + anchorPoint
  checkSelection()
}