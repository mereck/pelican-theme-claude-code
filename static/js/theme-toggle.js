(function () {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    function getTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        reRenderMermaid(theme, null);
    }

    function reRenderMermaid(theme, siteTheme) {
        if (typeof window.mermaid === 'undefined') return;

        var diagrams = document.querySelectorAll('.mermaid[data-mermaid-source]');
        if (diagrams.length === 0) return;

        var darkVars = {
            primaryColor: '#2e2f3a',
            primaryBorderColor: '#d97757',
            primaryTextColor: '#d4d4d8',
            lineColor: '#d97757',
            secondaryColor: '#282935',
            tertiaryColor: '#1a1b23',
            noteBkgColor: '#2e2f3a',
            noteBorderColor: '#d97757',
            actorBkg: '#2e2f3a',
            actorBorder: '#d97757',
            actorTextColor: '#d4d4d8',
            activationBkgColor: '#3f3f46',
            activationBorderColor: '#d97757',
            signalColor: '#d97757',
            labelBoxBkgColor: '#2e2f3a',
            labelBoxBorderColor: '#d97757'
        };

        var lightVars = {
            primaryColor: '#fef3c7',
            primaryBorderColor: '#c2410c',
            primaryTextColor: '#1c1917',
            lineColor: '#c2410c',
            secondaryColor: '#f5f5f4',
            tertiaryColor: '#ffffff',
            noteBkgColor: '#fef3c7',
            noteBorderColor: '#c2410c',
            actorBkg: '#fef3c7',
            actorBorder: '#c2410c',
            actorTextColor: '#1c1917',
            activationBkgColor: '#e7e5e4',
            activationBorderColor: '#c2410c',
            signalColor: '#c2410c',
            labelBoxBkgColor: '#fef3c7',
            labelBoxBorderColor: '#c2410c'
        };

        var ninetyVars = {
            primaryColor: '#e0f0f0',
            primaryBorderColor: '#008080',
            primaryTextColor: '#000000',
            lineColor: '#008080',
            secondaryColor: '#f5f5f5',
            tertiaryColor: '#ffffff',
            noteBkgColor: '#e0f0f0',
            noteBorderColor: '#008080',
            actorBkg: '#e0f0f0',
            actorBorder: '#008080',
            actorTextColor: '#000000',
            activationBkgColor: '#c0c0c0',
            activationBorderColor: '#008080',
            signalColor: '#008080',
            labelBoxBkgColor: '#e0f0f0',
            labelBoxBorderColor: '#008080'
        };

        if (!siteTheme) siteTheme = localStorage.getItem('site-theme') || 'cc';
        var vars = siteTheme === '90s' ? ninetyVars : (theme === 'dark' ? darkVars : lightVars);

        diagrams.forEach(function (el) {
            el.removeAttribute('data-processed');
            el.innerHTML = el.getAttribute('data-mermaid-source');
        });

        window.mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: vars
        });

        window.mermaid.run();
    }

    toggle.addEventListener('click', function () {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });

    // --- Site theme picker (CC ↔ 90s) ---
    var picker = document.getElementById('theme-picker');
    if (picker) {
        var pickerLabel = picker.querySelector('.picker-label');

        function getSiteTheme() {
            return localStorage.getItem('site-theme') || 'cc';
        }

        function applySiteTheme(st) {
            var ccCss = document.getElementById('css-cc');
            var ccPyg = document.getElementById('css-cc-pygments');
            var nineCss = document.getElementById('css-90s');
            var ninePyg = document.getElementById('css-90s-pygments');

            if (st === '90s') {
                ccCss.disabled = true;
                ccPyg.disabled = true;
                nineCss.disabled = false;
                ninePyg.disabled = false;
                if (pickerLabel) pickerLabel.textContent = 'CC';
            } else {
                ccCss.disabled = false;
                ccPyg.disabled = false;
                nineCss.disabled = true;
                ninePyg.disabled = true;
                if (pickerLabel) pickerLabel.textContent = '90s';
            }

            document.documentElement.setAttribute('data-site-theme', st);
            localStorage.setItem('site-theme', st);
            reRenderMermaid(getTheme(), st);
        }

        // Apply on load
        applySiteTheme(getSiteTheme());

        picker.addEventListener('click', function () {
            applySiteTheme(getSiteTheme() === 'cc' ? '90s' : 'cc');
        });
    }

    // Listen for OS preference changes
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', function (e) {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    // --- Typewriter animation ---
    document.querySelectorAll('.typewriter').forEach(function (el) {
        var text = el.textContent;
        el.textContent = '';
        var cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        cursor.textContent = '\u2588';
        el.appendChild(cursor);

        var i = 0;
        var delay = Math.max(12, Math.floor(600 / text.length));
        var interval = setInterval(function () {
            cursor.before(text[i]);
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                cursor.classList.add('fade');
            }
        }, delay);
    });

    // --- Random action verbs (topic-aware) ---
    var tagVerbs = {
        'threading':    ['Synchronizing', 'Signaling', 'Joining', 'Scheduling', 'Dispatching'],
        'concurrency':  ['Synchronizing', 'Signaling', 'Joining', 'Scheduling', 'Dispatching'],
        'property-based testing': ['Shrinking', 'Generating', 'Fuzzing', 'Asserting', 'Sampling'],
        'claude code':  ['Verifying', 'Reviewing', 'Auditing', 'Evaluating', 'Inspecting'],
        'n-tier architecture':    ['Refactoring', 'Layering', 'Decoupling', 'Extracting', 'Separating'],
        'monolithic architecture': ['Refactoring', 'Layering', 'Decoupling', 'Extracting', 'Separating'],
        'python':       ['Importing', 'Yielding', 'Iterating', 'Unpacking', 'Interpreting']
    };
    var fallbackVerbs = ['Loading', 'Fetching', 'Resolving', 'Rendering', 'Reading'];

    document.querySelectorAll('.action-verb').forEach(function (el) {
        var tags = (el.getAttribute('data-tags') || '').toLowerCase().split(',').map(function (t) { return t.trim(); });
        var pool = [];
        tags.forEach(function (tag) {
            if (tagVerbs[tag]) pool = pool.concat(tagVerbs[tag]);
        });
        if (pool.length === 0) pool = fallbackVerbs;
        el.textContent = pool[Math.floor(Math.random() * pool.length)];
    });

    // --- External links: nofollow + new tab ---
    var host = window.location.hostname;
    document.querySelectorAll('a[href]').forEach(function (a) {
        try {
            var url = new URL(a.href, window.location.origin);
            if (url.hostname && url.hostname !== host) {
                a.setAttribute('target', '_blank');
                var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
                ['nofollow', 'noopener', 'noreferrer'].forEach(function (v) {
                    if (rel.indexOf(v) === -1) rel.push(v);
                });
                a.setAttribute('rel', rel.join(' '));
            }
        } catch (e) {}
    });
})();
