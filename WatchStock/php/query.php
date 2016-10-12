<?php
	//Script to query WatchStock stock items from DB
  //Written by: Benjamin Stout | 2016-05-12

  // Get query term
  $term = $_GET['query'];
  // Get query type [search/quote/history]
  $type = $_GET['type'];

  // Check for empty parameters
  if(!empty($term) && !empty($type)){

    // Intialize empty json array
    $json = array();

    // -----CONNECT TO DB-----
    //include DB constants
    include __DIR__ . '/db_core.php';
    //open connection to DB
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    // Return connection error
    if ($mysqli->connect_errno) {
      // PROD
      $json['error'] = $mysqli->connect_errno;
      // DEBUGGING
      //$json['error'] = $mysqli->connect_error;
      exit(json_encode($json));
    }

    // -----BUILD QUERY-----
    if($type == 'search')
      $query = "SELECT symName AS `name`,
                      symSymbol AS `symbol`
                FROM symbols
                WHERE symName LIKE '%{$term}%' OR symSymbol LIKE '%{$term}%'
                ORDER BY symName";
    else if($type == 'history')
      $query ="SELECT symSymbol AS `symbol`,
                      symName AS `name`,
                      qQuoteDateTime AS `date`,
                      qLastSalePrice AS `last`,
                      qNetChangePrice AS `chng`,
                      qNetChangePct AS `pctchng`,
                      qShareVolumeQty AS `vol`
              FROM symbols
              LEFT OUTER JOIN quotes ON symSymbol=qSymbol
              WHERE qSymbol='{$term}'
              ORDER BY qQuoteDateTime DESC";
    else if($type == 'quote')
      $query = "SELECT symSymbol AS `symbol`,
                        symName AS `name`,
                        qQuoteDateTime AS `date`,
                        qLastSalePrice AS `last`,
                        qAskPrice  AS `ask`,
                        qBidPrice  AS `bid`,
                        q52WeekLow AS `yrlow`,
                        q52WeekHigh AS `yrhigh`,
                        qTodaysLow AS `low`,
                        qTodaysHigh AS `high`,
                        qNetChangePrice AS `chng`,
                        qNetChangePct AS `pctchng`,
                        qShareVolumeQty AS `vol`,
                        qPreviousClosePrice AS `preclose`,
                        qCurrentPERatio AS `pe`,
                        qEarningsPerShare AS `eshare`,
                        qCashDividendAmount AS `dshare`,
                        qCurrentYieldPct AS `yield`,
                        qTotalOutstandingSharesQty AS `shares`,
                        ROUND(qTotalOutstandingSharesQty*qPreviousClosePrice) AS `cap`
                FROM symbols
                LEFT OUTER JOIN quotes ON symSymbol=qSymbol
                WHERE symSymbol='{$term}'
                ORDER BY qQuoteDateTime DESC
                LIMIT 1";


    // -----QUERY DB-----
    if ($result = $mysqli->query($query)){

      // Parse response and build JSON
      $json['data'] = array();

      while ($row = $result->fetch_object()) {
        array_push($json['data'], $row);
      }

      // Free result set
      $result->close();
    }
    else{
      $json['error'] = $mysqli->error;
    }
    // Close mysqli connection
    $mysqli->close();
  }
  else{
    $json['error'] = 'Invalid request type. Check AJAX parameters.';
  }
  exit(json_encode($json));
?>
