<?php
  ob_start();

  // Specify no-caching header controls for page
  header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); // Date in the past
  header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT"); // always modified
  header("Cache-Control: no-store, no-cache, must-revalidate"); // HTTP/1.1
  header("Cache-Control: post-check=0, pre-check=0", false);
  header("Pragma: no-cache"); // HTTP/1.0
?>

<head>
  <meta charset='utf-8'>
  <title>WatchStock</title>
  <link rel='icon' type='image/png' href='img/favicon-32x32.png' sizes='32x32'>
  <link rel='icon' type='image/png' href='img/favicon-96x96.png' sizes='96x96'>
  <link rel='icon' type='image/png' href='img/favicon-16x16.png' sizes='16x16'>
  <link rel='shortcut icon' type='image/x-icon' href='img/favicon.ico' />
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <link rel='stylesheet' type='text/css' href='css/normalize.css'>
  <link rel='stylesheet' type='text/css' href='css/fonts.css'>
  <link rel='stylesheet' type='text/css' href='css/WatchStock.css'>
</head>
<body class='body'>
  <div class='top-bar'>
    <div id='title' class='title'>WatchStock</div>
    <form id='searchForm' action='' method='get'>
      <input id='query' type='text' placeholder='GE, LNKD, Google...' class='search-field'>
    </form>
    <img id='qq' src='img/qq.png' class='quick-quote'>
    <span id="qq-tooltip" class="tooltip">QuickQuote</span>
  </div>
  <div id='startHere' class='start-here'>
    <img height='70' src='img/start-arrow.png' class='start-arrow'>
    <div class='start-text'>Start Here</div>
  </div>
  <div id='navMenu' class='nav-menu'>
    <div id='navTray' class='nav-tray'></div>
    <img id='navArrow' src='img/nav-arrow.png' class='nav-arrow'>
    <img id='navSearch' src='img/search.png' class='nav-search'>
    <img id='navExit' src='img/exit-white.png' class='nav-exit'>
    <img id='navHistory' src='img/history.png' class='nav-history'>
    <img id='navQuote' src='img/quote.png' class='nav-quote'>
    <div id='navButton' class='nav-button'>WS</div>
  </div>
  <div class='content'>
    <div id='home' class='container'>
      <h2>Welcome to WatchStock!</h2>
      <h4>A unique and simple way of keeping up to date with your investments</h4>
    </div>
    <div id='search' class='container'>
    </div>
    <div id='history' class='container'>
      <h2>History</h2>
      <h4>There's nothing here... yet. Try searching!</h4>
    </div>
    <div id='quote' class='container'>
      <h2>Quote</h2>
      <h4>There's nothing here... yet. Try searching!</h4>
    </div>
  </div>
  <script  type='text/javascript' src='js/jquery-2.2.3.min.js'></script>
  <script type='text/javascript' src='js/WatchStock.js'></script>
</body>
</html>

<?php ob_end_flush(); ?>
