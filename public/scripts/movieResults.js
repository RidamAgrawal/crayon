import select2 from './select2.js';

const searchForm = document.querySelector('.searchForm');
const resultsSection = document.querySelector('.resultsSection');
const query = document.querySelector('.filterQuery');
const filterSection = document.querySelector('.filter');
let page = -1;
let limit = 10;

const filterMap=new Map();
const genresOptions = new Array("Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "Film", "History", "Horror", "Music", "Musical", "Mystery", "News", "Romance", "Sci-fi", "Short", "Sport", "Talk", "Thriller", "War", "Western");
const ratingOptions = new Array("All", "Above 9", "Above 8", "Above 7", "Above 6", "Above 5", "Above 4", "Above 3");
const languageOptions = new Array("English", "Spanish", "French", "Mandarin", "Hindi", "Arabic", "German", "Japanese", "Italian", "Portuguese", "Korean", "Russian", "Turkish");
const countriesOptions = new Array("USA", "India", "China", "UK", "France", "Japan", "South-Korea", "Italy", "Mexico", "Germany", "Spain", "Australia", "Brazil", "Russia", "Turkey");

filterMap.set('genres',new select2('genres',genresOptions));
filterMap.set('rating',new select2('rating',ratingOptions));
filterMap.set('language',new select2('language',languageOptions));
filterMap.set('countries',new select2('countries',countriesOptions));

const inputRow=searchForm.querySelectorAll('.inputRow');
if(inputRow[1]){
    inputRow[1].appendChild(filterMap.get('genres').createSelect2());
    inputRow[1].appendChild(filterMap.get('rating').createSelect2());
    inputRow[1].appendChild(filterMap.get('language').createSelect2());
}
if(inputRow[2]){
    inputRow[2].prepend(filterMap.get('countries').createSelect2());
}

// attaching callbacks so that whenever chip are added or removed reflects changes in filterDropdown section
filterMap.forEach((selects,filterKey)=>{
    selects.onChange(
        (arr)=>{
            const filter=filterSection.querySelector('.'+filterKey);
            Array.from(filter?.children[1].children || [] )
            .forEach(filterItem=>{
                const filterCheckbox=filterItem.querySelector('input');
                if(filterCheckbox && arr.indexOf(filterCheckbox.value)!=-1){
                    filterCheckbox.checked=true;
                }
                else{
                    filterCheckbox.checked=false;
                }
            });

            const activeFilter=filter.querySelector('.active'+filterKey.at(0).toUpperCase()+filterKey.slice(1,));
            if(activeFilter){
                activeFilter.innerHTML='';
                arr.forEach(
                    (label)=>{
                        activeFilter.innerHTML+=`<div class='selectedFilter'><span>${label}</span><svg data-genres='${label}' xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#424242"><path data-genres='${label}' d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg></div>`;
                    }
                )
            }
        }
    )
})

var filterTimer = null;

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

async function searchMovie(movieTitle) {
    // if(movieTitle.length<=2){return undefined;}
    page++;
    return await fetch(`${url.origin}/movies/search`, {
        method: 'POST',
        headers:
        {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            search: movieTitle, page, limit
        })
    })
        .then((res) => res.json())
        .then(showResults);
    //here directly the data is returned through this method
}

async function filterCaller() {
    let filter = {}
    // const genresInput = searchForm.querySelector('input#genres');
    const ratingInput = searchForm.querySelector('input#rating');
    const languageInput = searchForm.querySelector('input#language');
    const countriesInput = searchForm.querySelector('input#countries');
    const durationInput = searchForm.querySelector('input#duration');
    const yearInput = searchForm.querySelector('input#year');
    const searchInput = searchForm.querySelector('input#searchInput');

    if (searchInput.value) {
        searchMovie(searchInput.value);
        return;
    }

    // if (genresInput.value) { filter.genres = genresInput.value; }
    if (ratingInput.value) { filter.rating = ratingInput.value; }
    if (languageInput.value) { filter.language = languageInput.value; }
    if (countriesInput.value) { filter.countries = countriesInput.value; }
    if (durationInput.value) { filter.duration = durationInput.value; }
    if (yearInput.value) { filter.year = yearInput.value; }

    // console.log("filter is ",filter);
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
    page++;
    filter.page = page;
    filter.limit = limit;
    let res = await filterMovie(filter);
    console.log(res);
    showResults(res);
}

