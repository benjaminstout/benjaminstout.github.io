//Script to hold MySQL database credentials
//Written by: Benjamin Stout | 2016-05-12

// -----Variables-----
var nav = document.getElementById('navTray');
var img = $('#navArrow');
var offset = img.offset();
var curSection = '#home';
var curStock = '';
var curCompany = '';
var curHistory = '';
var curQuote = '';
var curSearch = '';
var searching = false;
var navHidden = true;

// -----Element Functions-----
function expandTray(){
  // Enable nav arrow tracking
  $(document).mousemove(rotate);
  $('#startHere').fadeOut();
  if(searching)
    $('#navArrow, #navExit, #navHistory, #navQuote').fadeIn();
  else
    $('#navArrow, #navSearch, #navHistory, #navQuote').fadeIn();
  $('#navTray').removeClass('closed');
  // Reset CSS animation on element
  nav.offsetWidth = nav.offsetWidth;
  $('#navTray').addClass('open');
  navHidden = false;
}

function hideTray(){
  // Disable nav arrow tracking
  $(document).off("mousemove", rotate);
  if(searching)
    $('#navArrow, #navExit, #navHistory, #navQuote').fadeOut(150);
  else
    $('#navArrow, #navSearch, #navHistory, #navQuote').fadeOut(150);
  $('#navTray').removeClass('open');
  // Reset CSS animation on element
  nav.offsetWidth = nav.offsetWidth;
  $('#navTray').addClass('closed');
  navHidden = true;
}

function showSection(elem){
  $('#home, #search, #history, #quote').fadeOut().promise().done(function(){
    $(elem).fadeIn();
  });
  curSection = elem;
}

//Evaluate if QuickQuote should be shown or not
function evalQQ(){
  length = $('#query').val().length
  if(length >= 1 && length <= 5){
    $('#qq').fadeTo(250, 0.5);
  }
  else{$('#qq').fadeTo(250, 0).promise().done(function(){$('#qq').hide();});}
}

function highlight(elem){
  $('#navExit, #navSearch, #navHistory, #navQuote').removeClass('highlighted');
  $(elem).addClass('highlighted');
}

// -----Formatting Functions-----
function formatNumber(num, isCurrency=false, isPercent=false){
    var parts=num.toString().split('.');
    return (isCurrency?'$':'') + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts[1]?'.'+parts[1]:'') + (isPercent?'%':'');
}

// -----Nav arrow rotation-----
function rotate(evt){
    var imgX = (offset.left) + (img.width()/2);
    var imgY = (offset.top) + (img.height()/2);
    var radians = Math.atan2(evt.pageX - imgX, (evt.pageY - $(window).scrollTop()) - imgY);
    var deg = (radians * (180 / Math.PI) * -1) + 45;
    if(deg <= -15){
      if(searching)
        highlight('#navExit');
      else
        highlight('#navSearch');
      if (deg < -48)
        deg = -48;
    }
    else if(deg <= 18)
      highlight('#navHistory');
    else {
      highlight('#navQuote');
      if (deg > 47)
        deg = 47;
    }
    img.css('-moz-transform', 'rotate('+deg+'deg)');
    img.css('-webkit-transform', 'rotate('+deg+'deg)');
    img.css('-o-transform', 'rotate('+deg+'deg)');
    img.css('-ms-transform', 'rotate('+deg+'deg)');
}

