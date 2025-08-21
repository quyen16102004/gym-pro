// MultipleFiles/script.js
let users = JSON.parse(localStorage.getItem('users')) || [];
let isLoggedIn = false;
let currentUser = null;

let membersPerPage = 5;
let currentMemberPage = 1;
let transactionsPerPage = 10;
let currentTransactionPage = 1;


const defaultMembers = [];
let members = JSON.parse(localStorage.getItem('members')) || defaultMembers;

const defaultTrainers = [];
let trainers = JSON.parse(localStorage.getItem('trainers')) || defaultTrainers;

const defaultPackages = [];
let packages = JSON.parse(localStorage.getItem('packages')) || defaultPackages;

const defaultTransactions = [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || defaultTransactions;


let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
if (accounts.length === 0) {
    accounts = [];
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

const editingState = {
    memberId: null,
    trainerId: null,
    packageId: null,
    accountId: null,
    transactionId: null,
};

// --- Utility Functions ---

/**
 * Generates a unique ID for a given type.
 * @returns {number} The generated unique ID.
 */
function generateUniqueIdSimple() {
    return Date.now();
}

function hideAllForms() {
    const unifiedFormPopup = document.getElementById('unified-form-popup');
    const overlay = document.getElementById('overlay');

    unifiedFormPopup.style.display = 'none';
    overlay.style.display = 'none';

    document.querySelectorAll('.form-content').forEach(content => content.classList.add('hidden'));

    // Clear all error messages and error styles when hiding the form
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));

    // Reset all editing IDs
    Object.keys(editingState).forEach(key => editingState[key] = null);
}

/**
 * Fills a form with data from an object.
 * @param {HTMLElement} formContentElement - The form content element.
 * @param {object} data - The data object to fill the form with.
 * @param {object} fieldMap - A map of data keys to input element IDs.
 */
function fillForm(formContentElement, data, fieldMap) {
    for (const key in fieldMap) {
        const inputElement = formContentElement.querySelector(`#${fieldMap[key]}`);
        if (inputElement && data && data[key] !== undefined) {
            inputElement.value = data[key];
        } else if (inputElement) {
            inputElement.value = ''; // Clear if no data or data is undefined
        }
    }
}

/**
 * Shows a unified form popup for various entity types.
 * @param {string} formType - The type of form to show ('member', 'trainer', 'package', 'account', 'transaction').
 * @param {number|string|null} id - The ID of the entity to edit, or null for a new entity.
 */
