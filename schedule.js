let schedulesPerPage = 10;
let currentSchedulePage = 1;

function renderSchedules() {
    const tbody = document.getElementById('schedule-list');
    if (!tbody) return;

    const searchTerm = document.getElementById('schedule-search').value.toLowerCase();
    const filteredSchedules = schedules.filter(sch =>
        (members.find(m => m.id === sch.memberId)?.name || '').toLowerCase().includes(searchTerm) ||
        (trainers.find(t => t.id === sch.trainerId)?.name || '').toLowerCase().includes(searchTerm) ||
        sch.date.includes(searchTerm) ||
        sch.status.toLowerCase().includes(searchTerm)
    );

    const totalSchedules = filteredSchedules.length;
    const totalPages = Math.ceil(totalSchedules / schedulesPerPage);
    currentSchedulePage = Math.min(currentSchedulePage, totalPages || 1);

    const startIndex = (currentSchedulePage - 1) * schedulesPerPage;
    const endIndex = startIndex + schedulesPerPage;
    const paginatedSchedules = filteredSchedules.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedSchedules.map(sch => `
        <tr>
            <td>LT${sch.id.toString().padStart(4, '0')}</td>
            <td>${members.find(m => m.id === sch.memberId)?.name || 'N/A'}</td>
            <td>${trainers.find(t => t.id === sch.trainerId)?.name || 'N/A'}</td>
            <td>${sch.date}</td>
            <td>${sch.startTime}</td>
            <td>${sch.endTime}</td>
            <td><span class="status-badge status-${sch.status.toLowerCase().replace(' ', '-')}">${sch.status}</span></td>
            <td>
                <button class="btn-action edit-btn" onclick="showFormPopup('schedule', ${sch.id})"><i class="fas fa-edit"></i> Sửa</button>
                <button class="btn-action delete-btn" onclick="deleteSchedule(${sch.id})"><i class="fas fa-trash-alt"></i> Xóa</button>
            </td>
        </tr>
    `).join('');

    const paginationContainer = document.getElementById('schedule-pagination');
    if (paginationContainer) {
        paginationContainer.innerHTML = `
            <div class="pagination">
                <button class="btn btn-primary" onclick="changeSchedulePage(${currentSchedulePage - 1})" ${currentSchedulePage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Trước</button>
                <span class="page-info">Trang ${currentSchedulePage} / ${totalPages}</span>
                <button class="btn btn-primary" onclick="changeSchedulePage(${currentSchedulePage + 1})" ${currentSchedulePage === totalPages ? 'disabled' : ''}>Sau <i class="fas fa-chevron-right"></i></button>
            </div>
        `;
    }
    localStorage.setItem('schedules', JSON.stringify(schedules));
}

function changeSchedulePage(page) {
    const searchTerm = document.getElementById('schedule-search').value.toLowerCase();
    const filteredSchedules = schedules.filter(sch =>
        (members.find(m => m.id === sch.memberId)?.name || '').toLowerCase().includes(searchTerm) ||
        (trainers.find(t => t.id === sch.trainerId)?.name || '').toLowerCase().includes(searchTerm) ||
        sch.date.includes(searchTerm) ||
        sch.status.toLowerCase().includes(searchTerm)
    );
    const totalPages = Math.ceil(filteredSchedules.length / schedulesPerPage);

    if (page < 1 || page > totalPages) return;

    currentSchedulePage = page;
    renderSchedules();
}

function saveSchedule() {
    const memberIdInput = document.getElementById('sch-member');
    const trainerIdInput = document.getElementById('sch-trainer');
    const dateInput = document.getElementById('sch-date');
    const startTimeInput = document.getElementById('sch-start-time');
    const endTimeInput = document.getElementById('sch-end-time');
    const statusInput = document.getElementById('sch-status');

    const memberId = parseInt(memberIdInput.value);
    const trainerId = parseInt(trainerIdInput.value);
    const date = dateInput.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const status = statusInput.value;

    let hasError = false;
    [memberIdInput, trainerIdInput, dateInput, startTimeInput, endTimeInput, statusInput].forEach(clearInputError);

    if (!memberId) { displayInputError(memberIdInput, 'Vui lòng chọn hội viên.'); hasError = true; }
    if (!trainerId) { displayInputError(trainerIdInput, 'Vui lòng chọn huấn luyện viên.'); hasError = true; }
    if (!date) { displayInputError(dateInput, 'Ngày tập không được để trống.'); hasError = true; }
    if (!startTime) { displayInputError(startTimeInput, 'Giờ bắt đầu không được để trống.'); hasError = true; }
    if (!endTime) { displayInputError(endTimeInput, 'Giờ kết thúc không được để trống.'); hasError = true; }
    if (startTime && endTime && startTime >= endTime) { displayInputError(endTimeInput, 'Giờ kết thúc phải sau giờ bắt đầu.'); hasError = true; }
    if (!status) { displayInputError(statusInput, 'Vui lòng chọn trạng thái.'); hasError = true; }

    if (hasError) {
        alert('Vui lòng nhập đầy đủ thông tin lịch tập!');
        return;
    }

    if (editingState.scheduleId) {
        const scheduleIndex = schedules.findIndex(sch => sch.id === editingState.scheduleId);
        if (scheduleIndex !== -1) {
            schedules[scheduleIndex] = { id: editingState.scheduleId, memberId, trainerId, date, startTime, endTime, status };
            alert('Cập nhật lịch tập thành công!');
        }
    } else {
        const newSchedule = { id: generateUniqueIdSimple(), memberId, trainerId, date, startTime, endTime, status };
        schedules.push(newSchedule);
        alert('Thêm lịch tập thành công!');
    }

    localStorage.setItem('schedules', JSON.stringify(schedules));
    renderSchedules();
    hideAllForms();
}


function deleteSchedule(id) {
    if (confirm('Bạn chắc chắn muốn xóa lịch tập này?')) {
        schedules = schedules.filter(sch => sch.id !== id);
        localStorage.setItem('schedules', JSON.stringify(schedules));
        hideAllForms();
        renderSchedules();
        alert('Xóa lịch tập thành công!');
    }
}
