package ws

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

func WS(c *gin.Context) {
	// Upgrade connection
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer ws.Close()

	// Connect to gopls TCP
	conn, err := net.Dial("tcp", "gopls:4389") // or "localhost:4389" if running outside Docker
	if err != nil {
		log.Println("TCP connect to gopls failed:", err)
		return
	}
	defer conn.Close()
	fmt.Println("Connected to gopls TCP", conn.RemoteAddr())

	// WebSocket → gopls TCP (with Content-Length framing)
	go func() {
		for {
			_, msg, err := ws.ReadMessage()
			if err != nil {
				log.Println("WS read error:", err)
				return
			}
			fmt.Println("🔹 Incoming from frontend:", string(msg))

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
			line, err := reader.ReadString('\n')
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
		if _, err := io.ReadFull(reader, body); err != nil {
			log.Println("Read body error:", err)
			return
		}
		// 🔍 Add log here
		fmt.Println("🔸 Response from gopls:", string(body))

		ws.WriteMessage(websocket.TextMessage, body)
	}
}
