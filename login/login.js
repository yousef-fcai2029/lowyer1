/**
 * login.js
 * --------------------------------------
 * منطق صفحة تسجيل الدخول.
 */

$(function () {

    // لو المستخدم داخل بالفعل، وديه على طول للداشبورد
    Auth.redirectIfLoggedIn();

    const $email = $("#email");
    const $password = $("#password");
    const $errorMsg = $("#error-msg");
    const $loginBtn = $("#loginBtn");
    const $loginBtnText = $("#loginBtnText");
    const $loginSpinner = $("#loginSpinner");

    function showError(message) {
        $errorMsg.text(message).removeClass("d-none");
    }

    function hideError() {
        $errorMsg.addClass("d-none");
    }

    function setLoading(isLoading) {
        $loginBtn.prop("disabled", isLoading);
        $loginBtnText.toggleClass("d-none", isLoading);
        $loginSpinner.toggleClass("d-none", !isLoading);
    }

    async function handleLogin() {
        hideError();

        const email = $email.val().trim();
        const password = $password.val().trim();

        if (!email || !password) {
            showError("من فضلك أدخل البريد الإلكتروني وكلمة المرور");
            return;
        }

        setLoading(true);

        try {
            const result = await Api.login(email, password);

            if (!result || !result.success) {
                showError(result?.message || "فشل تسجيل الدخول، حاول مرة أخرى");
                setLoading(false);
                return;
            }

            Auth.saveSession(result.token, result.user);
            window.location.href = CONFIG.PAGES.DASHBOARD;

        } catch (err) {
            console.error(err);
            showError("حدث خطأ في الاتصال بالسيرفر");
            setLoading(false);
        }
    }

    $loginBtn.on("click", function (e) {
        e.preventDefault();
        handleLogin();
    });

    // تسجيل الدخول بالـ Enter من أي حقل
    $email.add($password).on("keypress", function (e) {
        if (e.which === 13) {
            e.preventDefault();
            handleLogin();
        }
    });

    // تعبئة سريعة بالحسابات التجريبية
    $(".demo-account").on("click", function () {
        $email.val($(this).data("email"));
        $password.val($(this).data("password"));
    });

});
