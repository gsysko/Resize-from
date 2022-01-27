import 'figma-plugin-ds/dist/figma-plugin-ds.css'
import './ui.css'

//Focus the first input. Select text in inputs when focused, and submit on "Enter" key.
let inputwidth = document.getElementById("input_width") as HTMLInputElement
inputwidth.onfocus = event => inputwidth.select()
inputwidth.onkeydown = event => {if(event.key == "Enter")resize()}
let inputheight = document.getElementById("input_height") as HTMLInputElement
inputheight.onfocus = event => inputheight.select()
inputheight.onkeydown = event => {if(event.key == "Enter")resize()}

//Set click listeners on all the buttons
document.getElementById('button_resize').onclick = () => resize()
document.getElementById('button_w_l').onclick = () => setHorizontalAnchor("l")
document.getElementById('button_w_c').onclick = () => setHorizontalAnchor("c")
document.getElementById('button_w_r').onclick = () => setHorizontalAnchor("r")
document.getElementById('button_h_t').onclick = () => setVerticalAnchor("t")
document.getElementById('button_h_c').onclick = () => setVerticalAnchor("c")
document.getElementById('button_h_b').onclick = () => setVerticalAnchor("b")

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

function resize() {
  const widthTextbox = document.getElementById('input_width') as HTMLInputElement
  const width = parseInt(widthTextbox.value, 10)
  let verticalDirection = "t"
  let horizontalDirection = "l"
  if (widthTextbox.value.search(/\d*c/i) == 0) {
    horizontalDirection = "c"
  } else if (widthTextbox.value.search(/\d*r/i) == 0) {
    horizontalDirection = "r"
  }
  
  const heightTextbox = document.getElementById('input_height') as HTMLInputElement
  const height = parseInt(heightTextbox.value, 10)
  if (heightTextbox.value.search(/\d*c/i) == 0) {
    verticalDirection = "c"
  } else if (heightTextbox.value.search(/\d*b/i) == 0) {
    verticalDirection = "b"
  }
  parent.postMessage({ pluginMessage: { type: 'resize', width, horizontalDirection, height, verticalDirection } }, '*')
}

const re = /[A-Za-z]/g
function setHorizontalAnchor(anchorPoint: string) {
  inputwidth.value = inputwidth.value.replaceAll(re, "") + anchorPoint
}

function setVerticalAnchor(anchorPoint: string) {
  inputheight.value = inputheight.value.replaceAll(re, "") + anchorPoint
}