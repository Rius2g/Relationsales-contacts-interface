package routes

import (
    "github.com/gin-gonic/gin"
    "context"
    "time"
    "fmt"
    t "backend/types"
    database "backend/database"

)

func ChangeInfo(c *gin.Context){
    var contact t.Contact 

    if err := c.ShouldBindJSON(&contact); err != nil { 
        fmt.Println(err)
        c.JSON(400, gin.H{"error": err.Error()})
        return
    } 

    fmt.Println(contact)


    ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second) 
    defer cancel()



    if err := database.DB.UpdateContact(ctx, contact); err != nil { 
        c.JSON(500, gin.H{"error": err.Error()})
        return
    } 

    c.JSON(200, gin.H{"message": "Contact info changed successfully"})

}

