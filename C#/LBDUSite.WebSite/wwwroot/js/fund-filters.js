/* ==================== Hero Section ==================== */
.fund - list - hero {
    background: linear - gradient(135deg, var(--primary) 0 %, var(--primary - dark) 100 %);
    padding: 80px 20px 60px;
    color: white;
    text - align: center;
}

.hero - container {
    max - width: 900px;
    margin: 0 auto;
}

.hero - title {
    font - size: 2.5rem;
    font - weight: 800;
    margin - bottom: 15px;
}

.hero - subtitle {
    font - size: 1.125rem;
    opacity: 0.95;
    margin - bottom: 40px;
}

/* Search Bar */
.search - bar - large {
    display: flex;
    align - items: center;
    background: white;
    border - radius: 50px;
    padding: 8px 8px 8px 25px;
    box - shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    max - width: 700px;
    margin: 0 auto;
}

.search - bar - large i {
    color: var(--gray - 400);
    font - size: 1.25rem;
    margin - right: 15px;
}

.search - bar - large input {
    flex: 1;
    border: none;
    outline: none;
    font - size: 1rem;
    color: var(--gray - 900);
}

.search - btn {
    background: var(--primary);
    color: white;
    border: none;
    padding: 12px 30px;
    border - radius: 50px;
    font - weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.search - btn:hover {
    background: var(--primary - dark);
}

/* ==================== Filter Section ==================== */
.fund - filters - section {
    background: white;
    padding: 20px 0;
    border - bottom: 1px solid var(--gray - 200);
    position: sticky;
    top: 70px;
    z - index: 100;
    box - shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filters - container {
    max - width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Quick Filter Chips - Horizontal Scroll */
.quick - filters {
    margin - bottom: 15px;
}

.filter - chips - scroll {
    display: flex;
    gap: 10px;
    overflow - x: auto;
    padding: 10px 0;
    scrollbar - width: none;
    -ms - overflow - style: none;
}

.filter - chips - scroll:: -webkit - scrollbar {
    display: none;
}

.filter - chip {
    display: inline - flex;
    align - items: center;
    gap: 6px;
    padding: 10px 20px;
    border: 2px solid var(--gray - 300);
    border - radius: 50px;
    background: white;
    color: var(--gray - 700);
    font - size: 0.875rem;
    font - weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white - space: nowrap;
    flex - shrink: 0;
}

.filter - chip:hover {
    border - color: var(--primary);
    color: var(--primary);
    transform: translateY(-2px);
}

.filter - chip.active {
    background: var(--primary);
    border - color: var(--primary);
    color: white;
}

.chip - featured {
    border - color: var(--success);
    color: var(--success);
}

.chip - featured.active {
    background: var(--success);
    color: white;
}

.chip - hot {
    border - color: #ef4444;
    color: #ef4444;
}

.chip - hot.active {
    background: #ef4444;
    color: white;
}

.chip - tax {
    border - color: #8b5cf6;
    color: #8b5cf6;
}

.chip - tax.active {
    background: #8b5cf6;
    color: white;
}

.chip - rating {
    border - color: #f59e0b;
    color: #f59e0b;
}

.chip - rating.active {
    background: #f59e0b;
    color: white;
}

/* Filter Bottom Row */
.filter - bottom - row {
    display: flex;
    align - items: center;
    gap: 20px;
    padding - top: 15px;
    border - top: 1px solid var(--gray - 200);
}

.sort - dropdown {
    display: flex;
    align - items: center;
    gap: 10px;
}

.sort - dropdown label {
    display: flex;
    align - items: center;
    gap: 6px;
    font - size: 0.875rem;
    font - weight: 600;
    color: var(--gray - 700);
    white - space: nowrap;
}

.select - modern {
    padding: 10px 35px 10px 15px;
    border: 2px solid var(--gray - 300);
    border - radius: 8px;
    background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no - repeat right 12px center;
    background - size: 12px;
    font - size: 0.875rem;
    font - weight: 600;
    color: var(--gray - 700);
    cursor: pointer;
    appearance: none;
    transition: all 0.3s ease;
    min - width: 200px;
}

.select - modern:hover {
    border - color: var(--primary);
}

.select - modern:focus {
    outline: none;
    border - color: var(--primary);
    box - shadow: 0 0 0 3px rgba(28, 165, 155, 0.1);
}

.btn - advanced - filter {
    display: inline - flex;
    align - items: center;
    gap: 8px;
    padding: 10px 20px;
    border: 2px solid var(--gray - 300);
    border - radius: 8px;
    background: white;
    color: var(--gray - 700);
    font - size: 0.875rem;
    font - weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin - left: auto;
}

.btn - advanced - filter:hover {
    border - color: var(--primary);
    color: var(--primary);
}

/* ==================== Fund Groups Section ==================== */
.fund - groups - section {
    background: var(--gray - 50);
    padding: 40px 0 60px;
}

.fund - groups - container {
    max - width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Individual Fund Group */
.fund - group {
    margin - bottom: 50px;
}

.group - header {
    display: flex;
    justify - content: space - between;
    align - items: center;
    margin - bottom: 20px;
}

.group - title {
    display: flex;
    align - items: center;
    gap: 12px;
}

.group - title i {
    font - size: 1.5rem;
    color: var(--primary);
}

.group - title h2 {
    font - size: 1.5rem;
    font - weight: 700;
    color: var(--gray - 900);
    margin: 0;
}

.group - count {
    padding: 4px 12px;
    background: var(--gray - 200);
    color: var(--gray - 700);
    border - radius: 12px;
    font - size: 0.875rem;
    font - weight: 600;
}

.group - count.badge - tax {
    background: #8b5cf6;
    color: white;
}

.view - all - link {
    display: flex;
    align - items: center;
    gap: 6px;
    color: var(--primary);
    text - decoration: none;
    font - weight: 600;
    font - size: 0.875rem;
    transition: all 0.3s ease;
}

.view - all - link:hover {
    color: var(--primary - dark);
    transform: translateX(5px);
}

/* Horizontal Scroll Container */
.fund - scroll - container {
    position: relative;
    margin: 0 - 20px;
    padding: 0 20px;
}

.fund - scroll {
    display: flex;
    gap: 20px;
    overflow - x: auto;
    scroll - behavior: smooth;
    padding: 10px 0 20px;
    scrollbar - width: thin;
    scrollbar - color: var(--primary) var(--gray - 200);
}

.fund - scroll:: -webkit - scrollbar {
    height: 8px;
}

.fund - scroll:: -webkit - scrollbar - track {
    background: var(--gray - 200);
    border - radius: 4px;
}

.fund - scroll:: -webkit - scrollbar - thumb {
    background: var(--primary);
    border - radius: 4px;
}

.fund - scroll:: -webkit - scrollbar - thumb:hover {
    background: var(--primary - dark);
}

/* ==================== Compact Fund Card ==================== */
.fund - card - compact {
    flex: 0 0 280px;
    background: white;
    border - radius: 12px;
    padding: 20px;
    box - shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    display: flex;
    flex - direction: column;
}

.fund - card - compact:hover {
    transform: translateY(-4px);
    box - shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.fund - badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 10px;
    border - radius: 12px;
    font - size: 0.75rem;
    font - weight: 700;
    display: flex;
    align - items: center;
    gap: 4px;
}

.badge - recommended {
    background: var(--success);
    color: white;
}

.badge - new {
    background: var(--primary);
color: white;
}

.badge - hot {
    background: #ef4444;
    color: white;
}

.badge - tax {
    background: #8b5cf6;
    color: white;
}

.badge - rating {
    background: #f59e0b;
    color: white;
}

.fund - compact - header {
    display: flex;
    justify - content: space - between;
    align - items: center;
    margin - bottom: 15px;
}

.fund - amc - logo {
    width: 40px;
    height: 40px;
    background: var(--primary);
    color: white;
    border - radius: 8px;
    display: flex;
    align - items: center;
    justify - content: center;
    font - weight: 700;
    font - size: 0.875rem;
}

.fund - type - label {
    padding: 4px 10px;
    border - radius: 12px;
    font - size: 0.75rem;
    font - weight: 600;
}

.fund - type - label.equity {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

.fund - type - label.fixed {
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
}

.fund - type - label.mixed {
    background: rgba(168, 85, 247, 0.1);
    color: #7c3aed;
}

.fund - compact - code {
    font - size: 1.125rem;
    font - weight: 700;
    color: var(--gray - 900);
    margin - bottom: 8px;
}

.fund - compact - name {
    font - size: 0.875rem;
    color: var(--gray - 600);
    line - height: 1.4;
    margin - bottom: 15px;
    display: -webkit - box;
    -webkit - line - clamp: 2;
    -webkit - box - orient: vertical;
    overflow: hidden;
    min - height: 38px;
}

.fund - compact - stats {
    display: flex;
    gap: 20px;
    padding: 12px 0;
    border - top: 1px solid var(--gray - 200);
    border - bottom: 1px solid var(--gray - 200);
    margin - bottom: 12px;
}

.stat {
    flex: 1;
    display: flex;
    flex - direction: column;
    gap: 4px;
}

.stat - label {
    font - size: 0.75rem;
    color: var(--gray - 500);
    text - transform: uppercase;
}

.stat - value {
    font - size: 1rem;
    font - weight: 700;
    color: var(--gray - 900);
}

.stat - value.positive {
    color: var(--success);
}

.stat - value.negative {
    color: var(--danger);
}

.stat - value - small {
    font - size: 0.875rem;
    font - weight: 600;
    color: var(--gray - 700);
}

.fund - compact - footer {
    display: flex;
    justify - content: space - between;
    align - items: center;
}

.risk - badge {
    font - size: 0.75rem;
    color: var(--gray - 600);
    display: flex;
    align - items: center;
    gap: 4px;
}

.fund - arrow {
    color: var(--primary);
    font - size: 0.875rem;
}

/* ==================== Responsive ==================== */
@media(max - width: 768px) {
    .hero - title {
        font - size: 1.75rem;
    }

    .filter - bottom - row {
        flex - direction: column;
        align - items: stretch;
    }

    .btn - advanced - filter {
        margin - left: 0;
    }

    .fund - card - compact {
        flex: 0 0 260px;
    }
}