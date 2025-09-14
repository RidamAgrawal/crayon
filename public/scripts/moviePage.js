
const movieId = JSON.parse(document.querySelector('[data-movieId]').dataset.movieid).movieId;

const youtube_api = document.querySelector('.YOUTUBE_API');
const title = document.querySelector('.title');
const moviePoster = document.querySelector('.moviePoster');
const genres = document.querySelector('.genres');
const ratings = document.querySelector('.ratings');
const plot = document.querySelector('.plot');
const directors = document.querySelector('.directors');
const writers = document.querySelector('.writers');
const cast = document.querySelector('.cast');
const TrailerSection = document.querySelector('.showTrailer');
const commentsContainer = document.querySelector('.commentsContainer');
const wishlistButton = document.querySelector('.apiToggleButton');

async function getMovie() {

    return await fetch(`${url.origin}/movies/movieId?movieId=${movieId}`)
        .then(res => res.json());
}
async function getComments() {
    return await fetch(`${url.origin}/comments/movie/${movieId}`)
        .then(res => res.json());
}

async function show() {
    let rs = await getMovie();
    console.log(rs);
    title.innerText = rs.title;
    moviePoster.src = rs.poster || "images/subscribeBackground.png";
    moviePoster.setAttribute('onerror', 'this.onerror=null; this.src="images/subscribeBackground.png"');
    Array.from(rs.genres).forEach(i => genres.innerHTML += `<span>${i}</span>`);
    ratings.children[0].children[1].innerText = rs.imdb.rating;
    ratings.children[1].children[1].innerText = (rs?.tomatoes?.viewer?.meter) ? rs.tomatoes.viewer.meter + "%" : "NA";
    ratings.children[2].children[1].innerText = rs.runtime + " mins";
    plot.children[0].innerText = rs.plot || 'No information available';
    plot.children[1].innerText = rs.fullplot || 'No information available';
    directors.children[0].children[1].innerText = rs.directors.join(', ');
    writers.children[0].children[1].innerText = rs.writers.join(', ');
    cast.children[0].children[1].innerText = rs.cast.join(', ');

    const query = encodeURIComponent(`${rs.title} official trailer`);
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${query}&key=${youtube_api.dataset.api_key}`;
    // console.log(youtubeUrl);
    try {
        const youtubeTrailerData = await fetch(youtubeUrl)
            .then(res => res.json());
        if (youtubeTrailerData.items.length > 0) {
            const trailerId = youtubeTrailerData.items[0].id.videoId;
            TrailerSection.children[1].src = `https://www.youtube.com/embed/${trailerId}`;
        }
        else {
            TrailerSection.children[1].src = `https://www.youtube.com/embed/1zq4g7Z5m3A`;
        }
    }
    catch (e) {
        console.log("error:", e);
    }
    console.log(rs.comments);
    const commentCounter = commentsContainer.querySelector('.commentsHeader .commentCount');
    commentCounter.innerText = rs.comments.length;
    showComments();
}
show();

function showFullPlot() {
    plot.children[0].classList.remove('show');
    plot.children[1].classList.add('show');
    plot.children[2].classList.remove('show');
    plot.children[3].classList.add('show');
}
function hidePlot() {
    plot.children[0].classList.add('show');
    plot.children[1].classList.remove('show');
    plot.children[2].classList.add('show');
    plot.children[3].classList.remove('show');
}
async function showTrailer() {
    openModal(4);
}

commentsContainer.addEventListener('click', async (event) => {
    element = event.target;
    if (element.dataset?.action === 'send') {
        let text = document.querySelector('textarea#commentBox').value;
        if (text) {
            addComment(text);
        }
    }
})

async function addComment(comment) {
    try {
        const data = await fetch(`${url.origin}/user/loginUser`, {
            method: "POST",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({})
        })
            .then(res => res.json())

        if (data.hasOwnProperty('error')) {
            openModal(0);
            return;
        }

        fetch(url.origin + '/comments/addComment', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: comment, movie: movieId, user: data.id })
        })
            .then(res => res.json())
            .then(data => console.log(data));

    } catch (error) {
        console.log('error', error);
    }
}

