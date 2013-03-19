/* vim: set fdm=marker: */
/* Copyright notice and X11 License {{{
  
   Stella del Mattino
   Lets you view your starred, liked, and shared items from Google Reader.
   
   Copyright (C) 2012-2013 Scott Zeid
   http://code.s.zeid.me/stella-del-mattino/
   
   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:
   
   The above copyright notice and this permission notice shall be included in
   all copies or substantial portions of the Software.
   
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   THE SOFTWARE.
   
   Except as contained in this notice, the name(s) of the above copyright holders
   shall not be used in advertising or otherwise to promote the sale, use or
   other dealings in this Software without prior written authorization.
   
}}}*/

var CAN_OPEN_FILES = ["function", "object"].indexOf($.type(FileReader)) >= 0;
var CAN_SAVE_FILES = ["function", "object"].indexOf($.type(Blob)) >= 0;
var ARTICLES = {};
var STATIC_TEMPLATE = "";
var STATIC_JSON_PLACEHOLDER = "___STELLA_DEL_MATTINO"+"_"+"INSERT_JSON_HERE___";
var STATIC_NAME_PLACEHOLDER = "___STELLA_DEL_MATTINO"+"_"+"INSERT_NAME_HERE___";

function selectFile() {
 $("#file").click();
 return false;
}

function loadFile() {
 var files = $(this)[0].files;
 if ($.type(files.length) === "number" && files.length) {
  readFile(files[0], function(e, info) {
   $("#json").attr("title", info.name);
   $("#json").text(info.data);
   parseJSON();
  }, "UTF-8");
 }
}

function parseJSON(json, name) {
 if (typeof(json) === "undefined") json = $("#json").text();
 if (typeof(name) === "undefined") name = $("#json").attr("title");
 if (json === "") return;
 var parsed = JSON.parse(json);
 var title = $("<div></div>").html(parsed.title).text();
 $("#jsonTitle").show().text(title);
 document.title = title;
 var type = "received";
 if (parsed.id.match(/\/starred$/)) type = "starred";
 if (parsed.id.match(/\/like$/)) type = "liked";
 if (parsed.id.match(/\/broadcast(-friends)?$/)) type = "shared";
 if (parsed.id.match(/\/post$/)) type = "noted";
 var items = parsed.items;
 var $articles = $("<div class='accordion'></div>").appendTo($("#articles").empty());
 for (var i = 0; i < items.length; i++) {
  var item = items[i];
  var id   = "item-" + i;
  var body = {"direction": "ltr", "content": ""};
  if      (item.content) body = item.content;
  else if (item.summary) body = item.summary;
  ARTICLES[id] = {"item": item, "body": body, "type": type};
  var $article = $("<article class='accordion-group'></article>");
  var $header  = $("<header class='accordion-heading accordion-toggle'></header>");
  var $toggle  = $("<a class='accordion-toggle collapsed' data-toggle='collapse'></a>");
  $toggle.attr("href", "#" + id).on("click.stella", loadArticle).append(headerText(item));
  var $body    = $("<div class='accordion-body collapse'></div>").attr("id", id);
  var $content = $("<div class='accordion-inner'></div>");
  $article.append($header.append($toggle)).append($body.append($content));
  $articles.append($article);
 }
 if (CAN_SAVE_FILES && !isStatic()) {
  $("#staticPage").attr("href", makeStaticPage()).attr("download", name + ".html");
  $("#staticPage").off("click").show();
 }
}

function headerText(item) {
 var origin = (item.origin) ? item.origin: {"streamId": "", "title": "", "htmlUrl": ""};
 var originTitle = $("<div></div>").html(origin.title).text();
 var date = dateToLocalISOString(new Date(item.published * 1000));
 var dateShort = date.match("^[0-9]{4}-[0-9]{2}-[0-9]{2}")[0];
 var $row   = $("<span class='row'></span>");
 var $feed  = $("<span class='span2 feed'></span>").text(originTitle);
 $feed.attr("title", $feed.text());
 var $title = $("<span class='span7 title'></span>").html(item.title);
 $title.attr("title", $title.text());
 var $date  = $("<span class='span2 date'></span>").html(dateShort).attr("title", date);
 return $row.append($feed).append($title).append($date);
}

