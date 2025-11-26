$(document).ready(function () {
    // Global variables
    let currentStep = 1;
    let currentMode = 'recommend';
    let selectedRisk = initialData.selectedRisk;
    let investmentAmount = initialData.investmentAmount;
    let timeHorizon = initialData.timeHorizon;
    let currentAllocation = { equity: 40, mixed: 30, fixed: 20, money: 10 };
    let allocationChart = null;

    const riskProfiles = initialData.riskProfiles;
    const fundDatabase = initialData.fundDatabase;

    const assetClassInfo = {
        equity: { name: 'Equity Funds', icon: '📈', color: '#f44336' },
        mixed: { name: 'Mixed Funds', icon: '⚖️', color: '#ff9800' },
        fixed: { name: 'Fixed Income', icon: '🏦', color: '#4caf50' },
        money: { name: 'Money Market', icon: '💰', color: '#2196f3' }
    };

    // Format money
    function formatMoney(amount) {
        return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Step navigation
    function goToStep(step) {
        if (step <= currentStep || step === currentStep + 1) {
            currentStep = step;
            updateStepDisplay();
            updatePreview();
        }
    }

    function nextStep() {
        if (currentStep === 3 && currentMode === 'advanced') {
            const total = Object.values(currentAllocation).reduce((a, b) => a + b, 0);
            if (total !== 100) {
                alert('⚠️ สัดส่วนการลงทุนต้องรวมเป็น 100%\nปัจจุบัน: ' + total + '%');
                return;
            }
        }

        if (currentStep < 4) {
            currentStep++;
            updateStepDisplay();
            updatePreview();
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
            updateStepDisplay();
        }
    }

    function updateStepDisplay() {
        // Hide all steps
        $('.wizard-content').hide();
        $('.step-indicator').removeClass('active completed');

        // Show current step
        $('#step-' + currentStep).show();
        $('#step-indicator-' + currentStep).addClass('active');

        // Mark completed steps
        for (let i = 1; i < currentStep; i++) {
            $('#step-indicator-' + i).addClass('completed');
        }
    }

    // Risk selection
    function selectRisk(risk) {
        selectedRisk = risk;
        $('.risk-option').removeClass('selected');
        $('[data-risk="' + risk + '"]').addClass('selected');

        const profile = riskProfiles[risk];
        currentAllocation = { ...profile.Allocation };
        currentAllocation.equity = profile.Allocation.Equity;
        currentAllocation.mixed = profile.Allocation.Mixed;
        currentAllocation.fixed = profile.Allocation.Fixed;
        currentAllocation.money = profile.Allocation.Money;

        // Update sliders
        $('#equity-slider').val(currentAllocation.equity);
        $('#mixed-slider').val(currentAllocation.mixed);
        $('#fixed-slider').val(currentAllocation.fixed);
        $('#money-slider').val(currentAllocation.money);

        updateAllocationDisplay();
        updatePreview();
    }

    // Mode toggle
    function setMode(mode) {
        currentMode = mode;
        $('.mode-btn').removeClass('active');
        $('#mode-' + mode).addClass('active');

        if (mode === 'recommend') {
            $('#recommend-mode').show();
            $('#advanced-mode').hide();

            // Reset to recommended allocation
            const profile = riskProfiles[selectedRisk];
            currentAllocation.equity = profile.Allocation.Equity;
            currentAllocation.mixed = profile.Allocation.Mixed;
            currentAllocation.fixed = profile.Allocation.Fixed;
            currentAllocation.money = profile.Allocation.Money;
        } else {
            $('#recommend-mode').hide();
            $('#advanced-mode').show();
        }

        updateAllocationDisplay();
        updatePreview();
    }

    // Update allocation
    function updateAllocation(assetClass, value) {
        currentAllocation[assetClass] = parseInt(value);
        updateAllocationDisplay();
        updatePreview();
    }

    function updateAllocationDisplay() {
        $('#equity-value').text(currentAllocation.equity + '%');
        $('#mixed-value').text(currentAllocation.mixed + '%');
        $('#fixed-value').text(currentAllocation.fixed + '%');
        $('#money-value').text(currentAllocation.money + '%');

        const total = Object.values(currentAllocation).reduce((a, b) => a + b, 0);
        $('#total-value').text(total + '%');

        $('#total-allocation').removeClass('valid invalid');
        if (total === 100) {
            $('#total-allocation').addClass('valid');
        } else {
            $('#total-allocation').addClass('invalid');
        }
    }

    // Update preview
    function updatePreview() {
        const profile = riskProfiles[selectedRisk];

        // Update badge
        $('#risk-badge').text(profile.Name).removeClass().addClass('risk-badge ' + profile.Badge);

        // Calculate expected return
        const expectedReturn = (
            currentAllocation.equity * 15 +
            currentAllocation.mixed * 12 +
            currentAllocation.fixed * 8 +
            currentAllocation.money * 5
        ) / 100;

        // Update metrics
        $('#preview-amount').text('฿' + formatMoney(investmentAmount));
        $('#preview-return').text(expectedReturn.toFixed(2) + '%');
        $('#preview-time').text(timeHorizon + ' Years');

        const projectedValue = investmentAmount * Math.pow(1 + expectedReturn / 100, timeHorizon);
        $('#preview-projected').text('฿' + formatMoney(projectedValue));

        // Update order summary
        $('#summary-amount').text('฿' + formatMoney(investmentAmount));
        $('#summary-total').text('฿' + formatMoney(investmentAmount));

        // Update chart
        updateChart();

        // Update order list
        updateOrderList();
    }

    // Update chart
    function updateChart() {
        const ctx = $('#allocation-chart')[0].getContext('2d');

        if (allocationChart) {
            allocationChart.destroy();
        }

        allocationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Equity', 'Mixed', 'Fixed Income', 'Money Market'],
                datasets: [{
                    data: [
                        currentAllocation.equity,
                        currentAllocation.mixed,
                        currentAllocation.fixed,
                        currentAllocation.money
                    ],
                    backgroundColor: ['#f44336', '#ff9800', '#4caf50', '#2196f3'],
                    borderWidth: 3,
                    borderColor: '#1e222d'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#d1d4dc',
                            font: { size: 13 },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const amount = (investmentAmount * value / 100);
                                return label + ': ' + value + '% (฿' + formatMoney(amount) + ')';
                            }
                        }
                    }
                }
            }
        });
    }

    // Update order list
    function updateOrderList() {
        let html = '';
        let totalFunds = 0;

        $.each(currentAllocation, function (assetClass, percent) {
            if (percent > 0) {
                const info = assetClassInfo[assetClass];
                const classAmount = investmentAmount * percent / 100;
                const funds = fundDatabase[assetClass];

                // Determine number of funds
                let numFunds = 1;
                if (percent >= 40) numFunds = 3;
                else if (percent >= 25) numFunds = 2;
                else if (percent >= 15) numFunds = 2;

                const sortedFunds = [...funds].sort((a, b) => b.Score - a.Score);
                const selectedFunds = sortedFunds.slice(0, Math.min(numFunds, funds.length));
                const amountPerFund = classAmount / selectedFunds.length;

                html += `
                    <div class="allocation-group">
                        <div class="allocation-group-header ${assetClass}">
                            <div class="allocation-group-title">
                                <span>${info.icon}</span>
                                <span>${info.name} (${percent}%)</span>
                            </div>
                            <div class="allocation-group-amount">฿${formatMoney(classAmount)}</div>
                        </div>
                `;

                $.each(selectedFunds, function (index, fund) {
                    html += `
                        <div class="fund-order-item">
                            <div class="fund-order-header">
                                <div class="fund-code">${fund.Code}</div>
                                <div class="fund-amount">฿${formatMoney(amountPerFund)}</div>
                            </div>
                            <div class="fund-name">${fund.Name}</div>
                            <div class="fund-stats">
                                <div class="fund-stat">
                                    <span class="fund-stat-label">Return</span>
                                    <span class="fund-stat-value">${fund.Return}%</span>
                                </div>
                                <div class="fund-stat">
                                    <span class="fund-stat-label">Risk</span>
                                    <span class="fund-stat-value">${fund.Risk}</span>
                                </div>
                                <div class="fund-stat">
                                    <span class="fund-stat-label">Score</span>
                                    <span class="fund-stat-value">${fund.Score}</span>
                                </div>
                            </div>
                        </div>
                    `;
                    totalFunds++;
                });

                html += '</div>';
            }
        });

        $('#order-list').html(html);
        $('#summary-funds').text(totalFunds + ' Funds');
    }

    // Submit order
    function submitOrder() {
        const orderData = {
            investmentAmount: investmentAmount,
            timeHorizon: timeHorizon,
            riskProfile: selectedRisk,
            allocation: currentAllocation,
            funds: []
        };

        // Collect fund orders
        $.each(currentAllocation, function (assetClass, percent) {
            if (percent > 0) {
                const classAmount = investmentAmount * percent / 100;
                const funds = fundDatabase[assetClass];

                let numFunds = 1;
                if (percent >= 40) numFunds = 3;
                else if (percent >= 25) numFunds = 2;
                else if (percent >= 15) numFunds = 2;

                const sortedFunds = [...funds].sort((a, b) => b.Score - a.Score);
                const selectedFunds = sortedFunds.slice(0, Math.min(numFunds, funds.length));
                const amountPerFund = classAmount / selectedFunds.length;

                $.each(selectedFunds, function (index, fund) {
                    orderData.funds.push({
                        code: fund.Code,
                        name: fund.Name,
                        amount: amountPerFund,
                        assetClass: assetClass
                    });
                });
            }
        });

        console.log('Order Submitted:', orderData);

        alert(`✅ Order Submitted Successfully!\n\n` +
            `Investment Amount: ฿${formatMoney(investmentAmount)}\n` +
            `Number of Funds: ${orderData.funds.length}\n` +
            `Risk Profile: ${riskProfiles[selectedRisk].Name}\n\n` +
            `คำสั่งซื้อของคุณได้ถูกส่งเรียบร้อยแล้ว`);
    }

    // Event listeners
    $('.step-indicator').on('click', function () {
        const step = $(this).data('step');
        goToStep(step);
    });

    $('.btn-next').on('click', function () {
        nextStep();
    });

    $('.btn-prev').on('click', function () {
        prevStep();
    });

    $('.risk-option').on('click', function () {
        const risk = $(this).data('risk');
        selectRisk(risk);
    });

    $('.mode-btn').on('click', function () {
        const mode = $(this).data('mode');
        setMode(mode);
    });

    $('#investment-amount').on('input', function () {
        investmentAmount = parseFloat($(this).val());
        updatePreview();
    });

    $('#time-horizon').on('input', function () {
        timeHorizon = parseInt($(this).val());
        $('#time-value').text(timeHorizon);
        updatePreview();
    });

    $('.allocation-slider').on('input', function () {
        const assetClass = $(this).data('asset');
        const value = $(this).val();
        updateAllocation(assetClass, value);
    });

    $('#btn-submit').on('click', function () {
        submitOrder();
    });

    // Initialize
    updatePreview();
});