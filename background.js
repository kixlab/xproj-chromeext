var api_host = 'https://api.budgetwiser.org';

var auth = new OAuth2('custom', {
    client_id: 'chromeextension',
    client_secret: '',
    api_scope: '',
    host: api_host
});

function updateContextMenu() {
    // setInterval(() => {alert('asdf')}, 1000)
    chrome.contextMenus.removeAll();
    if (auth.hasAccessToken()) {
        var user = auth.get('user');
        if (user) {
            chrome.contextMenus.create({
                title: "Logged in as " + user.username,
                contexts: ["browser_action"],
                enabled: false
            });
        }
        chrome.contextMenus.create({
            title: "Logout",
            contexts: ["browser_action"],
            onclick: function() {
                auth.clearAccessToken();
                updateContextMenu();
            }
        });
    } else {
        chrome.contextMenus.create({
            title: "Login",
            contexts: ["browser_action"],
            onclick: function() {
                getUser(function() {
                    updateContextMenu();
                });
            }
        });
    }
}
updateContextMenu();

function getUser(callback) {
    auth.authorize(function() {
        console.log('authorized, sending request');
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(event) {
            if (xhr.readyState == 4) {
                if(xhr.status == 200) {
                    console.log(xhr.responseText);
                    var data = JSON.parse(xhr.responseText);
                    auth.set('user', data);
                    
                    if (callback) {
                        callback(data);
                    }
                } else {
                    // Request failure: something bad happened
                }
            }
        };
        xhr.open('GET', api_host + '/api/auth/user/', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', 'Bearer ' + auth.getAccessToken());
        xhr.send();
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('background received message', request);

    if (request.action == "authenticate") {
        console.log('Authorizing...');

        auth.authorize(function() {
            console.log('authorized user');
            sendResponse({msg: "success"});
        });
    }
    if (request.action == 'getUser') {
        getUser(function(data) {
            sendResponse(data);      
        });
    }

    if (request.action == 'authenticate') {
        getUser(function () {
            updateContextMenu()
            sendResponse({token: auth.getAccessToken()})
        })
    }

    if(request.action == 'getToken') {
        // auth.authorize()
        let token = auth.getAccessToken()
        console.log('token from background.js: ' + token)
        if(token){
            auth.authorize()
            sendResponse({token: token, isLogedIn: true})
        } else {
            if(localStorage.getItem('token')) {

                // getUser(function() {
                //     updateContextMenu();
                //     token = auth.getAccessToken()
                //     sendResponse({token: token})
                // });
                sendResponse({token: localStorage.getItem('token'), isLogedIn: false})
                // let token = localStorage.getItem('token')
                // console.log(auth.getConfig())
                // let authURL = auth.adapter.authorizationCodeURL(auth.getConfig())
                // console.log('authURL: '+)
                // let consolidateURL = api_host + `/accounts/consolidate-user/?token=${token}&next=${authURL}`
                // chrome.tabs.create({url: consolidateURL}, function(tabs) {
                //     //
                // })
            } else {
                let xhr = new XMLHttpRequest()
                xhr.onreadystatechange = function (event) {
                    if(xhr.readyState == 4){
                        if(xhr.status == 200) {
                            // console.log(xhr.responseText)
                            let data = JSON.parse(xhr.responseText)
                            // auth.setSource(data)
                            // console.log(auth.getAccessToken())
                            token = data.access_token
                            console.log(token)
                            localStorage.setItem('token', token)
                            sendResponse({'token': token, isLogedIn: false})
                        }
                    }
                }
                xhr.open('POST', api_host + '/oauth/auto-signup/', true)
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Authorization', 'Bearer ' + auth.getAccessToken());
                xhr.send();
            }
        }
        
    }

    return true; // async response
});
    
    