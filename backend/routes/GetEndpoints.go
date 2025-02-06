package routes

import (
    "github.com/gin-gonic/gin"
    "context"
    "time"
    database "backend/database"
)


func AllData(c *gin.Context){
    ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second) 
    defer cancel()

    orgsWithContacts, err := database.DB.GetAllData(ctx)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, orgsWithContacts)
}