async function showComments() {
    const comments = await getComments();

    Array.from(comments).forEach(async (comment) => {
        
        commentsContainer.innerHTML += `
            <div class="comment">
                <div class="user">
                    <div class="thumbicon">${(comment.user.avatar) ? `<img src="/images/${comment.user.avatar}.jpg" alt="${comment.user.name}">` : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#424242"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"/></svg>'}</div>
                    <div class="userName">${comment.user?.name || 'anonymous'}</div>
                    <div class="timeBefore">${timePassedTillNow(comment.createdAt)} ago</div>
                </div>
                <div class="commentBody">
                    ${comment.text}
                </div>
                <div class="commentMenu">
                    <svg data-action="like" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#424242"><path data-action="like" d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"/></svg>
                    <span class="likeCount">${comment.likes}</span>
                    <svg data-action="dislike" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#424242"><path data-action=""dislike d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"/></svg>
                    <span class="dislikeCount">${comment.dislikes}</span>
                    reply
                    <svg data-action="reply" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#424242"><path data-action="reply" d="M760-200v-160q0-50-35-85t-85-35H273l144 144-57 56-240-240 240-240 57 56-144 144h367q83 0 141.5 58.5T840-360v160h-80Z"/></svg>
                    <svg data-action="reoly" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#424242"><path data-action="reply" d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/></svg>
                </div>
            </div>
        `;

    })
}


// async function addToWishlist() {
//     if (!id) {
//         openModal(0);
//         return;
//     }
//     const addToWishlist = wishlistButton.querySelector('.addToWishlist');
//     const removeFromWishlist = wishlistButton.querySelector('.removeFromWishlist');
//     const loader = wishlistButton.querySelector('.loader');
//     const button = wishlistButton.querySelector('button');
    
//     loader.classList.remove('hide');
//     button.disabled = true;

//     await fetch(url.origin + '/user/wishlist/' + movieId)
//         .then(res => res.json())
//         .then(data => {
//             loader.classList.add('hide');
//             button.disabled = false;
//             if(!data.hasOwnProperty('error')){
//                 if(data.action=='removed'){
//                     addToWishlist.classList.remove('hide');
//                     removeFromWishlist.classList.add('hide');
//                 }
//                 else{
//                     addToWishlist.classList.add('hide');
//                     removeFromWishlist.classList.remove('hide');
//                 }
//             }
//         });
// }

async function checkIfUserWishlistedCurrentMovie(){
    return await fetch(url.origin + '/user/wishlist/')
        .then(res => res.json())
        .then(data => !data.error && !!data.wishlist?.find(movieItem => movieItem.movie._id == movieId) );
}
async function checkIfUserLikedCurrentMovie(){
    return await fetch(url.origin + '/user/like/')
    .then(res => res.json())
    .then(data => data.liked && !data.liked?.find(item => item.movie == movieId))
}
async function checkIfUserDislikedCurrentMovie(){
    return await fetch(url.origin + '/user/dislike/')
    .then(res => res.json())
    .then(data => data.disliked && !data.disliked?.find(item => item.movie == movieId))
}