function showFormPopup(formType, id = null) {
    hideAllForms(); // Call this first to clear previous state

    const unifiedFormPopup = document.getElementById('unified-form-popup');
    const formPopupTitle = document.getElementById('form-popup-title');
    const overlay = document.getElementById('overlay');

    unifiedFormPopup.style.display = 'block';
    overlay.style.display = 'block';

    let currentFormContent;
    let titleText = '';
    let data = null;
    let fieldMap = {};

    // Reset editing state for the current form type
    Object.keys(editingState).forEach(key => editingState[key] = null);

    switch (formType) {
        case 'member':
            currentFormContent = document.getElementById('member-form-content');
            titleText = id ? 'Sửa thông tin hội viên' : 'Thêm hội viên mới';
            editingState.memberId = id;
            if (id) data = members.find(m => m.id === id);
            fieldMap = {
                name: 'mem-name', dob: 'mem-dob', gender: 'mem-gender', phone: 'mem-phone',
                email: 'mem-email', address: 'mem-address', packageId: 'mem-package', trainerId: 'mem-trainer',
                startDate: 'mem-start-date'
            };

            const memIdInput = document.getElementById('mem-id');
            if (memIdInput) {
                memIdInput.value = id ? id : 'Tự động tạo';
                memIdInput.readOnly = !!id;
            }

            // Populate package dropdown
            const memPackageSelect = document.getElementById('mem-package');
            memPackageSelect.innerHTML = '<option value="">Chọn gói tập</option>';
            packages.forEach(pkg => {
                const option = document.createElement('option');
                option.value = pkg.id;
                option.textContent = `${pkg.name} - ${pkg.price}`;
                memPackageSelect.appendChild(option);
            });
            if (data && data.packageId) {
                memPackageSelect.value = data.packageId;
            }

            // Populate trainer dropdown
            const memTrainerSelect = document.getElementById('mem-trainer');
            memTrainerSelect.innerHTML = '<option value="">Chọn huấn luyện viên</option>';
            trainers.forEach(trainer => {
                const option = document.createElement('option');
                option.value = trainer.id;
                option.textContent = `${trainer.name} - ${trainer.specialization}`;
                memTrainerSelect.appendChild(option);
            });
            if (data && data.trainerId) {
                memTrainerSelect.value = data.trainerId;
            }

            // Set default start date for new member
            if (!id) {
                document.getElementById('mem-start-date').valueAsDate = new Date();
            }
            break;
        case 'trainer':
            currentFormContent = document.getElementById('trainer-form-content');
            titleText = id ? 'Sửa thông tin huấn luyện viên' : 'Thêm huấn luyện viên mới';
            editingState.trainerId = id;
            if (id) data = trainers.find(t => t.id === id);
            fieldMap = {
                name: 'tr-name', specialization: 'tr-specialization', birthYear: 'tr-birth-year',
                phone: 'tr-phone', email: 'tr-email'
            };

            const trIdInput = document.getElementById('tr-id');
            if (trIdInput) {
                trIdInput.value = id ? id : 'Tự động tạo';
                trIdInput.readOnly = !!id;
            }
            break;
        case 'package':
            currentFormContent = document.getElementById('package-form-content');
            titleText = id ? 'Sửa thông tin gói tập' : 'Thêm gói tập mới';
            editingState.packageId = id;
            if (id) data = packages.find(p => p.id === id);
            fieldMap = {
                name: 'pkg-name', price: 'pkg-price', durationInMonths: 'pkg-duration', benefit: 'pkg-benefit'
            };

            const pkgIdInput = document.getElementById('pkg-id');
            if (pkgIdInput) {
                pkgIdInput.value = id ? id : 'Tự động tạo';
                pkgIdInput.readOnly = !!id;
            }
            break;
        case 'account':
            currentFormContent = document.getElementById('account-form-content');
            titleText = id ? 'Sửa thông tin tài khoản' : 'Thêm tài khoản mới';
            editingState.accountId = id;
            if (id) data = accounts.find(x => x.id === id);
            fieldMap = {
                username: 'acc-username', fullname: 'acc-fullname', email: 'acc-email', role: 'acc-role'
            };

            const accIdInput = document.getElementById('acc-id');
            if (accIdInput) {
                accIdInput.value = id ? id : 'Tự động tạo';
                accIdInput.readOnly = !!id;
            }

            const accPasswordField = document.getElementById('acc-password');
            if (accPasswordField) {
                accPasswordField.value = '';
                accPasswordField.placeholder = id ? 'Để trống nếu không đổi mật khẩu' : 'Mật khẩu';
            }
            const accUsernameInput = document.getElementById('acc-username');
            if (accUsernameInput) {
                accUsernameInput.readOnly = !!id;
            }
            break;
        case 'transaction':
            currentFormContent = document.getElementById('transaction-form-content');
            titleText = id ? 'Sửa giao dịch' : 'Thêm giao dịch mới';
            editingState.transactionId = id;
            if (id) data = transactions.find(t => t.id === id);
            fieldMap = {
                memberId: 'trans-member', description: 'trans-description', amount: 'trans-amount',
                date: 'trans-date', status: 'trans-status', packageId: 'trans-package-id'
            };

            const transIdInput = document.getElementById('trans-id');
            if (transIdInput) {
                transIdInput.value = id ? id : 'Tự động tạo';
                transIdInput.readOnly = !!id;
            }

            // Populate member dropdown
            const transMemberSelect = document.getElementById('trans-member');
            transMemberSelect.innerHTML = '<option value="">Chọn hội viên</option>';
            members.forEach(member => {
                const option = document.createElement('option');
                option.value = member.id;
                option.textContent = member.name;
                transMemberSelect.appendChild(option);
            });
            if (data && data.memberId) {
                transMemberSelect.value = data.memberId;
            }
            break;
        default:
            console.error('Unknown form type:', formType);
            return;
    }

    fillForm(currentFormContent, data, fieldMap);
    formPopupTitle.innerText = titleText;
    currentFormContent.classList.remove('hidden');
    unifiedFormPopup.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

/**
 * Validates an email address.
 * @param {string} email - The email string to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Validates a Vietnamese phone number.
 * @param {string} phone - The phone number string to validate.
 * @returns {boolean} True if the phone number is valid, false otherwise.
 */
function isValidPhone(phone) {
    const re = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return re.test(String(phone));
}

/**
 * Displays an error message for a given input element.
 * @param {HTMLElement} inputElement - The input element to mark as error.
 * @param {string} message - The error message to display.
 */
function displayInputError(inputElement, message) {
    inputElement.classList.add('error');
    let errorMessageElement = inputElement.nextElementSibling;
    if (!errorMessageElement || !errorMessageElement.classList.contains('error-message')) {
        errorMessageElement = document.createElement('span');
        errorMessageElement.classList.add('error-message');
        inputElement.parentNode.insertBefore(errorMessageElement, inputElement.nextSibling);
    }
    errorMessageElement.textContent = message;
}

/**
 * Clears any error message and styling from an input element.
 * @param {HTMLElement} inputElement - The input element to clear errors from.
 */
function clearInputError(inputElement) {
    inputElement.classList.remove('error');
    const errorMessageElement = inputElement.nextElementSibling;
    if (errorMessageElement && errorMessageElement.classList.contains('error-message')) {
        errorMessageElement.textContent = '';
    }
}

// --- Pagination Functions ---

function renderMembers() {
    const tbody = document.getElementById('member-list');
    if (!tbody) return;

    const searchTerm = document.getElementById('member-search').value.toLowerCase();
    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm) ||
        m.email.toLowerCase().includes(searchTerm) ||
        m.phone.includes(searchTerm) ||
        (m.gender && m.gender.toLowerCase().includes(searchTerm)) ||
        (m.address && m.address.toLowerCase().includes(searchTerm)) ||
        (packages.find(p => p.id === m.packageId)?.name || '').toLowerCase().includes(searchTerm)
    );

    const totalMembers = filteredMembers.length;
    const totalPages = Math.ceil(totalMembers / membersPerPage);
    currentMemberPage = Math.min(currentMemberPage, totalPages || 1);

    const startIndex = (currentMemberPage - 1) * membersPerPage;
    const endIndex = startIndex + membersPerPage;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedMembers.map(m => `
        <tr>
            <td>${m.name}</td>
            <td>${m.dob}</td>
            <td>${m.gender || 'N/A'}</td>
            <td>${m.phone}</td>
            <td>${m.email}</td>
            <td>${m.address || 'N/A'}</td>
            <td>${packages.find(p => p.id === m.packageId)?.name || 'N/A'}</td>
            <td>${trainers.find(t => t.id === m.trainerId)?.name || 'N/A'}</td>
            <td>${m.startDate || 'N/A'}</td>
            <td>
                <button class="btn-action edit-btn" onclick="showFormPopup('member', ${m.id})"><i class="fas fa-edit"></i> Sửa</button>
                <button class="btn-action delete-btn" onclick="deleteMember(${m.id})"><i class="fas fa-trash-alt"></i> Xóa</button>
            </td>
        </tr>
    `).join('');

    const paginationContainer = document.getElementById('member-pagination');
    if (paginationContainer) {
        paginationContainer.innerHTML = `
            <div class="pagination">
                <button class="btn btn-primary" onclick="changeMemberPage(${currentMemberPage - 1})" ${currentMemberPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Trước</button>
                <span class="page-info">Trang ${currentMemberPage} / ${totalPages}</span>
                <button class="btn btn-primary" onclick="changeMemberPage(${currentMemberPage + 1})" ${currentMemberPage === totalPages ? 'disabled' : ''}>Sau <i class="fas fa-chevron-right"></i></button>
            </div>
        `;
    }

    localStorage.setItem('members', JSON.stringify(members));
}

