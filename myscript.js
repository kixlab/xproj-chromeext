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

  str += '<p>' + qs[qidx].content + '</p>'
  if (qs[qidx].type !== 'end') {
    str += qs[qidx].vueElements.reduce(function (prev, cur) {
      return prev + '<li>' + cur + '</li>'
    }, '<ul>') + '</ul>'
    str += '<p>' + qs[qidx].extraContent + '</p>'
    if (qs[qidx].type === 'status') {
      str += '<button class="buttons progressButtons">역행중</button> <button class="buttons progressButtons">이행되지 않음</button> '         
      str += '<button class="buttons progressButtons">이행 중</button> <button class="buttons progressButtons">이행 완료</button> <br><br> <button class="buttons dontknowProgress">잘 모르겠음</button>'                  
    } else {
      str += '<button class="buttons yesButton">예</button> <button class="buttons noButton">아니오</button> <button class="buttons dontknow">잘 모르겠음</button>'      
    }
  } else {
    str += '<input type="text"> <button class="submitButton">의견 보내기</button>'
    str += '<p>' + qs[qidx].extraContent + '</p>'
    str += '<br><button id="finButton">다른 공약 보기</button>'
    // str += '<br><a target="_blank" href="http://34.248.205.104:3000/#/promiseDetail/seoul/0/' + promise.key + '"> PromiseBook에서 공약 더 알아보기</a>'
  }
  console.log(str)
  $('#myContainer').append(str)
  $('.yesButton').click(function () {
    $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
      question: qs[qidx].content,
      score: 1
    })
    qidx += 1
    questions()
  })
  $('.noButton').click(function () {
    $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
      question: qs[qidx].content,
      score: 0
    })
    qidx += 1
    questions()
  })
  $('.progressButtons').click(function () {
    qidx += 1
    questions()
  })
  $('#finButton').click(function (ev) {
    $('#myContainer').remove()
    addButtons()
  })
}
let addButtons = function () {
  $('#articleBodyContents').append('<div id="myContainer" title="PromiseBook"><h3>기사와 관련있는 ' + officialName + '의 공약입니다. 클릭하시면 자세한 내용을 알아보실 수 있습니다.</h3></div>')
  $('#myContainer').dialog({
    position: {
      my: 'right center',
      at: 'right center+25%'
    },
    minHeight: 200
  })
  promise = promises[Math.floor(Math.random() * promises.length)]
  qs = [
    {
      content: '지금 보고 계신 기사가 해당 공약 이행과 관련이 있어 보이시나요?',
      vueElements: [],
      extraContent: '',
      type: 'purpose'
    },
    // {
    //   content: '다음은 공직자가 밝힌 이 공약의 목적입니다.',
    //   vueElements: promise.purpose,
    //   extraContent: '이 목적은 적절한가요?',
    //   type: 'purpose'
    // },
    // {
    //   content: '다음은 공직자가 밝힌 이 공약의 이행 계획입니다.',
    //   vueElements: promise.plan,
    //   extraContent: '이 이행 계획은 적절한가요?',
    //   type: 'plan'
    // },
    {
      content: '이 공약이 우리나라를 투명한 국가로 만드는 데 도움이 된다고 생각하시나요?',
      vueElements: [],
      extraContent: '',
      type: 'plan'
    },
    {
      content: '기사를 읽고, 이 공약의 현재 상태를 평가해주세요.',
      vueElements: [],
      extraContent: '',
      type: 'status'
    },
    // {
    //   content: '다음은 이 공약과 연관된 자료입니다.',
    //   progressTitle: (promise.progresses.length != 0) ? promise.progresses[0].title : '',
    //   progressLink: (promise.progresses.length != 0) ? ( promise.progresses[0].reference ? promise.progresses[0].reference.link : '' ) : '',
    //   extraContent: '이 자료는 이 공약의 이행현황과 관련이 있나요?',
    //   type: 'progress'
    // },
    // {
    //   content: '다음 중 이 공약의 혜택을 볼 사람들을 골라주세요.',
    //   categories: this.$store.state.targets,
    //   extraContent: '',
    //   type: 'categories'
    // },
    // {
    //   content: '다음은 이 공약을 보고 다른 시민들이 남긴 의견입니다.',
    //   vueElements: promise.comments.map((c) => {return c.text}),
    //   extraContent: '혹시 추가하실 의견이 있으신가요?',
    //   type: 'comments'
    // },
    {
      content: officialName +  '에게 공약 이행 현황 공개를 요청하는 메시지를 보내주세요. 이 메시지는 ' + officialName + '에게 전달되며, PromiseBook 홈페이지에도 게시됩니다.',
      extraContent: '',//'다른 공약 보기 버튼을 누르시면 기사와 연관있는 다른 공약을 보실 수 있습니다.',
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
    // $('#myContainer').empty()
    // $('#myContainer').append('<p>기사가 등록되었습니다.</p>')
    // window.open('http://localhost:8080/#/newPromiseDetail/seoul/0/' + promises[idx].key)
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
