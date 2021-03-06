let token = ''
let promises = []
let object = {}
let promiseId = ''
let budgetId = ''
let budgetIds = []
let promptInstance = {}
let prompts = []
let curPromptSet = ''
let curPromptIdx = 0
let officialName = ''
let keywords = []
// let labels = ['중요도', '관련도','인지도','선호도','이행도']
let chart = null
let scores = []

let isLogedIn = false

const showCharts = function (labels, datasets){
  if(chart){
    chart.destroy()
  }
  let ctx = document.getElementById('myChart').getContext('2d')
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: 5,
            stepSize: 1
          }
        }]
      }
    }
  })
}

const setPrompts = async function (promptSetName, objectId) {
  prompts = await $.get(`https://api.budgetwiser.org/api/prompt-sets/${promptSetName}/`, {
    "object_id": objectId
  })
  promptInstance = await $.get(prompts.next_prompt_instance, {
    "object_id": objectId
  })
  curPromptSet = promptSetName
  curPromptIdx = 0
  questions()
}

const getPromiseId = function (url) {
  const tokens = url.split('/')
  tokens.pop()
  return tokens.pop()
}
const getObjectId = function (objectType) {
  if(objectType === 'promise'){
    return promiseId
  } else if(objectType === 'budget program'){
    return budgetId
  }
}
const getResponseObjectIds = function (responseObjectType){
  if(!responseObjectType){
    return []
  }
  else if(responseObjectType === 'budget program'){
    return budgetIds
  }
}
const setResponseObjectIds = function (promptInstance) {
  let objectIds = getResponseObjectIds(promptInstance.prompt.response_object_type)
  if(objectIds.length === 0){
    promptInstance.response_objects.forEach(function(o){
      objectIds.push(o.id)
    })
  }
  console.log(objectIds)
}
const setObjectId = function (promptInstance) {
  let objectId = getObjectId(promptInstance.prompt.response_object_type)
  if(objectId === ''){
    const randomObject = promptInstance.response_objects[Math.floor(Math.random() * promptInstance.response_objects.length)]
    if(promptInstance.prompt.response_object_type === 'budget program'){
      budgetId = randomObject.id
    }
    // objectId = randomObject.id
  }
}

