package middleware

import (
    "encoding/json"
    "errors"
    "fmt"
    "net/http"
    "os"
    "strings"
    "github.com/form3tech-oss/jwt-go"
    "github.com/gin-gonic/gin"
)

type CustomClaims struct {
    Scope string   `json:"scope"`
    Aud  []string `json:"aud"`
    jwt.StandardClaims
}

type Jwks struct {
    Keys []JSONWebKeys `json:"keys"`
}

type JSONWebKeys struct {
    Kty string   `json:"kty"`
    Kid string   `json:"kid"`
    Use string   `json:"use"`
    N   string   `json:"n"`
    E   string   `json:"e"`
    X5c []string `json:"x5c"`
}

var JWKS_URI string
var ISSUER string
var AUDIENCE string

func InitAuth(test string) {
        JWKS_URI = os.Getenv("AUTH0_JWKS_URI")
        ISSUER = os.Getenv("AUTH0_ISSUER")
        AUDIENCE = os.Getenv("AUTH0_AUDIENCE")
}

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")

        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
            c.Abort()
            return
        }

        bearerToken := strings.Split(authHeader, " ")

        if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header"})
            c.Abort()
            return
        }

        token := bearerToken[1]

        claims := &CustomClaims{}
        parsedToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
            if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
            }

            // Debug audience check
            validAud := false
            for _, aud := range claims.Aud {
                if aud == AUDIENCE {
                    validAud = true
                    break
                }
            }
            if !validAud {
                return nil, errors.New("invalid audience")
            }

            // Debug issuer check
            if !claims.VerifyIssuer(ISSUER, true) {
                return nil, errors.New("invalid issuer")
            }

            cert, err := getPemCert(token)
            if err != nil {
                fmt.Printf("Error getting PEM cert: %v\n", err)
                return nil, err
            }

            key, err := jwt.ParseRSAPublicKeyFromPEM([]byte(cert))
            if err != nil {
                fmt.Printf("Error parsing RSA public key: %v\n", err)
                return nil, err
            }

            return key, nil
        })

        if err != nil {
            fmt.Printf("Token validation error: %v\n", err)
            c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
            c.Abort()
            return
        }

        if !parsedToken.Valid {
            fmt.Println("Token is invalid")
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        c.Set("userId", claims.Subject)
        c.Next()
    }
}

func getPemCert(token *jwt.Token) (string, error) {
    resp, err := http.Get(JWKS_URI)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    var jwks = Jwks{}
    if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
        return "", err
    }

    for k := range jwks.Keys {
        if token.Header["kid"] == jwks.Keys[k].Kid {
            x5c := jwks.Keys[k].X5c[0]
            return fmt.Sprintf("-----BEGIN CERTIFICATE-----\n%s\n-----END CERTIFICATE-----", x5c), nil
        }
    }

    return "", errors.New("unable to find appropriate key")
}
