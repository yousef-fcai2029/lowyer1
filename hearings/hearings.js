/**
 * hearings.js
 * --------------------------------------
 * منطق صفحة الجلسات.
 */

$(function () {

    let allHearings = [];
    let allCases = [];
    const hearingModal = new bootstrap.Modal(document.getElementById("hearingModal"));

    init();

    async function init() {
        await loadCasesForSelect();
        await loadHearings();
    }

    async function loadCasesForSelect() {
        try {
            allCases = await Api.getCases();
            const $select = $("#hearingCase");
            allCases.forEach(c => {
                $select.append(`<option value="${c.id}">#${c.case_number} - ${c.title}</option>`);
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function loadHearings() {
        try {
            allHearings = await Api.getHearings();
            applyFilter();
        } catch (err) {
            console.error(err);
            $("#hearingsTableBody").html(`<tr><td colspan="7" class="text-center text-danger py-4">حدث خطأ في تحميل الجلسات</td></tr>`);
        }
    }

    function applyFilter() {
        const filterType = $("#filterType").val();
        const today = new Date().toISOString().split("T")[0];

        let filtered = allHearings;
        if (filterType === "upcoming") {
            filtered = allHearings.filter(h => h.date >= today);
        } else if (filterType === "past") {
            filtered = allHearings.filter(h => h.date < today);
        }

        renderHearings(filtered);
    }

    function renderHearings(hearings) {
        const $body = $("#hearingsTableBody").empty();

        if (!hearings.length) {
            $body.append(`<tr><td colspan="7" class="text-center text-muted py-4">لا توجد جلسات مطابقة</td></tr>`);
            return;
        }

        const today = new Date().toISOString().split("T")[0];

        hearings.forEach(h => {
            const isPast = h.date < today;
            const dateCell = isPast
                ? `${h.date}`
                : `<span class="badge bg-warning text-dark">قادمة</span> ${h.date}`;

            $body.append(`
                <tr>
                    <td>${dateCell}</td>
                    <td><strong>#${h.case_number}</strong></td>
                    <td>${h.case_title}</td>
                    <td>${h.court || "-"}</td>
                    <td>${h.notes || "-"}</td>
                    <td>${h.result || "-"}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary edit-hearing" data-id="${h.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-hearing" data-id="${h.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    $("#filterType").on("change", applyFilter);

    $("#addHearingBtn").on("click", function () {
        resetHearingForm();
        $("#hearingModalTitle").text("إضافة جلسة جديدة");
        hearingModal.show();
    });

    $(document).on("click", ".edit-hearing", function () {
        const id = $(this).data("id");
        const hearing = allHearings.find(h => h.id === id);
        if (!hearing) return;

        resetHearingForm();
        $("#hearingModalTitle").text("تعديل الجلسة");
        $("#hearingId").val(hearing.id);
        $("#hearingCase").val(hearing.case_id);
        $("#hearingDate").val(hearing.date);
        $("#hearingCourt").val(hearing.court);
        $("#hearingNotes").val(hearing.notes);
        $("#hearingResult").val(hearing.result);

        hearingModal.show();
    });

    function resetHearingForm() {
        $("#hearingId").val("");
        $("#hearingCase").val("");
        $("#hearingDate").val("");
        $("#hearingCourt").val("");
        $("#hearingNotes").val("");
        $("#hearingResult").val("");
        $("#hearingFormError").addClass("d-none");
    }

    $("#saveHearingBtn").on("click", async function () {
        const id = $("#hearingId").val();
        const caseId = $("#hearingCase").val();
        const date = $("#hearingDate").val();
        const court = $("#hearingCourt").val().trim();
        const notes = $("#hearingNotes").val().trim();
        const result = $("#hearingResult").val().trim();

        if (!caseId || !date) {
            $("#hearingFormError").text("القضية والتاريخ مطلوبان").removeClass("d-none");
            return;
        }

        const hearingData = { case_id: Number(caseId), date, court, notes, result };

        try {
            const apiResult = id
                ? await Api.updateHearing(id, hearingData)
                : await Api.createHearing(hearingData);

            if (!apiResult.success) {
                $("#hearingFormError").text(apiResult.message || "حدث خطأ").removeClass("d-none");
                return;
            }

            hearingModal.hide();
            loadHearings();

        } catch (err) {
            console.error(err);
            $("#hearingFormError").text("حدث خطأ في الاتصال بالسيرفر").removeClass("d-none");
        }
    });

    $(document).on("click", ".delete-hearing", async function () {
        const id = $(this).data("id");
        if (!confirm("هل أنت متأكد من حذف هذه الجلسة؟")) return;

        try {
            const result = await Api.deleteHearing(id);
            if (!result.success) {
                alert(result.message || "حدث خطأ أثناء الحذف");
                return;
            }
            loadHearings();
        } catch (err) {
            console.error(err);
            alert("حدث خطأ في الاتصال بالسيرفر");
        }
    });

});
