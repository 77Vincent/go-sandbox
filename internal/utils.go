package internal

import (
	"regexp"
	"strings"
)

var re = regexp.MustCompile(`/var.*\.go:`)

func parseErrorMessages(input string) string {
	input = strings.ReplaceAll(input, "# command-line-arguments", "")
	input = re.ReplaceAllString(input, "tmp.go:")
	return input
}
