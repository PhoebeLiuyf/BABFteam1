// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Global variable to store CSV data
    let retrofitData = [];
    
    // Load CSV data from GitHub
    async function loadRetrofitData() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/PhoebeLiuyf/BABF/main/PHPP_Retrofit_Simulation_Table_with_key.csv');
            const csvText = await response.text();
            retrofitData = parseCSV(csvText);
            console.log('Retrofit data loaded:', retrofitData.length, 'rows');
            updateExplorerCards();
        } catch (error) {
            console.error('Error loading retrofit data:', error);
        }
    }
    
    // Parse CSV text to array of objects
    function parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                data.push(row);
            }
        }
        return data;
    }
    
    // Update explorer cards with toggle functionality
    function updateExplorerCards() {
        // 先解绑所有change事件
        const toggles = document.querySelectorAll('.toggle-item input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.removeEventListener('change', updateStrategyData);
        });
        // 再绑定
        toggles.forEach(toggle => {
            toggle.addEventListener('change', updateStrategyData);
        });
    }
    
    // Update strategy data based on selected measures
    function updateStrategyData() {
        let selectedMeasures = [];
        const toggles = document.querySelectorAll('.toggle-item input[type="checkbox"]:checked');
        toggles.forEach(toggle => {
            selectedMeasures.push(toggle.getAttribute('data-measure'));
        });
        // 去重
        selectedMeasures = [...new Set(selectedMeasures)];
        console.log('Selected measures:', selectedMeasures);
        const strategyDataDiv = document.getElementById('strategy-data');
        
        if (selectedMeasures.length === 0) {
            displayDefaultData(strategyDataDiv);
            return;
        }
        
        // Find matching strategy in CSV data
        const matchingStrategy = findMatchingStrategy(selectedMeasures);
        console.log('Matching strategy:', matchingStrategy);
        
        if (matchingStrategy) {
            displayStrategyData(matchingStrategy, strategyDataDiv);
        } else {
            strategyDataDiv.innerHTML = '<p>No data available for selected combination</p>';
        }
    }
    
    // Find strategy that matches selected measures
    function findMatchingStrategy(selectedMeasures) {
        if (retrofitData.length === 0) {
            console.log('retrofitData is empty!');
            return null;
        }
        const sortedMeasures = selectedMeasures.sort();
        const key = sortedMeasures.join(' + ');
        console.log('Looking for key:', key);
        console.log('All keys:', retrofitData.map(row => row.key));
        return retrofitData.find(row => row.key === key);
    }
    
    // Display strategy data in table format
    function displayStrategyData(strategy, container) {
        function formatValue(val, isMoney = false) {
            if (val === undefined || val === null || val === "") return "-";
            if (typeof val === "string" && val.includes(",")) val = val.replace(/,/g, "");
            let num = Number(val);
            if (isNaN(num)) return val;
            return isMoney ? num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : num.toFixed(2);
        }
        const metrics = [
            { label: 'Annual Energy Consumption (kWh)', value: formatValue(strategy['Annual Energy Consumption (kWh)'], true) },
            { label: 'Total Annual Energy Saving (kWh)', value: formatValue(strategy['Total Annual Energy Saving (kWh)'], true) },
            { label: 'Energy Saving (%)', value: formatValue(strategy['Energy Saving (%)']) + '%' },
            { label: 'ECM Cost (£)', value: '£' + formatValue(strategy['ECM Cost (£)'], true) },
            { label: 'Total Annual Energy Cost Saving (£)', value: '£' + formatValue(strategy['Total Annual Energy Cost Saving (£)'], true) },
            { label: 'Payback (Years)', value: formatValue(strategy['Payback (Years)']) }
        ];
        
        let html = '<table>';
        metrics.forEach(metric => {
            html += `
                <tr>
                    <td class="label">${metric.label}</td>
                    <td class="value">${metric.value}</td>
                </tr>
            `;
        });
        html += '</table>';
        
        container.innerHTML = html;
    }
    
    // Display default "none" data
    function displayDefaultData(container) {
        let baseline = '523,894.00';
        const defaultMetrics = [
            { label: 'Annual Energy Consumption (kWh)', value: baseline },
            { label: 'Total Annual Energy Saving (kWh)', value: '-' },
            { label: 'Energy Saving (%)', value: '-' },
            { label: 'ECM Cost (£)', value: '-' },
            { label: 'Total Annual Energy Cost Saving (£)', value: '-' },
            { label: 'Payback (Years)', value: '-' }
        ];
        
        let html = '<table>';
        defaultMetrics.forEach(metric => {
            html += `
                <tr>
                    <td class="label">${metric.label}</td>
                    <td class="value">${metric.value}</td>
                </tr>
            `;
        });
        html += '</table>';
        
        container.innerHTML = html;
    }

    // Load data when page loads
    loadRetrofitData();

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation to feature cards on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        observer.observe(card);
    });

    // Add hover effect to feature cards
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });

    // Add parallax effect to hero section
    const hero = document.querySelector('.hero');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
    });

    // Building selector info display
    const buildingSelect = document.getElementById('building-select');
    const buildingInfo = document.getElementById('building-info');
    const buildingImage = document.getElementById('building-image');
    const heroContent = document.querySelector('.hero-content');
    const heroText = document.getElementById('hero-text');
    const heroInfo = document.getElementById('hero-info');
    const heroInfoLeft = document.getElementById('hero-info-left');
    const heroDesc = document.getElementById('hero-desc');
    if (buildingSelect && buildingInfo && buildingImage && heroContent && heroText && heroInfo && heroInfoLeft && heroDesc) {
        buildingSelect.addEventListener('change', function() {
            if (this.value === 'student-center' || this.value === 'ioe') {
                buildingInfo.textContent = '';
                buildingImage.style.display = 'none';
                heroContent.classList.add('only-image');
                heroContent.classList.remove('only-text');
                heroText.style.display = 'none';
                heroInfo.style.display = 'none';
                heroInfoLeft.style.display = 'none';
                heroDesc.style.display = 'none';
                alert('No information available');
            } else if (this.value === 'dr-williams-library') {
                buildingInfo.textContent = '';
                buildingImage.style.display = 'block';
                heroContent.classList.add('only-image');
                heroContent.classList.remove('only-text');
                heroText.style.display = 'none';
                heroInfo.style.display = 'flex';
                heroInfoLeft.style.display = 'flex';
                heroDesc.style.display = 'block';
            } else {
                buildingInfo.textContent = '';
                buildingImage.style.display = 'none';
                heroContent.classList.remove('only-image');
                heroContent.classList.add('only-text');
                heroText.style.display = 'block';
                heroInfo.style.display = 'none';
                heroInfoLeft.style.display = 'none';
                heroDesc.style.display = 'none';
            }
        });
    }
    if (heroContent && heroText && heroInfo && heroInfoLeft && heroDesc && buildingSelect.value === "") {
        heroContent.classList.add('only-text');
        heroText.style.display = 'block';
        heroInfo.style.display = 'none';
        heroInfoLeft.style.display = 'none';
        heroDesc.style.display = 'none';
    }

    document.getElementById('retrofit-mode-select').addEventListener('change', function() {
        const explorerCards = document.querySelector('.feature-cards-explorer');
        const compareCards = document.querySelector('.feature-cards-compare');
        const compareBtn = document.getElementById('compare-run-btn');
        
        if (this.value === 'compare') {
            explorerCards.style.display = 'none';
            compareCards.style.display = 'grid';
            compareBtn.style.display = 'inline-block';
            // 切换到compare时，重置explore的Strategy Performance为默认，并取消所有勾选和解绑事件
            const strategyDataDiv = document.getElementById('strategy-data');
            if (strategyDataDiv && typeof displayDefaultData === 'function') {
                displayDefaultData(strategyDataDiv);
            }
            // 取消所有explore卡片的toggle勾选并解绑事件
            const toggles = document.querySelectorAll('.feature-cards-explorer .toggle-item input[type="checkbox"]');
            toggles.forEach(cb => {
                cb.checked = false;
                cb.removeEventListener('change', updateStrategyData);
            });
        } else {
            explorerCards.style.display = 'grid';
            compareCards.style.display = 'none';
            compareBtn.style.display = 'none';
            // 每次切换回Tool Explorer时，强制重置Strategy Performance为默认none data
            const strategyDataDiv = document.getElementById('strategy-data');
            if (strategyDataDiv && typeof displayDefaultData === 'function') {
                displayDefaultData(strategyDataDiv);
            }
            // 取消所有explore卡片的toggle勾选
            document.querySelectorAll('.feature-cards-explorer .toggle-item input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            // 重新绑定toggle事件
            if (typeof updateExplorerCards === 'function') {
                updateExplorerCards();
            }
        }
    });

    // Render TOP 5 bar charts
    function renderTop5Charts() {
        if (!retrofitData || retrofitData.length === 0) return;
        // Helper to get top 5, filter out 'none' key
        function getTop5(arr, key, asc = false) {
            return arr
                .filter(row => row[key] && !isNaN(row[key]) && row.key && row.key.toLowerCase() !== 'none')
                .sort((a, b) => asc ? (parseFloat(a[key]) - parseFloat(b[key])) : (parseFloat(b[key]) - parseFloat(a[key])))
                .slice(0, 5);
        }
        // 1. Energy Saving Top 5
        const topEnergy = getTop5(retrofitData, 'Total Annual Energy Saving (kWh)');
        // 2. ECM Cost Lowest 5
        const lowCost = getTop5(retrofitData, 'ECM Cost (£)', true);
        // 3. Payback Shortest 5
        const shortPayback = getTop5(retrofitData, 'Payback (Years)', true);

        // Chart rendering helper
        function renderBarChart(canvasId, dataArr, valueKey, labelKey, color) {
            const ctx = document.getElementById(canvasId).getContext('2d');
            if (window[canvasId + '_chart']) window[canvasId + '_chart'].destroy();

            // 只保留有效数值
            const filtered = dataArr.filter(row => Number.isFinite(Number(row[valueKey])));

            window[canvasId + '_chart'] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: filtered.map(row => ''), // 不显示x轴label
                    datasets: [{
                        data: filtered.map(row => Number(row[valueKey])),
                        backgroundColor: color,
                        borderRadius: 0, // 顶部平
                        maxBarThickness: 28,
                        barPercentage: 0.6,
                        categoryPercentage: 0.6,
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    const idx = context.dataIndex;
                                    const row = filtered[idx];
                                    let val = row && row[valueKey] !== undefined ? Number(row[valueKey]).toLocaleString(undefined, {maximumFractionDigits: 2}) : '-';
                                    return val;
                                },
                                afterLabel: function(context) {
                                    const idx = context.dataIndex;
                                    const row = filtered[idx];
                                    if (row && row.key) {
                                        // 按"+"分割，每个retrofit measure单独一行
                                        return ['Retrofit:'].concat(row.key.split(' + '));
                                    }
                                    return '';
                                }
                            },
                            bodyFont: { size: 9 },
                            titleFont: { size: 9 }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { 
                                font: { size: 8 },
                                maxRotation: 45,
                                minRotation: 45,
                                autoSkip: false
                            },
                            grid: { display: false }
                        },
                        y: {
                            ticks: { font: { size: 8 } },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
        renderBarChart('chart-energy-saving', topEnergy, 'Total Annual Energy Saving (kWh)', 'Total Annual Energy Saving (kWh)', '#c6d300');
        renderBarChart('chart-ecm-cost', lowCost, 'ECM Cost (£)', 'ECM Cost (£)', '#2c3e50');
        renderBarChart('chart-payback', shortPayback, 'Payback (Years)', 'Payback (Years)', '#b0be00');
    }

    // --- Compare Mode Logic ---
    function getCompareKey(toggleContainerId) {
        const toggles = document.querySelectorAll(`#${toggleContainerId} input[type='checkbox']:checked`);
        const selected = Array.from(toggles).map(t => t.getAttribute('data-measure')).sort();
        return selected.join(' + ');
    }

    function getCompareData(key) {
        if (!key) key = '';
        if (key === '') key = 'none';
        return retrofitData.find(row => row.key === key);
    }

    function renderCompareCharts(data1, data2, baseline) {
        // Helper for each chart
        function makeChart(canvasId, labels, values, keys, colorArr) {
            const ctx = document.getElementById(canvasId).getContext('2d');
            if (window[canvasId + '_chart']) window[canvasId + '_chart'].destroy();
            window[canvasId + '_chart'] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colorArr,
                        borderRadius: 0,
                        maxBarThickness: 16,
                        barPercentage: 0.4,
                        categoryPercentage: 0.8,
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return context.parsed.y !== undefined ? context.parsed.y : context.parsed.x;
                                },
                                afterLabel: function(context) {
                                    const idx = context.dataIndex;
                                    return keys[idx] ? ['Retrofit:'].concat(keys[idx].split(' + ')) : '';
                                }
                            },
                            bodyFont: { size: 9 },
                            titleFont: { size: 9 }
                        }
                    },
                    scales: {
                        x: { 
                            ticks: { 
                                font: { size: 8 },
                                maxRotation: 45,
                                minRotation: 45,
                                autoSkip: false
                            },
                            grid: { display: false }
                        },
                        y: { ticks: { font: { size: 8 } }, grid: { display: false } }
                    }
                }
            });
        }
        // Annual Energy Consumption (kWh) - baseline, Strategy 1, Strategy 2
        makeChart('compare-chart-energy', ['Baseline', 'Strategy 1', 'Strategy 2'], [baseline['Annual Energy Consumption (kWh)'], data1['Annual Energy Consumption (kWh)'], data2['Annual Energy Consumption (kWh)']], [baseline.key, data1.key, data2.key], ['#aaa', '#c6d300', '#2c3e50']);
        // Energy Saving (%)
        makeChart('compare-chart-saving', ['Strategy 1', 'Strategy 2'], [data1['Energy Saving (%)'], data2['Energy Saving (%)']], [data1.key, data2.key], ['#c6d300', '#2c3e50']);
        // ECM Cost (£)
        makeChart('compare-chart-cost', ['Strategy 1', 'Strategy 2'], [data1['ECM Cost (£)'], data2['ECM Cost (£)']], [data1.key, data2.key], ['#c6d300', '#2c3e50']);
        // Payback (Years)
        makeChart('compare-chart-payback', ['Strategy 1', 'Strategy 2'], [data1['Payback (Years)'], data2['Payback (Years)']], [data1.key, data2.key], ['#c6d300', '#2c3e50']);
    }

    // Add event listener for Compare button
    setTimeout(() => {
        const btn = document.getElementById('compare-run-btn');
        if (btn) {
            btn.onclick = function() {
                const key1 = getCompareKey('compare-toggle1');
                const key2 = getCompareKey('compare-toggle2');
                const data1 = getCompareData(key1) || { 'Annual Energy Consumption (kWh)': 0, 'Energy Saving (%)': 0, 'ECM Cost (£)': 0, 'Payback (Years)': 0, key: key1 };
                const data2 = getCompareData(key2) || { 'Annual Energy Consumption (kWh)': 0, 'Energy Saving (%)': 0, 'ECM Cost (£)': 0, 'Payback (Years)': 0, key: key2 };
                const baseline = { 'Annual Energy Consumption (kWh)': 523894, key: 'none' };
                renderCompareCharts(data1, data2, baseline);
            };
        }
    }, 500);

    // 新增：显示空表格
    function displayEmptyData(container) {
        const emptyMetrics = [
            { label: 'Annual Energy Consumption (kWh)', value: '-' },
            { label: 'Total Annual Energy Saving (kWh)', value: '-' },
            { label: 'Energy Saving (%)', value: '-' },
            { label: 'ECM Cost (£)', value: '-' },
            { label: 'Total Annual Energy Cost Saving (£)', value: '-' },
            { label: 'Payback (Years)', value: '-' }
        ];
        let html = '<table>';
        emptyMetrics.forEach(metric => {
            html += `
                <tr>
                    <td class="label">${metric.label}</td>
                    <td class="value">${metric.value}</td>
                </tr>
            `;
        });
        html += '</table>';
        container.innerHTML = html;
    }

    // 清空TOP 5统计图canvas
    function clearTop5Charts() {
        ['chart-energy-saving', 'chart-ecm-cost', 'chart-payback'].forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas && canvas.getContext) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
    }

    // 页面初始时显示空表格和空TOP 5
    const strategyDataDiv = document.getElementById('strategy-data');
    if (strategyDataDiv && typeof displayEmptyData === 'function') {
        displayEmptyData(strategyDataDiv);
    }
    clearTop5Charts();

    // building-select切换时控制表格和TOP 5
    if (buildingSelect) {
        buildingSelect.addEventListener('change', function() {
            const strategyDataDiv = document.getElementById('strategy-data');
            if (this.value === 'dr-williams-library') {
                // 选择library，显示none数据和TOP 5
                if (strategyDataDiv && typeof displayDefaultData === 'function') {
                    displayDefaultData(strategyDataDiv);
                }
                if (typeof renderTop5Charts === 'function') {
                    renderTop5Charts();
                }
            } else {
                // 未选择或选其他，显示空表格和清空TOP 5
                if (strategyDataDiv && typeof displayEmptyData === 'function') {
                    displayEmptyData(strategyDataDiv);
                }
                clearTop5Charts();
            }
        });
    }
}); 