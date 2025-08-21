// MultipleFiles/report.js
const currentMonth = new Date().getMonth() + 1; // Lấy tháng hiện tại (1-12)

function renderReports() {
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = transactions.reduce((sum, t) => {
        const transactionDate = new Date(t.date);
        if (t.status === 'Đã thanh toán' && transactionDate.getMonth() + 1 === currentMonth && transactionDate.getFullYear() === currentYear) {
            return sum + t.amount;
        }
        return sum;
    }, 0);
    document.getElementById('monthly-revenue-report').innerText = monthlyRevenue.toLocaleString('vi-VN') + 'đ';

    const packagesSold = transactions.filter(t => t.description.includes('gói')).length;
    document.getElementById('packages-sold-report').innerText = packagesSold;

    const detailedReportList = document.getElementById('detailed-report-list');
    if (detailedReportList) {
        detailedReportList.innerHTML = `
            <tr>
                <td>Hội viên sắp hết hạn</td>
                <td>${getExpiringMembersCount()}</td>
                <td><button class="btn-action view-btn btn-small">Xem</button></td>
            </tr>
            <tr>
                <td>Gói tập bán chạy nhất</td>
                <td>${getMostPopularPackage()}</td>
                <td><button class="btn-action view-btn btn-small">Xem</button></td>
            </tr>
            <tr>
                <td>Huấn luyện viên có nhiều học viên nhất</td>
                <td>${getTrainerWithMostStudents()}</td>
                <td><button class="btn-action view-btn btn-small">Xem</button></td>
            </tr>
        `;
    }
}

function getExpiringMembersCount() {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    // Vì đã bỏ thuộc tính expiryDate khỏi member, hàm này sẽ luôn trả về 0 hoặc cần được định nghĩa lại logic
    // Nếu bạn muốn có báo cáo về hội viên sắp hết hạn, bạn cần có một cách khác để xác định điều đó
    // Ví dụ: dựa vào ngày bắt đầu và thời hạn gói tập của họ.
    // Hiện tại, tôi sẽ để nó trả về 0 vì không có expiryDate trực tiếp.
    return 0; // Hoặc bạn có thể thay đổi logic nếu có cách khác để xác định ngày hết hạn
}

function getMostPopularPackage() {
    const packageCounts = {};
    members.forEach(m => {
        const pkgName = packages.find(p => p.id === m.packageId)?.name;
        if (pkgName) {
            packageCounts[pkgName] = (packageCounts[pkgName] || 0) + 1;
        }
    });
    let mostPopular = 'N/A';
    let maxCount = 0;
    for (const pkg in packageCounts) {
        if (packageCounts[pkg] > maxCount) {
            maxCount = packageCounts[pkg];
            mostPopular = pkg;
        }
    }
    return mostPopular;
}

function getTrainerWithMostStudents() {
    const trainerStudentCounts = {};
    trainers.forEach(t => {
        trainerStudentCounts[t.name] = members.filter(m => m.trainerId === t.id).length;
    });

    let topTrainer = 'N/A';
    let maxStudents = -1;
    for (const trainerName in trainerStudentCounts) {
        if (trainerStudentCounts[trainerName] > maxStudents) {
            maxStudents = trainerStudentCounts[trainerName];
            topTrainer = trainerName;
        }
    }
    return topTrainer;
}
