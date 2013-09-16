.ONESHELL:

all: stella.html stella.combined.js stella.combined.css

stella.html:        src/stella.html
	cp -a $^ $@

stella.combined.js: lib/html5shiv.js lib/jquery.min.js lib/URI.min.js \
                    lib/bootstrap/bootstrap.min.js \
                    src/stella.js
	rm -f $@
	first=1
	for i in $^; do
	 [ $$first -eq 0 ] && echo >> $@
	 echo "/* ==== $$i ==== */" >> $@
	 cat $$i >> $@
	 first=0
	done

stella.combined.css: lib/bootstrap/bootstrap.min.css src/webfonts.css src/stella.css
	rm -f $@
	first=1
	for i in $^; do
	 [ $$first -eq 0 ] && echo >> $@
	 echo "/* ==== $$i ==== */" >> $@
	 cat $$i >> $@
	 first=0
	done

.PHONY: clean

clean:
	rm -f stella.html stella.combined.js stella.combined.css
