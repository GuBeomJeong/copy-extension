const oAppEl = document.querySelector("#app");
const oDeleteBtnEl = document.querySelector("#delete_btn");
const nShowLimit = 4;

function makeTemplate(item){
    let oDate = new Date(item.sTimestamp);

    let sTime = oDate.toLocaleString();
    let sUri = item.sUri;
    let sData = item.sData;

    let sTemplate = `<li>${sData}</li><li>${sUri}</li><li>${sTime}</li><hr/>`;
    return sTemplate;
}

function renderData(items){
    let sTemplate="";
    let length = items.length < nShowLimit ? items.length : nShowLimit;

    for(let i = items.length-1; i>=items.length-length;i--){
        sTemplate += makeTemplate(items[i]);
    }
    oAppEl.innerHTML = sTemplate;
}

function getData(){
    return new Promise((resolve,reject)=>{
        chrome.storage.local.get("copyList",(items)=>{
            if(items.copyList){
                resolve(items.copyList);
            }else{
                reject();
            }
        })
    });
}

function onEvent(){
    oDeleteBtnEl.addEventListener("click",(e)=>{
        chrome.storage.local.clear(()=>{
            oAppEl.innerHTML="";
        });
    })
}

function init(){
    getData()
        .then(renderData)
        .catch(()=>{
            console.warn("no data");
        });
    onEvent();
}

init();