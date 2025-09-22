
const recentsContainer = document.querySelector('.recents');
const popDesContainer = document.querySelector('.popDes');
const recommendedContainer = document.querySelector('.recommended');
const searchBtn = document.querySelector('#searchBtn');
const filterBtn = document.querySelector('#filterBtn');
const searchInput = document.querySelector('#searchInput');
const searchForm = document.querySelector('.searchForm');
const filterSelect = document.getElementsByClassName('select');

var recentsTimer = null;
var popDesTimer = null;
var recommTimer = null;
var searchTimer = null;
var filterTimer = null;

recentsContainer.addEventListener('click', (event) => {
    if (event.target.dataset.action === 'left') {
        moveSlider(recentsTimer, 'left', recentsContainer);
    }
    else if (event.target.dataset.action === 'right') {
        moveSlider(recentsTimer, 'right', recentsContainer);
    }
});
popDesContainer.addEventListener('click', (event) => {
    if (event.target.dataset.action === 'left') {
        moveSlider(popDesTimer, 'left', popDesContainer.children[1]);
    }
    else if (event.target.dataset.action === 'right') {
        moveSlider(popDesTimer, 'right', popDesContainer.children[1]);
    }
    // console.log(popDesContainer.children[1]);
})
recommendedContainer.addEventListener('click', (event) => {
    if (event.target.dataset.action === 'left') {
        moveSlider(recommTimer, 'left', recommendedContainer.children[1]);
    }
    else if (event.target.dataset.action === 'right') {
        moveSlider(recommTimer, 'right', recommendedContainer.children[1]);
    }
    // console.log(recommendedContainer.children[1]);
})

function moveSlider(timer, type, container) {
    if (timer) {
        return;
    }
    if (type === 'right') {
        container.children[1].children[container.children[1].children.length - 1].classList.add(type);
    }
    else {
        container.children[1].children[0].classList.add(type);
    }
    timer = setTimeout(() => {
        if (type === 'right') {
            container.children[1].children[container.children[1].children.length - 1].classList.remove(type);
            container.children[1].appendChild(container.children[1].children[0]);
        }
        else {
            container.children[1].children[0].classList.remove(type);
            container.children[1].prepend(container.children[1].children[container.children[1].children.length - 1]);
        }
        timer = null;
    }, 1000);
}


const fetchTopMovies = async () => {

    await fetch(`${url.origin}/movies/filter`, {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            imdbVotes: '4000',
            limit: '8'
        })
    })
        .then(res => res.json())
        .then(data => {
            data = data.filter((itm, index, self) => index === self.findIndex((t) => (t.title === itm.title)));
            // console.log(data);
            popDesContainer.children[1].children[1].innerHTML = '';
            Array.from(prepareCards1(data)).forEach(itm => {
                popDesContainer.children[1].children[1].appendChild(itm);
            });
        });
}
fetchTopMovies();

const fetchTopRecommended = async () => {
    await fetch(`${url.origin}/movies/filter`, {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            imdbRating: 8.5,
            limit: 10
        })
    })
        .then(res => res.json())
        .then(data => {
            data = data.filter((itm, index, self) => index === self.findIndex((t) => (t.title === itm.title)));
            // for(let i=0;i<data.length-(data.length%2===0)?1:0;i++){
            //     recommendedContainer.children[1].children[1].innerHTML+=
            //     `<div class="card">
            //         <div class="img"><img src="${data[i].poster}" onerror="this.onerror=null; this.src='images/subscribeBackground.png';" alt="img"></div>
            //         <div class="details">
            //             <div class="info">
            //                 <span>${data[i].title}</span>
            //                 <span>${data[i].runtime} mins</span>
            //             </div>
            //             <span>${data[i].year}</span>
            //         </div>
            //     </div>`;
            // }
            if (data.length % 2 === 0) {
                data.pop();
            }
            // console.log(data);
            recommendedContainer.children[1].children[1].innerHTML = '';
            Array.from(prepareCards2(data)).forEach(itm => { recommendedContainer.children[1].children[1].appendChild(itm); });
        });
}
fetchTopRecommended();

function debounce(callback, delay) {
    let timerId;
    return function (...args) {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            callback(...args);
        }, delay);
    }
}
async function debounceCallback(event) {
    if (!event.target.value && /^[A-Za-z]+$/.test(event.target.value) === false) { return; }
    let movies = await searchMovie(event.target.value);
    // console.log(movies);
    let searchSelect = event.target.nextElementSibling.nextElementSibling;
    searchSelect.innerHTML = '';
    let newDiv = document.createElement('div');
    for (let i = 0; i < Math.min(5, movies.length); i++) {
        newDiv.innerHTML += `<li>${movies[i].title}</li>`;
    }
    searchSelect.appendChild(newDiv);
}

