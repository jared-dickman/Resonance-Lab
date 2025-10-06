package render

import (
	"bytes"
	_ "embed"
	"html/template"
	"strings"

	"github.com/Pilfer/ultimate-guitar-scraper/pkg/ultimateguitar"
)

//go:embed template.tmpl
var tabTemplate string

// TabToHTML renders a UG tab response into the HTML format used by the CLI exporter.
func TabToHTML(tab ultimateguitar.TabResult) (string, error) {
	t, err := template.New("tab").Parse(tabTemplate)
	if err != nil {
		return "", err
	}

	var out bytes.Buffer
	if err := t.Execute(&out, tab); err != nil {
		return "", err
	}

	html := out.String()
	html = strings.ReplaceAll(html, "[tab]", "<div class=\"gtab\">")
	html = strings.ReplaceAll(html, "[/tab]", "</div>")
	html = strings.ReplaceAll(html, "[ch]", "<span class=\"chord\">")
	html = strings.ReplaceAll(html, "[/ch]", "</span>")

	return html, nil
}