const promptEnd = async function () {
  if(curPromptSet === 'chrome-extension-promise') {
    let stats = await $.get(`https://api.budgetwiser.org/api/prompt-sets/${curPromptSet}/statistics/`, {object_ids: getObjectId('promise')})
    let labels = stats.ordered_prompts.map(p => p.label)
    let data = stats.series.map(d => {
      return {
        label: '전체',
        data: d.prompt_data.map(r => Math.round(r.mean_rating*100)/100),
        borderColor: '#F2526E',
        backgroundColor: 'rgba(243, 188, 200, 0.7)'
      }
    })
    console.log(data)
    data.push({
      label: '내 점수',
      data: scores,
      borderColor: '#6DDDF2',
      backgroundColor: 'rgba(193, 240, 244, 0.7)'
    })
    $('#myContainer').empty()
    $('#myContainer').append('<div class="promiseTitle"><h3>' + object.title + '</h3></div>')
    $('#myContainer').append('<div class="questionContent">공약 평가 완료! 다른 사람들의 의견을 확인해보세요.</div>')
    $('#myContainer').append('<div id="myChartDiv"><canvas id="myChart" ></canvas></div>')
    $('#myContainer').append('이 공약과 관련된 사업을 평가해주세요. ')
    if(!isLogedIn){
      $('#myContainer').append('<span id="login">몇 가지 정보를 알려주시면, 직접 관련있는 공약을 보여드립니다.</span>')
    }
    $('#myContainer').append('<br><button type="button" id="showBudgets" class="promiseTitleButton">관련 사업 보기</button>')
    if(!isLogedIn){
      $('#myContainer').append('<button type="button" id="loginButton" class="promiseTitleButton">회원 가입</button>')
      $('#loginButton').click(function () {
        chrome.runtime.sendMessage({action: 'authenticate'}, response => {
          token = response.token
          $('#loginButton').hide()
          $('#login').hide()
          isLogedIn = true
        })
      })
    }
    $('#showBudgets').click(function (ev) {
      // ev.preventDefault()
      scores = []
      setPrompts('chrome-extension-budget')

    })
    showCharts(labels, data)
  } else if (curPromptSet === 'chrome-extension-budget') {
    let stats = await $.get(`https://api.budgetwiser.org/api/prompt-sets/${curPromptSet}/statistics/`, {object_ids: getObjectId('budget program')})
    let labels = stats.ordered_prompts.slice(1).map(p => p.label)
    let data = stats.series.map(d => {
      return {
        label: d.label,
        data: d.prompt_data.slice(1).map(r => r.mean_rating),
        backgroundColor: 'rgba(243, 188, 200, 0.7)',
        borderColor: '#F2526E'
      }
    })
    console.log(data)
    data.push({
      label: '내 점수',
      data: scores,
      borderColor: '#6DDDF2',
      backgroundColor: 'rgba(193, 240, 244, 0.7)'
    })
    $('#myContainer').empty()
    $('#myContainer').append('<div class="promiseTitle"><h3>' + object.title + '</h3></div>')
    let str = `<div class="questionContent">사업 평가 완료! 다른 사람들의 의견을 확인해보세요.</div><div id="myChartDiv"><canvas id="myChart"></canvas></div>다른 공약에 대한 의견도 남겨주세요! `
    let str2 = `<br><button type="button" class="promiseTitleButton" id="endButton">다른 공약 보기</button>`
    $('#myContainer').append(str)
    if(!isLogedIn){
      $('#myContainer').append('<span id="login">몇 가지 정보를 알려주시면, 직접 관련있는 공약을 보여드립니다.</span>')
    }
    $('#myContainer').append(str2)
    if(!isLogedIn){
      $('#myContainer').append('<button type="button" id="loginButton" class="promiseTitleButton">회원 가입</button>')
      $('#loginButton').click(function () {
        chrome.runtime.sendMessage({action: 'authenticate'}, response => {
          token = response.token
          $('#loginButton').hide()
          $('#login').hide()
          isLogedIn = true
        })
      })
    }
    $('#endButton').click(function (ev) {
      // ev.preventDefault()
      $('#myContainer').empty()
      addButtons()
    })
    showCharts(labels, data)
  }
}
const questions = function () {
  curPromptIdx += 1
  $('#myContainer').empty()
  let str = '<div class="promiseTitle"><h3><a id="detail">' + object.title + '</a></h3></div>'
  str += '<div class="questionContent">' + promptInstance.display_text + '</div>'
  $('#myContainer').append(str)
  $('#detail').click(function () {
    $('#myContainer').empty()
    $('#myContainer').append(
      `
      <div class="promiseTitle"><h3>${object.title}</h3></div>
      <h3 class="detailHeader">공약 목표</h3>
      <div class="prompt" id="goals">
      </div>
      <button type="button" class="progressButtons" id="detailCloseBtn">설명 닫기</button>
      `
    )
    console.log(object.goals.replace(/\n/g, '<br />'))
    $('#goals').html(`${object.goals.replace(/\n/g, '<br />')}`)
    $('#detailCloseBtn').click(function () {
      curPromptIdx -= 1
      questions()
    })
  })
  console.log(promptInstance)
  if(promptInstance.prompt.type === 'likert') {
    $('#myContainer').append('<div class="likertLabels">매우 아니다</div>')
    for(let i = promptInstance.prompt.scale_min; i <= promptInstance.prompt.scale_max; i++){
      str = `<button type="button" class="progressButtons" id="button${i}">${i}</button>`
      // '<button class="buttons progressButtons" id="button' + i + '">' + i + '</button>'
      $('#myContainer').append(str)
      $('#button'+i).click( async (ev)=> {
        // ev.preventDefault()
        $(ev.target).animate({ opacity: 0.3 });
        scores.push(i)
        await $.post({
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          data: JSON.stringify({
            "object_id": getObjectId(promptInstance.prompt.prompt_object_type),
            "rating": i
          }),
          dataType: 'json',
          url: promptInstance.response_create_url
        })
        if(!promptInstance.next_prompt_instance) {
          promptEnd()
        } else {
          $.get(promptInstance.next_prompt_instance, {"object_id": getObjectId(promptInstance.next_prompt.prompt_object_type)}).then((data) => {
            console.log(data)
            promptInstance = data
            questions()
          })
        }
      })
    }
    $('#myContainer').append('<div class="likertLabels">매우 그렇다</div>')
    $('#myContainer').append('<br><button type="button" class="progressButtons" id="skipButton">→</button>')
    $('#skipButton').click(function () {
      if(!promptInstance.next_prompt_instance) {
        promptEnd()
      } else {
        $.get(promptInstance.next_prompt_instance, {"object_id": getObjectId(promptInstance.next_prompt.prompt_object_type)}).then((data) => {
          console.log(data)
          promptInstance = data
          questions()
        })
      }
    })
  } else if (promptInstance.prompt.type === 'tagging') {
    // for(let i = 0; i < promptInstance.response_objects.length; i++){
    //   str = '<div>'
    //   str += '<input id="checkbox' + i + '"type="checkbox">'
    //   str += '<label for="checkbox' + i + '">' + promptInstance.response_objects[i].__str__ + '</label>'
    //   str += '</div>'
    //   $('#myContainer').append(str)
    // }

    $('#myContainer').empty()
    $('#myContainer').append(str)
    promptInstance.response_objects.forEach(function(obj){
      str = `<button type="button" class="tagButtons" id="button${obj.id}">${obj.__str__}</button>`
      $('#myContainer').append(str)
      $(`#button${obj.id}`).click((ev) => {
        // ev.preventDefault()
        $(ev.target).animate({ opacity: 0.3 });
        budgetId = obj.id
        object = obj
        object.title = obj.__str__
        $.get(promptInstance.next_prompt_instance, {"object_id": getObjectId(promptInstance.next_prompt.prompt_object_type)}).then((data) => {
          console.log(data)
          promptInstance = data
          questions()
        })
      })
    })
    $('#myContainer').append('<button type="button" class="tagButtons" id="otherBudgets">다른 사업 보기</button>')
    $('#otherBudgets').click(function () {
      // curPromptIdx -= 1
      setPrompts('chrome-extension-budget')
    })
    // str = '<button class="progressButtons">다음</button>'
    // $('#myContainer').append(str)
    // $('.progressButtons').click((ev) => {

    //   // const tags = []
    //   // for(let i = 0; i < promptInstance.response_objects.length; i++){
    //   //   const tag = {}
    //   //   tag['rating'] = $('input:checkbox[id="checkbox' + i + '"]').is(':checked') ? 1 : 0
    //   //   tag['object_id'] = promptInstance.response_objects[i].id
    //   //   tags.push(tag)
    //   // }
    //   // setObjectId(promptInstance)
    //   // setResponseObjectIds(promptInstance)

    //   // console.log(tags)
    //   // $.post({
    //   //   headers: {
    //   //     'Authorization': 'Bearer ' + token,
    //   //     'Content-Type': 'application/json'
    //   //   },
    //   //   data: JSON.stringify({
    //   //     "object_id": getObjectId(promptInstance.prompt.prompt_object_type),
    //   //     "tags": tags
    //   //   }),
    //   //   url: promptInstance.response_create_url
    //   // })
    //   // if(!promptInstance.next_prompt_instance) {
    //   //   promptEnd()
    //   // }
    //   // const payload = {
    //   //   "object_id": getObjectId(promptInstance.next_prompt.prompt_object_type),
    //   // }
    //   // if(promptInstance.next_prompt.response_object_type === promptInstance.prompt.response_object_type){
    //   //   payload['response_object_ids'] = getResponseObjectIds(promptInstance.next_prompt.response_object_type).reduce(function(prev, cur){
    //   //     return prev + ',' + cur
    //   //   })
    //   // }
    //   // $.get(promptInstance.next_prompt_instance, payload).then((data) => {
    //   //   console.log(data)
    //   //   promptInstance = data
    //   //   questions()
    //   // })
    // })
  } else if (promptInstance.prompt.type === 'openended') {
    str = '<input type="text" class="comment" id="comment" placeholder="의견을 적어주세요."></input>'
    $('#myContainer').append(str)
    str = '<button type="button" class="progressButtons">다음</button>'
    $('#myContainer').append(str)
    $('.progressButtons').click((ev) => {
      // ev.preventDefault()
      $(ev.target).animate({ opacity: 0.3 });
      const text = $('#comment').val()
      $.post({
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          "object_id": getObjectId(promptInstance.prompt.prompt_object_type),
          "text": text
        }),
        url: promptInstance.response_create_url
      })
      if(!promptInstance.next_prompt_instance) {
        promptEnd()
      }
      $.get(promptInstance.next_prompt_instance, {"object_id": getObjectId(promptInstance.next_prompt.prompt_object_type)}).then((data) => {
        console.log(data)
        promptInstance = data
        questions()
      })
    })
  }
  $('#myContainer').append(`<div id="progressIndicator"></div>`)
  let len = curPromptSet === 'chrome-extension-budget' ? prompts.ordered_prompts.length - 1 : prompts.ordered_prompts.length // 1st question of budget is should not be counted
  let curIdx = curPromptSet === 'chrome-extension-budget' ? curPromptIdx - 1 : curPromptIdx // should not code like this though
  if (curIdx != 0)
    $('#progressIndicator').append(`${curIdx}/${len}`)
}
const addButtons = function () {
  $('#myContainer').empty()
  if(promises.length) {
    $('#myContainer').append(`<div class="prompt">이 기사와 관련있는 ${officialName}의 공약입니다.</div>`)
    let promiseIdx = Math.floor(Math.random() * promises.length)
    object = promises[promiseIdx]
    console.log(promises)
    promiseId = object.object_id
    let str = `<div class="promiseTitle"><h3>${object.title}</h3></button>`
    $('#myContainer').append(str)
    $('#myContainer').append('<div class="prompt"><span class="emphasis-text">20대 대학원생</span>과 가장 연관있는 공약입니다. 이 공약에 대해 어떻게 생각하시나요?</div>')
    $('#myContainer').append('<button type="button" id="noneBtn" class="promiseTitleButton">다른 공약 보기</button>')
    $('#myContainer').append('<button type="button" id="evalBtn" class="promiseTitleButton">이 공약 평가하기</button>')
    // $('#myContainer').append('<button id="detailBtn">자세한 정보 보기</button>')
    // $('#detailBtn').click(function() {
    //   $('#myContainer').empty()
    //   $('#myContainer').append(
    //     `
    //     <div class="promiseTitle"><h3>${object.title}</h3></div>
    //     <h3 class="detailHeader">공약 목적</h3>
    //     <div class="prompt">
    //     <ul>
    //       <li>초등학생 2명 중 1명은 '나홀로 등학교' 학생입니다. 그들이 전체 사고의 67.2%를 차지합니다. 어린이보호구역 내에서 만큼은 어린이 교통사고를 완전히 없앨 방법이 반드시 필요합니다.</li>
    //     </ul>
    //     </div>
    //     <h3 class="detailHeader">공약 목표</h3>
    //     <div class="prompt">
    //     <ul>
    //       <li>2016년 어린이보호구역 내 교통사고 50% 감축</li>
    //       <li>2018년 6월까지 75% 감축</li>
    //       <li>2020년까지 ZERO화 달성</li>
    //     </ul>
    //     </div>
    //     <button type="button" class="progressButtons" id="detailCloseBtn">설명 닫기</button>
    //     `
    //   )
    // })
    $('#noneBtn').click(function (ev) {
      console.log(ev)
      // ev.preventDefault()
      $('#myContainer').empty()
      promises.splice(promiseIdx, 1)
      addButtons()
    })
    $('#evalBtn').click(function(ev) {
      // ev.preventDefault()
      setPrompts('chrome-extension-promise', promiseId)
    })
  } else {
    $('#myContainer').append(`<div class="prompt">기사와 관련있는 ${officialName}의 공약이 없습니다. 다른 기사에서 뵈어요!</div>`)
  }
}

