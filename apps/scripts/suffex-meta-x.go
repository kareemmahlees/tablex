package main

import (
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"runtime"
	"strings"
)

func main() {

	extension := ""
	if runtime.GOOS == "windows" {
		extension = ".exe"
	}

	cmd := exec.Command("rustc", "-Vv")
	stdout, err := cmd.Output()

	pat := regexp.MustCompile("host:\\s.+")
	targetTriple := strings.Split(pat.FindString(string(stdout)), " ")[1]

	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}

	err = os.Rename(fmt.Sprintf("apps/bin/meta-x%s", extension),
		fmt.Sprintf("apps/bin/meta-x-%s%s", targetTriple, extension))
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}

}
