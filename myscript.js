let token = ''
let promises = []
let object = {}
let promiseId = ''
let budgetId = ''
let budgetIds = []
let promptInstance = {}
let prompts = []
let curPromptIdx = 0
let officialName = ''
let category = ''
let labels = ['중요도', '관련도','인지도','선호도','이행도']
let chart = {}
let scores = []

const showCharts = function (datasets){
  let ctx = document.getElementById('myChart').getContext('2d')
  chart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      scale: {
        ticks: {
          min: 1,
          max: 5,
          stepSize: 1
        }
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

const promptEnd = function () {
  $('#myContainer').empty()
  let str = `<h3>응답해주셔서 감사합니다.</h3><br><button class="progressButtons" id="endButton">다른 공약 보기</button>`
  $('#myContainer').append(str)
  $('#endButton').click(function () {
    $('#myContainer').empty()
    addButtons()
  })

}
const questions = function () {
  curPromptIdx += 1
  $('#myContainer').empty()
  let str = '<div class="promiseTitle"><h3>' + object.title + '</h3></div>' 
  str += '<div class="questionContent">' + promptInstance.display_text + '</div>'
  $('#myContainer').append(str)
  console.log(promptInstance)
  if(promptInstance.prompt.type === 'likert') {
    $('#myContainer').append('<div class="likertLabels">매우<br>아니다</div>')
    for(let i = promptInstance.prompt.scale_min; i <= promptInstance.prompt.scale_max; i++){
      str = `<button class="progressButtons" id="button${i}">${i}</button>`
      // '<button class="buttons progressButtons" id="button' + i + '">' + i + '</button>'
      $('#myContainer').append(str)
      $('#button'+i).click( ()=> {
        scores.push(i)
        $.post({
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
        }
        $.get(promptInstance.next_prompt_instance, {"object_id": getObjectId(promptInstance.next_prompt.prompt_object_type)}).then((data) => {
          console.log(data)
          promptInstance = data
          questions()
        })
      })
    }
    $('#myContainer').append('<div class="likertLabels">매우<br>그렇다</div>')
  } else if (promptInstance.prompt.type === 'tagging') {
    // for(let i = 0; i < promptInstance.response_objects.length; i++){
    //   str = '<div>'
    //   str += '<input id="checkbox' + i + '"type="checkbox">'
    //   str += '<label for="checkbox' + i + '">' + promptInstance.response_objects[i].__str__ + '</label>'
    //   str += '</div>'
    //   $('#myContainer').append(str)
    // }
    $('#myContainer').empty()
    $('#myContainer').append('<div class="questionContent">공약 평가 완료! 다른 사람들의 의견을 확인해보세요.</div>')
    $('#myContainer').append('<canvas id="myChart" width="100%" height="100%"></canvas>')
    $('#myContainer').append('<button id="showBudgets" class="promiseTitleButton">관련 사업 보기</button>')
    $('#showBudgets').click(function () {
      $('#myContainer').empty().append(str)
      promptInstance.response_objects.forEach(function(obj){
        str = `<button class="tagButtons" id="button${obj.id}">${obj.__str__}</button>`
        $('#myContainer').append(str)
        $(`#button${obj.id}`).click((ev) => {
          budgetId = obj.id
          object = obj
          object.title = obj.__str__
          console.log(object)
          setPrompts('chrome-extension-budget', budgetId)
        })
      })
    })

    showCharts([{
      data: scores,
      label: '점수'
    }])
    
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
    str = '<button class="progressButtons">다음</button>'
    $('#myContainer').append(str)
    $('.progressButtons').click(() => {
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
  for (let i = 1; i <= prompts.ordered_prompts.length; i++) {
    if(!labels[i-1]){
      break
    }
    str = ''
    if (i < curPromptIdx){
      str += `<div class="progressIndicator done">${labels[i-1]}</div>`
    } else if (i == curPromptIdx){
      str += `<div class="progressIndicator current">${labels[i-1]}</div>`
    } else {
      str += `<div class="progressIndicator notyet">${labels[i-1]}</div>`
    }
    $('#progressIndicator').append(str)
  }
}
const addButtons = function () {
  $('#myContainer').empty()
  $('#myContainer').append(`<div class="prompt">이 기사와 관련있는 ${officialName}의 공약입니다.</div>`)  
  object = promises[Math.floor(Math.random() * promises.length)]
  // console.log(promises)
  promiseId = object.object_id
  let str = `<div class="promiseTitle"><h3>${object.title}</h3></button>`
  $('#myContainer').append(str)
  $('#myContainer').append('<div class="prompt">20대 남성 대학원생과 가장 연관있는 공약입니다. 이 공약에 대해 어떻게 생각하시나요?</div>')
  $('#myContainer').append('<button class="promiseTitleButton">이 공약 평가하기</button>')
  $('#noneBtn').click(function (ev) {
    $('#myContainer').empty()
    addButtons()
  })
  $('.promiseTitleButton').click(function(ev) {
    setPrompts('chrome-extension-promise', promiseId)
  })
}
const initializePromiseList = function () {
  chrome.runtime.sendMessage({action: 'getToken'}, (response) => {
    token = response.token
  })
  const url = 'https://api.budgetwiser.org/api/news/get_by_url/'
  const onSuccess = function (data, textStatus, jqXHR) {
    category = data.categories[0]
    promises = data.promises
    console.log(data.categories)
    promises.forEach((promise) => {
      promise.object_id = getPromiseId(promise.url)
    })
    officialName = '박원순 서울시장'
    addButtons()
  }
  const newsURL = window.location.href
  console.log(newsURL)
  const myContainer = '<div class="promiseBook">PromiseBook</div><div id="myContainer"><img id="loader"></div>'
  if(newsURL.startsWith('http://news.naver.com/main/read.nhn')){
    $('.da').empty()
    $('.da').append(myContainer)
  } else if (newsURL.startsWith('http://v.media.daum.net/v/')){
    $('.hcg_media_pc_mAside').prepend(myContainer)
    $('.daum_ddn_area').remove()
    // $('#loader').attr("src", chrome.extension.getURL('loading.gif'))
    // $.get(url, {url: newsURL}, onSuccess)
  } else if (newsURL.startsWith('http://news.chosun.com/site/data')) {
    console.log('asdf')
    $('.news_aside').prepend(myContainer)
    $('.art_ad_aside').remove()
    // $('#loader').attr("src", chrome.extension.getURL('loading.gif'))
    // $.get(url, {url: newsURL}, onSuccess)
  } else if(newsURL.startsWith('http://www.hani.co.kr')) {
    $('#ad_kisa_r01').empty().append(myContainer)
  }
  $('#loader').attr("src", chrome.extension.getURL('loading.gif'))
  $.get(url, {url: newsURL}, onSuccess)
  // let ctx = document.getElementById('myChart').getContext('2d')
  // chart = new Chart(ctx, {
  //   type: 'radar',
  //   label: '점수',
  //   data: {
  //     labels: labels,
  //     datasets: [{
  //         data: [1, 2, 3, 4, 5, 4]
  //     }]
  //   }
  // })
}

initializePromiseList()
