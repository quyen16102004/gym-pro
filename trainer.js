// MultipleFiles/trainer.js
// --- Trainer Management ---

function renderTrainers() {
    const trainersContainer = document.getElementById('trainer-list');
    if (!trainersContainer) return;

    const searchTerm = document.getElementById('trainer-search').value.toLowerCase();
    const filteredTrainers = trainers.filter(t =>
        t.name.toLowerCase().includes(searchTerm) ||
        t.specialization.toLowerCase().includes(searchTerm) ||
        (t.birthYear && t.birthYear.toString().includes(searchTerm)) ||
        t.email.toLowerCase().includes(searchTerm) ||
        t.phone.includes(searchTerm)
    );

    trainersContainer.innerHTML = filteredTrainers.map(t => {
        const studentsCount = members.filter(m => m.trainerId === t.id).length;
        return `
        <div class="trainer-card">
            <div class="trainer-header">
                <h3><i class="fas fa-user-tie"></i> ${t.name}</h3>
                <span class="trainer-specialization">${t.specialization}</span>
            </div>
            <div class="trainer-body">
                <p><i class="fas fa-users"></i> Số học viên: ${studentsCount}</p>
                <p><i class="fas fa-calendar"></i> Năm sinh: ${t.birthYear || 'N/A'}</p>
                <p><i class="fas fa-phone"></i> ${t.phone}</p>
                <p><i class="fas fa-envelope"></i> ${t.email}</p>
            </div>
            <div class="trainer-footer">
                <button class="btn-action edit-btn" onclick="showFormPopup('trainer', ${t.id})"><i class="fas fa-edit"></i> Sửa</button>
                <button class="btn-action delete-btn" onclick="deleteTrainer(${t.id})"><i class="fas fa-trash-alt"></i> Xóa</button>
            </div>
        </div>
    `;
    }).join('');
    localStorage.setItem('trainers', JSON.stringify(trainers));
}

function saveTrainer() {
    const nameInput = document.getElementById('tr-name');
    const specializationInput = document.getElementById('tr-specialization');
    const birthYearInput = document.getElementById('tr-birth-year');
    const phoneInput = document.getElementById('tr-phone');
    const emailInput = document.getElementById('tr-email');

    const name = nameInput.value.trim();
    const specialization = specializationInput.value;
    const birthYear = parseInt(birthYearInput.value);
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();

    let hasError = false;
    [nameInput, specializationInput, birthYearInput, phoneInput, emailInput].forEach(clearInputError);

    if (!name) { displayInputError(nameInput, 'Họ tên không được để trống.'); hasError = true; }
    if (!specialization) { displayInputError(specializationInput, 'Vui lòng chọn chuyên môn.'); hasError = true; }
    if (isNaN(birthYear) || birthYear < 1900 || birthYear > new Date().getFullYear()) { displayInputError(birthYearInput, 'Năm sinh không hợp lệ.'); hasError = true; }
    if (!phone) { displayInputError(phoneInput, 'Số điện thoại không được để trống.'); hasError = true; }
    else if (!isValidPhone(phone)) { displayInputError(phoneInput, 'Số điện thoại không hợp lệ.'); hasError = true; }
    if (!email) { displayInputError(emailInput, 'Email không được để trống.'); hasError = true; }
    else if (!isValidEmail(email)) { displayInputError(emailInput, 'Email không hợp lệ.'); hasError = true; }

    if (hasError) {
        alert('Vui lòng nhập đầy đủ thông tin huấn luyện viên!');
        return;
    }

    if (editingState.trainerId) {
        const trainerIndex = trainers.findIndex(t => t.id === editingState.trainerId);
        if (trainerIndex !== -1) {
            trainers[trainerIndex] = { id: editingState.trainerId, name, specialization, birthYear, phone, email };
            alert('Cập nhật huấn luyện viên thành công!');
        }
    } else {
        const newTrainer = { id: generateUniqueIdSimple(), name, specialization, birthYear, phone, email };
        trainers.push(newTrainer);
        alert('Thêm huấn luyện viên thành công!');
    }

    hideAllForms();
    renderTrainers();
}

function deleteTrainer(id) {
    if (confirm('Bạn chắc chắn muốn xóa huấn luyện viên này?')) {
        trainers = trainers.filter(t => t.id !== id);
        localStorage.setItem('trainers', JSON.stringify(trainers));
        hideAllForms();
        renderTrainers();
        alert('Xóa huấn luyện viên thành công!');
    }
}
