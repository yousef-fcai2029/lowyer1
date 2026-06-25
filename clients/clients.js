/**
 * clients.js
 * --------------------------------------
 * منطق صفحة العملاء.
 */

$(function () {

    let allClients = [];
    const clientModal = new bootstrap.Modal(document.getElementById("clientModal"));
    const casesModal = new bootstrap.Modal(document.getElementById("clientCasesModal"));

    loadClients();

    // ===== تحميل وعرض العملاء =====
    async function loadClients() {
        try {
            allClients = await Api.getClients();
            renderClients(allClients);
        } catch (err) {
            console.error(err);
            $("#clientsTableBody").html(`<tr><td colspan="6" class="text-center text-danger py-4">حدث خطأ في تحميل العملاء</td></tr>`);
        }
    }

    function renderClients(clients) {
        const $body = $("#clientsTableBody").empty();

        if (!clients.length) {
            $body.append(`<tr><td colspan="6" class="text-center text-muted py-4">لا يوجد عملاء حالياً</td></tr>`);
            return;
        }

        clients.forEach(client => {
            $body.append(`
                <tr>
                    <td>${client.name}</td>
                    <td>${client.phone}</td>
                    <td>${client.address || "-"}</td>
                    <td>${client.national_id || "-"}</td>
                    <td>
                        <span class="badge bg-info text-dark view-cases" style="cursor:pointer" data-id="${client.id}" data-name="${client.name}">
                            ${client.cases_count} قضية
                        </span>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary edit-client" data-id="${client.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-client" data-id="${client.id}" data-name="${client.name}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    // ===== البحث =====
    $("#searchInput").on("input", function () {
        const term = $(this).val().trim().toLowerCase();
        const filtered = allClients.filter(c =>
            c.name.toLowerCase().includes(term) || c.phone.includes(term)
        );
        renderClients(filtered);
    });

    // ===== فتح مودال إضافة عميل =====
    $("#addClientBtn").on("click", function () {
        resetClientForm();
        $("#clientModalTitle").text("إضافة عميل جديد");
        clientModal.show();
    });

    // ===== فتح مودال تعديل عميل =====
    $(document).on("click", ".edit-client", async function () {
        const id = $(this).data("id");
        const client = allClients.find(c => c.id === id);
        if (!client) return;

        resetClientForm();
        $("#clientModalTitle").text("تعديل بيانات العميل");
        $("#clientId").val(client.id);
        $("#clientName").val(client.name);
        $("#clientPhone").val(client.phone);
        $("#clientAddress").val(client.address);
        $("#clientNationalId").val(client.national_id);

        clientModal.show();
    });

    function resetClientForm() {
        $("#clientId").val("");
        $("#clientName").val("");
        $("#clientPhone").val("");
        $("#clientAddress").val("");
        $("#clientNationalId").val("");
        $("#clientFormError").addClass("d-none");
    }

    // ===== حفظ (إضافة أو تعديل) =====
    $("#saveClientBtn").on("click", async function () {
        const id = $("#clientId").val();
        const name = $("#clientName").val().trim();
        const phone = $("#clientPhone").val().trim();
        const address = $("#clientAddress").val().trim();
        const nationalId = $("#clientNationalId").val().trim();

        if (!name || !phone) {
            $("#clientFormError").text("الاسم ورقم الهاتف مطلوبان").removeClass("d-none");
            return;
        }

        const clientData = { name, phone, address, national_id: nationalId };

        try {
            const result = id
                ? await Api.updateClient(id, clientData)
                : await Api.createClient(clientData);

            if (!result.success) {
                $("#clientFormError").text(result.message || "حدث خطأ").removeClass("d-none");
                return;
            }

            clientModal.hide();
            loadClients();

        } catch (err) {
            console.error(err);
            $("#clientFormError").text("حدث خطأ في الاتصال بالسيرفر").removeClass("d-none");
        }
    });

    // ===== حذف عميل =====
    $(document).on("click", ".delete-client", async function () {
        const id = $(this).data("id");
        const name = $(this).data("name");

        if (!confirm(`هل أنت متأكد من حذف العميل "${name}"؟`)) return;

        try {
            const result = await Api.deleteClient(id);
            if (!result.success) {
                alert(result.message || "حدث خطأ أثناء الحذف");
                return;
            }
            loadClients();
        } catch (err) {
            console.error(err);
            alert("حدث خطأ في الاتصال بالسيرفر");
        }
    });

    // ===== عرض قضايا عميل معين =====
    $(document).on("click", ".view-cases", async function () {
        const clientId = $(this).data("id");
        const clientName = $(this).data("name");

        $("#clientCasesName").text(clientName);
        $("#clientCasesList").html(`<li class="list-group-item text-muted">جاري التحميل...</li>`);
        casesModal.show();

        try {
            const allCases = await Api.getCases();
            const clientCases = allCases.filter(c => c.client_id === clientId);

            const $list = $("#clientCasesList").empty();

            if (!clientCases.length) {
                $list.append(`<li class="list-group-item text-muted">لا توجد قضايا لهذا العميل</li>`);
                return;
            }

            const statusLabels = {
                active: '<span class="badge bg-success">نشطة</span>',
                pending: '<span class="badge bg-warning text-dark">معلقة</span>',
                closed: '<span class="badge bg-secondary">مغلقة</span>'
            };

            clientCases.forEach(c => {
                $list.append(`
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>#${c.case_number}</strong> - ${c.title}
                            <div class="small text-muted">${c.court}</div>
                        </div>
                        <div class="text-end">
                            ${statusLabels[c.status] || ""}
                            <br>
                            <a href="case-details.html?id=${c.id}" class="small">عرض التفاصيل</a>
                        </div>
                    </li>
                `);
            });

        } catch (err) {
            console.error(err);
            $("#clientCasesList").html(`<li class="list-group-item text-danger">حدث خطأ في تحميل القضايا</li>`);
        }
    });

});