// -----Search/Query AJAX-----
function query(term, type, qq=false){
  //update search box with current stock
  if (term && $('#query').val() !== term){$('#query').val(term);}
  //check for valid query, otherwise do nothing
  if(term && type && ((type === '#search' && curSearch != term)||(type === '#quote' && curQuote != term)||(type === '#history' && curHistory != term))){
    var table = '';
    var redirect = false;
    //begin AJAX
    $.ajax({
      type: 'GET',
      url: 'php/query.php',
      data: {query: term,
            type: type.slice(1)},
      dataType: 'json',
      timeout: 5000,
      success: function(response){
        if (response.hasOwnProperty('data')){
          if (type === '#search'){
            curSearch = term;
            // If redirected from QuickQuote, prepend notice
            if(qq) table += '<h5>There were no stocks found under the symbol '+term+'. Perhaps you meant to search?</h5>';
            table += '<h2>Search Results</h2>'+
                      '<h3>'+response.data.length+' Results for: '+term+'</h3>';
            if(response.data.length != 0){
              table += '<table class="table-fill">'+
                          '<thead>'+
                            '<tr>'+
                              '<th>Company</th>'+
                              '<th>Symbol</th>'+
                              '<th>Action</th>'+
                            '</tr>'+
                          '</thead>'+
                          '<tbody class="table-hover">';
              $.each(response.data, function(index, result) {
                table += '<tr>'+
                            '<td>'+result.name+'</td>'+
                            '<td>'+result.symbol+'</td>'+
                            '<td>'+
                              '<div class="buttons">'+
                                '<button type="button" class="button quoteButton">Quote</button>'+
                                '<button type="button" class="button historyButton">History</button>'+
                              '</div>'+
                            '</td>'+
                          '</tr>';
              });
              table += '</tbody>'+
                      '</table>';
            }
            else {
              table += '<h5>Search returned no results... Try again!</h5>';
            }
          }
          else if (type === '#quote'){
            curQuote = term;
            //Set company name and symbol if quick quote
            if(qq && response.data.length != 0){
              curStock = response.data[0].symbol;
              curCompany = response.data[0].name;
            }

            table += '<h2>Quote</h2>'+
                      '<h3>'+curQuote+': '+curCompany+'</h3>'+
                      '<div class=buttons>'+
                        '<button class="goSearchButton white">Search Results</button>'+
                        '<button class="goHistoryButton white">Stock History</button>'+
                      '</div><br></br>';
            if(response.data.length != 0){
              curStock = curQuote;
              result = response.data[0];
              table += '<table class="table-fill">'+
                      '<thead>'+
                        '<tr>'+
                          '<th colspan="2">'+(result.date?result.date:'n/a')+'</th>'+
                        '</tr>'+
                      '</thead>'+
                      '<tbody class="table-hover">'+
                        '<tr>'+
                          '<td>Last</td>'+
                          '<td>'+(result.last?formatNumber(result.last, true):'n/a')+'</td>'+
                        '</tr>'+
                        '<tr>'+
                          '<td>Change</td>'+
                          '<td'+((result.chng&&result.chng!=0)?(result.chng<0?' style="color:red"':' style="color:#00CC00"'):'')+'>'+
                            (result.chng?formatNumber(result.chng):'n/a')+
                          '</td>'+
                        '</tr>'+
                        '<tr>'+
                          '<td>%Change</td>'+
                          '<td'+((result.pctchng&&result.pctchng!=0)?(result.pctchng<0?' style="color:red"':' style="color:#00CC00"'):'')+'>'+
                            (result.pctchng?formatNumber(result.pctchng, false, true):'n/a')+
                          '</td>'+
                        '</tr><tr>'+
                          '<td>High</td>'+
                          '<td>'+(result.high?formatNumber(result.high, true):'n/a')+'</td>'+
                        '</tr><tr>'+
                          '<td>Low</td>'+
                          '<td>'+(result.low?formatNumber(result.low, true):'n/a')+'</td>'+
                        '</tr><tr>'+
                          '<td>Daily Volume</td>'+
                          '<td>'+(result.vol?formatNumber(result.vol):'n/a')+'</td>'+
                        '</tr><tr>'+
                          '<td>Prev Close</td>'+
                          '<td>'+(result.preclose?formatNumber(result.preclose):'n/a')+'</td>'+
                        '</tr><tr>'+
                          '<td>Bid</td>'+
                          '<td>'+(result.bid?formatNumber(result.bid):'n/a')+'</td>'+
                        '</tr><tr>'+
                          '<td>Ask</td>'+
                          '<td>'+(result.ask?formatNumber(result.ask):'n/a')+'</td>'+
                        '</tr><tr>'+
                          '<td>52 Week High</td>'+
                          '<td>'+(result.yrhigh?formatNumber(result.yrhigh):'n/a')+'</td>'+
                        '</tr><tr>'+
                          '<td>52 Week Low</td>'+
                          '<td>'+(result.yrlow?formatNumber(result.yrlow):'n/a')+'</td>'+
                        '</tr>'+
                      '</tbody>'+
                    '</table>'+
                    '<table class="table-fill">'+
                      '<thead>'+
                        '<tr>'+
                          '<th colspan="2">Fundamentals</th>'+
                        '</tr>'+
                      '</thead>'+
                      '<tbody class="table-hover">'+
                        '<tr>'+
                          '<td>PE Ratio</td>'+
                          '<td>'+(result.pe?formatNumber(result.pe):'n/a')+'</td>'+
                        '</tr>'+
                        '<tr>'+
                          '<td>Earnings/share</td>'+
                          '<td>'+(result.eshare?formatNumber(result.eshare):'n/a')+'</td>'+
                        '</tr>'+
                        '<tr>'+
                          '<td>Div/Share</td>'+
                          '<td>'+(result.dshare?formatNumber(result.dshare):'n/a')+'</td>'+
                        '</tr><tr>'+
                          '<td>Market Cap.</td>'+
                          '<td>'+(result.cap?formatNumber(result.cap, true):'n/a')+'</td>'+
                        '</tr><tr>'+
                          '<td># Shrs Out.</td>'+
                          '<td>'+(result.shares?formatNumber(result.shares):'n/a')+'</td>'+
                        '</tr><tr>'+
                          '<td>Div. Yield</td>'+
                          '<td>'+(result.yield?formatNumber(result.yield):'n/a')+'</td>'+
                        '</tr>'+
                      '</tbody>'+
                    '</table>';
            }
            else{
              //Redirect to search if quick quote is invalid
              if(qq)
                redirect = true;
              else
                table += '<h5>There is no quote available for '+curStock+'</h5>';
            }
          }
          else if (type === '#history'){
            curHistory = term;

            table += '<h2>History</h2>'+
                      '<h3>'+curHistory+': '+curCompany+'</h3>'+
                      '<div class=buttons>'+
                        '<button class="goSearchButton white">Search Results</button>'+
                        '<button class="goQuoteButton white">Stock Quote</button>'+
                      '</div><br></br>';
            if(response.data.length != 0){
              curStock = curHistory;
              table += '<table class="table-fill">'+
                      '<thead>'+
                        '<tr>'+
                          '<th>Date</th>'+
                          '<th>Last</th>'+
                          '<th>Change</th>'+
                          '<th>%Change</th>'+
                          '<th>Volume</th>'+
                        '</tr>'+
                      '</thead>'+
                      '<tbody class="table-hover">';
              $.each(response.data, function(index, result) {
                table += '<tr>'+
                            '<td>'+(result.date?result.date:'n/a')+'</td>'+
                            '<td>'+(result.last?formatNumber(result.last, true):'n/a')+'</td>'+
                            '<td'+((result.chng&&result.chng!=0)?(result.chng<0?' style="color:red"':' style="color:#00CC00"'):'')+'>'+
                              (result.chng?formatNumber(result.chng):'n/a')+
                            '</td>'+
                            '<td'+((result.pctchng&&result.pctchng!=0)?(result.pctchng<0?' style="color:red"':' style="color:#00CC00"'):'')+'>'+
                              (result.pctchng?formatNumber(result.pctchng, false, true):'n/a')+
                            '</td>'+
                            '<td>'+(result.vol?formatNumber(result.vol):'n/a')+'</td>'+
                          '</tr>';
              });
              table += '</tbody>'+
                      '</table>';
            }
            else{
              table += '<h5>There is no history available for '+curStock+'</h5>';
            }
          }
        }
        else if (response.hasOwnProperty('error')){
          table += '<h3>'+term+'</h3>'+
                    '<h5>'+response['error']+'</h5>';
        }
        else if (qq)
          redirect = true;

        $(curSection).fadeOut().promise().done(function(){
            if(!redirect){
              //Write table HTML
              $(type).html(table);
              //Attach button click event handlers
              if(type === '#search'){
                $('.quoteButton').click(function(){
                  curCompany = $(this).closest('tr').find('td:eq(0)').text()
                  curStock = $(this).closest('tr').find('td:eq(1)').text()
                  // Query with symbol and type
                  query(curStock, '#quote');
                });
                $('.historyButton').click(function(){
                  curCompany = $(this).closest('tr').find('td:eq(0)').text()
                  curStock = $(this).closest('tr').find('td:eq(1)').text()
                  query(curStock, '#history');
                });
              }
              else if(type === '#quote'){
                $('.goSearchButton').click(function(){curSearch && !qq?query(curSearch, '#search'):query(curStock, '#search');});
                $('.goHistoryButton').click(function(){query(curStock, '#history');});
              }
              else if(type === '#history'){
                $('.goSearchButton').click(function(){curSearch && !qq?query(curSearch, '#search'):query(curStock, '#search');});
                $('.goQuoteButton').click(function(){query(curStock, '#quote');});
              }
            }
        });
        if(!redirect)
          showSection(type);
        else
          query(term, '#search', true);
      },
      error: function(xhr, textStatus, errorThrown){
         console.log(textStatus + ' ' + errorThrown);
      }
    });
  }
  else
    showSection(type);
}


