.ONESHELL:

all: stella.combined.js stella.combined.css

stella.combined.js: html5shiv.js jquery.min.js URI.min.js bootstrap/bootstrap.min.js \
                    stella.js
	rm -f $@
	first=1
	for i in $^; do
	 [ $$first -eq 0 ] && echo >> $@
	 cat $$i >> $@
	 first=0
	done

stella.combined.css: webfonts.css bootstrap/bootstrap.min.css stella.css
	rm -f $@
	first=1
	for i in $^; do
	 [ $$first -eq 0 ] && echo >> $@
	 cat $$i >> $@
	 first=0
	done

.PHONY: clean

clean:
	rm -f stella.combined.js stella.combined.css
