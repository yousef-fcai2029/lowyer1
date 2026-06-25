/**
 * documents.js
 * --------------------------------------
 * منطق صفحة الملفات.
 *
 * ملاحظة عن الرفع: في وضع mock، بنقرأ اسم وحجم الملف الفعلي
 * من عنصر input[type=file] (عشان التجربة تكون حقيقية بقدر الإمكان)
 * لكن مش بنرفع المحتوى لأي سيرفر حقيقي - لحد ما الباك إند يوفر endpoint للرفع.
 */

$(function () {

    let allDocuments = [];
    let allCases = [];
    const documentModal = new bootstrap.Modal(document.getElementById("documentModal"));

    init();

    async function init() {
        await loadCasesForSelect();
        await loadDocuments();
    }

    async function loadCasesForSelect() {
        try {
            allCases = await Api.getCases();

            const $modalSelect = $("#documentCase");
            const $filterSelect = $("#filterCase");

            allCases.forEach(c => {
                const optionHtml = `<option value="${c.id}">#${c.case_number} - ${c.title}</option>`;
                $modalSelect.append(optionHtml);
                $filterSelect.append(optionHtml);
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function loadDocuments() {
        try {
            allDocuments = await Api.getDocuments();
            applyFilter();
        } catch (err) {
            console.error(err);
            $("#documentsTableBody").html(`<tr><td colspan="7" class="text-center text-danger py-4">حدث خطأ في تحميل الملفات</td></tr>`);
        }
    }

    function applyFilter() {
        const caseId = $("#filterCase").val();
        const filtered = caseId ? allDocuments.filter(d => d.case_id === Number(caseId)) : allDocuments;
        renderDocuments(filtered);
    }

    const fileIcons = {
        "عقد": "bi-file-earmark-text",
        "حكم محكمة": "bi-file-earmark-check",
        "بطاقة شخصية": "bi-file-earmark-person",
        "مستند آخر": "bi-file-earmark"
    };

    function renderDocuments(documents) {
        const $body = $("#documentsTableBody").empty();

        if (!documents.length) {
            $body.append(`<tr><td colspan="7" class="text-center text-muted py-4">لا توجد ملفات مرفوعة</td></tr>`);
            return;
        }

        documents.forEach(d => {
            const icon = fileIcons[d.type] || "bi-file-earmark";
            $body.append(`
                <tr>
                    <td><i class="bi ${icon}"></i> ${d.name}</td>
                    <td><span class="badge bg-light text-dark border">${d.type}</span></td>
                    <td><strong>#${d.case_number}</strong> - ${d.case_title}</td>
                    <td>${d.file_size || "-"}</td>
                    <td>${d.uploaded_by_name}</td>
                    <td>${d.uploaded_at}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger delete-document" data-id="${d.id}" data-name="${d.name}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    $("#filterCase").on("change", applyFilter);

    $("#addDocumentBtn").on("click", function () {
        resetDocumentForm();
        documentModal.show();
    });

    function resetDocumentForm() {
        $("#documentCase").val("");
        $("#documentType").val("عقد");
        $("#documentFile").val("");
        $("#documentFormError").addClass("d-none");
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    $("#saveDocumentBtn").on("click", async function () {
        const caseId = $("#documentCase").val();
        const type = $("#documentType").val();
        const fileInput = document.getElementById("documentFile");
        const file = fileInput.files[0];

        if (!caseId || !file) {
            $("#documentFormError").text("القضية والملف مطلوبان").removeClass("d-none");
            return;
        }

        const $btn = $("#saveDocumentBtn");
        $btn.prop("disabled", true);
        $("#saveDocBtnText").addClass("d-none");
        $("#saveDocSpinner").removeClass("d-none");

        const documentData = {
            case_id: Number(caseId),
            type,
            name: file.name,
            file_size: formatFileSize(file.size)
        };

        try {
            const result = await Api.createDocument(documentData);

            if (!result.success) {
                $("#documentFormError").text(result.message || "حدث خطأ").removeClass("d-none");
                return;
            }

            documentModal.hide();
            loadDocuments();

        } catch (err) {
            console.error(err);
            $("#documentFormError").text("حدث خطأ في الاتصال بالسيرفر").removeClass("d-none");
        } finally {
            $btn.prop("disabled", false);
            $("#saveDocBtnText").removeClass("d-none");
            $("#saveDocSpinner").addClass("d-none");
        }
    });

    $(document).on("click", ".delete-document", async function () {
        const id = $(this).data("id");
        const name = $(this).data("name");

        if (!confirm(`هل أنت متأكد من حذف الملف "${name}"؟`)) return;

        try {
            const result = await Api.deleteDocument(id);
            if (!result.success) {
                alert(result.message || "حدث خطأ أثناء الحذف");
                return;
            }
            loadDocuments();
        } catch (err) {
            console.error(err);
            alert("حدث خطأ في الاتصال بالسيرفر");
        }
    });

});
