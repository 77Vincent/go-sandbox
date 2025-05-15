package worker

import (
	"log"
	"os"
	"path/filepath"
)

// Define allowed directories/files.
var allowed = map[string]bool{
	"go1": true,
	"go2": true,
	//"go4": true,
}

// CleanupWorkspace scans the given directory and removes any file or directory
// whose name is not in the allowed list.
func CleanupWorkspace(path string) error {
	entries, err := os.ReadDir(path)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		name := entry.Name()
		// If not in allowed list, remove it.
		if !allowed[name] {
			fullPath := filepath.Join(path, name)
			log.Printf("Removing %s", fullPath)
			if err = os.RemoveAll(fullPath); err != nil {
				log.Printf("Error removing %s: %v", fullPath, err)
			}
		}
	}
	return nil
}