function changeMemberPage(page) {
    const searchTerm = document.getElementById('member-search').value.toLowerCase();
    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm) ||
        m.email.toLowerCase().includes(searchTerm) ||
        m.phone.includes(searchTerm) ||
        (m.gender && m.gender.toLowerCase().includes(searchTerm)) ||
        (m.address && m.address.toLowerCase().includes(searchTerm)) ||
        (packages.find(p => p.id === m.packageId)?.name || '').toLowerCase().includes(searchTerm)
    );
    const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

    if (page < 1 || page > totalPages) return;

    currentMemberPage = page;
    renderMembers();
}

// --- Page Navigation and Access Control ---

function showPageBasedOnRole(role) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('#nav-private a').forEach(item => item.classList.add('hidden'));

    document.getElementById('home').classList.remove('hidden');
    document.querySelector('a[onclick*="showPage(\'home\')"]').classList.remove('hidden');

    hideAllForms();

    document.getElementById('nav-private').classList.remove('hidden');
    document.getElementById('nav-public').classList.add('hidden');

    const navLinks = {
        'member': 'a[onclick*="showPage(\'member\')"]',
        'transaction': 'a[onclick*="showPage(\'transaction\')"]',
        'report': 'a[onclick*="showPage(\'report\')"]',
        'trainer': 'a[onclick*="showPage(\'trainer\')"]',
        'package': 'a[onclick*="showPage(\'package\')"]',
        'account': 'a[onclick*="showPage(\'account\')"]',
    };

    const rolePermissions = {
        'admin': ['member', 'transaction', 'report', 'trainer', 'package', 'account'],
        'trainer': [],
    };

    if (rolePermissions[role]) {
        rolePermissions[role].forEach(pageId => {
            const link = document.querySelector(navLinks[pageId]);
            if (link) link.classList.remove('hidden');
        });
        showPage('home'); // Default to home page after login
    } else {
        document.getElementById('nav-private').classList.add('hidden');
        document.getElementById('nav-public').classList.remove('hidden');
        showPage('login');
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    const activeLink = document.querySelector(`nav a[onclick*="showPage('${pageId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    hideAllForms();

    // Render specific content when navigating to a page
    switch (pageId) {
        case 'member':
            currentMemberPage = 1;
            renderMembers();
            break;
        case 'trainer':
            renderTrainers();
            break;
        case 'package':
            renderPackages();
            break;
        case 'account':
            renderAccounts();
            break;
        case 'transaction':
            currentTransactionPage = 1;
            renderTransactions();
            break;
        case 'report':
            renderReports();
            break;
    }
}

// --- Authentication ---

function login(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const rememberMe = document.getElementById('remember-me').checked;

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert('Sai tên đăng nhập hoặc mật khẩu!');
        return false;
    }

    isLoggedIn = true;
    currentUser = user;

    if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
        localStorage.setItem('rememberedPassword', password);
    } else {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
    }

    showPageBasedOnRole(user.role);
    alert('Đăng nhập thành công!');
    return false;
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    localStorage.removeItem('rememberedUsername');
    localStorage.removeItem('rememberedPassword');
    showPage('login');
    alert('Đã đăng xuất!');
}

// --- Initial Load and Setup ---

document.addEventListener('DOMContentLoaded', () => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    if (rememberedUsername && rememberedPassword) {
        document.getElementById('login-username').value = rememberedUsername;
        document.getElementById('login-password').value = rememberedPassword;
        document.getElementById('remember-me').checked = true;
    }

    if (users.length === 0) {
        users = [
            { id: 1, username: 'admin', password: 'admin', role: 'admin', fullname: 'Quản trị viên', email: 'admin@gym.com', phone: '0123456789' },
            { id: 2, username: 'trainer1', password: 'trainer', role: 'trainer', fullname: 'Trần Văn B', email: 'tranvanb@gym.com', phone: '0901234567' }
        ];
        localStorage.setItem('users', JSON.stringify(users));
        accounts = [...users];
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }

    if (!localStorage.getItem('members')) localStorage.setItem('members', JSON.stringify(members));
    if (!localStorage.getItem('trainers')) localStorage.setItem('trainers', JSON.stringify(trainers));
    if (!localStorage.getItem('packages')) localStorage.setItem('packages', JSON.stringify(packages));
    if (!localStorage.getItem('transactions')) localStorage.setItem('transactions', JSON.stringify(transactions));


    if (rememberedUsername && rememberedPassword) {
        const rememberedUser = users.find(u => u.username === rememberedUsername && u.password === rememberedPassword);
        if (rememberedUser) {
            isLoggedIn = true;
            currentUser = rememberedUser;
            showPageBasedOnRole(currentUser.role);
        } else {
            showPage('login');
        }
    } else {
        showPage('login');
    }
});
