/* vim: set fdm=marker: */
/* Copyright notice and X11 License {{{
  
   Stella del Mattino
   Lets you view your starred items from Google Reader.
   
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
  });
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
  ARTICLES[id] = body;
  $article = $("<article class='accordion-group'></article>");
  $header  = $("<header class='accordion-heading accordion-toggle'></header>");
  $toggle  = $("<a class='accordion-toggle' data-toggle='collapse'></a>");
  $toggle.attr("href", "#" + id).html(item.title);
  $toggle.on("click.stella", loadArticle);
  $body    = $("<div class='accordion-body collapse'></div>").attr("id", id);
  $content = $("<div class='accordion-inner'></div>");
  $article.append($header.append($toggle)).append($body.append($content));
  $articles.append($article);
 }
}

function loadArticle(id) {
 if ($.type(id) !== "string") {
  id = $(this).attr("href").replace(/^#/, "");
  $(this).off("click.stella");
 }
 body = ARTICLES[id];
 $body = $("#"+id);
 $content = $body.children(".accordion-inner").html(body.content);
 $body.css("direction", body.direction);
 console.log("Loaded " + id);
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
function readFile(file, onload, dataURI) {
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
 else
  reader.readAsBinaryString(file);
 return reader;
}
