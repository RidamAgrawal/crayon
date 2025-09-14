const header = document.querySelector('header');
const modal = document.querySelector('.modal');
const loginSection = document.querySelector('.loginSection');
const signupSection = document.querySelector('.signupSection');
const updateProfile = document.querySelector('.updateProfile');

const url = new URL(window.location.href);

let name = null, email = null, avatar = null, id = null;

async function getUserInfo() {
    try {
        return await fetch(`${url.origin}/user/loginUser`, {
            method: "POST",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({})
        })
            .then(res => res.json())
            .then((data) => {
                if (data.error) {
                    header.querySelector('.profileImage img').style.display = 'none';
                    header.querySelector('.profileImage svg').style.display = 'block';
                    return;
                }
                name = data.name,
                    email = data.email,
                    avatar = data.avatar,
                    id = data.id
                if (avatar) {
                    header.querySelector('.profileImage img').setAttribute('src', `/images/${avatar}.jpg`);
                    header.querySelector('.profileImage img').style.display = 'block';
                    header.querySelector('.profileImage svg').style.display = 'none';
                }
            })
    }
    catch (error) {
        console.log(error);
        header.querySelector('.profileImage img').style.display = 'none';
        header.querySelector('.profileImage svg').style.display = 'block';
        return error;
    }
}
getUserInfo();

function openModal(i) {
    if (modal.classList.contains('show')) {
        Array.from(modal.querySelector('.modalContent div').children).forEach(modalContentSection => modalContentSection.classList.remove('show'));
        modal.querySelector('.modalContent div').children[i].classList.add('show');
        return;
    }
    document.body.classList.add('noScroll');
    modal.classList.add('show');
    Array.from(modal.querySelector('.modalContent div').children).forEach(modalContentSection => modalContentSection.classList.remove('show'));
    setTimeout(() => {
        modal.children[0].classList.add('show');
        modal.querySelector('.modalContent div')?.children[i]?.classList.add('show');
        if (i === 1) {
            const avatarContainer = signupSection.querySelector('.avatars');
            const signupAvatarInput = signupSection.querySelector('input#signupAvatar');
            let previouslySelectedAvatarNumber = signupAvatarInput.dataset.value;
            if (previouslySelectedAvatarNumber) {
                avatarContainer.children[previouslySelectedAvatarNumber - 1]?.classList.remove('selected');
                signupAvatarInput.dataset.value = +avatar || 1;
                avatarContainer.children[avatar || 1 - 1]?.classList.add('selected');
            }
            avatarContainer.addEventListener('click', (event) => {
                const element = event.target;
                const clickedAvatarNumber = element.dataset?.avatar;
                if (clickedAvatarNumber) {
                    //remove previously selected icon
                    previouslySelectedAvatarNumber = signupAvatarInput.dataset.value;
                    avatarContainer.children[+previouslySelectedAvatarNumber - 1]?.classList.remove('selected');
                    //updating to input newly selected icon
                    signupAvatarInput.dataset.value = clickedAvatarNumber;
                    avatarContainer.children[clickedAvatarNumber - 1]?.classList.add('selected');
                }
            })
        }
        else if (i === 3) {
            if (!avatar) {
                openModal(0);
                return;
            }
            const avatarContainer = updateProfile.querySelector('.avatars');
            const updateAvatarInput = updateProfile.querySelector('input#updateAvatar');
            const updateNameInput = updateProfile.querySelector('input#updateName');



            let previouslySelectedAvatarNumber = updateAvatarInput.dataset.value;
            if (previouslySelectedAvatarNumber) {
                avatarContainer.children[+previouslySelectedAvatarNumber - 1].classList.remove('selected');
            }
            updateAvatarInput.dataset.value = avatar;
            updateNameInput.value = name;
            avatarContainer.children[avatar - 1].classList.add('selected');
            avatarContainer.addEventListener('click', (event) => {
                const element = event.target;
                const clickedAvatarNumber = element.dataset?.avatar;
                if (clickedAvatarNumber) {
                    //remove previously selected icon
                    previouslySelectedAvatarNumber = updateAvatarInput.dataset.value;

                    avatarContainer.children[+previouslySelectedAvatarNumber - 1].classList.remove('selected');
                    //updating to input newly selected icon
                    updateAvatarInput.dataset.value = clickedAvatarNumber;
                    avatarContainer.children[clickedAvatarNumber - 1].classList.add('selected');
                }
            })
        }
    }, 0);
}
function closeModal() {
    document.querySelector('body').classList.remove('noScroll');
    modal.children[0].classList.remove('show');
    setTimeout(() => {
        modal.classList.remove('show');
        Array.from(modal.querySelector('.modalContent div').children).forEach(i => {
            i.classList.remove('show');
        });
    }, 500);
}

