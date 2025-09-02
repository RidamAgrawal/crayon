

function prepareCards1(items){
    let arr=[];
    items.map((itm)=>{
        let card=document.createElement('div');
        card.classList.add('card');

        const posterUrl=itm.poster;
        const fallbackUrl='images/subscribeBackground.png';

        const img = new Image();
        img.onload = () => {
            card.style.backgroundImage = `url('${posterUrl}')`;
        };
        img.onerror = () => {
            card.style.backgroundImage = `url('${fallbackUrl}')`;
        };
        img.src = posterUrl;

        let details=document.createElement('div');
        details.classList.add('details');
        let title=document.createElement('span');
        title.innerText=itm.title;
        details.appendChild(title);
        let pricing=document.createElement('div');
        pricing.classList.add('pricing');
        let pricingTxt=document.createElement('span');
        pricingTxt.classList.add('price');
        pricingTxt.innerText=itm.runtime+'mins';
        pricing.appendChild(pricingTxt);
        details.appendChild(pricing);
        card.appendChild(details);
        arr.push(card);
    })
    return arr;
}
function prepareCards2(items){
    let arr=[];
    items.map((itm)=>{
        let card=document.createElement('div');
        card.classList.add('card');

        let imgContainer=document.createElement('div');
        imgContainer.className='img';
        let img=document.createElement('img');
        img.src = itm.poster;
        img.alt = itm.title;
        img.onerror = function () {
            this.onerror = null;
            this.src = 'images/subscribeBackground.png';
        };
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);
        let details=document.createElement('div');
        details.classList.add('details');
        let info=document.createElement('div');
        info.className='info';
        let title=document.createElement('span');
        title.innerText=itm.title;
        info.appendChild(title);
        let runtime=document.createElement('span');
        runtime.innerText=itm.runtime+" mins";
        info.appendChild(runtime);
        details.appendChild(info);
        let yr=document.createElement('span');
        yr.innerText=itm.year;
        details.appendChild(yr);
        card.appendChild(details);
        arr.push(card);
    })
    return arr;
}
function prepareCards3(items){
    let arr=[];
    items.map((itm)=>{
        let card=document.createElement('div');
        card.classList.add('card');

        let imgContainer=document.createElement('div');
        imgContainer.className='img';
        let img=document.createElement('img');
        img.src = itm.poster;
        img.alt = itm.title;
        img.onerror = function () {
            this.onerror = null;
            this.src = 'images/subscribeBackground.png';
        };
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);
        let details=document.createElement('div');
        details.classList.add('details');
        let info=document.createElement('div');
        info.className='info';
        let title=document.createElement('span');
        title.innerText=itm.title;
        info.appendChild(title);
        let runtime=document.createElement('span');
        runtime.innerText=itm.runtime+" mins";
        info.appendChild(runtime);
        details.appendChild(info);
        let yr=document.createElement('span');
        yr.innerText=itm.year;
        details.appendChild(yr);
        card.appendChild(details);
        arr.push(card);
    })
    return arr;
}
