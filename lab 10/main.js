// DOM Elements
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const countrySelect = $('#country');
const citySelect = $('#city');
const signupForm = $('.signupForm');
const loginForm = $('.loginForm');
const loginBtn = $('#loginBtn');
const signupBtn = $('#signupBtn');
const navButtons = $$('.btn');
const logoutBtn = $('#logoutBtn');

const usersContainer = $('#usersContainer');
const searchInput = $('#searchInput');
const sortSelect = $('#sortSelect');
const minAgeInput = $('#minAge');
const maxAgeInput = $('#maxAge');
const emailFilter = $('#emailFilter');
const yearFilter = $('#yearFilter');
const nameFilter = $('#nameFilter');
const countryFilter = $('#countryFilter');
const cityFilter = $('#cityFilter');


const appContainer = $('#app');
const snackbar = $('#snackbar');

let mainBlock = document.querySelector('.main-block');

let usersData = [];

// Debounce function
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

const debouncedFilterAndSort = debounce(filterAndSort, 300);

// Event Listeners
navButtons.forEach(btn => btn.addEventListener('click', handleNavClick));

signupForm.addEventListener('submit', handleSignupFormSubmit);
loginForm.addEventListener('submit', handleLoginFormSubmit);

countrySelect.addEventListener('change', handleCountryChange);
searchInput.addEventListener('input', debouncedFilterAndSort);
sortSelect.addEventListener('change', filterAndSort);
minAgeInput.addEventListener('input', filterAndSort);
maxAgeInput.addEventListener('input', filterAndSort);
logoutBtn.addEventListener('click', handleLogout);
[emailFilter, yearFilter, searchInput, countryFilter, cityFilter].forEach(input =>
    input.addEventListener('input', debouncedFilterAndSort)
);


// Navigation handler
function handleNavClick(e) {
    const isSignup = e.target.id === 'signupNavBtn';
    loginForm.style.display = isSignup ? 'none' : 'flex';
    signupForm.style.display = isSignup ? 'flex' : 'none';
    navButtons.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');

    // При переході скидаємо форми і сховуємо блок користувачів
    clearFormMessages(signupForm);
    clearFormMessages(loginForm);
    appContainer.classList.add('hidden');
}

// Universal form validator — повертає true/false
function validateForm(form) {
    let formIsValid = true;
    form.classList.add('validated');
    const inputs = form.querySelectorAll('input, select');
    clearMessages(inputs);
    inputs.forEach(input => {
        if (['radio', 'submit'].includes(input.type)) return;
        const isValid = input.checkValidity();
        const msg = document.createElement('div');
        msg.className = isValid ? 'success-message' : 'error-message';
        msg.textContent = isValid ? 'Looks good!' : getErrorMessage(input);
        input.insertAdjacentElement('afterend', msg);
        if (!isValid) formIsValid = false;
    });
    return formIsValid;
}

function clearMessages(inputs) {
    inputs.forEach(input => {
        const next = input.nextElementSibling;
        if (next && (next.classList.contains('error-message') || next.classList.contains('success-message'))) {
            next.remove();
        }
    });
}

function clearFormMessages(form) {
    const inputs = form.querySelectorAll('input, select');
    clearMessages(inputs);
}

