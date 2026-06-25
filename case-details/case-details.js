/**
 * case-details.js
 * --------------------------------------
 * يقرأ معرف القضية من رابط الصفحة (?id=...)
 * ويعرض بياناتها كاملة: العميل، الجلسات، المدفوعات.
 */

$(function () {

    const caseId = new URLSearchParams(window.location.search).get("id");

    if (!caseId) {
        $("#pageContent").html(`<div class="alert alert-danger">لم يتم تحديد قضية</div>`);
        return;
    }

    loadCaseDetails();

    async function loadCaseDetails() {
        try {
            const caseData = await Api.getCaseById(caseId);

            if (!caseData) {
                $("#pageContent").html(`<div class="alert alert-warning">القضية غير موجودة</div>`);
                return;
            }

            render(caseData);

        } catch (err) {
            console.error(err);
            $("#pageContent").html(`<div class="alert alert-danger">حدث خطأ في تحميل بيانات القضية</div>`);
        }
    }

    function render(c) {
        const statusLabels = {
            active: '<span class="badge bg-success">نشطة</span>',
            pending: '<span class="badge bg-warning text-dark">معلقة</span>',
            closed: '<span class="badge bg-secondary">مغلقة</span>'
        };

        const totalPaid = c.payments.reduce((sum, p) => sum + p.amount, 0);

        const hearingsRows = c.hearings.length
            ? c.hearings.map(h => `
                <tr>
                    <td>${h.date}</td>
                    <td>${h.court || "-"}</td>
                    <td>${h.notes || "-"}</td>
                    <td>${h.result || "-"}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="4" class="text-center text-muted">لا توجد جلسات مسجلة</td></tr>`;

        const paymentsRows = c.payments.length
            ? c.payments.map(p => `
                <tr>
                    <td>${p.date}</td>
                    <td>${p.amount.toLocaleString("ar-EG")} ج.م</td>
                    <td>${p.method || "-"}</td>
                    <td>${p.notes || "-"}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="4" class="text-center text-muted">لا توجد مدفوعات مسجلة</td></tr>`;

        $("#pageContent").html(`
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <a href="cases.html" class="text-decoration-none small">
                        <i class="bi bi-arrow-right"></i> رجوع إلى القضايا
                    </a>
                    <h5 class="mb-0 mt-1">
                        <i class="bi bi-briefcase"></i> قضية #${c.case_number} - ${c.title}
                    </h5>
                </div>
                ${statusLabels[c.status] || ""}
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <div class="card shadow-sm h-100">
                        <div class="card-header bg-white"><strong>بيانات القضية</strong></div>
                        <div class="card-body">
                            <p class="mb-2"><strong>المحكمة:</strong> ${c.court || "-"}</p>
                            <p class="mb-2"><strong>الوصف:</strong> ${c.description || "-"}</p>
                            <p class="mb-0"><strong>المحامي المسؤول:</strong> ${c.lawyer ? (c.lawyer.full_name || c.lawyer.username) : "-"}</p>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card shadow-sm h-100">
                        <div class="card-header bg-white"><strong>بيانات العميل</strong></div>
                        <div class="card-body">
                            ${c.client ? `
                                <p class="mb-2"><strong>الاسم:</strong> ${c.client.name}</p>
                                <p class="mb-2"><strong>الهاتف:</strong> ${c.client.phone}</p>
                                <p class="mb-2"><strong>العنوان:</strong> ${c.client.address || "-"}</p>
                                <p class="mb-0"><strong>الرقم القومي:</strong> ${c.client.national_id || "-"}</p>
                            ` : `<p class="text-muted mb-0">لا توجد بيانات عميل مرتبطة</p>`}
                        </div>
                    </div>
                </div>
            </div>

            <div class="card shadow-sm mb-4">
                <div class="card-header bg-white"><strong><i class="bi bi-calendar-event"></i> الجلسات</strong></div>
                <div class="table-responsive">
                    <table class="table mb-0">
                        <thead class="table-light">
                            <tr><th>التاريخ</th><th>المحكمة</th><th>ملاحظات</th><th>النتيجة</th></tr>
                        </thead>
                        <tbody>${hearingsRows}</tbody>
                    </table>
                </div>
            </div>

            <div class="card shadow-sm">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <strong><i class="bi bi-cash-coin"></i> المدفوعات</strong>
                    <span class="badge bg-success">إجمالي المدفوع: ${totalPaid.toLocaleString("ar-EG")} ج.م</span>
                </div>
                <div class="table-responsive">
                    <table class="table mb-0">
                        <thead class="table-light">
                            <tr><th>التاريخ</th><th>المبلغ</th><th>طريقة الدفع</th><th>ملاحظات</th></tr>
                        </thead>
                        <tbody>${paymentsRows}</tbody>
                    </table>
                </div>
            </div>
        `);
    }

});
