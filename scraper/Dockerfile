# Start from official Go image (has Go compiler pre-installed)
FROM golang:1.25.1-alpine AS builder

# Install git (needed for go mod download)
RUN apk add --no-cache git

# Set working directory inside container
WORKDIR /app

# Copy go.mod and go.sum first (Docker caches this layer)
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the code
COPY . .

# Build the server binary
# CGO_ENABLED=0 makes a static binary (works anywhere)
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# Use a minimal image for running (smaller & more secure)
FROM alpine:latest

# Install ca-certificates (needed for HTTPS requests)
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/server .

# Create directory for songs
RUN mkdir -p /app/songs

# Expose port 8080
EXPOSE 8080

# Set environment variables
ENV SONGS_DIR=/app/songs
ENV ADDR=:8080

# Run the server
CMD ["./server"]