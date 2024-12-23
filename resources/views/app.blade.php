<!DOCTYPE html>
<html class="h-100">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @viteReactRefresh
    @vite([
        'resources/sass/app.scss',
        'resources/js/app.jsx',
        ])
    <!--favicon-->
    <link rel="shortcut icon" href="/images/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
</head>
<body class="d-flex flex-column h-100">
    <!--Navigation bar-->
    <nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top py-2 px-3">
        <a class="navbar-brand" href="/">Flask Damco</a>
    </nav>
    <!--Main Content -->
    <div class="flex-shrink-0">
        <div id="root"></div>
    </div>
    <footer class="footer mt-auto py-3">
        <div>   
            <img src="/images/github_logo_32px.png" alt="GitHub logo" width="24px" \="">
            <a href="https://github.com/francistalbot/flask_damco"
            class=" link-underline link-underline-opacity-0 link-underline-opacity-75-hover">
                <span class="text-muted">Flask Damco on GitHub</span>
            </a>
        </div>
    </footer>
</body>
</html>