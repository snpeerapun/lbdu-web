/**
 * Admin Login Page - jQuery Script
 * LBDU Fund Platform
 */

$(document).ready(function () {

    // ===================================
    // Toggle Password Visibility
    // ===================================
    $('#togglePassword').on('click', function () {
        const passwordInput = $('#password');
        const icon = $(this).find('i');

        if (passwordInput.attr('type') === 'password') {
            passwordInput.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            passwordInput.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });

    // ===================================
    // Form Validation
    // ===================================
    function validateForm() {
        let isValid = true;

        // Clear previous errors
        $('.error-message').text('');
        $('.form-control').removeClass('error');

        // Validate Username
        const username = $('#username').val().trim();
        if (username === '') {
            $('#usernameError').text('กรุณากรอกชื่อผู้ใช้');
            $('#username').addClass('error');
            isValid = false;
        } else if (username.length < 3) {
            $('#usernameError').text('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร');
            $('#username').addClass('error');
            isValid = false;
        }

        // Validate Password
        const password = $('#password').val();
        if (password === '') {
            $('#passwordError').text('กรุณากรอกรหัสผ่าน');
            $('#password').addClass('error');
            isValid = false;
        } else if (password.length < 6) {
            $('#passwordError').text('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            $('#password').addClass('error');
            isValid = false;
        }

        return isValid;
    }

    // Clear error on input
    $('.form-control').on('input', function () {
        $(this).removeClass('error');
        $(this).siblings('.error-message').text('');
    });

    // ===================================
    // Alert Message Functions
    // ===================================
    function showAlert(message, type = 'danger') {
        const alertDiv = $('#alertMessage');
        alertDiv.removeClass('alert-success alert-danger');
        alertDiv.addClass(`alert-${type}`);
        alertDiv.html(message);
        alertDiv.slideDown(300);

        // Auto hide after 5 seconds
        setTimeout(function () {
            alertDiv.slideUp(300);
        }, 5000);
    }

    function hideAlert() {
        $('#alertMessage').slideUp(300);
    }

    // ===================================
    // Login Form Submit
    // ===================================
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        // Hide any existing alerts
        hideAlert();

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Get form data
        const formData = {
            username: $('#username').val().trim(),
            password: $('#password').val(),
            rememberMe: $('#rememberMe').is(':checked'),
            __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val()
        };

        // Show loading state
        const btnLogin = $('#btnLogin');
        const btnText = btnLogin.find('.btn-text');
        const btnSpinner = btnLogin.find('.btn-spinner');

        btnLogin.prop('disabled', true);
        btnText.hide();
        btnSpinner.show();

        // Submit login request
        $.ajax({
            url: '/Auth/Login',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    showAlert('เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนหน้า...', 'success');

                    // Redirect after 1 second
                    setTimeout(function () {
                        window.location.href = response.redirectUrl;
                    }, 1000);
                } else {
                    showAlert(response.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'danger');
                    resetButton();
                }
            },
            error: function (xhr, status, error) {
                console.error('Login error:', error);
                showAlert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง', 'danger');
                resetButton();
            }
        });

        function resetButton() {
            btnLogin.prop('disabled', false);
            btnText.show();
            btnSpinner.hide();
        }
    });

    // ===================================
    // Enter Key Support
    // ===================================
    $('.form-control').on('keypress', function (e) {
        if (e.which === 13) { // Enter key
            $('#loginForm').submit();
        }
    });

    // ===================================
    // Auto-fill from Cookie (if Remember Me was checked)
    // ===================================
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    const rememberedUsername = getCookie('AdminUsername');
    if (rememberedUsername) {
        $('#username').val(rememberedUsername);
        $('#rememberMe').prop('checked', true);
        $('#password').focus();
    } else {
        $('#username').focus();
    }

    // ===================================
    // Input Animation Effects
    // ===================================
    $('.form-control').on('focus', function () {
        $(this).parent().addClass('focused');
    });

    $('.form-control').on('blur', function () {
        if ($(this).val() === '') {
            $(this).parent().removeClass('focused');
        }
    });

    // Check if fields have values on page load
    $('.form-control').each(function () {
        if ($(this).val() !== '') {
            $(this).parent().addClass('focused');
        }
    });

    // ===================================
    // Prevent Multiple Submissions
    // ===================================
    let isSubmitting = false;
    $('#loginForm').on('submit', function (e) {
        if (isSubmitting) {
            e.preventDefault();
            return false;
        }
        isSubmitting = true;

        // Reset after 3 seconds (in case something goes wrong)
        setTimeout(function () {
            isSubmitting = false;
        }, 3000);
    });

    // ===================================
    // Demo Credentials Auto-fill (for testing)
    // ===================================
    $('.demo-info').on('click', 'code', function () {
        const text = $(this).text();
        if (text === 'admin') {
            $('#username').val('admin');
        } else if (text === 'admin123') {
            $('#password').val('admin123');
        }
        showAlert('ข้อมูลถูกกรอกอัตโนมัติแล้ว', 'success');
    });

    // ===================================
    // Console Welcome Message
    // ===================================
    console.log('%c LBDU Admin Panel ', 'background: #2563eb; color: white; font-size: 20px; padding: 10px;');
    console.log('%c System Version: 1.0.0 ', 'color: #6b7280; font-size: 12px;');

});