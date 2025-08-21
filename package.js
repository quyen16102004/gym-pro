// MultipleFiles/package.js

// --- Package Management ---

function renderPackages() {
    const packagesContainer = document.getElementById('package-container');
    if (!packagesContainer) return;

    const searchTerm = document.getElementById('package-search')?.value.toLowerCase() || '';
    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm) ||
        pkg.price.toLowerCase().includes(searchTerm) ||
        pkg.benefit.toLowerCase().includes(searchTerm)
    );

    packagesContainer.innerHTML = filteredPackages.map(pkg => `
        <div class="package-card">
            <div class="package-header">
                <h3><i class="fas fa-dumbbell"></i> ${pkg.name}</h3>
                <span class="package-price">${pkg.price}</span>
            </div>
            <div class="package-body">
                <p><i class="fas fa-calendar-alt"></i> Thời hạn: ${pkg.durationInMonths} tháng</p>
                <p><i class="fas fa-star"></i> Quyền lợi:</p>
                ${pkg.benefit.split(',').map(b => `<p><i class="fas fa-check"></i> ${b.trim()}</p>`).join('')}
            </div>
            <div class="package-footer">
                <button class="btn-action edit-btn" onclick="showFormPopup('package', ${pkg.id})"><i class="fas fa-edit"></i> Sửa</button>
                <button class="btn-action delete-btn" onclick="deletePackage(${pkg.id})"><i class="fas fa-trash-alt"></i> Xóa</button>
            </div>
        </div>
    `).join('');
    localStorage.setItem('packages', JSON.stringify(packages));
}

function savePackage() {
    const nameInput = document.getElementById('pkg-name');
    const priceInput = document.getElementById('pkg-price');
    const durationInput = document.getElementById('pkg-duration');
    const benefitInput = document.getElementById('pkg-benefit');

    const name = nameInput.value.trim();
    const price = priceInput.value.trim();
    const durationInMonths = parseInt(durationInput.value) || 0;
    const benefit = benefitInput.value.trim();

    let hasError = false;
    [nameInput, priceInput, durationInput, benefitInput].forEach(clearInputError);

    if (!name) { displayInputError(nameInput, 'Tên gói tập không được để trống.'); hasError = true; }
    if (!price) { displayInputError(priceInput, 'Giá không được để trống.'); hasError = true; }
    if (isNaN(durationInMonths) || durationInMonths <= 0) { displayInputError(durationInput, 'Thời hạn phải là số dương.'); hasError = true; }
    if (!benefit) { displayInputError(benefitInput, 'Quyền lợi không được để trống.'); hasError = true; }

    if (hasError) {
        alert('Vui lòng nhập đủ thông tin gói tập!');
        return;
    }

    if (editingState.packageId) {
        const packageIndex = packages.findIndex(p => p.id === editingState.packageId);
        if (packageIndex !== -1) {
            packages[packageIndex] = { id: editingState.packageId, name, price, durationInMonths, benefit };
            alert('Cập nhật gói tập thành công!');
        }
    } else {
        const newPackage = { id: generateUniqueIdSimple(), name, price, durationInMonths, benefit };
        packages.push(newPackage);
        alert('Thêm gói tập thành công!');
    }

    hideAllForms();
    renderPackages();
}

function deletePackage(id) {
    if (confirm('Bạn chắc chắn muốn xóa gói tập này?')) {
        packages = packages.filter(p => p.id !== id);
        localStorage.setItem('packages', JSON.stringify(packages));
        hideAllForms();
        renderPackages();
        alert('Xóa gói tập thành công!');
    }
}