function showResults(items) {
    let inputQuery = JSON.parse(query.dataset.query);
    const movieCards = resultsSection.querySelector('.flightCards');
    if (page == 0) {
        movieCards.innerHTML = '';
        movieCards.innerHTML += `<div>
        <span>Showing ${page * limit} out of 1000 Results:</span>
        <h3>filter</h3>
            ${inputQuery.hasOwnProperty('genres') ? `<div><span>genres:</span><span>${inputQuery.genres}</span></div>` : ''}
            ${inputQuery.hasOwnProperty('imdbRating') ? `<div><span>rating:</span><span>${inputQuery.imdbRating}</span></div>` : ''}
            ${inputQuery.hasOwnProperty('language') ? `<div><span>language:</span><span>${inputQuery.language}</span></div>` : ''}
            ${inputQuery.hasOwnProperty('countries') ? `<div><span>language:</span><span>${inputQuery.countries}</span></div>` : ''}
            ${inputQuery.hasOwnProperty('duration') ? `<div><span>language:</span><span>${inputQuery.countries}</span></div>` : ''}
            ${inputQuery.hasOwnProperty('year') ? `<div><span>language:</span><span>${inputQuery.year}</span></div>` : ''}
            ${inputQuery.hasOwnProperty('search') ? `<div><span>search:</span><span>${inputQuery.search}</span></div>` : ''}
    </div>`;
    }
    else { movieCards.removeChild(movieCards.lastElementChild); }


    items.map(i => {
        movieCards.innerHTML += `<div class="flightCard">
                        <div class="airline">
                            <a href='/moviePage?movieId=${i._id}'><img src='${i.poster}' width="35" height="36"></a>                       
                            <a href='/moviePage?movieId=${i._id}'><span>${i.title}</span></a>
                        </div>
                        <div class="flightDetails">
                            <div class="departure">
                                <span>${i.imdb.rating}</span>
                                <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.1058 6.43948L11.1163 5.65526L8.88591 0.765024C8.825 0.631132 8.72477 0.522744 8.60097 0.45686C8.29048 0.29109 7.91317 0.429232 7.75793 0.765024L5.5275 5.65526L0.538023 6.43948C0.400464 6.46074 0.274695 6.53087 0.178403 6.63713C0.0619923 6.76653 -0.00215557 6.94062 5.53105e-05 7.12115C0.00226619 7.30167 0.0706549 7.47386 0.190194 7.59988L3.80015 11.4062L2.94728 16.781C2.92728 16.9061 2.94007 17.0346 2.98421 17.1522C3.02834 17.2698 3.10205 17.3716 3.19698 17.4462C3.29191 17.5208 3.40426 17.5651 3.52129 17.5741C3.63832 17.5831 3.75535 17.5565 3.8591 17.4972L8.32192 14.9597L12.7847 17.4972C12.9066 17.5674 13.0481 17.5908 13.1837 17.5653C13.5256 17.5015 13.7555 17.1508 13.6966 16.781L12.8437 11.4062L16.4536 7.59988C16.5519 7.49574 16.6168 7.35972 16.6364 7.21096C16.6895 6.83903 16.4497 6.49474 16.1058 6.43948Z" fill="#FDBF00"/>
                                </svg>
                            </div>
                            <div class="arrival">
                                <span>${i.imdb.votes}</span>
                                <span><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#424242"><path d="M360-240h220q17 0 31.5-8.5T632-272l84-196q2-5 3-10t1-10v-32q0-17-11.5-28.5T680-560H496l24-136q2-10-1-19t-10-16l-29-29-184 200q-8 8-12 18t-4 22v200q0 33 23.5 56.5T360-240ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg></span>
                            </div>
                        </div>
                        <div class="pricing">
                            ${i.runtime ? i.runtime : 150} mins
                        </div>
                    </div>`;
    });
    if (items.length < 10) {
        movieCards.innerHTML += `
                    <button class="showMore" disabled>
                        No More Results to show
                    </button>`
    }
    else {
        movieCards.innerHTML += `
                    <button class="showMore" onclick="filterCaller()">
                        Show More Results
                    </button>`;
    }
    const resultsInfoContainer = resultsSection.querySelector('.flightCards div span');
    resultsInfoContainer.innerText = `Showing ${(page * limit) + items.length} out of 1000 Results:`;
}


async function checkQuery() {
    const filter = JSON.parse(query.dataset.query);
    const durationInput = searchForm.querySelector('input#duration');
    const yearInput = searchForm.querySelector('input#year');
    const searchInput = searchForm.querySelector('input#searchInput');
    
    for(let key in filter){
        if(filterMap.has(key)){
            const selectFilter = filterMap.get(key);
            if(selectFilter && selectFilter instanceof select2){
                selectFilter.value = filter[key].split(',');
            }
        }
    }
    if (filter.duration) { durationInput.value = filter.duration; }
    if (filter.year) { yearInput.value = filter.year; }
    if (filter.search) { searchInput.value = filter.search; }

    filterCaller();
}
checkQuery();

filterSection.addEventListener('click', handleFilterSection);

function handleFilterSection(event) {
    let element = event.target;
    const filterKey = Object.keys(element.dataset)[0];
    filterMap.get(filterKey)?.toggleValue(element.dataset[filterKey]);
}

function debounce(func, delay) {
    let timeout;
    return function () {
        const args = arguments;
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args)
        }, delay);
    }
}