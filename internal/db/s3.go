package db

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/credentials"
	cfg "github.com/tianqi-wen_frgr/go-sandbox/internal"
	"io"
	"os"
	"sync"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
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

func S3() S3Client {
	s3Once.Do(func() {
		var (
			sess   *session.Session
			region = os.Getenv(cfg.AwsRegionKey)
			isProd = os.Getenv(cfg.EnvKey) == cfg.ProdModeValue
		)
		if region == "" {
			region = cfg.DefaultRegion
		}

		// it is a local environment
		if isProd {
			// production environment
			sess, _ = session.NewSession(&aws.Config{
				Region: aws.String(region),
			})
		} else {
			sess, _ = session.NewSession(&aws.Config{
				Region:           aws.String(region),
				Credentials:      credentials.AnonymousCredentials,
				S3ForcePathStyle: aws.Bool(true),
				Endpoint:         aws.String(cfg.LocalStackEndpoint),
			})
		}

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