// Валідація дати народження
function validateBirthDate() {
    const input = $('#birthDate');
    const msgElem = input.nextElementSibling;
    const birthDate = new Date(input.value);
    const today = new Date();

    if (!input.value) {
        setError(input, msgElem, 'Це поле є обов’язковим');
        input.style.borderColor = 'red';
        return false;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    if (birthDate > today || age < 12) {
        setError(input, msgElem, 'Вам має бути не менше 12 років');
        input.style.borderColor = 'red';
        return false;
    }

    input.style.borderColor = 'green';
    if (msgElem) msgElem.remove();
    return true;
}

// Валідація паролів
function validatePasswordMatch() {
    const pass = $('#password');
    const confirm = $('#confirmPassword');
    const msg = confirm.nextElementSibling;

    if (pass.value !== confirm.value) {
        setError(confirm, msg, 'Паролі не співпадають');
        pass.style.borderColor = confirm.style.borderColor = 'red';
        return false;
    }

    pass.style.borderColor = confirm.style.borderColor = 'green';
    if (msg) msg.remove();
    return true;
}

function getErrorMessage(input) {
    if (input.validity.valueMissing) return 'Це поле є обов’язковим';
    if (input.validity.tooShort) return `Мінімум ${input.minLength} символів`;
    if (input.validity.tooLong) return `Максимум ${input.maxLength} символів`;
    if (input.validity.typeMismatch) {
        return input.type === 'email' ? 'Невірна електронна адреса' : 'Невірний формат';
    }
    if (input.validity.rangeUnderflow || input.validity.rangeOverflow) return 'Значення поза допустимим діапазоном';
    if (input.validity.patternMismatch) return 'Невідповідний формат';
    return 'Невірне значення';
}

function setError(input, div, message) {
    if (!div) {
        div = document.createElement('div');
        div.className = 'error-message';
        input.insertAdjacentElement('afterend', div);
    }
    div.textContent = message;
    div.className = 'error-message';
}

// Форми
function handleSignupFormSubmit(e) {
    e.preventDefault();
    const basicValid = validateForm(signupForm);
    const birthValid = validateBirthDate();
    const passValid = validatePasswordMatch();

    if (basicValid && birthValid && passValid) {
        localStorage.setItem('loggedIn', 'true');
        showSnackbar('Ви успішно зареєстровані!', 'green', signupForm);
        setTimeout(() => {
            mainBlock.style.display = 'none';
            appContainer.classList.remove('hidden');
            loadUsers();
        }, 3000);
        clearForm(signupForm);
    }
}

function handleLoginFormSubmit(e) {
    e.preventDefault();
    const basicValid = validateForm(loginForm);

    if (basicValid) {
        localStorage.setItem('loggedIn', 'true');
        showSnackbar('Ви успішно увійшли!', 'green', loginForm);
        setTimeout(() => {
            mainBlock.style.display = 'none';
            appContainer.classList.remove('hidden');
            loadUsers();
        }, 3000);
        clearForm(loginForm);
    }
}

function clearForm(form) {
    const elements = form.elements;
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (el.type === 'checkbox' || el.type === 'radio') {
            el.checked = false;
        } else if (el.type !== 'submit' && el.type !== 'button' && el.type !== 'reset') {
            el.value = '';
        }
    }
}

function handleLogout() {
    localStorage.removeItem('loggedIn');
    appContainer.classList.add('hidden');
    mainBlock.style.display = 'flex';
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    navButtons.forEach(btn => btn.classList.remove('active'));
    $('signupNavBtn')?.classList.add('active');
}

// Country-city selector
const citiesByCountry = {
    'Ukraine': ['Kyiv', 'Lviv', 'Odesa'],
    'USA': ['New York', 'Los Angeles', 'Chicago'],
    'Germany': ['Berlin', 'Munich', 'Hamburg']
};

function handleCountryChange() {
    const cities = citiesByCountry[this.value] || [];
    citySelect.innerHTML = '<option value="">Select city</option>';
    cities.forEach(city => citySelect.add(new Option(city, city)));
    citySelect.disabled = cities.length === 0;
}

// Snackbar
function showSnackbar(message, color, form) {
    snackbar.textContent = message;
    snackbar.style.backgroundColor = color;
    snackbar.classList.add('show');
    setTimeout(() => {
        snackbar.classList.remove('show');
    }, 3000);
}

function restoreFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);

    if (params.has('search')) searchInput.value = params.get('search');
    if (params.has('email')) emailFilter.value = params.get('email');
    if (params.has('year')) yearFilter.value = params.get('year');
    if (params.has('country')) countryFilter.value = params.get('country');
    if (params.has('city')) cityFilter.value = params.get('city');
    if (params.has('minAge')) minAgeInput.value = params.get('minAge');
    if (params.has('maxAge')) maxAgeInput.value = params.get('maxAge');
    if (params.has('sort')) sortSelect.value = params.get('sort');

    filterAndSort();
}

