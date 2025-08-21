// MultipleFiles/member.js
// --- Member Management ---

function saveMember() {
    const nameInput = document.getElementById('mem-name');
    const dobInput = document.getElementById('mem-dob');
    const genderInput = document.getElementById('mem-gender');
    const phoneInput = document.getElementById('mem-phone');
    const emailInput = document.getElementById('mem-email');
    const addressInput = document.getElementById('mem-address');
    const packageIdInput = document.getElementById('mem-package');
    const trainerIdInput = document.getElementById('mem-trainer');
    const startDateInput = document.getElementById('mem-start-date');
    // const expiryDateInput = document.getElementById('mem-expiry-date'); // Đã bỏ

    const name = nameInput.value.trim();
    const dob = dobInput.value;
    const gender = genderInput.value;
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const address = addressInput.value.trim();
    const packageId = parseInt(packageIdInput.value);
    const trainerId = parseInt(trainerIdInput.value);
    const startDate = startDateInput.value;
    // const expiryDate = expiryDateInput.value; // Đã bỏ

    let hasError = false;
    // Cập nhật mảng kiểm tra lỗi, bỏ expiryDateInput
    [nameInput, dobInput, genderInput, phoneInput, emailInput, addressInput, packageIdInput, trainerIdInput, startDateInput].forEach(clearInputError);

    if (!name) { displayInputError(nameInput, 'Họ tên không được để trống.'); hasError = true; }
    if (!dob) { displayInputError(dobInput, 'Ngày sinh không được để trống.'); hasError = true; }
    if (!gender) { displayInputError(genderInput, 'Vui lòng chọn giới tính.'); hasError = true; }
    if (!phone) { displayInputError(phoneInput, 'Số điện thoại không được để trống.'); hasError = true; }
    else if (!isValidPhone(phone)) { displayInputError(phoneInput, 'Số điện thoại không hợp lệ.'); hasError = true; }
    if (!email) { displayInputError(emailInput, 'Email không được để trống.'); hasError = true; }
    else if (!isValidEmail(email)) { displayInputError(emailInput, 'Email không hợp lệ.'); hasError = true; }
    if (!address) { displayInputError(addressInput, 'Địa chỉ không được để trống.'); hasError = true; }
    if (!packageId) { displayInputError(packageIdInput, 'Vui lòng chọn gói tập.'); hasError = true; }
    if (!trainerId) { displayInputError(trainerIdInput, 'Vui lòng chọn huấn luyện viên.'); hasError = true; }
    if (!startDate) { displayInputError(startDateInput, 'Ngày bắt đầu không được để trống.'); hasError = true; }
    // if (!expiryDate) { displayInputError(expiryDateInput, 'Ngày hết hạn không được để trống.'); hasError = true; } // Đã bỏ


    if (hasError) {
        alert('Vui lòng nhập đầy đủ thông tin hội viên!');
        return;
    }

    const selectedPackage = packages.find(p => p.id === packageId);
    const packagePrice = selectedPackage ? parseFloat(selectedPackage.price.replace(/\D/g, '')) : 0;
    const packageName = selectedPackage ? selectedPackage.name : 'N/A';

    let transactionDescription = "";
    let transactionAmount = packagePrice;

    if (editingState.memberId) {
        const memberIndex = members.findIndex(m => m.id === editingState.memberId);
        if (memberIndex !== -1) {
            // Cập nhật đối tượng member, bỏ expiryDate
            members[memberIndex] = { id: editingState.memberId, name, dob, gender, phone, email, address, packageId, trainerId, startDate };
            transactionDescription = `Gia hạn gói ${packageName}`;
            alert('Cập nhật hội viên thành công!');
        }
    } else {
        // Cập nhật đối tượng newMember, bỏ expiryDate
        const newMember = { id: generateUniqueIdSimple(), name, dob, gender, phone, email, address, packageId, trainerId, startDate };
        members.push(newMember);
        transactionDescription = `Đăng ký gói ${packageName}`;
        alert('Thêm hội viên thành công!');
    }

    // Create a new transaction
    const newTransaction = {
        id: generateUniqueIdSimple(),
        date: new Date().toISOString().split('T')[0], // Current date
        memberId: editingState.memberId || members[members.length - 1].id, // Use existing ID or newly created member's ID
        description: transactionDescription,
        amount: transactionAmount,
        status: "Đã thanh toán", // Default to paid for simplicity
        packageId: packageId // Thêm packageId vào transaction
    };
    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));


    hideAllForms();
    renderMembers();
}

function deleteMember(id) {
    if (confirm('Bạn chắc chắn muốn xóa hội viên này?')) {
        members = members.filter(m => m.id !== id);
        localStorage.setItem('members', JSON.stringify(members));
        hideAllForms();
        renderMembers();
        alert('Xóa hội viên thành công!');
    }
}