const togglePane = function () {
  console.log('a')
  $('#appName').html('<a href="https://api.budgetwiser.org" target="_blank">🐟Tuna News</a>')
  $('#commentsButton').show()
  let txt = $('#collapseButton').text()
  $('#collapseButton').text(txt === 'expand_more' ? 'expand_less' : 'expand_more')
  $('#myContainer').toggle()
}

const initializePromiseList = function () {
  chrome.runtime.sendMessage({action: 'getToken'}, (response) => {
    token = response.token
    isLogedIn = response.isLogedIn
    console.log('token: ' + token)
  })
  const url = 'https://api.budgetwiser.org/api/news/get_by_url/'
  const onSuccess = function (data, textStatus, jqXHR) {
    promises = data.promises
    keywords = data.title_keywords
    const selector = newsSites[window.location.hostname]
    let txt = $(selector).html()
    console.log(txt)
    // keywords.forEach(k => {
    //   txt = txt.replace(k, `<span class="keywords">${k}</span>`)
    // })
    // $(selector).html(txt)

    console.log(data)
    promises.forEach((promise) => {
      promise.object_id = getPromiseId(promise.url)
    })
    officialName = '박원순 서울시장'
    addButtons()
  }
  const newsURL = window.location.href
  console.log(newsURL)
  const myContainer =
  `<div class="promiseBook">
    <div class="promiseBookTitle">
      <div id="appName">
        기사 주제와 관련된, 박원순 시장의 4년 전 약속은?
      </div>
      <div class="promiseBookTitleButtons">
        <i class="material-icons" id="collapseButton">expand_more</i>
      </div>
    </div>
    <div id="myContainer"><img id="loader"></div>
  </div>`
  const selector = newsSites[window.location.hostname]
  if (selector) {
    let marginLeft = parseInt($(selector).css('marginLeft').split('px')[0])
    console.log(marginLeft)
    let paddingLeft = parseInt($(selector).css('paddingLeft').split('px')[0])
    let margin = (marginLeft > paddingLeft ? marginLeft : paddingLeft) + 1
    console.log(paddingLeft)
    $(myContainer).insertBefore($(selector))
    $('.promiseBook').css('marginLeft', margin+'px')
    // $('.promiseBook').css('paddingLeft', paddingLeft)
    $('#loader').attr("src", chrome.extension.getURL('loading.gif'))
    // $('#collapseButton').click(function () {
    //   togglePane()
    // })
    $('.promiseBookTitle').click(function(ev){
      togglePane()
    })

    $.get(url, {url: newsURL}, onSuccess).fail(function () {
      $('#myContainer').empty().append(`<div class="prompt">서버 오류입니다. 조금 뒤 다시 시도해주세요!</div>`)
    })
  }
}

initializePromiseList()
