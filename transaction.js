// MultipleFiles/transaction.js
// --- Transaction Management ---

function renderTransactions() {
    const tbody = document.getElementById('transaction-list');
    if (!tbody) return;

    const searchTerm = document.getElementById('transaction-search').value.toLowerCase();
    const filteredTransactions = transactions.filter(t =>
        (members.find(m => m.id === t.memberId)?.name || '').toLowerCase().includes(searchTerm) ||
        (packages.find(p => p.id === t.packageId)?.name || '').toLowerCase().includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm) ||
        t.status.toLowerCase().includes(searchTerm) ||
        t.date.includes(searchTerm)
    );

    const totalTransactions = filteredTransactions.length;
    const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
    currentTransactionPage = Math.min(currentTransactionPage, totalPages || 1);

    const startIndex = (currentTransactionPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedTransactions.map(t => `
        <tr>
            <td>GD${t.id.toString().padStart(4, '0')}</td>
            <td>${t.date}</td>
            <td>${members.find(m => m.id === t.memberId)?.name || 'N/A'}</td>
            <td>${packages.find(p => p.id === t.packageId)?.name || 'N/A'}</td>
            <td>${t.description}</td>
            <td>${t.amount.toLocaleString('vi-VN')}đ</td>
            <td><span class="status-badge status-${t.status.toLowerCase().replace(' ', '-')}">${t.status}</span></td>
            <td>
                <button class="btn-action edit-btn" onclick="showFormPopup('transaction', ${t.id})"><i class="fas fa-edit"></i> Sửa</button>
                <button class="btn-action delete-btn" onclick="deleteTransaction(${t.id})"><i class="fas fa-trash-alt"></i> Xóa</button>
            </td>
        </tr>
    `).join('');

    const paginationContainer = document.getElementById('transaction-pagination');
    if (paginationContainer) {
        paginationContainer.innerHTML = `
            <div class="pagination">
                <button class="btn btn-primary" onclick="changeTransactionPage(${currentTransactionPage - 1})" ${currentTransactionPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Trước</button>
                <span class="page-info">Trang ${currentTransactionPage} / ${totalPages}</span>
                <button class="btn btn-primary" onclick="changeTransactionPage(${currentTransactionPage + 1})" ${currentTransactionPage === totalPages ? 'disabled' : ''}>Sau <i class="fas fa-chevron-right"></i></button>
            </div>
        `;
    }

    updateTotalRevenue();
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function changeTransactionPage(page) {
    const searchTerm = document.getElementById('transaction-search').value.toLowerCase();
    const filteredTransactions = transactions.filter(t =>
        (members.find(m => m.id === t.memberId)?.name || '').toLowerCase().includes(searchTerm) ||
        (packages.find(p => p.id === t.packageId)?.name || '').toLowerCase().includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm) ||
        t.status.toLowerCase().includes(searchTerm) ||
        t.date.includes(searchTerm)
    );
    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

    if (page < 1 || page > totalPages) return;

    currentTransactionPage = page;
    renderTransactions();
}

function saveTransaction() {
    const memberIdInput = document.getElementById('trans-member');
    const descriptionInput = document.getElementById('trans-description');
    const amountInput = document.getElementById('trans-amount');
    const dateInput = document.getElementById('trans-date');
    const statusInput = document.getElementById('trans-status');

    const memberId = parseInt(memberIdInput.value);
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;
    const status = statusInput.value;

    let hasError = false;
    [memberIdInput, descriptionInput, amountInput, dateInput, statusInput].forEach(clearInputError);

    if (!memberId) { displayInputError(memberIdInput, 'Vui lòng chọn hội viên.'); hasError = true; }
    if (!description) { displayInputError(descriptionInput, 'Mô tả không được để trống.'); hasError = true; }
    if (isNaN(amount) || amount <= 0) { displayInputError(amountInput, 'Số tiền phải là số dương.'); hasError = true; }
    if (!date) { displayInputError(dateInput, 'Ngày giao dịch không được để trống.'); hasError = true; }
    if (!status) { displayInputError(statusInput, 'Vui lòng chọn trạng thái.'); hasError = true; }

    if (hasError) {
        alert('Vui lòng nhập đầy đủ thông tin giao dịch!');
        return;
    }

    // Lấy packageId từ thông tin hội viên được chọn
    const memberOfTransaction = members.find(m => m.id === memberId);
    const packageId = memberOfTransaction ? memberOfTransaction.packageId : null;

    if (editingState.transactionId) {
        const transactionIndex = transactions.findIndex(t => t.id === editingState.transactionId);
        if (transactionIndex !== -1) {
            transactions[transactionIndex] = { id: editingState.transactionId, memberId, description, amount, date, status, packageId };
            alert('Cập nhật giao dịch thành công!');
        }
    } else {
        const newTransaction = { id: generateUniqueIdSimple(), memberId, description, amount, date, status, packageId };
        transactions.push(newTransaction);
        alert('Thêm giao dịch thành công!');
    }

    hideAllForms();
    renderTransactions();
}

function deleteTransaction(id) {
    if (confirm('Bạn chắc chắn muốn xóa giao dịch này?')) {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        hideAllForms();
        renderTransactions();
        alert('Xóa giao dịch thành công!');
    }
}

function updateTotalRevenue() {
    const totalRevenue = transactions.reduce((sum, t) => {
        return t.status === 'Đã thanh toán' ? sum + t.amount : sum;
    }, 0);
    document.getElementById('total-revenue').innerText = totalRevenue.toLocaleString('vi-VN') + 'đ';
}
