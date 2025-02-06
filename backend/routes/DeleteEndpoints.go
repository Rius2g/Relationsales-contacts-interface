package routes 

import (
    "github.com/gin-gonic/gin"  
    "context"
    "time"
    "fmt"
    database "backend/database"
)


func DeleteContact(c *gin.Context){
    contactID := c.Param("id")
    fmt.Println(contactID)

    ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second) 
    defer cancel()


    if err := database.DB.DeleteContact(ctx, contactID); err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(200, gin.H{"message": "Contact deleted successfully"})
}