// -----Attach event listeners on DOM ready-----
$(function(){
  $('#navSearch').click(function(){
    if (searching)
      $('#searchForm').submit();
    else{
      searching = true;
      $('#navExit').fadeIn();
      $('#title').fadeOut().promise().done(function(){
        $('#searchForm').fadeIn();
        $('#query').focus();
      });
      $('#navSearch').addClass('searching');
      evalQQ();
    }
  });
  $('#navExit').click(function(){
    searching = false;
    showSection('#home');
    $('#searchForm, #navExit, #qq').fadeOut().promise().done(function(){
      $('#title').fadeIn();
    })
    $('#navSearch').removeClass('searching');
  });
  $('#navHistory').click(function(){query(curStock, '#history');});
  $('#navQuote').click(function(){query(curStock, '#quote');});
  $('#navButton').mouseover(expandTray);
  $('#navMenu').mouseleave(hideTray);
  $('#searchForm').submit(function(e){
    query($('#query').val(), '#search');
    return false;
  });
  $('#qq').hover(function(){
                  $(this).fadeTo(250, 1);
                  $('#qq-tooltip').fadeTo(250, 1);
                },
                function(){
                  $(this).fadeTo(250, 0.5);
                  $('#qq-tooltip').fadeTo(250, 0).promise().done(function(){$('#qq-tooltip').hide();});
                });
  $('#qq').click(function(){query($('#query').val().toUpperCase(), '#quote', true);});
  $('#query').keyup(function(){evalQQ();});
});
