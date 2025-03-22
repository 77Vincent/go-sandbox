package db

import (
	"context"
	"github.com/go-redis/redis/v8"
	"github.com/tianqi-wen_frgr/best-go-playground/config"
	"sync"
	"time"
)

type RedisClient interface {
	Get(ctx context.Context, key string) *redis.StringCmd
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) *redis.StatusCmd
}

var (
	rdb  RedisClient
	once sync.Once
)

// Redis returns the Redis client.
// singleton pattern
func Redis() RedisClient {
	once.Do(func() {
		rdb = redis.NewClient(&redis.Options{
			Addr: config.RedisUrl,
		})
	})

	return rdb
}
