let promises = []
let promise = {}
let qidx = 0
let qs = []
let officialName = ''
let category = ''
// window.onload = function onLoadListener() {
//   initializePromiseList()
// }

let questions = function () {
  $('#myContainer').empty()
  let str = '<h3>' + promise.title + '</h3><br>'  
  str += '<ul> <li> 생활권 주변 10분거리 공원과 생애주기별 힐링공원 조성 </li> <li> 서울둘레길 근교산 자락길 등 걷고 싶은 서울길 완성 </li> </ul> <br> <hr />'

  str += '<p id="questionContent">' + qs[qidx].content + '</p>'
  if (qs[qidx].type === 'status') {
    str += '<button class="buttons progressButtons">역행중</button> <button class="buttons progressButtons">이행되지 않음</button> '         
    str += '<button class="buttons progressButtons">이행 중</button> <button class="buttons progressButtons">이행 완료</button> <br><br> <button class="buttons progressButtons dontknowProgress">잘 모르겠음</button>'   
    $('#myContainer').append(str)
    $('.progressButtons').click(function () {
      qidx += 1
      questions()
    })
  } else if (qs[qidx].type === 'yesno') {
    str += '<button class="buttons yesButton">예</button> <button class="buttons noButton">아니오</button> <button class="buttons dontknow">잘 모르겠음</button>'      
    $('#myContainer').append(str)    
    $('.yesButton').click(function () {
      $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
        question: qs[qidx].content,
        score: 1
      })
      qs[qidx].yesAction()
      questions()
    })
    $('.noButton').click(function () {
      $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
        question: qs[qidx].content,
        score: 0
      })
      qs[qidx].noAction()
      questions()
    })
  } else if (qs[qidx].type === 'end') {
    str += '<input type="text" id="opinionInput"> <button id="submitButton" class="submitButton">의견 보내기</button>'
    str += '<br><button id="finButton">다른 공약 보기</button>'
    $('#myContainer').append(str)    
    $('#submitButton').click(function(ev){
      $('#submitButton').remove()
      $('#opinionInput').remove()
      // $('#questionContent').append('')
    })    
    $('#finButton').click(function (ev) {
      $('#myContainer').remove()
      addButtons()
    })
  }
}
let addButtons = function () {
  $('#articleBodyContents').append('<div id="myContainer" title="PromiseBook"><h3>기사와 관련있는 ' + officialName + '의 공약입니다. 클릭하시면 자세한 내용을 알아보실 수 있습니다.</h3></div>')
  $('#myContainer').dialog({
    position: {
      my: 'right center',
      at: 'right center+25%'
    },
    minHeight: 200,
    minWidth: 350
  })
  promise = promises[Math.floor(Math.random() * promises.length)]
  qs = [
    {
      content: '지금 보고 계신 기사가 해당 공약 이행과 관련이 있어 보이시나요?',
      type: 'yesno',
      yesAction: function () {
        qidx += 1
      },
      noAction: function () {
        qidx += 1
      }
    },
    {
      content: '이 공약이 우리나라를 투명한 국가로 만드는 데 도움이 된다고 생각하시나요?',
      type: 'yesno',
      yesAction: function () {
        qidx += 1
      },
      noAction: function () {
        qidx += 1
      }
    },
    {
      content: '기사를 읽고, 이 공약의 현재 상태를 평가해주세요.',
      extraContent: '',
      type: 'status'
    },
    {
      content: officialName +  '에게 공약 이행 현황 공개를 요청하는 메시지를 보내주세요. 이 메시지는 ' + officialName + '에게 전달되며, PromiseBook 홈페이지에도 게시됩니다.',
      type: 'end'
    }
  ]
  let str = '<br><a class="promises">' + promise.title + '</a><br>'
  $('#myContainer').append(str)
  $('#myContainer').append('<a id="noneBtn">다른 공약 보기</a>')
  $('#noneBtn').click(function (ev) {
    $('#myContainer').remove()
    addButtons()
  })
  $('.promises').click(function (ev) {
    //TODO: Connect it to the local guide like tagger
    questions()
  })
}
var initializePromiseList = function () {
  let articleArray = $('#articleBodyContents').text().trim().split('\n')
  let article = articleArray[articleArray.length - 1]
  console.log(article)
  // let data = new FormData()
  // data.append('article', article)
  let httpPost = new XMLHttpRequest()
  let url = 'http://34.208.245.104:3000/promise/seoul/0'
  httpPost.onreadystatechange = function (err) {
    if (httpPost.readyState == 4 && httpPost.status == 200) {
      let response = JSON.parse(httpPost.responseText)
      category = response.category
      promises = response.promises
      console.log(response)
      officialName = '박원순 서울시장' // extract it from promiseList.city and promiseList.district
      // document.getElementById('container').innerText = httpPost.responseText
      addButtons()
    } else {
      $('#articleBodyContents').append(err)
    }
  }

  httpPost.open('POST', url, true)
  httpPost.setRequestHeader('Content-Type', 'application/json')
  let data = {"article": article}
  console.log(JSON.stringify(data))
  httpPost.send(JSON.stringify(data))
}

initializePromiseList()