// ===================== USERS SECTION ======================
async function loadUsers() {
    try {
        const res = await fetch('https://randomuser.me/api/?results=30&nat=us,gb,ca,au');
        const data = await res.json();
        usersData = data.results;
        renderUsers(usersData);
        restoreFiltersFromURL();
    } catch (err) {
        usersContainer.innerHTML = 'Помилка завантаження користувачів.';
        console.error(err);
    }
}

let currentPage = 1;
const itemsPerPage = 6;


function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById('paginationContainer');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active-page' : '';
        btn.addEventListener('click', () => {
            currentPage = i;
            renderUsers(usersData);
        });
        container.appendChild(btn);
    }
}


function renderUsers(users) {
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = users.slice(start, start + itemsPerPage);

    usersContainer.innerHTML = paginatedUsers.length
        ? paginatedUsers.map(user => `
            <div class="user-card">
                <img src="${user.picture.medium}" alt="Фото ${user.name.first}" />
                <div>
                    <b>${user.name.first} ${user.name.last}</b><br/>
                    Вік: ${user.dob.age}<br/>
                    Рік народження: ${new Date(user.dob.date).getFullYear()}<br/>
                    Email: ${user.email}<br/>
                    Країна: ${user.location.country}<br/>
                    Місто: ${user.location.city}
                </div>
            </div>
        `).join('')
        : '<p>Нічого не знайдено.</p>';

    renderPagination(users.length);
}

function filterAndSort() {
    let filtered = [...usersData];

    const searchTerm = searchInput.value.trim().toLowerCase();
    const minAge = parseInt(minAgeInput.value, 10);
    const maxAge = parseInt(maxAgeInput.value, 10);
    const emailTerm = emailFilter.value.trim().toLowerCase();
    const yearTerm = yearFilter.value.trim();
    const countryTerm = countryFilter.value.trim().toLowerCase();
    const cityTerm = cityFilter.value.trim().toLowerCase();
    const sortType = sortSelect.value;

    if (searchTerm) {
        filtered = filtered.filter(u =>
            u.name.first.toLowerCase().includes(searchTerm) ||
            u.name.last.toLowerCase().includes(searchTerm)
        );
    }

    if (!isNaN(minAge)) filtered = filtered.filter(u => u.dob.age >= minAge);
    if (!isNaN(maxAge)) filtered = filtered.filter(u => u.dob.age <= maxAge);

    if (emailTerm) {
        filtered = filtered.filter(u => u.email.toLowerCase().includes(emailTerm));
    }

    if (yearTerm) {
        filtered = filtered.filter(u =>
            new Date(u.dob.date).getFullYear().toString() === yearTerm
        );
    }


    if (countryTerm) {
        filtered = filtered.filter(u =>
            u.location.country.toLowerCase().includes(countryTerm)
        );
    }

    if (cityTerm) {
        filtered = filtered.filter(u =>
            u.location.city.toLowerCase().includes(cityTerm)
        );
    }

    if (sortType === 'age-asc') {
        filtered.sort((a, b) => a.dob.age - b.dob.age);
    } else if (sortType === 'age-desc') {
        filtered.sort((a, b) => b.dob.age - a.dob.age);
    }

    renderUsers(filtered);
    updateURLParams();
}

function updateURLParams() {
    const params = new URLSearchParams();

    if (searchInput.value) params.set('search', searchInput.value);
    if (minAgeInput.value) params.set('minAge', minAgeInput.value);
    if (maxAgeInput.value) params.set('maxAge', maxAgeInput.value);
    if (emailFilter.value) params.set('email', emailFilter.value);
    if (yearFilter.value) params.set('year', yearFilter.value);
    if (countryFilter.value) params.set('country', countryFilter.value);
    if (cityFilter.value) params.set('city', cityFilter.value);
    if (sortSelect.value) params.set('sort', sortSelect.value);

    const newUrl = `${location.pathname}?${params.toString()}`;
    history.replaceState(null, '', newUrl);
}



// Ініціалізація початкового стану
(() => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
    appContainer.classList.add('hidden');

    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    if (isLoggedIn) {
        mainBlock.style.display = 'none';
        appContainer.classList.remove('hidden');
        loadUsers();
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        appContainer.classList.add('hidden');
    }
})();
