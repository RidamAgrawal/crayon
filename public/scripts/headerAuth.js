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
        Array.from(modal.querySelector('.modalContent div').children).forEach(modalContentSection => modalContentSection.style.display = 'none');
        modal.children[0].children[0].children[i].style.display = 'flex';
        return;
    }
    document.body.classList.add('noScroll');
    modal.classList.add('show');
    Array.from(modal.querySelector('.modalContent div').children).forEach(modalContentSection => modalContentSection.style.display = 'none');
    setTimeout(() => {
        modal.children[0].classList.add('show');
        modal.children[0].children[0].children[i].style.display = 'flex';
        if (i === 1) {
            const avatarContainer = signupSection.querySelector('.avatars');
            const signupAvatarInput = signupSection.querySelector('input#signupAvatar');
            let previouslySelectedAvatarNumber = signupAvatarInput.dataset.value;
            if (previouslySelectedAvatarNumber) {
                avatarContainer.children[previouslySelectedAvatarNumber - 1].classList.remove('selected');
                signupAvatarInput.dataset.value = avatar;
                avatarContainer.children[avatar || 1 - 1].classList.add('selected');
            }
            avatarContainer.addEventListener('click', (event) => {
                const element = event.target;
                const clickedAvatarNumber = element.dataset?.avatar;
                if (clickedAvatarNumber) {
                    //remove previously selected icon
                    previouslySelectedAvatarNumber = signupAvatarInput.dataset.value;
                    avatarContainer.children[+previouslySelectedAvatarNumber - 1].classList.remove('selected');
                    //updating to input newly selected icon
                    signupAvatarInput.dataset.value = clickedAvatarNumber;
                    avatarContainer.children[clickedAvatarNumber - 1].classList.add('selected');
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
        Array.from(modal.children[0].children[0].children).forEach(i => {
            i.style.display = 'none';
            i.children[1].innerHTML = '';
            Array.from(i.children[2].children)
                .forEach(i2 => {
                    if (i2.children.length >= 2) { i2.children[0].value = ''; }

                })
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
        let email = document.querySelector('input#loginEmail').value;
        let password = document.querySelector('input#loginPassword').value;

        let res = formValidation({ email, password });
        let formHeader = loginSection.children[0];
        formHeader.innerHTML = '';
        if (!res) {
            await fetch(`${url.origin}/user/loginUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
                .then(res => res.json())
                .then(async data => {
                    await getUserInfo();
                    closeModal();
                });
            return;
        }
        if (res.email) {
            let emailErr = document.createElement('span');
            emailErr.innerText = 'please enter a valid email';
            formHeader.appendChild(emailErr);
        }
        if (res.password) {
            let passwordErr = document.createElement('span');
            passwordErr.innerText = `password must have ${res.password.map((i => `${i} character `))}`;
            formHeader.appendChild(passwordErr);
        }
    }
    catch (error) {
        console.log(error);
    }
}
async function signup() {
    try {
        let name = document.querySelector('input#signupName').value;
        let email = document.querySelector('input#signupEmail').value;
        let password = document.querySelector('input#signupPassword').value;
        let avatar = document.querySelector('input#signupAvatar').dataset.value;

        res = formValidation({ name, email, password, avatar });

        let formHeader = signupSection.children[1];
        formHeader.innerHTML = '';
        if (!res) {
            await fetch(`${url.origin}/user/createUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, avatar })
            })
                .then(res => res.json())
                .then(async data => {
                    if (data.error) {
                        let err = document.createElement('span');
                        err.innerText = `Email ${email} already exists`;
                        err.style.color = 'red';
                        formHeader.appendChild(err);
                    }
                    else {
                        console.log(data);
                        await getUserInfo();
                        closeModal();
                    }
                });
            return;
        }
        if (res.name) {
            let err = document.createElement('span');
            err.innerText = 'please enter a valid email';
            formHeader.appendChild(err);
        }
        if (res.email) {
            let err = document.createElement('span');
            err.innerText = 'please enter a valid name';
            formHeader.appendChild(err);
        }
        if (res.password) {
            let err = document.createElement('span');
            err.innerText = `password must have ${res.password.map((i => `${i} character `))}`;
            formHeader.appendChild(err);
        }
        if (res.avatar) {
            let err = document.createElement('span');
            err.innerText = 'please choose a valid avatar';
            formHeader.appendChild(err);
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
    await fetch(`${url.origin}/user/logout`);
    await getUserInfo();
    closeModal();
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