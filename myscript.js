let token = ''
let promises = []
let promise = {}
let promiseId = ''
let budgetId = ''
let budgetIds = []
let promptInstance = {}
let prompts = []
let officialName = ''
let category = ''

const getPromiseId = function () {
  const tokens = promise.url.split('/')
  tokens.pop()
  promiseId = tokens.pop()
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
  let str = `<h3>응답해주셔서 감사합니다.</h3><br><button class="progressButtons" id="endButton">닫기</button>`
  $('#myContainer').append(str)
  $('#endButton').click(function () {
    $('#myContainer').remove()
  })

}
const questions = function () {
  console.log(token)
  $('#myContainer').empty()
  let str = '<div class="promiseTitle"><h3>' + promise.title + '</h3></div>' 
  str += '<div class="questionContent">' + promptInstance.display_text + '</div>'
  $('#myContainer').append(str)
  console.log(promptInstance)
  if(promptInstance.prompt.type === 'likert') {
    $('#myContainer').append('<div class="likertLabels">매우<br>아니다</div>')
    for(let i = promptInstance.prompt.scale_min; i <= promptInstance.prompt.scale_max; i++){
      str = '<button class="buttons progressButtons" id="button' + i + '">' + i + '</button>'
      $('#myContainer').append(str)
      $('#button'+i).click( ()=> {
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
    for(let i = 0; i < promptInstance.response_objects.length; i++){
      str = '<div>'
      str += '<input id="checkbox' + i + '"type="checkbox">'
      str += '<label for="checkbox' + i + '">' + promptInstance.response_objects[i].__str__ + '</label>'
      str += '</div>'
      $('#myContainer').append(str)
    }
    str = '<button class="progressButtons">다음</button>'
    $('#myContainer').append(str)
    $('.progressButtons').click(() => {
      const tags = []
      for(let i = 0; i < promptInstance.response_objects.length; i++){
        const tag = {}
        tag['rating'] = $('input:checkbox[id="checkbox' + i + '"]').is(':checked') ? 1 : 0
        tag['object_id'] = promptInstance.response_objects[i].id
        tags.push(tag)
      }
      setObjectId(promptInstance)
      setResponseObjectIds(promptInstance)

      console.log(tags)
      $.post({
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          "object_id": getObjectId(promptInstance.prompt.prompt_object_type),
          "tags": tags
        }),
        url: promptInstance.response_create_url
      })
      if(!promptInstance.next_prompt_instance) {
        promptEnd()
      }
      const payload = {
        "object_id": getObjectId(promptInstance.next_prompt.prompt_object_type),
      }
      if(promptInstance.next_prompt.response_object_type === promptInstance.prompt.response_object_type){
        payload['response_object_ids'] = getResponseObjectIds(promptInstance.next_prompt.response_object_type).reduce(function(prev, cur){
          return prev + ',' + cur
        })
      }
      $.get(promptInstance.next_prompt_instance, payload).then((data) => {
        console.log(data)
        promptInstance = data
        questions()
      })
    })
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

}
const addButtons = function () {
  $('#myContainer').empty()
  $('#myContainer').append('<div class="prompt">이 기사와 관련있는 ' + officialName + '의 공약입니다.</div>')  
  promise = promises[Math.floor(Math.random() * promises.length)]
  getPromiseId()
  let str = '<button class="promiseTitleButton">' + promise.title + '</button>'
  $('#myContainer').append(str)
  $('#myContainer').append('<div class="prompt">이 공약에 대한 의견을 남겨주세요.</div>')
  // $('#myContainer').append('<a id="noneBtn">다른 공약 보기</a>')
  $('#noneBtn').click(function (ev) {
    $('#myContainer').empty()
    addButtons()
  })
  $('.promiseTitleButton').click(async function (ev) {
    prompts = await $.get('https://api.budgetwiser.org/api/prompt-sets/chrome-extension/', {
      "object_id": promiseId
    })
    promptInstance = await $.get(prompts.next_prompt_instance, {
      "object_id": promiseId
    })
    questions()
  })
}
const initializePromiseList = function () {
  chrome.runtime.sendMessage({action: 'getToken'}, (response) => {
    token = response.token
  })
  // $('.da').empty()
  // $('.da').append('<div class="promiseBook">PromiseBook</div><div id="myContainer"><img id="loader"></div>')
  // // $('#modal').css({
  // //   'position': 'relative',
  // //   'top': '50%',
  // //   'transform': 'translateY(-50%)',
  // //   'text-align': 'center'
  // // })
  // $('#loader').attr("src", chrome.extension.getURL('loading.gif'))
  // // $('#myContainer').dialog({
  // //   position: {
  // //     my: 'right center',
  // //     at: 'right center+25%'
  // //   },
  // //   height: 300,
  // //   minWidth: 450
  // // })
  const url = 'https://api.budgetwiser.org/api/news/get_by_url/'
  const onSuccess = function (data, textStatus, jqXHR) {
    category = data.categories[0]
    promises = data.promises
    officialName = '박원순 서울시장'
    addButtons()
  }
  const newsURL = window.location.href
  if(newsURL.startsWith('http://news.naver.com/main/read.nhn')){
    $('.da').empty()
    $('.da').append('<div class="promiseBook">PromiseBook</div><div id="myContainer"><img id="loader"></div>')
    $('#loader').attr("src", chrome.extension.getURL('loading.gif'))
    $.get(url, {url: newsURL}, onSuccess)
  }
}

initializePromiseList()
