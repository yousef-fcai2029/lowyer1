/**
 * payments.js
 * --------------------------------------
 * منطق صفحة الأتعاب والمدفوعات.
 * تطبيق فعلي لقاعدة الصلاحيات:
 * - ADMIN / LAWYER: عرض + إضافة + تعديل + حذف
 * - SECRETARY: عرض فقط (الإضافة والتعديل والحذف مخفية ومعطلة)
 */

$(function () {

    let allPayments = [];
    let allCases = [];
    const paymentModal = new bootstrap.Modal(document.getElementById("paymentModal"));

    const canCreate = Permissions.can("payments", "create");
    const canUpdate = Permissions.can("payments", "update");
    const canDelete = Permissions.can("payments", "delete");

    applyPermissionsToUI();
    init();

    // ===== تطبيق الصلاحيات على عناصر الواجهة =====
    function applyPermissionsToUI() {
        if (!canCreate) {
            $("#addPaymentBtn").remove();
            $("#readOnlyNotice").removeClass("d-none");
        }

        // لو مفيش صلاحية تعديل أو حذف، نخفي عمود الإجراءات كله
        if (!canUpdate && !canDelete) {
            $("#actionsHeader").remove();
        }
    }

    async function init() {
        await loadCasesForSelect();
        await loadPayments();
    }

    // ===== تحميل القضايا (للقائمة المنسدلة عند إضافة دفعة) =====
    async function loadCasesForSelect() {
        try {
            allCases = await Api.getCases();
            const $select = $("#paymentCase");
            allCases.forEach(c => {
                $select.append(`<option value="${c.id}">#${c.case_number} - ${c.title}</option>`);
            });
        } catch (err) {
            console.error(err);
        }
    }

    // ===== تحميل وعرض المدفوعات =====
    async function loadPayments() {
        try {
            allPayments = await Api.getPayments();
            renderSummary(allPayments);
            renderPayments(allPayments);
        } catch (err) {
            console.error(err);
            $("#paymentsTableBody").html(`<tr><td colspan="7" class="text-center text-danger py-4">حدث خطأ في تحميل المدفوعات</td></tr>`);
        }
    }

    function renderSummary(payments) {
        const total = payments.reduce((sum, p) => sum + p.amount, 0);
        const count = payments.length;
        const thisMonth = payments.filter(p => p.date && p.date.startsWith("2026-06")).reduce((s, p) => s + p.amount, 0);

        $("#paymentsSummaryRow").html(`
            <div class="col-md-4">
                <div class="card stat-card bg-payments p-3">
                    <div class="small opacity-75">إجمالي المدفوعات</div>
                    <div class="fs-4 fw-bold">${total.toLocaleString("ar-EG")} ج.م</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card stat-card bg-cases p-3">
                    <div class="small opacity-75">عدد الدفعات</div>
                    <div class="fs-4 fw-bold">${count}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card stat-card bg-clients p-3">
                    <div class="small opacity-75">مدفوعات هذا الشهر</div>
                    <div class="fs-4 fw-bold">${thisMonth.toLocaleString("ar-EG")} ج.م</div>
                </div>
            </div>
        `);
    }

    function renderPayments(payments) {
        const $body = $("#paymentsTableBody").empty();

        if (!payments.length) {
            const colspan = (canUpdate || canDelete) ? 7 : 6;
            $body.append(`<tr><td colspan="${colspan}" class="text-center text-muted py-4">لا توجد مدفوعات مسجلة</td></tr>`);
            return;
        }

        payments.forEach(p => {
            let actionsCell = "";
            if (canUpdate || canDelete) {
                actionsCell = `
                    <td class="text-center">
                        ${canUpdate ? `
                            <button class="btn btn-sm btn-outline-primary edit-payment" data-id="${p.id}">
                                <i class="bi bi-pencil"></i>
                            </button>` : ""}
                        ${canDelete ? `
                            <button class="btn btn-sm btn-outline-danger delete-payment" data-id="${p.id}">
                                <i class="bi bi-trash"></i>
                            </button>` : ""}
                    </td>
                `;
            }

            $body.append(`
                <tr>
                    <td><strong>#${p.case_number}</strong></td>
                    <td>${p.case_title}</td>
                    <td>${p.amount.toLocaleString("ar-EG")} ج.م</td>
                    <td>${p.date}</td>
                    <td>${p.method || "-"}</td>
                    <td>${p.notes || "-"}</td>
                    ${actionsCell}
                </tr>
            `);
        });
    }

    // ===== فتح مودال إضافة دفعة (الزرار نفسه مخفي للسكرتيرة، بس بنحمي النداء كمان) =====
    $("#addPaymentBtn").on("click", function () {
        if (!canCreate) return;
        resetPaymentForm();
        $("#paymentModalTitle").text("تسجيل دفعة جديدة");
        $("#paymentDate").val(new Date().toISOString().split("T")[0]);
        paymentModal.show();
    });

    // ===== فتح مودال تعديل دفعة =====
    $(document).on("click", ".edit-payment", function () {
        if (!canUpdate) return;

        const id = $(this).data("id");
        const payment = allPayments.find(p => p.id === id);
        if (!payment) return;

        resetPaymentForm();
        $("#paymentModalTitle").text("تعديل الدفعة");
        $("#paymentId").val(payment.id);
        $("#paymentCase").val(payment.case_id);
        $("#paymentAmount").val(payment.amount);
        $("#paymentDate").val(payment.date);
        $("#paymentMethod").val(payment.method);
        $("#paymentNotes").val(payment.notes);

        paymentModal.show();
    });

    function resetPaymentForm() {
        $("#paymentId").val("");
        $("#paymentCase").val("");
        $("#paymentAmount").val("");
        $("#paymentDate").val("");
        $("#paymentMethod").val("نقدي");
        $("#paymentNotes").val("");
        $("#paymentFormError").addClass("d-none");
    }

    // ===== حفظ (إضافة أو تعديل) =====
    $("#savePaymentBtn").on("click", async function () {
        const id = $("#paymentId").val();

        // حماية إضافية: لو حصل أي تلاعب وحاول يحفظ بدون صلاحية
        if ((!id && !canCreate) || (id && !canUpdate)) {
            $("#paymentFormError").text("لا تملك صلاحية تنفيذ هذا الإجراء").removeClass("d-none");
            return;
        }

        const caseId = $("#paymentCase").val();
        const amount = $("#paymentAmount").val();
        const date = $("#paymentDate").val();
        const method = $("#paymentMethod").val();
        const notes = $("#paymentNotes").val().trim();

        if (!caseId || !amount || !date) {
            $("#paymentFormError").text("القضية، المبلغ، والتاريخ مطلوبون").removeClass("d-none");
            return;
        }

        const paymentData = {
            case_id: Number(caseId),
            amount: Number(amount),
            date,
            method,
            notes
        };

        try {
            const result = id
                ? await Api.updatePayment(id, paymentData)
                : await Api.createPayment(paymentData);

            if (!result.success) {
                $("#paymentFormError").text(result.message || "حدث خطأ").removeClass("d-none");
                return;
            }

            paymentModal.hide();
            loadPayments();

        } catch (err) {
            console.error(err);
            $("#paymentFormError").text("حدث خطأ في الاتصال بالسيرفر").removeClass("d-none");
        }
    });

    // ===== حذف دفعة =====
    $(document).on("click", ".delete-payment", async function () {
        if (!canDelete) return;

        const id = $(this).data("id");
        if (!confirm("هل أنت متأكد من حذف هذه الدفعة؟")) return;

        try {
            const result = await Api.deletePayment(id);
            if (!result.success) {
                alert(result.message || "حدث خطأ أثناء الحذف");
                return;
            }
            loadPayments();
        } catch (err) {
            console.error(err);
            alert("حدث خطأ في الاتصال بالسيرفر");
        }
    });

});
