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
        label: d.label,
        data: d.prompt_data.map(r => r.mean_rating),
        borderColor: '#F2526E',
        backgroundColor: 'rgba(243, 188, 200, 0.3)'
      }
    })
    console.log(data)
    data.push({
      label: '내 점수',
      data: scores,
      borderColor: '#6DDDF2',
      backgroundColor: 'rgba(193, 240, 244, 0.3)'
    })
    $('#myContainer').empty()
    $('#myContainer').append('<div class="questionContent">공약 평가 완료! 다른 사람들의 의견을 확인해보세요.</div>')
    $('#myContainer').append('<div id="myChartDiv"><canvas id="myChart" ></canvas></div>')
    $('#myContainer').append('<button type="button" id="showBudgets" class="promiseTitleButton">관련 사업 보기</button>')
    $('#showBudgets').click(function (ev) {
      // ev.preventDefault()
      setPrompts('chrome-extension-budget')

    })
    showCharts(labels, data)
  } else if (curPromptSet === 'chrome-extension-budget') {
    let stats = await $.get(`https://api.budgetwiser.org/api/prompt-sets/${curPromptSet}/statistics/`, {object_ids: getObjectId('budget')})
    let labels = stats.ordered_prompts.slice(1).map(p => p.label)
    let data = stats.series.slice(1).map(d => {
      return {
        label: d.label,
        data: d.prompt_data.map(r => r.mean_rating),
        backgroundColor: 'rgba(243, 188, 200, 0.3)',
        borderColor: '#F2526E'
      }
    })
    console.log(data)
    data.push({
      label: '내 점수',
      data: scores,
      borderColor: '#6DDDF2',
      backgroundColor: 'rgba(193, 240, 244, 0.3)'
    })
    $('#myContainer').empty()
    let str = `<div class="questionContent">사업 평가 완료! 다른 사람들의 의견을 확인해보세요.</div><div id="myChartDiv"><canvas id="myChart"></canvas></div>다른 공약에 대한 의견도 남겨주세요!<br><button type="button" class="progressButtons" id="endButton">다른 공약 보기</button>`
    $('#myContainer').append(str)
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
  let str = '<div class="promiseTitle"><h3>' + object.title + '</h3></div>'
  str += '<div class="questionContent">' + promptInstance.display_text + '</div>'
  $('#myContainer').append(str)
  console.log(promptInstance)
  if(promptInstance.prompt.type === 'likert') {
    $('#myContainer').append('<div class="likertLabels">매우 아니다</div>')
    for(let i = promptInstance.prompt.scale_min; i <= promptInstance.prompt.scale_max; i++){
      str = `<button type="button" class="progressButtons" id="button${i}">${i}</button>`
      // '<button class="buttons progressButtons" id="button' + i + '">' + i + '</button>'
      $('#myContainer').append(str)
      $('#button'+i).click( async (ev)=> {
        // ev.preventDefault()
        $(ev.target).animate({ opacity: 0 });
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
    str = '<input type="text" id="comment"></input>'
    $('#myContainer').append(str)
    str = '<button type="button" class="progressButtons">다음</button>'
    $('#myContainer').append(str)
    $('.progressButtons').click((ev) => {
      // ev.preventDefault()
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
  let len = curPromptSet === 'chrome-extension-budget' ? prompts.ordered_prompts.length - 1 : prompts.ordered_prompts.length
  for (let i = 1; i <= len; i++) {
    str = ''
    if (i < curPromptIdx){
      str += `<span class="progressIndicator done">●</span>`
    } else if (i == curPromptIdx){
      str += `<span class="progressIndicator current">●</span>`
    } else {
      str += `<span class="progressIndicator notyet">●</span>`
    }
    $('#progressIndicator').append(str)
  }
}
const addButtons = function () {
  $('#myContainer').empty()
  if(promises.length) {
    $('#myContainer').append(`<div class="prompt">이 기사와 관련있는 ${officialName}의 공약입니다.</div>`)
    object = promises[Math.floor(Math.random() * promises.length)]
    console.log(promises)
    promiseId = object.object_id
    let str = `<div class="promiseTitle"><h3>${object.title}</h3></button>`
    $('#myContainer').append(str)
    $('#myContainer').append('<div class="prompt"><span class="emphasis-text">20대 남성 대학원생</span>과 가장 연관있는 공약입니다. 이 공약에 대해 어떻게 생각하시나요?</div>')
    $('#myContainer').append('<button type="button" id="noneBtn" class="promiseTitleButton">다른 공약 보기</button>')
    $('#myContainer').append('<button type="button" id="evalBtn" class="promiseTitleButton">이 공약 평가하기</button>')
    $('#noneBtn').click(function (ev) {
      console.log(ev)
      // ev.preventDefault()
      $('#myContainer').empty()
      addButtons()
    })
    $('#evalBtn').click(function(ev) {
      // ev.preventDefault()
      setPrompts('chrome-extension-promise', promiseId)
    })
  } else {
    $('#myContainer').append(`<div class="prompt">기사와 관련있는 ${officialName}의 공약이 없습니다. 다른 기사에서 뵈요!</div>`)
  }

}
const initializePromiseList = function () {
  chrome.runtime.sendMessage({action: 'getToken'}, (response) => {
    token = response.token
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
        박원순 시장이 4년 전에 뭐라고 했을까요?
      </div>
      <div class="promiseBookTitleButtons">
        <a href="https://goo.gl/forms/IFYwyUK68NiEWEsj2" target="_blank" id="commentsButton">Comments?</a>
        <button type="button" class="titleButtons" id="collapseButton">+</button>
      </div>
    </div>
    <div id="myContainer"><img id="loader"></div>
  </div>`
  const selector = newsSites[window.location.hostname]
  if (selector) {
    $(myContainer).insertBefore($(selector))
    $('#loader').attr("src", chrome.extension.getURL('loading.gif'))
    $('#collapseButton').click(function () {
      $('#appName').html('<a href="https://api.budgetwiser.org" target="_blank">PromiseBook</a>')
      let txt = $('#collapseButton').text()
      $('#collapseButton').text(txt === '+' ? '-' : '+')
      $('#myContainer').toggle()
    })

    $.get(url, {url: newsURL}, onSuccess)
  }  
}

initializePromiseList()