const searchDebounceHandler = debounce(debounceCallback, 1000);

searchInput.addEventListener('keyup', searchDebounceHandler);

async function searchMovie(movieTitle) {
    // if(movieTitle.length<=2){return undefined;}
    return await fetch(`${url.origin}/movies/search`, {
        method: 'POST',
        headers:
        {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            search: movieTitle
        })
    })
        .then((res) => res.json());
    //here directly the data is returned through this method
}

async function filterMovie(filter) {
    return await fetch(`${url.origin}/movies/filter`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filter)
    })
        .then(res => res.json());
}

Array.from(filterSelect).forEach(i => {
    i.addEventListener('click', (e) => {
        if (e.target.localName !== 'li') { return; }
        let inputField = i.previousElementSibling.previousElementSibling;
        let values = inputField.value;
        if (inputField.localName !== 'input') { return; }
        if (inputField.id === 'rating' || inputField.id === 'movie' || inputField.id === 'searchInput') {
            values = e.target.innerText;
        }
        else if (!values || values.split(',').indexOf(e.target.innerText) === -1) {
            if (values) {
                values += `,${e.target.innerText}`;
            }
            else {
                values = e.target.innerText;
            }
        }
        inputField.value = values;
        inputField.focus();
    })
});

async function filterCaller(e) {
    let filter = {}
    Array.from([...e.parentElement.children, ...e.parentElement.previousElementSibling.children])
        .forEach(i => {
            if (i.children[0] && i.children[0].value) {
                if (i.children[0].id && i.children[0].id === 'rating') {
                    if (i.children[0].value !== 'All') { filter['imdbRating'] = i.children[0].value.at(-1); }
                }
                else { filter[i.children[0].id] = i.children[0].value; }
            }
        })
    if (Object.keys(filter).length === 0) {
        if (filterTimer) {
            clearTimeout(filterTimer);
        }
        else {
            document.querySelector('.caution.filterCaution').classList.toggle('hide');
        }
        filterTimer = setTimeout(() => {
            document.querySelector('.caution.filterCaution').classList.toggle('hide');
            filterTimer = null;
        }, 1000);
        return;
    }
    // let res=await filterMovie(filter);
    let redirectUrl = `${url.origin}/movieResults?`;

    for (let i in filter) {
        redirectUrl += `${i}=${filter[i]}&`;
    }
    redirectUrl = redirectUrl.slice(0, -1);
    window.location.href = redirectUrl;
}

function searchCaller(element) {
    let parentContainer = element.parentElement;
    let searchString = parentContainer.children[0].children[0].value;
    if (typeof searchString !== 'string' || !searchString) {
        if (searchTimer) {
            clearTimeout(searchTimer);
        }
        else {
            document.querySelector('.caution.searchCaution').classList.toggle('hide');
        }
        searchTimer = setTimeout(() => {
            document.querySelector('.caution.searchCaution').classList.toggle('hide');
            searchTimer = null;
        }, 1000);
        return;
    }
    window.location.href = `${url.origin}/movieResults?search=${searchString}`;
}

searchForm.addEventListener('click', (event) => {
    const element = event.target;
    if (searchBtn.contains(element)) {
        searchCaller(element);
    }
    else if (filterBtn.contains(element)) {
        filterCaller(filterBtn);
    }
    else if (element.localName === 'input') {
        Array.from(filterSelect).forEach(i =>
            i.classList.add('hide')
        )
        element.nextElementSibling?.nextElementSibling?.classList.toggle('hide');
    }
    else {
        Array.from(filterSelect).forEach(i =>
            i.classList.add('hide')
        )
    }
})

async function showRecentSearches() {
    const searches = await fetch(url.origin + '/user/visited')
        .then(res => res.json())
        
    const recentsContainerTileHolder = recentsContainer.querySelector('.Container');
    if (recentsContainerTileHolder && Array.isArray(searches.visitedMovies)) {
        if(searches.visitedMovies.length < 4){
            recentsContainerTileHolder.innerHTML = 'No recently visited movies!';
            return ;
        }
        if(searches.visitedMovies.length%2){searches.visitedMovies.pop();}
        recentsContainerTileHolder.innerHTML = '';
        searches.visitedMovies.forEach(search => {
            const visitedDate=new Date(search.visitedAt);
            recentsContainerTileHolder.innerHTML += `<div class="flightContainer">
                        <div class="toFrom">
                            <img width='50  %' height='80px' src="${search.poster}" alt="movieImage">
                            <div class="to">
                                <span><a href="${url.origin}/moviePage?movieId=${search.movieId}">${search.title}</a></span>
                                <div class="date"><b>Visited on:</b> ${visitedDate.toDateString()}</div>
                            </div>
                        </div>
                    </div>`;
        })
    }
}

showRecentSearches();