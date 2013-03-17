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

var CAN_UPLOAD_FILES = ["function", "object"].indexOf($.type(FileReader)) >= 0;
var ARTICLES = {};

function selectFile() {
 $("#file").click();
 return false;
}

function loadFile() {
 var files = $(this)[0].files;
 if ($.type(files.length) === "number" && files.length) {
  readFile(files[0], function(e, info) {
   $("#json").text(info.data);
   parseJSON();
  }, false, true);
 }
}

function parseJSON(json) {
 if (typeof(json) === "undefined") json = $("#json").text();
 if (json === "") return;
 var parsed = JSON.parse(json);
 $("#jsonTitle").show().text(parsed.title);
 var items = parsed.items;
 var $articles = $("<div class='accordion'></div>").appendTo($("#articles").empty());
 for (var i = 0; i < items.length; i++) {
  var item = items[i];
  var id   = "item-" + i;
  var body = {"direction": "ltr", "content": ""};
  if      (item.content) body = item.content;
  else if (item.summary) body = item.summary;
  ARTICLES[id] = {"item": item, "body": body};
  var $article = $("<article class='accordion-group'></article>");
  var $header  = $("<header class='accordion-heading accordion-toggle'></header>");
  var $toggle  = $("<a class='accordion-toggle collapsed' data-toggle='collapse'></a>");
  $toggle.attr("href", "#" + id).on("click.stella", loadArticle).append(headerText(item));
  var $body    = $("<div class='accordion-body collapse'></div>").attr("id", id);
  var $content = $("<div class='accordion-inner'></div>");
  $article.append($header.append($toggle)).append($body.append($content));
  $articles.append($article);
 }
}

function headerText(item) {
 var origin = (item.origin) ? item.origin: {"streamId": "", "title": "", "htmlUrl": ""};
 var date = dateToLocalISOString(new Date(item.published * 1000));
 var dateShort = date.match("^[0-9]{4}-[0-9]{2}-[0-9]{2}")[0];
 var $row   = $("<span class='row'></span>");
 var $feed  = $("<span class='span2 feed'></span>").text(origin.title);
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
 var $body = $("#"+id);
 var $inner = $body.children(".accordion-inner");
 var $content = $("<div></div>").attr("id", id + "-content").html(body.content);
 $inner.append(metaText(item)).append($content);
 $inner.find("a").attr("target", "_blank");
 $body.css("direction", body.direction);
 console.log("Loaded " + id);
}

function metaText(item) {
 var origin = (item.origin) ? item.origin: {"streamId": "", "title": "", "htmlUrl": ""};
 var sep = " \u00b7 "; // &middot;
 var $meta = $("<p class='muted meta'></p>");
 var $small = $("<small></small>").appendTo($meta);
 // Feed site
 var $feed = $("<a href=''></a>").attr("href", origin.htmlUrl).text(origin.title);
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
 $small.append(sep, "starred on ", $starDate);
 // Original URL
 if (item.alternate && item.alternate.length && item.alternate.length > 0
     && item.alternate[0].href) {
  var $original = $("<a href=''></a>").attr("href", item.alternate[0].href)
                  .text("view original");
  $small.append(sep, $original);
 }
 return $meta;
}

$(document).ready(function() {
 $("header .nav a[href='#']").click(function() { return false; });
 $("header a[target='_blank']").each(function(i) {
  var el    = $(this);
  var title = el.attr("title");
  var text  = "(Opens in a new tab)";
  if (title) el.attr("title", text + "  " + title);
  else       el.attr("title", text);
 });
 if ($("html").hasClass("static")) {
  parseJSON();
  return;
 }
 if (!CAN_UPLOAD_FILES) {
  alert("Your browser does not support HTML5 file uploads.  I can't continue, sorry.  :(");
  $("header .nav").hide();
 }
 $("#selectFile").click(selectFile);
 $("#file").change(loadFile);
});

/// Utilities ///
function readFile(file, onload, dataURI, text) {
 var reader = new FileReader();
 reader.onload = function(e) {
  var info = {
   name: file.name, size: file.size, type: file.type,
   data: e.target.result, dom: file
  };
  onload(e, info);
 }
 if (dataURI)
  reader.readAsDataURL(file);
 else if (text)
  reader.readAsText(file);
 else
  reader.readAsBinaryString(file);
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
