Stella del Mattino
==================
Lets you view your starred, liked, and shared items from Google Reader.

Copyright © 2012-2013 Scott Zeid.  Released under the X11 License.  
<http://code.s.zeid.me/stella-del-mattino>

 

If you haven't heard already, [Google Reader is shutting down on July 1, 2013.][notice] 
However, until then, you can [take your data out using Google Takeout][takeout]
and you'll have all your subscriptions and starred, liked, and shared articles. 
The problem is that the article lists are JSON files with a custom schema that
there aren't (as far as I know) any user-friendly parsers for, so I made one.

It's worth noting that the JSON files that Takeout gives you *do* contain the
full contents of each article, so this will let you view that.

To use Stella, simply click "Select JSON file" and select the JSON file from
your Takeout archive.

A live instance of Stella is hosted on my site at <http://stella.s.zeid.me/>.




[notice]:   http://googlereader.blogspot.com/2013/03/powering-down-google-reader.html
[takeout]:  https://goo.gl/zijsh
