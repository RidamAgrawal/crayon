
const searchForm = document.querySelector('.searchForm');
const resultsSection = document.querySelector('.resultsSection');
const query = document.querySelector('.filterQuery');
const filterSection = document.querySelector('.filter');
const wishlistSection = document.querySelector('.recentlyBooked');
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
                        activeFilter.innerHTML+=`<div class='selectedFilter'><span>${label}</span><svg data-${filterKey}='${label}' xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#424242"><path data-${filterKey}='${label}' d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg></div>`;
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
}

async function filterCaller() {
    let filter = {}
    const durationInput = searchForm.querySelector('input#duration');
    const yearInput = searchForm.querySelector('input#year');
    

    filterMap.forEach((selects, filterKey) => {
        if (selects instanceof select2 && selects.value.length > 0 ) { 
            filter[filterKey] = selects.value.join(',');
            if(filterKey == 'rating'){
                filter[filterKey] = selects.value[0].split(' ')[1]; 
            }
        }
    })
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
    showResults(res,filter);
}

function showResults(items,filterQuery) {
    const movieCards = resultsSection.querySelector('.flightCards');
    if (page == 0) {
        movieCards.innerHTML = '';
        movieCards.innerHTML += `<div>
        <span>Showing ${page * limit} out of 1000 Results:</span>
        <h3>filter</h3>
            ${filterQuery.hasOwnProperty('genres') ? `<div><span>genres:</span><span>${filterQuery.genres}</span></div>` : ''}
            ${filterQuery.hasOwnProperty('rating') ? `<div><span>rating:</span><span>${filterQuery.rating}</span></div>` : ''}
            ${filterQuery.hasOwnProperty('language') ? `<div><span>language:</span><span>${filterQuery.language}</span></div>` : ''}
            ${filterQuery.hasOwnProperty('countries') ? `<div><span>countries:</span><span>${filterQuery.countries}</span></div>` : ''}
            ${filterQuery.hasOwnProperty('duration') ? `<div><span>duration:</span><span>${filterQuery.duration}</span></div>` : ''}
            ${filterQuery.hasOwnProperty('year') ? `<div><span>year:</span><span>${filterQuery.year}</span></div>` : ''}
            ${filterQuery.hasOwnProperty('search') ? `<div><span>search:</span><span>${filterQuery.search}</span></div>` : ''}
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
    if (filter.search) {
        searchInput.value = filter.search;
        showNewSearch();
    }

    if (Object.keys(filter).length > 0) { filterCaller(); }
}


async function showNewSearch(){
    page=-1;
    const searchInput = searchForm.querySelector('input#searchInput');

    if (searchInput.value) {
        let res = await searchMovie(searchInput.value);
        console.log(res);
        showResults(res,{ search : searchInput.value });
    }
    else{
        if (filterTimer) {
            clearTimeout(filterTimer);
        }
        else {
            document.querySelector('.caution.searchCaution').classList.toggle('hide');
        }
        filterTimer = setTimeout(() => {
            document.querySelector('.caution.searchCaution').classList.toggle('hide');
            filterTimer = null;
        }, 1000);
    }
}
function showNewFilter(){
    page=-1;
    filterCaller();
}
checkQuery();

filterSection.addEventListener('click', handleFilterSection);

function handleFilterSection(event) {
    let element = event.target;
    const filterKey = Object.keys(element.dataset)[0];
    if(filterKey) {
        filterMap.get(filterKey)?.toggleValue(element.dataset[filterKey]);
    }
}

async function getWishlist(){
    await fetch(url.origin+'/user/wishlist')
    .then((res) => res.json())
    .then((data) => {
        if(data.wishlist && Array.isArray(data.wishlist)){
            const wishlistCardsContainer=wishlistSection.querySelector('.recentCards');
            if(wishlistCardsContainer){
                wishlistCardsContainer.innerHTML='';
                data.wishlist.forEach(wishlistedMovie => {
                    const movieDetails=wishlistedMovie.movie;
                    wishlistCardsContainer.innerHTML+=`<div class="recentCard">
                                <div class="locations">
                                    <div class="departure">
                                        <span>${movieDetails.title}</span>
                                        <span>${movieDetails.year || ''}</span>
                                    </div>
                                </div>
                                <div class="details">
                                    <div class="class">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            height="14px" viewBox="0 -960 960 960" width="16px" fill="#7E8B97">
                                            <path 
                                                d="M400-240q50 0 85-35t35-85v-280h120v-80H460v256q-14-8-29-12t-31-4q-50 0-85 35t-35 85q0 50 35 85t85 35Zm80 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
                                                stroke="#7E8B97" stroke-width="1.5" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                        <span>${movieDetails.genres.at(0) || 'no genres'}</span>
                                    </div>
                                    <div class="class">
                                        <svg width="16" height="14" viewBox="0 0 16 14" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M11.0664 12.7429V11.4762C11.0664 10.8043 10.7995 10.16 10.3244 9.68487C9.84935 9.20978 9.20499 8.94287 8.53311 8.94287H3.46644C2.79456 8.94287 2.15019 9.20978 1.6751 9.68487C1.20001 10.16 0.933105 10.8043 0.933105 11.4762V12.7429"
                                                stroke="#7E8B97" stroke-width="1.5" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                            <path
                                                d="M5.99964 6.40956C7.39876 6.40956 8.53298 5.27535 8.53298 3.87623C8.53298 2.47711 7.39876 1.3429 5.99964 1.3429C4.60052 1.3429 3.46631 2.47711 3.46631 3.87623C3.46631 5.27535 4.60052 6.40956 5.99964 6.40956Z"
                                                stroke="#7E8B97" stroke-width="1.5" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                            <path
                                                d="M14.8664 12.7428V11.4762C14.866 10.9149 14.6792 10.3696 14.3353 9.92597C13.9914 9.48235 13.5099 9.1655 12.9664 9.02517M10.4331 1.42517C10.978 1.56469 11.461 1.88161 11.8059 2.32597C12.1509 2.77032 12.3381 3.31683 12.3381 3.87934C12.3381 4.44185 12.1509 4.98835 11.8059 5.43271C11.461 5.87706 10.978 6.19398 10.4331 6.3335"
                                                stroke="#7E8B97" stroke-width="1.5" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                        <span>${movieDetails.comments?.length || 0} comments</span>
                                    </div>
                                    <div class="class">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            height="14px" viewBox="0 -960 960 960" width="16px" fill="#7E8B97">
                                                <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"
                                                stroke="#7E8B97" stroke-width="1.5" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                        <span>${movieDetails.likes?.length || 0} likes</span>
                                    </div>
                                    <div class="class">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            height="14px" viewBox="0 -960 960 960" width="16px" fill="#7E8B97">
                                            <path 
                                                d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Zm163 450 117-71 117 71-31-133 104-90-137-11-53-126-53 126-137 11 104 90-31 133Z"
                                                stroke="#7E8B97" stroke-width="1.5" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                        <span>${movieDetails.imdb.rating}</span>
                                    </div>
                                </div>
                                <div class="provider">
                                    <span>added</span>
                                    <span>${timePassedTillNow(wishlistedMovie.createdAt)} ago!</span>
                                </div>
                            </div>`
                })
            }
        }
    })
}
getWishlist();

function toggleFilterDropdown(event){
    const element=event.target;
    const target=element.closest('.dropdown');
    if(target){
        target.classList.toggle('focused');
    }
}