function loadArticle(id) {
 if ($.type(id) !== "string") {
  id = $(this).attr("href").replace(/^#/, "");
  $(this).off("click.stella");
 }
 var item = ARTICLES[id].item;
 var body = ARTICLES[id].body;
 var type = ARTICLES[id].type;
 var $body = $("#"+id);
 var $inner = $body.children(".accordion-inner");
 var $content = $("<div></div>").attr("id", id + "-content").html(body.content);
 $inner.append(metaText(item, type)).append($content);
 $inner.find("a").attr("target", "_blank");
 $body.css("direction", body.direction);
 console.log("Loaded " + id);
}

function metaText(item, type) {
 if (typeof(type) === "undefined") type = "received";
 var origin = (item.origin) ? item.origin: {"streamId": "", "title": "", "htmlUrl": ""};
 var sep = " \u00b7 "; // &middot;
 var $meta = $("<p class='muted meta'></p>");
 var $small = $("<small></small>").appendTo($meta);
 // Feed site
 var originTitle = $("<div></div>").html(origin.title).text();
 var $feed = $("<a href=''></a>").attr("href", origin.htmlUrl).text(originTitle);
 $small.append("from ", $feed);
 // Feed RSS/ATOM URL
 var $xml = $("<a href=''></a>").attr("href", origin.streamId.replace(/^feed\//, ""))
            .text("feed");
 $small.append(" (", $xml, ")");
 // Author
 if (item.author)
  $small.append(sep, "by ", item.author);
 // Publish date
 var date = dateToLocalISOString(new Date(item.published * 1000));
 var dateShort = date.match("^[0-9]{4}-[0-9]{2}-[0-9]{2}")[0];
 var $date = $("<time></time>").attr("datetime", date).attr("title", date).text(dateShort);
 $small.append(sep, "published on ", $date);
 // Star date
 var starDate = dateToLocalISOString(new Date(Number(item.crawlTimeMsec)));
 var starDateShort = starDate.match("^[0-9]{4}-[0-9]{2}-[0-9]{2}")[0];
 var $starDate = $("<time></time>").attr("datetime", starDate).attr("title", starDate)
                 .text(starDateShort);
 $small.append(sep, type + " on ", $starDate);
 // Original URL
 if (item.alternate && item.alternate.length && item.alternate.length > 0
     && item.alternate[0].href) {
  var $original = $("<a href=''></a>").attr("href", item.alternate[0].href)
                  .text("view original");
  $small.append(sep, $original);
 }
 return $meta;
}

function generateStaticTemplate($headCloned, $bodyCloned) {
 var page = "<!DOCTYPE html>\n<html class=\"static\">\n <head>";
 var $head = $headCloned.clone(); // in case someone passed an original
 var $body = $bodyCloned.clone(); // instead of a clone
 $.get("stella.combined.css", function(data) {
  $head.children("link[href='stella.combined.css']")
  .replaceWith($("<style type='text/css'></style>").text(data));
  $.get("stella.combined.js", function(data) {
   $head.children("script[src='stella.combined.js']")
   .replaceWith($("<script type='text/javascript'><"+"/script>").text(data));
   page += $head.html() + "\n </head>\n <body>";
   $body.children("#json").text(STATIC_JSON_PLACEHOLDER);
   $body.children("#json").attr("title", STATIC_NAME_PLACEHOLDER);
   page += $body.html().replace(/[\n ]+$/gm, "");
   page += "\n </body>\n</html>\n";
   //page = page.replace(/\xC2\xA9|\u00A9/gi, "&copy;");
   //page = page.replace(/#/g, "\x2523");
   //page = page.replace(/&/g, "\x2526");
   ///*del*/
   //page = page.replace(/\/\*del\*\/(.|\n)*?\/\*\/del\*\//g, "");
   ///*/del*/return page.replace(/\x0D\x0A|\x0D|\x0A/g, "\x250A");
   STATIC_TEMPLATE = page;
  }, "html");
 }, "html");
}

function makeStaticPage(json, name) {
 if (typeof(json) === "undefined") json = $("#json").text();
 if (typeof(name) === "undefined") name = $("#json").attr("title");
 var page = STATIC_TEMPLATE;
 page = page.replace(STATIC_JSON_PLACEHOLDER, function(){return htmlEscape(json, false)});
 page = page.replace(STATIC_NAME_PLACEHOLDER, function(){return htmlEscape(name)});
 var blob = new Blob([page], {"type": "text/html"});
 var url = URL.createObjectURL(blob);
 return url;
}

function isStatic() {
 return $("html").hasClass("static");
}

$(document).ready(function() {
 $("header .nav a[href='#']").click(function() { return false; });
 $("header .nav a.hide").hide();
 $("header a[target='_blank']").each(function(i) {
  var el    = $(this);
  var title = el.attr("title");
  var text  = "(Opens in a new tab)";
  if (title) el.attr("title", text + "  " + title);
  else       el.attr("title", text);
 });
 generateStaticTemplate($(document.head).clone(), $(document.body).clone());
 if (!CAN_OPEN_FILES) {
  if (!isStatic())
   alert("Your browser doesn't support HTML5 file uploads.  I can't continue, sorry.  :(");
  $("#selectFile").hide();
 }
 $("#selectFile").click(selectFile);
 $("#file").change(loadFile);
 if (isStatic()) {
  parseJSON();
 }
});

/// Utilities ///
function htmlEscape(s, quotes) {
 if (typeof(quotes) === "undefined") quotes = true;
 s = s.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
 if (quotes)
  s = s.replace(/"/g, "&quot;").replace(/'/g, "&#039;");
 return s;
}

function readFile(file, onload, encoding) {
 var reader = new FileReader();
 reader.onload = function(e) {
  var info = {
   name: file.name, size: file.size, type: file.type,
   data: e.target.result, dom: file
  };
  onload(e, info);
 }
 if (encoding === "data:")
  reader.readAsDataURL(file);
 else if ($.type(encoding) === "string")
  reader.readAsText(file, encoding);
 else if (encoding === null)
  reader.readAsBinaryString(file);
 else
  reader.readAsText(file, "UTF-8");
 return reader;
}

// Copypasta from MDN
if (!Date.prototype.toISOString) {
 (function() {
  function pad(number) {
   var r = String(number);
   if (r.length === 1) {
    r = '0' + r;
   }
   return r;
  }
  Date.prototype.toISOString = function() {
   return this.getUTCFullYear()
           + '-' + pad(this.getUTCMonth() + 1)
           + '-' + pad(this.getUTCDate())
           + 'T' + pad(this.getUTCHours())
           + ':' + pad(this.getUTCMinutes())
           + ':' + pad(this.getUTCSeconds())
           + '.' + String((this.getUTCMilliseconds()/1000).toFixed(3)).slice(2, 5)
           + 'Z';
  };
 }());
}

var dateToLocalISOString = (function() {
 function pad(number) {
  var r = String(number);
  if (r.length === 1) {
   r = '0' + r;
  }
  return r;
 }
 return function(date) {
  var tzo = date.getTimezoneOffset();
  return date.getFullYear()
          + '-' + pad(date.getMonth() + 1)
          + '-' + pad(date.getDate())
          + 'T' + pad(date.getHours())
          + ':' + pad(date.getMinutes())
          + ':' + pad(date.getSeconds())
          + '.' + String((date.getMilliseconds()/1000).toFixed(3)).slice(2, 5)
          + ((tzo === 0) ? "Z" : (
           ((tzo > 0) ? "-" : "+")
           + pad(tzo / 60) + ":" + pad(tzo % 60)
          ))
 };
}());
