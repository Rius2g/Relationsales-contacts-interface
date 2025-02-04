package routes

import (
    "github.com/gin-gonic/gin"
    "context"
    "fmt"
    "time"
    database "backend/database"
)

func Search(c *gin.Context){

    ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second) 
    defer cancel()

    fmt.Println(ctx)
}

func AllData(c *gin.Context){
    ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second) 
    defer cancel()

    orgsWithContacts, err := database.DB.GetAllData(ctx)
    if err != nil {
        fmt.Println(err)
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, orgsWithContacts)
}
