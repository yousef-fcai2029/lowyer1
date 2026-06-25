/**
 * notifications.js
 * --------------------------------------
 * منطق صفحة الإشعارات.
 */

$(function () {

    loadNotifications();

    async function loadNotifications() {
        try {
            const notifications = await Api.getNotifications();
            renderNotifications(notifications);
        } catch (err) {
            console.error(err);
            $("#notificationsList").html(`<li class="list-group-item text-center text-danger py-4">حدث خطأ في تحميل الإشعارات</li>`);
        }
    }

    function renderNotifications(notifications) {
        const $list = $("#notificationsList").empty();

        if (!notifications.length) {
            $list.append(`<li class="list-group-item text-center text-muted py-4">لا توجد إشعارات</li>`);
            return;
        }

        notifications.forEach(n => {
            const unreadClass = n.is_read ? "" : "fw-bold bg-light";
            const unreadDot = n.is_read ? "" : `<span class="badge bg-primary rounded-circle p-1 me-2"> </span>`;

            $list.append(`
                <li class="list-group-item d-flex justify-content-between align-items-start ${unreadClass}" data-id="${n.id}">
                    <div>
                        <div>${unreadDot}${n.title}</div>
                        <div class="small text-muted">${n.message}</div>
                        <div class="small text-muted mt-1">${n.created_at || ""}</div>
                    </div>
                    <div class="d-flex gap-1">
                        ${!n.is_read ? `
                            <button class="btn btn-sm btn-outline-success mark-read" data-id="${n.id}" title="تحديد كمقروء">
                                <i class="bi bi-check2"></i>
                            </button>` : ""}
                        <button class="btn btn-sm btn-outline-danger delete-notification" data-id="${n.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </li>
            `);
        });
    }

    $(document).on("click", ".mark-read", async function (e) {
        e.stopPropagation();
        const id = $(this).data("id");

        try {
            await Api.markNotificationRead(id);
            loadNotifications();
        } catch (err) {
            console.error(err);
        }
    });

    $("#markAllReadBtn").on("click", async function () {
        try {
            await Api.markAllNotificationsRead();
            loadNotifications();
        } catch (err) {
            console.error(err);
        }
    });

    $(document).on("click", ".delete-notification", async function (e) {
        e.stopPropagation();
        const id = $(this).data("id");

        if (!confirm("هل تريد حذف هذا الإشعار؟")) return;

        try {
            const result = await Api.deleteNotification(id);
            if (!result.success) {
                alert(result.message || "حدث خطأ أثناء الحذف");
                return;
            }
            loadNotifications();
        } catch (err) {
            console.error(err);
            alert("حدث خطأ في الاتصال بالسيرفر");
        }
    });

});
