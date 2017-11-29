// let promises = []

// window.onload = function onLoadListener() {
//   initializePromiseList()
// }
// let addButtons = function () {
//   const idxs = []
//   for(let i = 0; i< 3; i++){
//     let idx = 0
//     while(true){
//       idx = Math.floor(Math.random() * promises.length)
//       if(!idxs.includes(idx)){
//         idxs.push(idx)
//         break
//       }
//     }
//   } 
//   let str = idxs.map(function (idx) { return promises[idx] }).reduce((prev, cur) => {
//     return prev + '<a href="#" class="promises">' + cur.title + '</a><br>'
//   }, '')
//   $('#container').append(str)
//   $('#container').append('<a id="noneBtn" href="#">관련 공약 없음</a>')
//   $('#noneBtn').click(function (ev) {
//     $('#container').empty()
//     addButtons()
//   })
//   $('.promises').click(function (ev) {
//     window.close()
//   })
// }
// var initializePromiseList = function () {
//   let httpPost = new XMLHttpRequest()
//   let url = 'http://34.208.245.104:3000/promise/seoul/1'
//   httpPost.onreadystatechange = function (err) {
//     if (httpPost.readyState == 4 && httpPost.status == 200) {
//       promises = JSON.parse(httpPost.responseText).promises
//       // document.getElementById('container').innerText = httpPost.responseText
//       addButtons()
//     } else {
//       $('#container').append(err)
//     }
//   }

//   httpPost.open('GET', url, true)
//   httpPost.send()
// }

