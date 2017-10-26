var api_host = 'http://localhost:8000';

var auth = new OAuth2('custom', {
    client_id: 'chromeextension',
    client_secret: '',
    api_scope: '',
    host: api_host
});

function updateContextMenu() {
    chrome.contextMenus.removeAll();
    if (auth.hasAccessToken()) {
        chrome.contextMenus.create({
            title: "Logged in as <>",
            contexts: ["browser_action"],
            enabled: false
        });
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
                auth.authorize(function() {
                    updateContextMenu();
                });
            }
        });
    }
}
updateContextMenu();

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
        auth.authorize(function() {
            console.log('authorized, sending request');
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(event) {
                if (xhr.readyState == 4) {
                    if(xhr.status == 200) {
                        console.log(xhr.responseText);
                        var data = JSON.parse(xhr.responseText);
                        sendResponse(data);                
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

    return true; // async response
});
    
    