// let handler = function (promises) {
//   return function (res) {
//     promises.concat(res.promises)
//     console.log(promises)
//     console.log(res)
//   }  
// }

let makeRequest = function (info) {
  let keyword = info.selectionText
  let pageUrl = info.pageUrl
  let promises = []
  let xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    // console.log(xhr.responseText)
    promises = JSON.parse(xhr.responseText).promises
    console.log(promises)
  }
  xhr.open("GET", "http://34.208.245.104:3000/promise/korea/0")
  xhr.send()
} 

chrome.contextMenus.create({
  title: "Request to officials",
  contexts: ["selection"],
})

chrome.contextMenus.onClicked.addListener(makeRequest)