modal.addEventListener('click', (e) => {
    if (!modal.children[0].contains(e.target) || e.target.dataset?.action === 'close') {
        closeModal();
    }
});
async function login() {
    try {
        const emailInput = loginSection.querySelector('input#loginEmail');
        const passwordInput = loginSection.querySelector('input#loginPassword');
        const formNotifier = loginSection.querySelector('.notifier');

        const loader = formNotifier.children[0];
        const errCtr = formNotifier.children[1];
        const successCtr = formNotifier.children[2];

        const cb = () =>{
            Array.from(formNotifier.children).forEach(ele => ele.classList.remove('show'));
        }

        loader.classList.add('show');
        await fetch(`${url.origin}/user/loginUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email:emailInput.value, password:passwordInput.value })
        })
            .then(res => res.json())
            .then(async data => {
                loader.classList.remove('show');
                if(data.error){
                    errCtr.innerText = data.error;
                    errCtr.classList.add('show');
                    passwordInput.value = '';
                }
                else{
                    successCtr.classList.add('show');
                    emailInput.value = "";
                    passwordInput.value = "";
                    
                    await getUserInfo();
                    closeModal();
                }
                setTimeout(cb.bind(this),1000);
            });
    }
    catch (error) {
        console.log(error);
    }
}
async function signup() {
    try {
        const nameInput = signupSection.querySelector('input#signupName');
        const emailInput = signupSection.querySelector('input#signupEmail');
        const passwordInput = signupSection.querySelector('input#signupPassword');
        const avatar = signupSection.querySelector('input#signupAvatar').dataset.value;
        const notifier = signupSection.querySelector('.notifier');
        
        const loader = notifier.children[0];
        const errCtr = notifier.children[1];
        const successCtr = notifier.children[2];
        
        const cb = () =>{
            Array.from(notifier.children).forEach(ele => ele.classList.remove('show'));
        }

        res = formValidation({ name:nameInput.value, email:emailInput.value, password:passwordInput.value, avatar });

        if (!res) {
            loader.classList.add('show');
            await fetch(`${url.origin}/user/createUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    name: nameInput.value,
                    email: emailInput.value,
                    password: passwordInput.value,
                    avatar
                })
            })
                .then(res => res.json())
                .then(async data => {
                    loader.classList.remove('show');
                    if (data.error) {
                        errCtr.innerHTML = "";
                        let err = document.createElement('div');
                        err.innerText = `Email ${email} already exists`;
                        err.style.color = 'red';
                        errCtr.appendChild(err);
                        errCtr.classList.add('show');
                    }
                    else {
                        successCtr.classList.add('show');
                        await getUserInfo();
                        closeModal();
                    }
                    setTimeout(cb.bind(this),1000);
                });
        }
        else{
            errCtr.innerHTML = "";
            if (res.name) {
                let err = document.createElement('div');
                err.innerText = 'please enter a valid email';
                errCtr.appendChild(err);
                nameInput.value = "";
            }
            if (res.email) {
                let err = document.createElement('span');
                err.innerText = 'please enter a valid name';
                errCtr.appendChild(err);
                emailInput.value = "";
            }
            if (res.password) {
                let err = document.createElement('span');
                err.innerText = `password must have ${res.password.map((i => `${i} character `))}`;
                errCtr.appendChild(err);
                passwordInput.value = "";
            }
            if (res.avatar) {
                let err = document.createElement('span');
                err.innerText = 'please choose a valid avatar';
                errCtr.appendChild(err);
            }
            errCtr.classList.add('show');
            setTimeout(cb.bind(this),500);
        }
    }
    catch (error) { 
        console.log(error);
    }
}

function formValidation(obj) {
    let { name, email, password, avatar } = obj;

    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    let res = {};

    if (!(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))) {
        res['email'] = 'invalid';
    }
    if (!/[a-z]/.test(password)) {
        res.password = ['lower'];
    }
    if (!/[A-Z]/.test(password)) {
        if (!res.password) { res.password = []; }
        res.password.push('upper');
    }
    if (!/\d/.test(password)) {
        if (!res.password) { res.password = []; }
        res.password.push('digit');
    }
    if (!/[@$!%*?&]/.test(password)) {
        if (!res.password) { res.password = []; }
        res.password.push('special[@$!%?&]');
    }
    if (password.length < 6) {
        if (!res.password) { res.password = []; }
        res.password.push('length');
    }
    if (name && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/.test(name)) {
        res.name = 'invalid';
    }
    if (avatar && !/\d/.test(avatar)) {
        res.avatar = 'invalid';
    }
    if (Object.keys(res).length === 0) { return undefined; }
    return res;
}

async function logout() {
    const logoutSection = document.querySelector('.logoutSection');
    const notifier = logoutSection.querySelector('.notifier');
    const loader = notifier.children[0];
    const errCtr = notifier.children[1];
    const successCtr = notifier.children[2];
    
    const cb = () =>{
        Array.from(notifier.children).forEach(ele => ele.classList.remove('show'));
    }

    try{
        loader.classList.add('show');
        await fetch(`${url.origin}/user/logout`)
        .then(res => res.json())
        .then(async data => {
            loader.classList.remove('show');
            if(!data.error){
                successCtr.classList.add('show');
                await getUserInfo();
                closeModal();
                setTimeout(cb.bind(this),500);
            }
            else{
                errCtr.innerText = data.error;
                setTimeout(cb.bind(this),500);
            }
        });
    }
    catch(err){
        console.log(err);
    }
}

async function changeProfile() {
    try {
        let name = updateProfile.querySelector('#updateName').value;
        let avatar = updateProfile.querySelector('#updateAvatar').dataset.value;
        let password = updateProfile.querySelector('#updatePassword').value;

        const updatedUser = await fetch(url.origin + '/user/update/' + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, avatar, password })
        })
            .then(res => res.json())
            .then(async data => {
                await getUserInfo();
                closeModal();
            })
    } catch (error) {
        console.log(error);
    }
}

function showDropDown(element){
    const selectContainer = element instanceof HTMLElement && element.querySelector('.select');
    if(selectContainer){
        selectContainer.style.gridTemplateRows=selectContainer.style.gridTemplateRows=='1fr' ? '0fr' : '1fr';
    }
}

function hideDropDown(element){
    const selectContainer = element instanceof HTMLElement && element.querySelector('.select');
    if(selectContainer){
        selectContainer.style.gridTemplateRows='0fr';
    }
}