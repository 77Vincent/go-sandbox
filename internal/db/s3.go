package db

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"io"
	"os"
	"sync"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	cfg "github.com/tianqi-wen_frgr/go-sandbox/config"
)

type S3Client interface {
	GetObject(ctx context.Context, key string) ([]byte, error)
	PutObject(ctx context.Context, key string, data []byte) error
}

var (
	s3c               S3Client
	s3Once            sync.Once
	ErrObjectNotFound = errors.New("object not found")
)

const (
	defaultRegion = "ap-northeast-1"
)

func S3() S3Client {
	s3Once.Do(func() {
		// use the production s3 setup by default
		var (
			forcePathStyle bool
			endpoint       = aws.String(cfg.RealS3Endpoint)
		)

		// it is a local environment
		if v := os.Getenv(cfg.EnvLocalStackEndpoint); v != "" {
			endpoint = aws.String(v)
			forcePathStyle = true
		}

		// Initialize a session
		sess, _ := session.NewSession(&aws.Config{
			Region:           aws.String(defaultRegion),
			Credentials:      credentials.AnonymousCredentials,
			S3ForcePathStyle: aws.Bool(forcePathStyle),
			Endpoint:         endpoint,
		})

		s3c = &s3Client{
			client: s3.New(sess),
			bucket: cfg.CodeSnippetBucket,
		}
	})
	return s3c
}

type s3Client struct {
	client *s3.S3
	bucket string
}

func (c *s3Client) GetObject(ctx context.Context, key string) ([]byte, error) {
	res, err := c.client.GetObjectWithContext(ctx, &s3.GetObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		var e awserr.Error
		if errors.As(err, &e) && e.Code() == s3.ErrCodeNoSuchKey {
			return nil, ErrObjectNotFound
		}
		return nil, fmt.Errorf("failed to get object: %w", err)
	}
	defer res.Body.Close()

	buf := new(bytes.Buffer)
	if _, err = io.Copy(buf, res.Body); err != nil {
		return nil, fmt.Errorf("failed to read object: %w", err)
	}

	return buf.Bytes(), nil
}

func (c *s3Client) PutObject(ctx context.Context, key string, data []byte) error {
	_, err := c.client.PutObjectWithContext(ctx, &s3.PutObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
		Body:   bytes.NewReader(data),
	})
	if err != nil {
		return fmt.Errorf("failed to put object: %w", err)
	}
	return nil
}
