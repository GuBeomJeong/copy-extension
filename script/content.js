let oDiv = document.createElement("div");
let sTotalData = "";
let bDoubleFlag =false;
let bExpandFlag = false;

function listener(e){
    let oSelection = window.getSelection();
    let sData = oSelection.toString();
    let sTimestamp = Date.now();
    let sBaseUri = oSelection.anchorNode.baseURI;
    let oSendObj = {};
    oSendObj.sTimestamp= sTimestamp;
    oSendObj.sData = sData;
    oSendObj.sUri = sBaseUri;

    if(!bDoubleFlag){
        bDoubleFlag = true;
        setTimeout(()=>{
            bDoubleFlag = false;
            if(!bExpandFlag){
                sTotalData="";
                while (oDiv.firstChild) {
                    oDiv.removeChild(oDiv.firstChild);
                }
            }
            bExpandFlag = false;
        },1000);

        chrome.storage.local.get("copyList",(items)=>{
            let aCopyList;
            if(items.copyList){
                //aCopyList = JSON.parse(items["copyList"]);
                aCopyList = items.copyList;
            }else{
                aCopyList = [];
            }

            aCopyList.push(oSendObj);

            chrome.storage.local.set({copyList:aCopyList},()=>{
                if(chrome.runtime.lastError){
                    console.warn("storage set error");
                }
            });

        });

    }else{
        let oNode = oSelection.getRangeAt(0).cloneContents();
        bExpandFlag= true;

        oDiv.appendChild(oNode);
        oDiv.appendChild(document.createElement("p"));
        sTotalData += sData+"\n";

        e.clipboardData.setData("text/plain",sTotalData);
        //e.clipboardData.setData("text/html",oDiv.innerHTML);
        // html에 대한 처리는 아직

        e.preventDefault();
    }
}

window.addEventListener("copy",listener);





