import 'figma-plugin-ds/dist/figma-plugin-ds.css'
import './ui.css'

let inputwidth = document.getElementById("input_width") as HTMLInputElement
inputwidth.onfocus = event => inputwidth.select()
inputwidth.onkeydown = event => {if(event.key == "Enter")resize()}
let inputheight = document.getElementById("input_height") as HTMLInputElement
inputheight.onfocus = event => inputheight.select()
inputheight.onkeydown = event => {if(event.key == "Enter")resize()}

document.getElementById('button_resize').onclick = () => resize()

//On receiving an event from code.ts...
window.onmessage = async (event) => {
  //...if it is a request to populate the dimension fields...
  if (event.data.pluginMessage.type === 'setSize') {
    const widthTextbox = document.getElementById('input_width') as HTMLInputElement
    widthTextbox.value = event.data.pluginMessage.width
    widthTextbox.select()
    const heightTextbox = document.getElementById('input_height') as HTMLInputElement
    heightTextbox.value = event.data.pluginMessage.height
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
  if (widthTextbox.value.search(/\d*c/i) == 0) {
    verticalDirection = "c"
  } else if (widthTextbox.value.search(/\d*b/i) == 0) {
    verticalDirection = "b"
  }
  parent.postMessage({ pluginMessage: { type: 'resize', width, horizontalDirection, height, verticalDirection } }, '*')
}
