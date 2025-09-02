
const body=document.querySelector('body');
const user=document.querySelector('.user');
const modal=document.querySelector('.modal');
const cardsContainer=document.querySelector('.cardsContainer');
const cardsImages=document.getElementsByClassName('cardImage');
const indexBar=document.querySelector('.indexBar');

const url=new URL(document.URL);

cardsContainer.addEventListener('click',async (e)=>{
    if(e.target.dataset.genres){
        // help(`${url.origin}/filter?genres=Action,Adventure&rating=8&language=English&countries=USA&duration=136&year=2020`);

        let genres=url.searchParams.get('genres');
        if(genres){
            let updatedGenres=[...genres.split(','),e.target.dataset.genres];
            url.searchParams.set('genres',updatedGenres.join(','));
            help(url);
        }
        else{
            url.searchParams.set('genres',e.target.dataset.genres);
            help(url);
        }
    }
    else{
        Array.from(cardsContainer.children).forEach(itm=>{
            if(itm.contains(e.target)){
                url.searchParams.set('movie',itm.dataset.id);
                console.log('calling ',url);
                help(url);
            }
        });
    }
})

indexBar.addEventListener('click',(e)=>{
    if(e.target.dataset.action==='next'){
        let page=url.searchParams.get('page');
        if(page){url.searchParams.set('page',String(Number(page)+1));}
        else{
            url.searchParams.set('page','1');
        }
        console.log(url);
        help(url);
    }
    else if(e.target.dataset.action==='previous'){
        let page=url.searchParams.get('page');
        if(page){
            page=Number(page);
            url.searchParams.set('page',String(page-1));
            help(url);
        }
    }
})

user.addEventListener('click',(e)=>{
    modal.style.display='flex';
    modal.children[0].children[1].style.display='flex';
    body.classList.add('noScroll');
})

modal.addEventListener('click',(e)=>{
    let modalHeader=modal.children[0].children[0];
    let modalBody=modal.children[0];
    if(!modal.children[0].contains(e.target)||e.target.dataset.action==='close'){
        modal.style.display='none';
        body.classList.remove('noScroll');
        modalHeader.children[0].children[0].classList.add('active');
        modalHeader.children[0].children[1].classList.remove('active');
        modalBody.children[1].style.display='flex';
        modalBody.children[2].style.display='none';
    }
    else if(e.target.dataset.action==='login'){
        if(!modalHeader.children[0].children[0].classList.contains('active')){
            modalHeader.children[0].children[0].classList.add('active');
            modalHeader.children[0].children[1].classList.remove('active');
            modalBody.children[1].style.display='flex';
            modalBody.children[2].style.display='none';
        }
    }
    else if(e.target.dataset.action==='signup'){
        if(!modalHeader.children[0].children[1].classList.contains('active')){
            modalHeader.children[0].children[1].classList.add('active');
            modalHeader.children[0].children[0].classList.remove('active');
            modalBody.children[2].style.display='flex';
            modalBody.children[1].style.display='none';
        }
    }
})

function help(url){
    window.location.href=url;
}

Array.from(cardsImages).forEach(async itm=>{
    itm.children[0].onerror = () => {
        itm.children[0].src='https://i.pinimg.com/474x/18/19/92/18199239e858f305ffe5898ba0b0b4c9.jpg';
        itm.parentElement.parentElement.nextElementSibling.innerHTML+=`<div class="img">
                                          <div class="circle">
                                          </div>
                                          <div class="circle" id="right">
                                          </div>
                                          <div class="circle" id="bottom">
                                          </div>
                                      </div>`;
    };
});
