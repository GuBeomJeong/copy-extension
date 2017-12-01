
function injectScript(){
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>{

        if (changeInfo.status !== 'loading') return;

        chrome.tabs.executeScript(tabId, {
            code: 'var injected = window.copyInjected; window.copyInjected = true; injected;',
            runAt: 'document_start'
        }, (res) => {

            if (chrome.runtime.lastError || res[0]){
                return;
            }

            chrome.tabs.executeScript(tabId,{
                file:'script/content.js'
            },()=>{
                if(chrome.runtime.lastError){
                    console.log("inject error");
                }
            })
        });
    });
}

function init(){
    injectScript();

}

init();

