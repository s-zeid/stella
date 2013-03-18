all: stella.combined.js stella.combined.css

stella.combined.js: html5shiv.js jquery.min.js bootstrap/bootstrap.min.js stella.js
	cat $^ > $@

stella.combined.css: ubuntu.css bootstrap/bootstrap.min.css stella.css
	cat $^ > $@
