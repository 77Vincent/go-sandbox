package db

import (
	"github.com/go-redis/redis/v8"
	"github.com/tianqi-wen_frgr/best-go-playground/config"
	"os"
	"sync"
)

var (
	rdb  *redis.Client
	once sync.Once
)

// Redis returns the Redis client.
// singleton pattern
func Redis() *redis.Client {
	once.Do(func() {
		address := config.RedisLocalUrl
		if v := os.Getenv(config.RedisEnvKey); v != "" {
			address = v
		}

		rdb = redis.NewClient(&redis.Options{
			Addr: address, // Redis server address
			// Password: "", // no password set
			// DB:       0,  // use default DB
		})
	})

	return rdb
}
