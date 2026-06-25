/**
 * cases.js
 * --------------------------------------
 * منطق صفحة القضايا.
 */

$(function () {

    let allCases = [];
    let allClients = [];
    const caseModal = new bootstrap.Modal(document.getElementById("caseModal"));

    init();

    async function init() {
        await loadClientsForSelect();
        await loadCases();
    }

    // ===== تحميل العملاء (للقائمة المنسدلة) =====
    async function loadClientsForSelect() {
        try {
            allClients = await Api.getClients();
            const $select = $("#caseClient");
            allClients.forEach(client => {
                $select.append(`<option value="${client.id}">${client.name}</option>`);
            });
        } catch (err) {
            console.error(err);
        }
    }

    // ===== تحميل وعرض القضايا =====
    async function loadCases() {
        try {
            allCases = await Api.getCases();
            applyFilters();
        } catch (err) {
            console.error(err);
            $("#casesTableBody").html(`<tr><td colspan="6" class="text-center text-danger py-4">حدث خطأ في تحميل القضايا</td></tr>`);
        }
    }

    function applyFilters() {
        const term = $("#searchInput").val().trim().toLowerCase();
        const status = $("#statusFilter").val();

        let filtered = allCases;

        if (term) {
            filtered = filtered.filter(c =>
                c.case_number.toLowerCase().includes(term) || c.title.toLowerCase().includes(term)
            );
        }

        if (status) {
            filtered = filtered.filter(c => c.status === status);
        }

        renderCases(filtered);
    }

    function renderCases(cases) {
        const $body = $("#casesTableBody").empty();

        if (!cases.length) {
            $body.append(`<tr><td colspan="6" class="text-center text-muted py-4">لا توجد قضايا مطابقة</td></tr>`);
            return;
        }

        const statusLabels = {
            active: '<span class="badge bg-success">نشطة</span>',
            pending: '<span class="badge bg-warning text-dark">معلقة</span>',
            closed: '<span class="badge bg-secondary">مغلقة</span>'
        };

        cases.forEach(c => {
            $body.append(`
                <tr>
                    <td><strong>#${c.case_number}</strong></td>
                    <td>${c.title}</td>
                    <td>${c.client_name}</td>
                    <td>${c.court || "-"}</td>
                    <td>${statusLabels[c.status] || c.status}</td>
                    <td class="text-center">
                        <a href="../case-details/case-details.html?id=${c.id}" class="btn btn-sm btn-outline-secondary">
                            <i class="bi bi-eye"></i>
                        </a>
                        <button class="btn btn-sm btn-outline-primary edit-case" data-id="${c.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-case" data-id="${c.id}" data-title="${c.title}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    $("#searchInput").on("input", applyFilters);
    $("#statusFilter").on("change", applyFilters);

    // ===== فتح مودال إضافة قضية =====
    $("#addCaseBtn").on("click", function () {
        resetCaseForm();
        $("#caseModalTitle").text("إضافة قضية جديدة");
        caseModal.show();
    });

    // ===== فتح مودال تعديل قضية =====
    $(document).on("click", ".edit-case", function () {
        const id = $(this).data("id");
        const caseItem = allCases.find(c => c.id === id);
        if (!caseItem) return;

        resetCaseForm();
        $("#caseModalTitle").text("تعديل القضية");
        $("#caseId").val(caseItem.id);
        $("#caseNumber").val(caseItem.case_number);
        $("#caseTitle").val(caseItem.title);
        $("#caseClient").val(caseItem.client_id);
        $("#caseCourt").val(caseItem.court);
        $("#caseStatus").val(caseItem.status);
        $("#caseDescription").val(caseItem.description);

        caseModal.show();
    });

    function resetCaseForm() {
        $("#caseId").val("");
        $("#caseNumber").val("");
        $("#caseTitle").val("");
        $("#caseClient").val("");
        $("#caseCourt").val("");
        $("#caseStatus").val("active");
        $("#caseDescription").val("");
        $("#caseFormError").addClass("d-none");
    }

    // ===== حفظ (إضافة أو تعديل) =====
    $("#saveCaseBtn").on("click", async function () {
        const id = $("#caseId").val();
        const caseNumber = $("#caseNumber").val().trim();
        const title = $("#caseTitle").val().trim();
        const clientId = $("#caseClient").val();
        const court = $("#caseCourt").val().trim();
        const status = $("#caseStatus").val();
        const description = $("#caseDescription").val().trim();

        if (!caseNumber || !title || !clientId) {
            $("#caseFormError").text("رقم القضية، العنوان، والعميل مطلوبون").removeClass("d-none");
            return;
        }

        const caseData = {
            case_number: caseNumber,
            title,
            client_id: Number(clientId),
            court,
            status,
            description
        };

        try {
            const result = id
                ? await Api.updateCase(id, caseData)
                : await Api.createCase(caseData);

            if (!result.success) {
                $("#caseFormError").text(result.message || "حدث خطأ").removeClass("d-none");
                return;
            }

            caseModal.hide();
            loadCases();

        } catch (err) {
            console.error(err);
            $("#caseFormError").text("حدث خطأ في الاتصال بالسيرفر").removeClass("d-none");
        }
    });

    // ===== حذف قضية =====
    $(document).on("click", ".delete-case", async function () {
        const id = $(this).data("id");
        const title = $(this).data("title");

        if (!confirm(`هل أنت متأكد من حذف القضية "${title}"؟ سيتم حذف الجلسات والمدفوعات المرتبطة بها.`)) return;

        try {
            const result = await Api.deleteCase(id);
            if (!result.success) {
                alert(result.message || "حدث خطأ أثناء الحذف");
                return;
            }
            loadCases();
        } catch (err) {
            console.error(err);
            alert("حدث خطأ في الاتصال بالسيرفر");
        }
    });

});
