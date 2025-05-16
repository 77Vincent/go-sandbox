package handlers

import (
	"bufio"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"io"
	"log"
	"net"
	"net/http"
	"strings"
)

// -- Upgrade HTTP to WebSocket --
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func LspHandler(version string) func(c *gin.Context) {
	return func(c *gin.Context) {
		// Upgrade connection
		ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Println("WebSocket upgrade error:", err)
			return
		}
		defer ws.Close()

		// Connect to gopls TCP
		var url string
		switch version {
		case "1":
			url = "gopls:4389"
		case "2":
			url = "gopls2:4389"
		default:
			url = "gopls:4389" // use the latest go version by default
		}

		conn, err := net.Dial("tcp", url)
		if err != nil {
			log.Println("TCP connect to gopls failed:", err)
			return
		}
		defer conn.Close()

		// WebSocket → gopls TCP (with Content-Length framing)
		go func() {
			for {
				var msg []byte
				_, msg, err = ws.ReadMessage()
				if err != nil {
					log.Println("LSP read error:", err)
					return
				}

				header := fmt.Sprintf("Content-Length: %d\r\n\r\n", len(msg))
				conn.Write([]byte(header))
				conn.Write(msg)
			}
		}()

		// gopls TCP → WebSocket (parse framed LSP response)
		reader := bufio.NewReader(conn)
		for {
			// parse headers
			var contentLength int
			for {
				var line string
				line, err = reader.ReadString('\n')
				if err != nil {
					log.Println("Read header error:", err)
					return
				}
				line = strings.TrimSpace(line)
				if line == "" {
					break
				}
				if strings.HasPrefix(line, "Content-Length:") {
					fmt.Sscanf(line, "Content-Length: %d", &contentLength)
				}
			}

			body := make([]byte, contentLength)
			if _, err = io.ReadFull(reader, body); err != nil {
				log.Println("Read body error:", err)
				return
			}

			ws.WriteMessage(websocket.TextMessage, body)
		}
	}
}
