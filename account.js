// MultipleFiles/account.js
// --- Account Management ---

function renderAccounts() {
    const tbody = document.getElementById('account-list');
    if (!tbody) return;

    const searchTerm = document.getElementById('account-search').value.toLowerCase();
    const filteredAccounts = accounts.filter(acc =>
        acc.username.toLowerCase().includes(searchTerm) ||
        (acc.fullname && acc.fullname.toLowerCase().includes(searchTerm)) ||
        (acc.email && acc.email.toLowerCase().includes(searchTerm)) ||
        acc.role.toLowerCase().includes(searchTerm)
    );

    tbody.innerHTML = filteredAccounts.map(acc => `
        <tr>
            <td>${acc.username}</td>
            <td>${acc.fullname || 'N/A'}</td>
            <td>${acc.email || 'N/A'}</td>
            <td>${acc.role}</td>
            <td>
                <button class="btn-action edit-btn" onclick="showFormPopup('account', ${acc.id})"><i class="fas fa-edit"></i> Sửa</button>
                <button class="btn-action delete-btn" onclick="deleteAccount(${acc.id})"><i class="fas fa-trash-alt"></i> Xóa</button>
            </td>
        </tr>
    `).join('');
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('users', JSON.stringify(users));
}

function saveAccount() {
    const usernameInput = document.getElementById('acc-username');
    const fullnameInput = document.getElementById('acc-fullname');
    const emailInput = document.getElementById('acc-email');
    const passwordInput = document.getElementById('acc-password');
    const roleInput = document.getElementById('acc-role');

    const username = usernameInput.value.trim();
    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const role = roleInput.value;

    let hasError = false;
    [usernameInput, fullnameInput, emailInput, passwordInput, roleInput].forEach(clearInputError);

    if (!username) { displayInputError(usernameInput, 'Tên đăng nhập không được để trống.'); hasError = true; }
    if (!fullname) { displayInputError(fullnameInput, 'Họ tên không được để trống.'); hasError = true; }
    if (!email) { displayInputError(emailInput, 'Email không được để trống.'); hasError = true; }
    else if (!isValidEmail(email)) { displayInputError(emailInput, 'Email không hợp lệ.'); hasError = true; }
    if (!role) { displayInputError(roleInput, 'Vui lòng chọn quyền.'); hasError = true; }

    if (hasError) {
        alert('Vui lòng nhập đầy đủ thông tin tài khoản!');
        return;
    }

    if (editingState.accountId) {
        const accountIndex = accounts.findIndex(acc => acc.id === editingState.accountId);
        const userIndex = users.findIndex(u => u.id === editingState.accountId);

        if (accountIndex !== -1) {
            if (username !== accounts[accountIndex].username && accounts.some(a => a.username === username && a.id !== editingState.accountId)) {
                displayInputError(usernameInput, 'Tên đăng nhập đã tồn tại!');
                alert('Tên đăng nhập đã tồn tại!');
                return;
            }
            accounts[accountIndex].username = username;
            accounts[accountIndex].fullname = fullname;
            accounts[accountIndex].email = email;
            if (password) {
                accounts[accountIndex].password = password;
            }
            accounts[accountIndex].role = role;
            alert('Cập nhật tài khoản thành công!');
        }
        if (userIndex !== -1) {
            users[userIndex].username = username;
            users[userIndex].fullname = fullname;
            users[userIndex].email = email;
            if (password) {
                users[userIndex].password = password;
            }
            users[userIndex].role = role;
        }
    } else {
        if (accounts.some(a => a.username === username)) {
            displayInputError(usernameInput, 'Tên đăng nhập đã tồn tại!');
            alert('Tên đăng nhập đã tồn tại!');
            return;
        }
        if (!password) {
            displayInputError(passwordInput, 'Vui lòng nhập mật khẩu cho tài khoản mới!');
            alert('Vui lòng nhập mật khẩu cho tài khoản mới!');
            return;
        }
        const newAccount = { id: generateUniqueIdSimple(), username, fullname, email, role, password };
        accounts.push(newAccount);
        users.push(newAccount);
        alert('Thêm tài khoản thành công!');
    }

    hideAllForms();
    renderAccounts();
}

function deleteAccount(id) {
    if (confirm('Bạn chắc chắn muốn xóa tài khoản này?')) {
        const accountToDelete = accounts.find(acc => acc.id === id);
        if (accountToDelete) {
            accounts = accounts.filter(x => x.id !== id);
            users = users.filter(u => u.id !== id);
            localStorage.setItem('accounts', JSON.stringify(accounts));
            localStorage.setItem('users', JSON.stringify(users));
            hideAllForms();
            renderAccounts();
            alert('Xóa tài khoản thành công!');
        } else {
            alert('Không tìm thấy tài khoản để xóa.');
        }
    }
}