const wishlistBtn = new ToggleButton({
    apiString: url.origin+'/user/wishlist/' + movieId,
    yesButtonHtml: `<div class="addToWishlist">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        height="24px" viewBox="0 -960 960 960" width="24px">
                                        <path d="M200-120v-640q0-33 23.5-56.5T280-840h240v80H280v518l200-86 200 86v-278h80v400L480-240 200-120Zm80-640h240-240Zm400 160v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z"/>
                                    </svg>
                                    <div>To Watchlist</div>
                                </div>`,
    noButtonHtml: `<div class="removeFromWishlist">
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                        height="24px" viewBox="0 -960 960 960" width="24px" fill="#424242">
                                        <path d="M840-680H600v-80h240v80ZM200-120v-640q0-33 23.5-56.5T280-840h240v80H280v518l200-86 200 86v-278h80v400L480-240 200-120Zm80-640h240-240Z"/>
                                    </svg>
                                    <div>Remove</div>
                                </div>`,
    toggleLogicFunction: (data) => data.status == 'success',
    initialLogicFunction: checkIfUserWishlistedCurrentMovie,
    successStatus: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#79ca00"><path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>`,
    failedStatus: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff0000"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>`
});
const likeBtn = new ToggleButton({
    apiString: url.origin+'/user/like/' + movieId,
    yesButtonHtml: `<div class="like">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M360-240h220q17 0 31.5-8.5T632-272l84-196q2-5 3-10t1-10v-32q0-17-11.5-28.5T680-560H496l24-136q2-10-1-19t-10-16l-29-29-184 200q-8 8-12 18t-4 22v200q0 33 23.5 56.5T360-240ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                    <div>like</div>
                                </div>`,
    noButtonHtml: `<div class="unlike">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M360-240h220q17 0 31.5-8.5T632-272l84-196q2-5 3-10t1-10v-32q0-17-11.5-28.5T680-560H496l24-136q2-10-1-19t-10-16l-29-29-184 200q-8 8-12 18t-4 22v200q0 33 23.5 56.5T360-240ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                    <div>liked</div>
                                </div>`,
    toggleLogicFunction: (data) => data.status == 'success',
    initialLogicFunction: checkIfUserLikedCurrentMovie,
    successStatus: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#79ca00"><path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>`,
    failedStatus: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff0000"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>`,
    styles: `
    .like svg,.unlike svg{
        border-radius:50%;
    } 
    .like svg{
        background-color:#1262af !important;
        fill:white !important;
    }
    .unlike svg{
        background-color:white !important;
        fill:#1262af !important;
    }
    .like:hover svg{
        background-color:white !important;
        fill:#1262af !important;
    }
    .unlike:hover svg{
        background-color:#1262af !important;
        fill:white !important;
    }
    `
});
const dislikeBtn = new ToggleButton({
    apiString: url.origin+'/user/dislike/' + movieId,
    yesButtonHtml: `<div class="dislike">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M360-240h220q17 0 31.5-8.5T632-272l84-196q2-5 3-10t1-10v-32q0-17-11.5-28.5T680-560H496l24-136q2-10-1-19t-10-16l-29-29-184 200q-8 8-12 18t-4 22v200q0 33 23.5 56.5T360-240ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                    <div>dislike</div>
                                </div>`,
    noButtonHtml: `<div class="undislike">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M360-240h220q17 0 31.5-8.5T632-272l84-196q2-5 3-10t1-10v-32q0-17-11.5-28.5T680-560H496l24-136q2-10-1-19t-10-16l-29-29-184 200q-8 8-12 18t-4 22v200q0 33 23.5 56.5T360-240ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                    <div>disliked</div>
                                </div>`,
    toggleLogicFunction: (data) => data.status == 'success',
    initialLogicFunction: checkIfUserDislikedCurrentMovie,
    successStatus: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#79ca00"><path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>`,
    failedStatus: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff0000"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>`,
    styles: `
    .dislike svg,.undislike svg{
        rotate:180deg;
        border-radius:50%;
    } 
    .dislike svg{
        background-color:#1262af !important;
        fill:white !important;
    }
    .undislike svg{
        background-color:white !important;
        fill:#1262af !important;
    }
    .dislike:hover svg{
        background-color:white !important;
        fill:#1262af !important;
    }
    .undislike:hover svg{
        background-color:#1262af !important;
        fill:white !important;
    }
    `
});
const buttonsContainer = document.querySelector('.buttons');
buttonsContainer.appendChild(wishlistBtn.wrapper);
buttonsContainer.appendChild(likeBtn.wrapper);
buttonsContainer.appendChild(dislikeBtn.wrapper);

likeBtn.successCallback.push(() => dislikeBtn.showYes());
dislikeBtn.successCallback.push(() => likeBtn.showYes());
// checkIfUserWishlistedCurrentMovie();

