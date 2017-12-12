const oCopyContainerEl = document.querySelector("#copy_container");
const oDeleteBtnEl = document.querySelector("#delete_btn");
const oNextPageBtnEl = document.querySelector("#next_page_btn");
const oPrePageBtnEl = document.querySelector("#pre_page_btn");
const oPageNumEl = document.querySelector("#page_num");
const oTotalPageNumEl = document.querySelector("#total_page_num");
const oSearchInputEl = document.querySelector("#search_input");
const oPageInfoEl = document.querySelector("#page_info");
const oSnackbarEl = document.querySelector("#snackbar")

const N_DEFAULT_LIMIT = 4;

let nPage = 1;
let nCurrentDate = 0;
let nPageLimit = 1;

let aItems;
let aCachedTemplate;

let oFuse;

function makeTemplate(item) {
    let oDate = new Date(item.nTimestamp);

    let sTime = oDate.toLocaleTimeString();
    let sUri = item.sUri;
    let sData = item.sData;
    let sTitle = item.sTitle;

    let nTempstamp = oDate.setHours(0, 0, 0, 0);

    let sTemplate = ``;

    if (nCurrentDate !== nTempstamp) {
        nCurrentDate = nTempstamp;
        sTemplate += `<p class = "date_separation">${oDate.toLocaleDateString()}</p>`;
    }

    sTemplate += `<div><span class="copy_data copy_content copy_content_hide">${sData}</span>
                    <p class="copy_data copy_uri copy_uri_hide" data-uri ="${sUri}">${sTitle}</p>
                    <span>${sTime}</span><img class="content_copy_img"><hr/></div>`;
    return sTemplate;
}

function renderData({nShowLimit}) {
    let sTemplate = aCachedTemplate[nPage - 1];
    if (!sTemplate) {
        sTemplate = "";
        let nItemsLength = aItems.length;
        //let nLength = nItemsLength < nShowLimit ? nItemsLength : nShowLimit;

        let nStart = nItemsLength - (nPage - 1) * nShowLimit - 1;
        let nEnd = nItemsLength - nPage * nShowLimit;
        nEnd = nEnd > 0 ? nEnd : 0;

        for (let i = nStart; i >= nEnd; i--) {
            sTemplate += makeTemplate(aItems[i]);
        }
        aCachedTemplate[nPage - 1] = sTemplate;
    }
    nCurrentDate = 0;
    oCopyContainerEl.innerHTML = sTemplate;
}

function renderSearchData({aItems}) {

    let sTemplate = "";
    let nItemsLength = aItems.length;
    //let nLength = nItemsLength < nShowLimit ? nItemsLength : nShowLimit;

    for (let i = nItemsLength - 1; i >= 0; i--) {
        sTemplate += makeTemplate(aItems[i]);
    }

    nCurrentDate = 0;
    oCopyContainerEl.innerHTML = sTemplate;
}

function renderPageData() {
    oPageNumEl.innerHTML = nPage;
}

function renderInitData() {
    oTotalPageNumEl.innerHTML = nPageLimit;
}

function getData() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("copyList", (items) => {
            if (items.copyList) {
                aItems = items.copyList;
                nPageLimit = parseInt((aItems.length - 1) / N_DEFAULT_LIMIT) + 1;
                aCachedTemplate = new Array(nPageLimit);
                resolve(aItems);
            } else {
                reject();
            }
        })
    });
}

function onEvent() {
    oDeleteBtnEl.addEventListener("click", (e) => {
        if (confirm("do you want to delete?") == true) {    //확인
            chrome.storage.local.clear(() => {
                window.location.reload();
            });
        } else {   //취소
            return;
        }


    });

    oCopyContainerEl.addEventListener("click", (e) => {
        let oTarget = e.target;
        let oClassList = oTarget.classList;

        if (oClassList.contains("copy_content_hide")) {
            oClassList.remove("copy_content_hide");
        } else if (oClassList.contains("copy_uri")) {
            chrome.tabs.create({url: e.target.dataset.uri}, function (tab) {

            });
        } else if (oClassList.contains("content_copy_img")) {

            let oDataNode = e.target.parentNode.firstChild;
            let range = document.createRange();
            range.selectNode(oDataNode);
            window.getSelection().addRange(range);

            try {

                document.execCommand('copy');

            } catch (err) {
                console.log('Oops, unable to copy');
                window.getSelection().removeAllRanges();
                return;
            }

            oSnackbarEl.className = "show";
            setTimeout(
                function () {
                    oSnackbarEl.className = oSnackbarEl.className.replace("show", "");
                }, 3000);


        }
    });

    oNextPageBtnEl.addEventListener("click", (e) => {
        if (nPage < nPageLimit) {
            nPage++;
            renderData({nShowLimit: N_DEFAULT_LIMIT});
            renderPageData();
        }

    });

    oPrePageBtnEl.addEventListener("click", (e) => {
        if (nPage > 1) {
            nPage--;
            renderData({nShowLimit: N_DEFAULT_LIMIT});
            renderPageData();
        }
    });

    oSearchInputEl.addEventListener("keyup", (e) => {
        let sValue = oSearchInputEl.value;
        if (sValue === "") {
            oPageInfoEl.style.display = "";
            renderData({nShowLimit: N_DEFAULT_LIMIT});
        } else {
            let aResult;
            aResult = oFuse.search(oSearchInputEl.value);
            aResult.sort((a, b) => {
                return a.nTimestamp > b.nTimestamp
            })
            renderSearchData({aItems: aResult});
            oPageInfoEl.style.display = "none";
        }
    });

}

function initFuse() {
    let options = {
        keys: ['sData', 'sTitle'],
        threshold: 0.1,
        tokenize: true
    };

    oFuse = new Fuse(aItems, options);
}

function init() {
    getData()
        .then((items) => {
            renderData({nShowLimit: N_DEFAULT_LIMIT});
            renderInitData();
            initFuse();
        })
        .catch(() => {
            console.warn("no data");
        });
    onEvent();
}

init();