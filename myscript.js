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
  // str += '<p> 초등학생 2명 중 1명은 ‘나홀로 등하교’ 학생입니다. 그들이 전체 사고의 67.2%를 차지합니다. 어린이보호구역 내에서 만큼은 어린이 교통사고를 완전히 없앨 방법이 반드시 필요합니다.</p> '

  str += '<p id="questionContent">' + qs[qidx].content + '</p>'
  if (qs[qidx].type === 'fourchoices') {
    str += '<br>'
    str += '<button class="buttons progressButtons backButton">해당없음</button> <button class="buttons progressButtons noneButton">1번</button> '         
    str += '<button class="buttons progressButtons okButton">2번</button> <button class="buttons progressButtons completeButton">3번</button>'   
    $('#myContainer').append(str)
    $('.backButton').click(function () {
      $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
        question: qs[qidx].content,
        score: 0
      })
      qidx += 1
      questions()
    })
    $('.noneButton').click(function () {
      $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
        question: qs[qidx].content,
        score: 1
      })
      qidx += 1
      questions()
    })
    $('.okButton').click(function () {
      $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
        question: qs[qidx].content,
        score: 2
      })
      qidx += 1
      questions()
    })    
    $('.completeButton').click(function () {
      $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
        question: qs[qidx].content,
        score: 3
      })
      qidx += 1
      questions()
    })
  } else if (qs[qidx].type === 'likert') {
    str += '<br>'
    str += '<button class="buttons progressButtons oneButton">매우 아니다</button> <button class="buttons progressButtons twoButton">아니다</button> '         
    str += '<button class="buttons progressButtons threeButton">보통</button> <button class="buttons progressButtons fourButton">그렇다</button> <button class="buttons progressButtons fiveButton">매우 그렇다</button>'   
    $('#myContainer').append(str)
    $('.oneButton').click(function () {
      $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
        question: qs[qidx].content,
        score: 1
      })
      qidx += 1
      questions()
    })
    $('.twoButton').click(function () {
      $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
        question: qs[qidx].content,
        score: 2
      })
      qidx += 1
      questions()
    })    
    $('.threeButton').click(function () {
      $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
        question: qs[qidx].content,
        score: 3
      })
      qidx += 1
      questions()
    })
    $('.fourButton').click(function () {
      $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
        question: qs[qidx].content,
        score: 4
      })
      qidx += 1
      questions()
    })
    $('.fiveButton').click(function () {
      $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
        question: qs[qidx].content,
        score: 5
      })
      qidx += 1
      questions()
    })
  }
  // else if (qs[qidx].type === 'yesno') {
  //   str += '<button class="buttons yesButton">예</button> <button class="buttons noButton">아니오</button> <button class="buttons dontknow">잘 모르겠음</button>'      
  //   $('#myContainer').append(str)    
  //   $('.yesButton').click(function () {
  //     $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
  //       question: qs[qidx].content,
  //       score: 1
  //     })
  //     qs[qidx].yesAction()
  //     questions()
  //   })
  //   $('.noButton').click(function () {
  //     $.post('http://34.208.245.104:3000/promise/seoul/0/' + promise.key, {
  //       question: qs[qidx].content,
  //       score: 0
  //     })
  //     qs[qidx].noAction()
  //     questions()
  //   })
  // } 
  else if (qs[qidx].type === 'openended') {
    str += '<textarea id="opinionInput"></textarea> <br><button id="submitButton" class="submitButton">의견 보내기</button>'
    $('#myContainer').append(str)    
    $('#submitButton').click(function(ev){
      $('#submitButton').remove()
      $('#opinionInput').remove()
      //TODO: store text in DB
      // $('#questionContent').append('')
      qidx += 1
      questions()
    })    
  }
  else if (qs[qidx].type === 'end') {
    // str += '<input type="text" id="opinionInput"> <button id="submitButton" class="submitButton">의견 보내기</button>'
    str += '<br><button id="finButton">다른 공약 보기</button>'
    $('#myContainer').append(str)    
    // $('#submitButton').click(function(ev){
    //   $('#submitButton').remove()
    //   $('#opinionInput').remove()
    //   // $('#questionContent').append('')
    // })    
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
    minWidth: 450
  })
  promise = promises[6]
  qs = [
    {
      content: `다음은 이 공약에 관한 설명입니다.
      <p>초등학생 2명 중 1명은 ‘나홀로 등하교’ 학생입니다. 그들이 전체 사고의 67.2%를 차지합니다. 어린이보호구역 내에서 만큼은 어린이 교통사고를 완전히 없앨 방법이 반드시 필요합니다.</p>
      <br>
      이 공약이 서울시의 중요한 문제를 해결한다고 생각하시나요?`,
      type: 'likert',
    },
    {
      content: '이 공약은 귀하와 관련이 있는 공약인가요?',
      type: 'likert'
    },
    {
      content: '서울시가 이 공약을 달성하기 위해 정책을 집행하는 것에 찬성하시나요?',
      type: 'likert'
    },
    {
      content: '이 공약에 대해 미리 알고 계셨나요?',
      type: 'likert',
    },
    {
      content: `서울시는 '어린이보호구역 내 교통사고 ZERO 목표로 종합대책 추진' 공약을 달성하기 위하여 다음과 같은 예산 사업(총 사업비 279억 1천 3백만원)을 진행하고 있습니다.
      <ul>
        <li> 어린이 보호구역 정비 </li>
        <li> 어린이 안전 영상정보(CCTV) 인프라 구축 </li>
        <li> 아이들이 안전한 환경「아마존」조성 </li>
        <li> 어린이 보호구역 과속경보표지판 설치 </li>
      </ul>
      <br>
      위 사업은 서울시가 공약을 달성하는데에 기여한다고 생각하시나요?`,
      type: 'likert'
    },   
    {
      content: `서울시는 '어린이보호구역 내 교통사고 ZERO 목표로 종합대책 추진' 공약을 달성하기 위하여 다음과 같은 예산 사업(총 사업비 279억 1천 3백만원)을 진행하고 있습니다.
      <ul>
        <li> 어린이 보호구역 정비 </li>
        <li> 어린이 안전 영상정보(CCTV) 인프라 구축 </li>
        <li> 아이들이 안전한 환경「아마존」조성 </li>
        <li> 어린이 보호구역 과속경보표지판 설치 </li>
      </ul>
      <br>
      이 공약 혹은 관련 사업에 대해 알고 계셨나요?`,
      type: 'likert'
    },
    {
      content: `다음은 '어린이보호구역 내 교통사고 ZERO 목표로 종합대책 추진' 공약의 단위 사업인 '어린이 보호구역 정비'에 관한 내용입니다.
     <p>사업 목적 및 내용: 초등학교, 유치원, 어린이집, 학원 등 대상 시설 주 출입문에서 반경 300m 이내의 일정 구간을 보호구역으로 지정하여 교통 안전 시설물 및 도로 부속물 설치로 어린이들의 안전한 통학 공간을 확보하고 교통사고를 예방하고자 함.</p>
     <br>
     서울시가 이 사업을 진행하는 것에 찬성하시나요?`,
      type: 'likert'
    },
    {
      content: '서울시는 이 사업을 잘 진행하고 있다고 생각하시나요?',
      type: 'likert',
    },
    {
      content: '그렇게 생각하시는 이유 혹은 근거는 무엇인가요?',
      type: 'openended'
    },
    {
      content: `다음은 '어린이보호구역 내 교통사고 ZERO 목표로 종합대책 추진' 공약의 단위사업인  '어린이 보호구역 정비'와 관련한 서울시의 최근 지출 내역 중 일부 입니다. 
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>일시</th>
            <th>용도(내용)</th>
            <th>지출금액</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>2017-07-20</td>
            <td>더불어민주당 초등학교 통학로 현장방문 참여자 격려 간담회</td>
            <td>92,400</td>
          </tr>
          <tr>
            <td>2</td>
            <td>2017-08-09</td>
            <td>어린이 보호구역 운영 현황 실태조사 관계자 간담회</td>
            <td>250,000</td>
          </tr>
          <tr>
            <td>3</td>
            <td>2017-09-29</td>
            <td>2017년 어린이 및 노인보호구역 개선사업(안전표지)</td>
            <td>8,560,000</td>
          </tr>
        </tbody>
      </table>
      <br>
      위 지출 내역 중, 그 용도가 적절하지 않은 것이 있나요?(중복 선택 가능)`,
      type: 'fourchoices'
    },
    {
      content: `다음은 '어린이보호구역 내 교통사고 ZERO 목표로 종합대책 추진' 공약의 단위사업인  '어린이 보호구역 정비'와 관련한 서울시의 최근 지출 내역 중 일부 입니다. 
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>일시</th>
            <th>용도(내용)</th>
            <th>지출금액</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>2017-07-20</td>
            <td>더불어민주당 초등학교 통학로 현장방문 참여자 격려 간담회</td>
            <td>92,400</td>
          </tr>
          <tr>
            <td>2</td>
            <td>2017-08-09</td>
            <td>어린이 보호구역 운영 현황 실태조사 관계자 간담회</td>
            <td>250,000</td>
          </tr>
          <tr>
            <td>3</td>
            <td>2017-09-29</td>
            <td>2017년 어린이 및 노인보호구역 개선사업(안전표지)</td>
            <td>8,560,000</td>
          </tr>
        </tbody>
      </table>
      앞서 선택하신 번호의 지출내역이 적절하지 못하다고 생각하시는 이유는 무엇인가요?(지출 금액이 너무 크다/작다 혹은 용도가 적절하지 못하다 등)\n
      또한, 관련하여 서울시에 정보/해명을 요구하고 싶은 부분이 있나요?`,
      type: 'openended'
    },
    {
      content: `전반적으로 서울시는  '어린이보호구역 내 교통사고 ZERO 목표로 종합대책 추진' 공약을 달성하기 위해 노력하고 있다고 생각하시나요?`,
      type: 'likert'
    },
    {
      content: `박원순 서울 시장의 공약 중 하나인 '어린이보호구역 내 교통사고 ZERO 목표로 종합대책 추진' 공약에 대해 어떻게 생각하시는지 자세히 적어주세요. `,
      type: 'openended'
    },
    {
      content: '설문과 설문 문항에서 얻게 된 정보로 인해 서울시, 혹은 박원순 시장에 대한 귀하의 생각에 변화가 있었나요? 그렇다면 그 변화에 대해 자세히 적어주세요. ',
      type: 'openended'
    },
    {
      content: '응답해주셔서 감사합니다. ',
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

  httpPost.open('PUT', url, true)
  httpPost.setRequestHeader('Content-Type', 'application/json')
  let data = {"article": article}
  console.log(JSON.stringify(data))
  httpPost.send(JSON.stringify(data))
};

var authenticate = function () {
  /*chrome.runtime.sendMessage({action: "getUser"}, function(response) {
    console.log(response);
  });
  */
}

initializePromiseList()
authenticate();
